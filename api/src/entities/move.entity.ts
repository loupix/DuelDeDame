import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Game } from './game.entity';

@Entity('moves')
export class Move {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  player: 'white' | 'black';

  @Column({ type: 'integer' })
  fromX: number;

  @Column({ type: 'integer' })
  fromY: number;

  @Column({ type: 'integer' })
  toX: number;

  @Column({ type: 'integer' })
  toY: number;

  @Column({ type: 'varchar', length: 50 })
  piece: string;

  @Column({ type: 'boolean', default: false })
  isCapture: boolean;

  @Column({ type: 'boolean', default: false })
  isPromotion: boolean;

  @Column({ type: 'integer' })
  moveNumber: number;

  @Column({ type: 'text', nullable: true })
  notation: string; // Notation algébrique du coup

  @Column({ type: 'text', nullable: true })
  comment: string; // Commentaire optionnel

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Game, game => game.moves, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gameId' })
  game: Game;
}