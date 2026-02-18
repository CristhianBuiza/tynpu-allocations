export interface Consultant {
  id: string;
  name: string;
  email: string;
  skills: string[];
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  budget: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  consultantId: string;
  projectId: string;
  consultant?: Consultant;
  project?: Project;
  startTime: string;
  endTime: string;
  hours: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateAssignmentDto {
  consultantId: string;
  projectId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}