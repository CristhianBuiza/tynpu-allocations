import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultant } from './entities/consultant.entity';
import { CreateConsultantDto } from './dto/create-consultant.dto';

@Injectable()
export class ConsultantsService {
  constructor(
    @InjectRepository(Consultant)
    private consultantsRepository: Repository<Consultant>,
  ) {}

  async create(createConsultantDto: CreateConsultantDto): Promise<Consultant> {
    const consultant = this.consultantsRepository.create(createConsultantDto);
    return this.consultantsRepository.save(consultant);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ data: Consultant[]; total: number; page: number; totalPages: number }> {
    const [data, total] = await this.consultantsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Consultant> {
    const consultant = await this.consultantsRepository.findOne({
      where: { id },
      relations: ['assignments', 'assignments.project'],
    });

    if (!consultant) {
      throw new NotFoundException(`Consultant with ID ${id} not found`);
    }

    return consultant;
  }

  async update(id: string, updateConsultantDto: Partial<CreateConsultantDto>): Promise<Consultant> {
    const consultant = await this.findOne(id);
    Object.assign(consultant, updateConsultantDto);
    return this.consultantsRepository.save(consultant);
  }

  async remove(id: string): Promise<void> {
    const consultant = await this.findOne(id);
    await this.consultantsRepository.remove(consultant);
  }
}