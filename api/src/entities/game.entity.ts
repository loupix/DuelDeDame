import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Move } from './move.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  status: 'waiting' | 'active' | 'finished';

  @Column({ type: 'varchar', length: 10, nullable: true })
  winner: 'white' | 'black' | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currentTurn: 'white' | 'black' | null;

  @Column({ type: 'integer', default: 0 })
  moveCount: number;

  @Column({ type: 'integer', default: 0 })
  duration: number; // en secondes

  @Column({ type: 'text', nullable: true })
  whitePlayerId: string;

  @Column({ type: 'text', nullable: true })
  blackPlayerId: string;

  @Column({ type: 'text', nullable: true })
  whitePlayerName: string;

  @Column({ type: 'text', nullable: true })
  blackPlayerName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Move, move => move.game, { cascade: true })
  moves: Move[];
}