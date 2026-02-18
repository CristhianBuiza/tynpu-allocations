import { IsString, IsDate, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

type ProjectStatus = 'planning' | 'active' | 'completed' | 'cancelled';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  client: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsEnum(['planning', 'active', 'completed', 'cancelled'])
  @IsOptional()
  status?: ProjectStatus;

  @IsNumber()
  @IsOptional()
  budget?: number;
}