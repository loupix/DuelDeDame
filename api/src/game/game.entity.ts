import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SessionEntity } from '../session/session.entity';

@Entity('games')
export class GameEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 6 })
  code!: string;

  @Column({ type: 'varchar', nullable: true })
  whitePlayerId?: string;

  @Column({ type: 'varchar', nullable: true })
  blackPlayerId?: string;

  @Column({ type: 'varchar', default: 'waiting' })
  status!: 'waiting' | 'active' | 'finished';

  @Column({ type: 'varchar', nullable: true })
  currentTurn?: 'white' | 'black';

  @Column({ type: 'text', nullable: true })
  boardState?: string;

  @Column({ type: 'int', default: 0 })
  moveCount!: number;

  @ManyToOne(() => SessionEntity, { eager: true, nullable: true })
  whitePlayer?: SessionEntity;

  @ManyToOne(() => SessionEntity, { eager: true, nullable: true })
  blackPlayer?: SessionEntity;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}