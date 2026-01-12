import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchExpenseList,
  fetchExpenseDetail,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  fetchExpenseStats
} from '../api/expenseApi';

// Query Keys
export const expenseKeys = {
  all: ['expenses'],
  lists: () => [...expenseKeys.all, 'list'],
  list: (filters) => [...expenseKeys.lists(), filters],
  details: () => [...expenseKeys.all, 'detail'],
  detail: (id) => [...expenseKeys.details(), id],
  stats: () => [...expenseKeys.all, 'stats'],
  statsFiltered: (filters) => [...expenseKeys.stats(), filters],
};

// 결의서 목록 조회 (캐싱 적용)
export const useExpenseList = (page = 1, size = 10, filters = {}, options = {}) => {
  return useQuery({
    queryKey: expenseKeys.list({ page, size, ...filters }),
    queryFn: () => fetchExpenseList(page, size, filters),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
    ...options,
  });
};

// 결의서 상세 조회 (캐싱 적용)
export const useExpenseDetail = (id, options = {}) => {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => fetchExpenseDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    ...options,
  });
};

// 결의서 통계 조회 (캐싱 적용)
export const useExpenseStats = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: expenseKeys.statsFiltered(filters),
    queryFn: () => fetchExpenseStats(filters),
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
    ...options,
  });
};

// 결의서 생성 뮤테이션
export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
};

// 결의서 수정 뮤테이션
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateExpense(id, data),
    onSuccess: (data, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
};

// 결의서 삭제 뮤테이션
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
};

// 결의서 승인 뮤테이션
export const useApproveExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }) => approveExpense(id, comment),
    onSuccess: (data, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
};

// 결의서 반려 뮤테이션
export const useRejectExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }) => rejectExpense(id, comment),
    onSuccess: (data, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.stats() });
    },
  });
};

