import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  identity!: string;

  @Column({ type: 'text', nullable: true })
  firstName?: string | null;

  @Column({ type: 'text', nullable: true })
  lastName?: string | null;

  @Column({ type: 'text', nullable: true })
  avatarColor?: string | null;

  @Column({ type: 'text', nullable: true })
  countryCode?: string | null;

  @Column({ type: 'text', nullable: true })
  language?: string | null;

  @Column({ type: 'text', nullable: true })
  timezone?: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  getDisplayName(): string {
    const initial = this.lastName ? this.lastName[0].toUpperCase() : '';
    return `${this.firstName || ''} ${initial ? initial + '.' : ''}`.trim();
  }
}

