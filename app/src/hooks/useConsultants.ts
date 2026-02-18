import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { consultantsApi } from '../services/api';
import { Consultant } from '../types/api';

const CONSULTANTS_PER_PAGE = 10;

export const useConsultants = () => {
  return useInfiniteQuery({
    queryKey: ['consultants'],
    queryFn: ({ pageParam = 1 }) => consultantsApi.getAll(pageParam, CONSULTANTS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

export const useConsultant = (id: string) => {
  return useQuery({
    queryKey: ['consultant', id],
    queryFn: () => consultantsApi.getById(id),
    enabled: !!id,
  });
};