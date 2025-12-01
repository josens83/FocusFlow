/**
 * @fileoverview 성능 최적화 유틸리티
 * @description 메모이제이션, 디바운스, 쓰로틀 등 성능 관련 유틸리티
 *
 * @performance
 * - 불필요한 연산 방지
 * - 이벤트 핸들러 최적화
 * - 메모리 효율적인 캐싱
 */

// ============================================================================
// 메모이제이션
// ============================================================================

/**
 * 함수 결과 메모이제이션
 *
 * @description
 * 동일한 인자로 호출 시 캐시된 결과 반환
 *
 * @performance
 * - 비용이 큰 연산 결과 재사용
 * - LRU 캐시로 메모리 제한
 *
 * @example
 * const expensiveCalc = memoize((n: number) => {
 *   // 비용이 큰 연산
 *   return fibonacci(n);
 * }, { maxSize: 100 });
 */
export function memoize<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  options: { maxSize?: number; keyFn?: (...args: TArgs) => string } = {}
): (...args: TArgs) => TResult {
  const { maxSize = 100, keyFn = (...args) => JSON.stringify(args) } = options;
  const cache = new Map<string, { value: TResult; timestamp: number }>();

  return (...args: TArgs): TResult => {
    const key = keyFn(...args);
    const cached = cache.get(key);

    if (cached) {
      // LRU: 접근된 항목을 맨 뒤로 이동
      cache.delete(key);
      cache.set(key, cached);
      return cached.value;
    }

    // 캐시 크기 제한
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  };
}

/**
 * 비동기 함수 메모이제이션
 *
 * @description
 * Promise 결과를 캐시하여 중복 요청 방지
 */
export function memoizeAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: { maxSize?: number; ttl?: number } = {}
): (...args: TArgs) => Promise<TResult> {
  const { maxSize = 100, ttl = 5 * 60 * 1000 } = options;
  const cache = new Map<string, { promise: Promise<TResult>; expiresAt: number }>();

  return async (...args: TArgs): Promise<TResult> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && now < cached.expiresAt) {
      return cached.promise;
    }

    // 캐시 크기 제한
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey) cache.delete(oldestKey);
    }

    const promise = fn(...args);
    cache.set(key, { promise, expiresAt: now + ttl });

    // 실패 시 캐시에서 제거
    promise.catch(() => cache.delete(key));

    return promise;
  };
}

// ============================================================================
// 디바운스 & 쓰로틀
// ============================================================================

/**
 * 디바운스 함수
 *
 * @description
 * 연속 호출 중 마지막 호출만 실행
 *
 * @performance
 * - 검색 입력, 리사이즈 이벤트 등에 유용
 *
 * @example
 * const debouncedSearch = debounce((query: string) => {
 *   fetchSearchResults(query);
 * }, 300);
 */
export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  delay: number
): {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => void;
} {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: TArgs | null = null;

  const debouncedFn = (...args: TArgs): void => {
    lastArgs = args;
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debouncedFn.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFn;
}

/**
 * 쓰로틀 함수
 *
 * @description
 * 일정 시간 내 최대 1회만 실행
 *
 * @performance
 * - 스크롤, 마우스 이동 이벤트 등에 유용
 *
 * @example
 * const throttledScroll = throttle(() => {
 *   updateScrollPosition();
 * }, 100);
 */
export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  limit: number
): (...args: TArgs) => void {
  let lastRun = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: TArgs | null = null;

  return (...args: TArgs): void => {
    const now = Date.now();

    if (now - lastRun >= limit) {
      fn(...args);
      lastRun = now;
    } else {
      lastArgs = args;
      if (!timeoutId) {
        timeoutId = setTimeout(() => {
          if (lastArgs) {
            fn(...lastArgs);
            lastRun = Date.now();
            lastArgs = null;
          }
          timeoutId = null;
        }, limit - (now - lastRun));
      }
    }
  };
}

// ============================================================================
// 배치 처리
// ============================================================================

/**
 * 요청 배치 처리
 *
 * @description
 * 짧은 시간 내 여러 요청을 하나로 묶어 처리
 *
 * @performance
 * - 네트워크 요청 수 감소
 * - 데이터베이스 쿼리 최적화
 *
 * @example
 * const batchedFetch = createBatcher(
 *   async (ids: string[]) => {
 *     const users = await db.user.findMany({ where: { id: { in: ids } } });
 *     return new Map(users.map(u => [u.id, u]));
 *   },
 *   { maxBatchSize: 50, maxWaitMs: 10 }
 * );
 *
 * // 개별 호출이 자동으로 배치됨
 * const user1 = await batchedFetch('id1');
 * const user2 = await batchedFetch('id2');
 */
