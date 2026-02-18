import { IsEmail, IsString, IsArray, IsOptional, IsNumber, IsEnum } from 'class-validator';

type AvailabilityType = 'available' | 'busy' | 'unavailable';

export class CreateConsultantDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsNumber()
  @IsOptional()
  hourlyRate?: number;

  @IsEnum(['available', 'busy', 'unavailable'])
  @IsOptional()
  availability?: AvailabilityType;
}