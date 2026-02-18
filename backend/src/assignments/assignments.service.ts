import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment } from './entities/assignment.entity';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { ScheduleValidatorService } from './services/schedule-validator.service';
import { ConsultantsService } from '../consultants/consultants.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
    private scheduleValidatorService: ScheduleValidatorService,
    private consultantsService: ConsultantsService,
    private projectsService: ProjectsService,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    // Validate consultant and project exist
    await this.consultantsService.findOne(createAssignmentDto.consultantId);
    await this.projectsService.findOne(createAssignmentDto.projectId);

    // Validate schedule conflict
    const validation = await this.scheduleValidatorService.validateAssignmentDates(
      createAssignmentDto.consultantId,
      createAssignmentDto.projectId,
      createAssignmentDto.startTime,
      createAssignmentDto.endTime,
    );

    if (!validation.isValid) {
      throw new BadRequestException({
        error: 'SCHEDULE_CONFLICT',
        message: validation.error,
      });
    }

    const assignment = this.assignmentsRepository.create(createAssignmentDto);
    return this.assignmentsRepository.save(assignment);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    consultantId?: string,
    projectId?: string,
  ): Promise<{ data: Assignment[]; total: number; page: number; totalPages: number }> {
    const query = this.assignmentsRepository
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.consultant', 'consultant')
      .leftJoinAndSelect('assignment.project', 'project')
      .orderBy('assignment.startTime', 'DESC');

    if (consultantId) {
      query.where('assignment.consultantId = :consultantId', { consultantId });
    }

    if (projectId) {
      query.where('assignment.projectId = :projectId', { projectId });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Assignment> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
      relations: ['consultant', 'project'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  async update(id: string, updateAssignmentDto: Partial<CreateAssignmentDto>): Promise<Assignment> {
    const assignment = await this.findOne(id);

    // If updating time or consultant, validate schedule conflict
    if (updateAssignmentDto.consultantId || updateAssignmentDto.startTime || updateAssignmentDto.endTime) {
      const consultantId = updateAssignmentDto.consultantId || assignment.consultantId;
      const projectId = assignment.projectId;
      const startTime = updateAssignmentDto.startTime || assignment.startTime;
      const endTime = updateAssignmentDto.endTime || assignment.endTime;

      const validation = await this.scheduleValidatorService.validateAssignmentDates(
        consultantId,
        projectId,
        startTime,
        endTime,
      );

      if (!validation.isValid) {
        throw new BadRequestException({
          error: 'SCHEDULE_CONFLICT',
          message: validation.error,
        });
      }
    }

    Object.assign(assignment, updateAssignmentDto);
    return this.assignmentsRepository.save(assignment);
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.findOne(id);
    await this.assignmentsRepository.remove(assignment);
  }
}