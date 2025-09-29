import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEntity } from './game.entity';
import { SessionService } from '../session/session.service';

export interface CreateGameDto {
  code?: string;
  playerId: string;
}

export interface JoinGameDto {
  code: string;
  playerId: string;
}

export interface GameStateDto {
  id: string;
  code: string;
  status: 'waiting' | 'active' | 'finished';
  currentTurn?: 'white' | 'black';
  whitePlayerId?: string;
  blackPlayerId?: string;
  moveCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameEntity)
    private readonly repo: Repository<GameEntity>,
    private readonly sessionService: SessionService,
  ) {}

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists = true;
    
    while (exists) {
      // Générer un code de 6 caractères alphanumériques
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingGame = await this.repo.findOne({ where: { code } });
      exists = !!existingGame;
    }
    
    return code!;
  }

  async create(dto: CreateGameDto): Promise<GameStateDto> {
    console.log(`[GameService] Création de partie pour ${dto.playerId} avec code ${dto.code}`);
    
    // Si un code est fourni, vérifier s'il existe déjà
    if (dto.code) {
      const existingGame = await this.repo.findOne({ where: { code: dto.code } });
      
      if (existingGame) {
        console.log(`[GameService] Partie existante trouvée: ${existingGame.id}, status: ${existingGame.status}`);
        console.log(`[GameService] White: ${existingGame.whitePlayerId}, Black: ${existingGame.blackPlayerId}`);
        
        // Si la partie existe et n'est pas terminée, essayer de rejoindre
        if (existingGame.status !== 'finished') {
          console.log(`[GameService] Tentative de rejoindre la partie existante`);
          return this.joinGame({ code: dto.code, playerId: dto.playerId });
        }
        throw new Error('Partie terminée');
      }
    }

    // Utiliser le code fourni ou générer un code unique
    const gameCode = dto.code || await this.generateUniqueCode();
    console.log(`[GameService] Création d'une nouvelle partie avec code: ${gameCode}`);

    // Créer une nouvelle partie
    const session = await this.sessionService.findOrCreateByIdentity(dto.playerId);
    const entity = this.repo.create({
      code: gameCode,
      whitePlayerId: dto.playerId,
      whitePlayer: session,
      status: 'waiting',
      currentTurn: 'white',
    });
    
    const savedGame = await this.repo.save(entity);
    console.log(`[GameService] Partie créée: ${savedGame.id}, White: ${savedGame.whitePlayerId}`);
    return this.mapToDto(savedGame);
  }

  async joinGame(dto: JoinGameDto): Promise<GameStateDto> {
    const game = await this.repo.findOne({ 
      where: { code: dto.code },
      relations: ['whitePlayer', 'blackPlayer']
    });
    
    if (!game) {
      throw new Error('Partie non trouvée');
    }

    if (game.status === 'finished') {
      throw new Error('Partie terminée');
    }

    // Si le joueur est déjà dans la partie, retourner l'état actuel
    console.log(`[GameService] Vérification joueur ${dto.playerId} dans partie ${dto.code}`);
    console.log(`[GameService] White: ${game.whitePlayerId}, Black: ${game.blackPlayerId}`);
    console.log(`[GameService] Match White: ${game.whitePlayerId === dto.playerId}, Match Black: ${game.blackPlayerId === dto.playerId}`);
    
    if (game.whitePlayerId === dto.playerId || game.blackPlayerId === dto.playerId) {
      console.log(`[GameService] Joueur ${dto.playerId} déjà dans la partie ${dto.code}`);
      return this.mapToDto(game);
    }

    // Si la partie est pleine
    if (game.whitePlayerId && game.blackPlayerId) {
      console.log(`[GameService] Partie pleine: White=${game.whitePlayerId}, Black=${game.blackPlayerId}`);
      throw new Error('Partie pleine');
    }

    // Vérifier à nouveau si le joueur n'est pas déjà dans la partie (protection contre les race conditions)
    if (game.whitePlayerId === dto.playerId || game.blackPlayerId === dto.playerId) {
      console.log(`[GameService] Joueur ${dto.playerId} déjà dans la partie après vérification supplémentaire`);
      return this.mapToDto(game);
    }

    // Ajouter le joueur à la partie
    const session = await this.sessionService.findOrCreateByIdentity(dto.playerId);
    
    if (!game.whitePlayerId) {
      console.log(`[GameService] Ajout du joueur ${dto.playerId} comme White`);
      game.whitePlayerId = dto.playerId;
      game.whitePlayer = session;
    } else if (!game.blackPlayerId) {
      console.log(`[GameService] Ajout du joueur ${dto.playerId} comme Black`);
      game.blackPlayerId = dto.playerId;
      game.blackPlayer = session;
    } else {
      console.log(`[GameService] Erreur: Impossible d'ajouter le joueur ${dto.playerId}`);
      throw new Error('Impossible d\'ajouter le joueur à la partie');
    }

    // Si les deux joueurs sont présents, démarrer la partie
    if (game.whitePlayerId && game.blackPlayerId) {
      game.status = 'active';
    }

    const savedGame = await this.repo.save(game);
    return this.mapToDto(savedGame);
  }

  async getGameByCode(code: string): Promise<GameStateDto | null> {
    const game = await this.repo.findOne({ 
      where: { code },
      relations: ['whitePlayer', 'blackPlayer']
    });
    
    if (!game) return null;
    return this.mapToDto(game);
  }

  async updateGameState(code: string, updates: Partial<GameEntity>): Promise<GameStateDto> {
    const game = await this.repo.findOne({ where: { code } });
    if (!game) {
      throw new Error('Partie non trouvée');
    }

    Object.assign(game, updates);
    const savedGame = await this.repo.save(game);
    return this.mapToDto(savedGame);
  }

  async finishGame(code: string, winner?: 'white' | 'black'): Promise<GameStateDto> {
    const game = await this.repo.findOne({ where: { code } });
    if (!game) {
      throw new Error('Partie non trouvée');
    }

    game.status = 'finished';
    const savedGame = await this.repo.save(game);
    return this.mapToDto(savedGame);
  }

  async getActiveGamesByPlayer(playerId: string): Promise<GameStateDto[]> {
    const games = await this.repo.find({
      where: [
        { whitePlayerId: playerId, status: 'active' },
        { blackPlayerId: playerId, status: 'active' },
        { whitePlayerId: playerId, status: 'waiting' },
        { blackPlayerId: playerId, status: 'waiting' }
      ],
      relations: ['whitePlayer', 'blackPlayer'],
      order: { updatedAt: 'DESC' }
    });

    return games.map(game => this.mapToDto(game));
  }

  private mapToDto(game: GameEntity): GameStateDto {
    return {
      id: game.id,
      code: game.code,
      status: game.status,
      currentTurn: game.currentTurn,
      whitePlayerId: game.whitePlayerId,
      blackPlayerId: game.blackPlayerId,
      moveCount: game.moveCount,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  }
}