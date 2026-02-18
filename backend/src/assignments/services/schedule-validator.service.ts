import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from '../entities/assignment.entity';

@Injectable()
export class ScheduleValidatorService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
  ) {}

  async checkScheduleConflict(
    consultantId: string,
    startTime: Date,
    endTime: Date,
    excludeAssignmentId?: string,
  ): Promise<{ hasConflict: boolean; conflictingAssignment?: Assignment }> {
    const query = this.assignmentsRepository
      .createQueryBuilder('assignment')
      .where('assignment.consultantId = :consultantId', { consultantId })
      .andWhere('assignment.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: ['cancelled', 'completed'],
      })
      .andWhere(
        '(assignment.startTime < :endTime AND assignment.endTime > :startTime)',
        { startTime, endTime },
      );

    if (excludeAssignmentId) {
      query.andWhere('assignment.id != :excludeAssignmentId', { excludeAssignmentId });
    }

    const conflictingAssignment = await query.getOne();

    return {
      hasConflict: !!conflictingAssignment,
      conflictingAssignment: conflictingAssignment || undefined,
    };
  }

  async validateAssignmentDates(
    consultantId: string,
    projectId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<{ isValid: boolean; error?: string }> {
    if (startTime >= endTime) {
      return {
        isValid: false,
        error: 'End time must be after start time',
      };
    }

    const { hasConflict, conflictingAssignment } = await this.checkScheduleConflict(
      consultantId,
      startTime,
      endTime,
    );

    if (hasConflict && conflictingAssignment) {
      return {
        isValid: false,
        error: `Consultant already assigned to project during this time period`,
      };
    }

    return { isValid: true };
  }
}