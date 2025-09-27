import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('games')
export class GameEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 6 })
  code!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: 'waiting' })
  status!: 'waiting' | 'playing' | 'finished';

  @Column({ type: 'varchar', length: 50, default: 'white' })
  currentTurn!: 'white' | 'black';

  @Column({ type: 'integer', default: 0 })
  playerCount!: number;

  @Column({ type: 'integer', default: 2 })
  maxPlayers!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  winner?: string;

  @Column({ type: 'text', nullable: true })
  gameState?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy?: string;

  @Column({ type: 'boolean', default: true })
  isPublic!: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}