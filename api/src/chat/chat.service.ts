import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageEntity } from './chat.entity';

export interface CreateChatMessageDto {
  gameCode: string;
  message: string;
  sender: 'white' | 'black' | 'system';
  isPredefined?: boolean;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessageEntity)
    private readonly repo: Repository<ChatMessageEntity>,
  ) {}

  async create(dto: CreateChatMessageDto): Promise<ChatMessageEntity> {
    const entity = this.repo.create({
      gameCode: dto.gameCode,
      message: dto.message,
      sender: dto.sender,
      isPredefined: !!dto.isPredefined,
    });
    return await this.repo.save(entity);
  }

  async listByGameCode(gameCode: string, limit = 100): Promise<ChatMessageEntity[]> {
    return await this.repo.find({
      where: { gameCode },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }
}

