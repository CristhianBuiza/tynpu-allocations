import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ConsultantsService } from './consultants.service';
import { CreateConsultantDto } from './dto/create-consultant.dto';
import { Consultant } from './entities/consultant.entity';

@ApiTags('consultants')
@Controller('api/consultants')
export class ConsultantsController {
  constructor(private readonly consultantsService: ConsultantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new consultant' })
  @ApiResponse({ status: 201, description: 'Consultant created successfully', type: Consultant })
  async create(@Body(ValidationPipe) createConsultantDto: CreateConsultantDto): Promise<Consultant> {
    return this.consultantsService.create(createConsultantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all consultants with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of consultants' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ data: Consultant[]; total: number; page: number; totalPages: number }> {
    return this.consultantsService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consultant by ID' })
  @ApiResponse({ status: 200, description: 'Consultant found', type: Consultant })
  @ApiResponse({ status: 404, description: 'Consultant not found' })
  async findOne(@Param('id') id: string): Promise<Consultant> {
    return this.consultantsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update consultant' })
  @ApiResponse({ status: 200, description: 'Consultant updated successfully', type: Consultant })
  @ApiResponse({ status: 404, description: 'Consultant not found' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateConsultantDto: Partial<CreateConsultantDto>,
  ): Promise<Consultant> {
    return this.consultantsService.update(id, updateConsultantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete consultant' })
  @ApiResponse({ status: 200, description: 'Consultant deleted successfully' })
  @ApiResponse({ status: 404, description: 'Consultant not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.consultantsService.remove(id);
  }
}