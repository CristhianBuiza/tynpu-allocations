import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { projectsApi } from '../services/api';
import { Project } from '../types/api';

const PROJECTS_PER_PAGE = 10;

export const useProjects = () => {
  return useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: ({ pageParam = 1 }) => projectsApi.getAll(pageParam, PROJECTS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useProject = (id: string) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
};