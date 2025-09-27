'use client'

export interface GameState {
  id: string;
  code: string;
  status: 'waiting' | 'active' | 'finished';
  currentTurn?: 'white' | 'black';
  whitePlayerId?: string;
  blackPlayerId?: string;
  moveCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  game?: T;
  error?: string;
}

export class GameApiService {
  private static instance: GameApiService;
  private apiBase: string;

  private constructor() {
    this.apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }

  static getInstance(): GameApiService {
    if (!GameApiService.instance) {
      GameApiService.instance = new GameApiService()
    }
    return GameApiService.instance
  }

  async createGame(code: string, playerId: string): Promise<ApiResponse<GameState>> {
    try {
      const response = await fetch(`${this.apiBase}/games/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, playerId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la partie:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async joinGame(code: string, playerId: string): Promise<ApiResponse<GameState>> {
    try {
      const response = await fetch(`${this.apiBase}/games/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, playerId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la connexion à la partie:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async getGame(code: string): Promise<ApiResponse<GameState>> {
    try {
      const response = await fetch(`${this.apiBase}/games/${code}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de la partie:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async updateGameState(
    code: string, 
    updates: {
      status?: 'waiting' | 'active' | 'finished';
      currentTurn?: 'white' | 'black';
      boardState?: string;
      moveCount?: number;
    }
  ): Promise<ApiResponse<GameState>> {
    try {
      const response = await fetch(`${this.apiBase}/games/${code}/state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la partie:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async finishGame(code: string, winner?: 'white' | 'black'): Promise<ApiResponse<GameState>> {
    try {
      const response = await fetch(`${this.apiBase}/games/${code}/finish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winner }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la fin de la partie:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async getActiveGamesByPlayer(playerId: string): Promise<{ success: boolean; games?: GameState[]; error?: string }> {
    try {
      const response = await fetch(`${this.apiBase}/games/player/${playerId}/active`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des parties actives:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
}