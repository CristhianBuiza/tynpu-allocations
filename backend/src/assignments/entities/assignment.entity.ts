import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Consultant } from '../../consultants/entities/consultant.entity';
import { Project } from '../../projects/entities/project.entity';

export type AssignmentStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Consultant, consultant => consultant.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'consultant_id' })
  consultant: Consultant;

  @Column('uuid')
  consultantId: string;

  @ManyToOne(() => Project, project => project.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column('uuid')
  projectId: string;

  @Column('timestamptz', { name: 'start_time' })
  startTime: Date;

  @Column('timestamptz', { name: 'end_time' })
  endTime: Date;

  @Column({
    type: 'int',
    generatedType: 'STORED',
    asExpression: 'EXTRACT(EPOCH FROM (end_time - start_time))/3600',
    nullable: true,
  })
  hours: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'scheduled',
    enum: ['scheduled', 'active', 'completed', 'cancelled']
  })
  status: AssignmentStatus;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
