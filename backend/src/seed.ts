import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsultantsService } from './consultants/consultants.service';
import { ProjectsService } from './projects/projects.service';
import { AssignmentsService } from './assignments/assignments.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const consultantsService = app.get(ConsultantsService);
  const projectsService = app.get(ProjectsService);
  const assignmentsService = app.get(AssignmentsService);

  console.log('Seeding data...');

  // Create consultants
  const consultants = [
    {
      name: 'John Smith',
      email: 'john.smith@tynpu.com',
      skills: ['React', 'TypeScript', 'Node.js'],
      hourlyRate: 75,
      availability: 'available' as const,
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@tynpu.com',
      skills: ['Python', 'Django', 'PostgreSQL'],
      hourlyRate: 80,
      availability: 'available' as const,
    },
    {
      name: 'Mike Chen',
      email: 'mike.chen@tynpu.com',
      skills: ['Java', 'Spring Boot', 'AWS'],
      hourlyRate: 85,
      availability: 'busy' as const,
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@tynpu.com',
      skills: ['Vue.js', 'JavaScript', 'MongoDB'],
      hourlyRate: 70,
      availability: 'available' as const,
    },
    {
      name: 'David Wilson',
      email: 'david.wilson@tynpu.com',
      skills: ['C#', '.NET', 'Azure'],
      hourlyRate: 90,
      availability: 'unavailable' as const,
    },
  ];

  for (const consultant of consultants) {
    try {
      await consultantsService.create(consultant);
      console.log(`Created consultant: ${consultant.name}`);
    } catch (error) {
      console.log(`Consultant ${consultant.name} already exists`);
    }
  }

  // Create projects
  const projects = [
    {
      name: 'E-commerce Platform',
      client: 'TechCorp Inc.',
      description: 'Building a modern e-commerce platform with React and Node.js',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      status: 'active' as const,
      budget: 150000,
    },
    {
      name: 'Mobile Banking App',
      client: 'FinanceFirst',
      description: 'Native mobile banking application for iOS and Android',
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-08-15'),
      status: 'planning' as const,
      budget: 200000,
    },
    {
      name: 'Data Analytics Dashboard',
      client: 'DataInsights',
      description: 'Real-time analytics dashboard with Python and React',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-05-31'),
      status: 'completed' as const,
      budget: 100000,
    },
    {
      name: 'Healthcare Management System',
      client: 'MediCare Plus',
      description: 'Comprehensive healthcare management system',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-10-31'),
      status: 'active' as const,
      budget: 300000,
    },
    {
      name: 'IoT Monitoring Platform',
      client: 'SmartTech Solutions',
      description: 'IoT device monitoring and management platform',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-09-30'),
      status: 'planning' as const,
      budget: 180000,
    },
  ];

  for (const project of projects) {
    try {
      await projectsService.create(project);
      console.log(`Created project: ${project.name}`);
    } catch (error) {
      console.log(`Project ${project.name} already exists`);
    }
  }

  // Create sample assignments (non overlapping)
  try {
    const consultantsPage = await consultantsService.findAll(1, 10);
    const projectsPage = await projectsService.findAll(1, 10);

    const c1 = consultantsPage.data[0];
    const c2 = consultantsPage.data[1];
    const p1 = projectsPage.data[0];
    const p2 = projectsPage.data[1];

    if (c1 && p1) {
      await assignmentsService.create({
        consultantId: c1.id,
        projectId: p1.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),
        notes: 'Kickoff meeting and initial setup',
      } as any);
      console.log(`Created assignment for ${c1.name} on ${p1.name}`);
    }

    if (c2 && p2) {
      await assignmentsService.create({
        consultantId: c2.id,
        projectId: p2.id,
        startTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 50 * 60 * 60 * 1000),
        notes: 'Architecture review session',
      } as any);
      console.log(`Created assignment for ${c2.name} on ${p2.name}`);
    }
  } catch (e) {
    console.log('Skipping assignments seeding due to error:', e?.message || e);
  }

  console.log('Seeding completed!');
  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
