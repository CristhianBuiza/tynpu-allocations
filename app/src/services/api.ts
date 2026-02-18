import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Consultant, Project, Assignment, PaginatedResponse, CreateAssignmentDto } from '../types/api';

const resolveDevApiBaseUrl = () => {
  const hostUri = (Constants as any)?.expoConfig?.hostUri as string | undefined;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return `http://${host}:3000/api`;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000/api';
  return 'http://localhost:3000/api';
};

// Para builds standalone (APK), leer desde app.json extra
const getApiUrl = () => {
  // Primero intentar desde app.json extra (funciona en APK)
  const extraApiUrl = Constants.expoConfig?.extra?.apiUrl;
  if (extraApiUrl) return extraApiUrl;
  
  // Luego desde variable de entorno (funciona en desarrollo)
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  
  // Fallback para desarrollo local
  return resolveDevApiBaseUrl();
};

const API_BASE_URL = getApiUrl();

console.log('🔗 Connecting to API:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message, error.response?.data);
    if (error.response?.status === 400 && error.response?.data?.error === 'SCHEDULE_CONFLICT') {
      throw new Error(error.response.data.message || 'Schedule conflict detected');
    }
    throw error;
  }
);

// Consultants API
export const consultantsApi = {
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Consultant>> => {
    const response = await api.get(`/consultants?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<Consultant> => {
    const response = await api.get(`/consultants/${id}`);
    return response.data;
  },

  create: async (data: Partial<Consultant>): Promise<Consultant> => {
    const response = await api.post('/consultants', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Consultant>): Promise<Consultant> => {
    const response = await api.patch(`/consultants/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/consultants/${id}`);
  },
};

// Projects API
export const projectsApi = {
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Project>> => {
    const response = await api.get(`/projects?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.patch(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Assignments API
export const assignmentsApi = {
  getAll: async (page: number = 1, limit: number = 10, consultantId?: string, projectId?: string): Promise<PaginatedResponse<Assignment>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (consultantId) params.append('consultantId', consultantId);
    if (projectId) params.append('projectId', projectId);

    const response = await api.get(`/assignments?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Assignment> => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  create: async (data: CreateAssignmentDto): Promise<Assignment> => {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateAssignmentDto>): Promise<Assignment> => {
    const response = await api.patch(`/assignments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },
};

export default api;
