import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchEntity } from './match.entity';
import { SessionService } from '../session/session.service';

export interface CreateMatchDto {
  identity: string;
  code: string;
  result: 'win' | 'loss' | 'draw';
  color: 'white' | 'black';
  duration: number;
  moves: number;
}

@Injectable()
export class MatchService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly repo: Repository<MatchEntity>,
    private readonly sessionService: SessionService,
  ) {}

  async create(dto: CreateMatchDto): Promise<MatchEntity> {
    const session = await this.sessionService.findOrCreateByIdentity(dto.identity);
    const entity = this.repo.create({
      code: dto.code,
      result: dto.result,
      color: dto.color,
      duration: dto.duration,
      moves: dto.moves,
      session,
    });
    return await this.repo.save(entity);
  }

  async listByIdentity(identity: string): Promise<MatchEntity[]> {
    const session = await this.sessionService.findByIdentity(identity);
    if (!session) return [];
    return await this.repo.find({ where: { session: { id: session.id } }, order: { createdAt: 'DESC' }, take: 50 });
  }
}

