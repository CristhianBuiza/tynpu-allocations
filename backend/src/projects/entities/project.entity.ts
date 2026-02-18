import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Assignment } from '../../assignments/entities/assignment.entity';

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'cancelled';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 200 })
  client: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'planning',
    enum: ['planning', 'active', 'completed', 'cancelled']
  })
  status: ProjectStatus;

  @Column('decimal', { precision: 12, scale: 2, default: 0.00 })
  budget: number;

  @OneToMany(() => Assignment, assignment => assignment.project)
  assignments: Assignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}