import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SessionEntity } from '../session/session.entity';

@Entity('matches')
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'text' })
  code!: string;

  @Column({ type: 'varchar' })
  result!: 'win' | 'loss' | 'draw';

  @Column({ type: 'varchar' })
  color!: 'white' | 'black';

  @Column({ type: 'int' })
  duration!: number;

  @Column({ type: 'int' })
  moves!: number;

  @ManyToOne(() => SessionEntity, { eager: true, nullable: false })
  session!: SessionEntity;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}

