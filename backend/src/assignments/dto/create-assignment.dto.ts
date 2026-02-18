import { IsString, IsDate, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAssignmentDto {
  @IsUUID()
  consultantId: string;

  @IsUUID()
  projectId: string;

  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}