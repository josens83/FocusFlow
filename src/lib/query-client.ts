/**
 * @fileoverview React Query 클라이언트 설정
 * @description 최적화된 React Query 설정
 *
 * @performance
 * - 스마트 리페칭 전략
 * - 오프라인 지원
 * - 효율적인 캐시 관리
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * React Query 기본 설정
 *
 * @performance
 * - staleTime: 데이터가 '신선한' 상태로 간주되는 시간
 * - gcTime: 캐시가 가비지 컬렉션되기 전 유지 시간
 * - refetchOnWindowFocus: 윈도우 포커스 시 리페치
 * - retry: 실패 시 재시도 횟수
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // 데이터가 5분간 신선한 것으로 간주
      staleTime: 5 * 60 * 1000,

      // 캐시를 30분간 유지
      gcTime: 30 * 60 * 1000,

      // 윈도우 포커스 시 stale 데이터만 리페치
      refetchOnWindowFocus: 'always' as const,

      // 네트워크 재연결 시 리페치
      refetchOnReconnect: true,

      // 마운트 시 stale 데이터 리페치
      refetchOnMount: true,

      // 3회 재시도 (지수 백오프)
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 구조적 공유로 불필요한 리렌더 방지
      structuralSharing: true,
    },
    mutations: {
      // 뮤테이션 실패 시 1회 재시도
      retry: 1,

      // 네트워크 에러에서 복구
      networkMode: 'always' as const,
    },
  },
};

/**
 * Query Client 인스턴스 생성
 */
export function createQueryClient(): QueryClient {
  return new QueryClient(queryClientConfig);
}

// ============================================================================
// Query Key 팩토리
// ============================================================================

/**
 * 타입 안전한 Query Key 팩토리
 *
 * @description
 * 일관된 쿼리 키 관리로 캐시 무효화 및 리페치 용이
 *
 * @example
 * useQuery({ queryKey: queryKeys.sessions.list({ status: 'COMPLETED' }) })
 * queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
 */
export const queryKeys = {
  // 사용자 관련
  user: {
    all: ['user'] as const,
    data: () => [...queryKeys.user.all, 'data'] as const,
    stats: () => [...queryKeys.user.all, 'stats'] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
  },

  // 세션 관련
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.sessions.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.sessions.all, 'detail', id] as const,
    active: () => [...queryKeys.sessions.all, 'active'] as const,
  },

  // 가든 관련
  garden: {
    all: ['garden'] as const,
    data: () => [...queryKeys.garden.all, 'data'] as const,
    plants: () => [...queryKeys.garden.all, 'plants'] as const,
    available: () => [...queryKeys.garden.all, 'available'] as const,
  },

  // 태스크 관련
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.tasks.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.tasks.all, 'detail', id] as const,
  },

  // 통계 관련
  stats: {
    all: ['stats'] as const,
    today: () => [...queryKeys.stats.all, 'today'] as const,
    week: () => [...queryKeys.stats.all, 'week'] as const,
    month: () => [...queryKeys.stats.all, 'month'] as const,
    range: (start: string, end: string) =>
      [...queryKeys.stats.all, 'range', start, end] as const,
  },

  // 사운드스케이프 관련
  soundscapes: {
    all: ['soundscapes'] as const,
    list: () => [...queryKeys.soundscapes.all, 'list'] as const,
  },

  // 성취 관련
  achievements: {
    all: ['achievements'] as const,
    list: () => [...queryKeys.achievements.all, 'list'] as const,
    unlocked: () => [...queryKeys.achievements.all, 'unlocked'] as const,
  },
};

// ============================================================================
// 캐시 무효화 헬퍼
// ============================================================================

/**
 * 세션 완료 시 관련 캐시 무효화
 */
export function invalidateSessionCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.garden.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.user.stats() });
}

/**
 * 사용자 데이터 변경 시 캐시 무효화
 */
export function invalidateUserCaches(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
}

// ============================================================================
// Prefetch 헬퍼
// ============================================================================

/**
 * 대시보드 데이터 프리페치
 *
 * @performance
 * 페이지 전환 전 데이터를 미리 로드하여 UX 향상
 */
export async function prefetchDashboardData(
  queryClient: QueryClient,
  userId: string
): Promise<void> {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.user.stats(),
      queryFn: () => fetch('/api/stats').then((r) => r.json()),
      staleTime: 5 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.sessions.list({ limit: 5, status: 'IN_PROGRESS' }),
      queryFn: () =>
        fetch('/api/sessions?limit=5&status=IN_PROGRESS').then((r) => r.json()),
      staleTime: 2 * 60 * 1000,
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.garden.data(),
      queryFn: () => fetch('/api/garden').then((r) => r.json()),
      staleTime: 5 * 60 * 1000,
    }),
  ]);
}

// ============================================================================
// Optimistic Update 헬퍼
// ============================================================================

/**
 * 낙관적 업데이트를 위한 컨텍스트 타입
 */
export interface OptimisticContext<T> {
  previousData: T | undefined;
}

/**
 * 낙관적 업데이트 설정 생성
 *
 * @description
 * 서버 응답 전에 UI를 먼저 업데이트하여 체감 속도 향상
 */
export function createOptimisticUpdate<TData, TVariables>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updater: (old: TData | undefined, variables: TVariables) => TData
) {
  return {
    onMutate: async (variables: TVariables): Promise<OptimisticContext<TData>> => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey });

      // 이전 데이터 스냅샷
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // 낙관적 업데이트
      queryClient.setQueryData<TData>(queryKey, (old) => updater(old, variables));

      return { previousData };
    },
    onError: (
      _error: unknown,
      _variables: TVariables,
      context: OptimisticContext<TData> | undefined
    ) => {
      // 에러 시 롤백
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      // 서버 데이터로 동기화
      queryClient.invalidateQueries({ queryKey });
    },
  };
}
