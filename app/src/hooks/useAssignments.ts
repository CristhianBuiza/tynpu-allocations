import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '../services/api';
import { Assignment, CreateAssignmentDto } from '../types/api';

const ASSIGNMENTS_PER_PAGE = 10;

export const useAssignments = (consultantId?: string, projectId?: string) => {
  return useInfiniteQuery({
    queryKey: ['assignments', consultantId, projectId],
    queryFn: ({ pageParam = 1 }) => assignmentsApi.getAll(pageParam, ASSIGNMENTS_PER_PAGE, consultantId, projectId),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useAssignment = (id: string) => {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentDto) => assignmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAssignmentDto> }) => 
      assignmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['consultants'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};