export function createBatcher<TKey, TValue>(
  batchFn: (keys: TKey[]) => Promise<Map<TKey, TValue>>,
  options: { maxBatchSize?: number; maxWaitMs?: number } = {}
): (key: TKey) => Promise<TValue | undefined> {
  const { maxBatchSize = 50, maxWaitMs = 10 } = options;

  let batch: TKey[] = [];
  let batchPromise: Promise<Map<TKey, TValue>> | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  const executeBatch = async (): Promise<Map<TKey, TValue>> => {
    const currentBatch = batch;
    batch = [];
    batchPromise = null;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    return batchFn(currentBatch);
  };

  return async (key: TKey): Promise<TValue | undefined> => {
    batch.push(key);

    if (batch.length >= maxBatchSize) {
      const result = await executeBatch();
      return result.get(key);
    }

    if (!batchPromise) {
      batchPromise = new Promise((resolve) => {
        timeoutId = setTimeout(async () => {
          resolve(await executeBatch());
        }, maxWaitMs);
      });
    }

    const result = await batchPromise;
    return result.get(key);
  };
}

// ============================================================================
// Lazy 로딩
// ============================================================================

/**
 * Lazy 초기화
 *
 * @description
 * 첫 접근 시에만 값을 계산
 *
 * @example
 * const heavyData = lazy(() => computeExpensiveData());
 * console.log(heavyData()); // 첫 호출 시 계산
 * console.log(heavyData()); // 캐시된 값 반환
 */
export function lazy<T>(factory: () => T): () => T {
  let value: T | undefined;
  let initialized = false;

  return (): T => {
    if (!initialized) {
      value = factory();
      initialized = true;
    }
    return value as T;
  };
}

// ============================================================================
// 성능 측정
// ============================================================================

/**
 * 성능 측정 데코레이터
 *
 * @description
 * 함수 실행 시간 측정 및 로깅
 *
 * @example
 * const measuredFn = withPerformanceTracking(
 *   myExpensiveFn,
 *   'myExpensiveFn'
 * );
 */
export function withPerformanceTracking<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  name: string,
  options: { threshold?: number; onSlow?: (duration: number) => void } = {}
): (...args: TArgs) => TResult {
  const { threshold = 100, onSlow } = options;

  return (...args: TArgs): TResult => {
    const start = performance.now();
    const result = fn(...args);
    const duration = performance.now() - start;

    if (duration > threshold) {
      console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
      onSlow?.(duration);
    }

    return result;
  };
}

/**
 * 비동기 함수 성능 측정
 */
export function withAsyncPerformanceTracking<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  name: string,
  options: { threshold?: number; onSlow?: (duration: number) => void } = {}
): (...args: TArgs) => Promise<TResult> {
  const { threshold = 100, onSlow } = options;

  return async (...args: TArgs): Promise<TResult> => {
    const start = performance.now();
    const result = await fn(...args);
    const duration = performance.now() - start;

    if (duration > threshold) {
      console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
      onSlow?.(duration);
    }

    return result;
  };
}

// ============================================================================
// Intersection Observer 헬퍼
// ============================================================================

/**
 * 뷰포트 진입 시 로드 (lazy loading)
 *
 * @description
 * 요소가 뷰포트에 들어올 때 콜백 실행
 *
 * @performance
 * - 이미지, 컴포넌트 지연 로딩
 * - 무한 스크롤 구현
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// ============================================================================
// 청크 처리
// ============================================================================

/**
 * 대용량 배열 청크 처리
 *
 * @description
 * 메인 스레드 블로킹 방지를 위한 청크 분할 처리
 *
 * @performance
 * - UI 반응성 유지
 * - 대용량 데이터 처리
 *
 * @example
 * await processInChunks(
 *   largeArray,
 *   async (chunk) => await processChunk(chunk),
 *   { chunkSize: 100 }
 * );
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (chunk: T[]) => Promise<R[]>,
  options: { chunkSize?: number; delay?: number } = {}
): Promise<R[]> {
  const { chunkSize = 100, delay = 0 } = options;
  const results: R[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await processor(chunk);
    results.push(...chunkResults);

    // 다른 태스크에 실행 기회 제공
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return results;
}
