import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'text' })
  gameCode!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ type: 'varchar' })
  sender!: 'white' | 'black' | 'system';

  @Column({ type: 'boolean', default: false })
  isPredefined!: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}

