import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { ScheduleValidatorService } from './services/schedule-validator.service';
import { Assignment } from './entities/assignment.entity';
import { ConsultantsModule } from '../consultants/consultants.module';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Assignment]),
    ConsultantsModule,
    ProjectsModule,
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, ScheduleValidatorService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}