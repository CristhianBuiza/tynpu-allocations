import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { Assignment } from './entities/assignment.entity';

@ApiTags('assignments')
@Controller('api/assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiResponse({ status: 201, description: 'Assignment created successfully', type: Assignment })
  @ApiResponse({ status: 400, description: 'Schedule conflict or validation error' })
  async create(@Body(ValidationPipe) createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assignments with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'consultantId', required: false, type: String, description: 'Filter by consultant ID' })
  @ApiQuery({ name: 'projectId', required: false, type: String, description: 'Filter by project ID' })
  @ApiResponse({ status: 200, description: 'List of assignments' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('consultantId') consultantId?: string,
    @Query('projectId') projectId?: string,
  ): Promise<{ data: Assignment[]; total: number; page: number; totalPages: number }> {
    return this.assignmentsService.findAll(page, limit, consultantId, projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assignment by ID' })
  @ApiResponse({ status: 200, description: 'Assignment found', type: Assignment })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async findOne(@Param('id') id: string): Promise<Assignment> {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update assignment' })
  @ApiResponse({ status: 200, description: 'Assignment updated successfully', type: Assignment })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @ApiResponse({ status: 400, description: 'Schedule conflict or validation error' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAssignmentDto: Partial<CreateAssignmentDto>,
  ): Promise<Assignment> {
    return this.assignmentsService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete assignment' })
  @ApiResponse({ status: 200, description: 'Assignment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.assignmentsService.remove(id);
  }
}