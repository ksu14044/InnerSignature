import { QueryClient } from '@tanstack/react-query';

// React Query 클라이언트 설정
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분 동안 데이터가 fresh 상태 유지
      gcTime: 10 * 60 * 1000, // 10분 동안 캐시 유지 (이전 cacheTime)
      retry: (failureCount, error) => {
        // 401, 403 에러는 재시도하지 않음
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        // 최대 2번 재시도
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // 창 포커스 시 자동 리패치 비활성화
      refetchOnReconnect: true, // 네트워크 재연결 시 리패치
    },
    mutations: {
      retry: false, // 뮤테이션은 기본적으로 재시도하지 않음
    },
  },
});
