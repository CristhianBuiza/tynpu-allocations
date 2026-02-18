import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Assignment } from '../../assignments/entities/assignment.entity';

export type AvailabilityType = 'available' | 'busy' | 'unavailable';

@Entity('consultants')
export class Consultant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column('text', { array: true, nullable: true })
  skills: string[];

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  hourlyRate: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'available',
    enum: ['available', 'busy', 'unavailable']
  })
  availability: AvailabilityType;

  @OneToMany(() => Assignment, assignment => assignment.consultant)
  assignments: Assignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
