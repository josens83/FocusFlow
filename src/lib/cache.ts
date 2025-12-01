/**
 * @fileoverview 캐싱 유틸리티
 * @description 서버 사이드 캐싱을 위한 유틸리티 함수들
 *
 * @performance
 * - TTL 기반 메모리 캐시
 * - LRU 캐시 전략 지원
 * - 프로덕션에서는 Redis 사용 권장
 *
 * @security
 * - 사용자별 캐시 격리
 * - 민감한 데이터 캐시 주의
 */

// ============================================================================
// 타입 정의
// ============================================================================

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

interface CacheOptions {
  /** TTL in milliseconds (default: 5 minutes) */
  ttl?: number;
  /** Maximum cache entries (default: 1000) */
  maxSize?: number;
  /** Stale-while-revalidate time in ms */
  staleWhileRevalidate?: number;
}

// ============================================================================
// In-Memory Cache 클래스 (LRU 전략)
// ============================================================================

/**
 * LRU 기반 메모리 캐시
 *
 * @performance
 * - O(1) get/set 연산
 * - 자동 만료 정리
 * - 메모리 사용량 제한
 *
 * @example
 * const cache = new MemoryCache<User>({ ttl: 60000, maxSize: 100 });
 * cache.set('user:123', userData);
 * const user = cache.get('user:123');
 */
export class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly ttl: number;
  private readonly maxSize: number;
  private cleanupInterval: NodeJS.Timer | null = null;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl ?? 5 * 60 * 1000; // 5분
    this.maxSize = options.maxSize ?? 1000;

    // 주기적 정리 (1분마다)
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * 캐시에서 값 가져오기
   *
   * @returns 캐시된 값 또는 undefined
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // 만료 체크
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // LRU: 접근된 항목을 맨 뒤로 이동
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  /**
   * 캐시에 값 저장
   *
   * @param key - 캐시 키
   * @param value - 저장할 값
   * @param ttl - 선택적 TTL 오버라이드
   */
  set(key: string, value: T, ttl?: number): void {
    // 크기 제한 체크
    if (this.cache.size >= this.maxSize) {
      // LRU: 가장 오래된 항목 제거
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl ?? this.ttl),
      createdAt: Date.now(),
    });
  }

  /**
   * 캐시에서 값 삭제
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 패턴 매칭으로 삭제
   *
   * @param pattern - 정규표현식 패턴
   */
  deletePattern(pattern: RegExp): number {
    let deleted = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * 캐시 전체 비우기
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 캐시 크기
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 캐시 키 존재 확인
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * 만료된 항목 정리
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 정리 인터벌 중지
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// ============================================================================
// 캐시 인스턴스 (싱글톤)
// ============================================================================

// 사용자 데이터 캐시 (짧은 TTL)
export const userCache = new MemoryCache<unknown>({
  ttl: 2 * 60 * 1000, // 2분
  maxSize: 500,
});

// 세션 데이터 캐시
export const sessionCache = new MemoryCache<unknown>({
  ttl: 5 * 60 * 1000, // 5분
  maxSize: 1000,
});

// 통계 데이터 캐시 (긴 TTL)
export const statsCache = new MemoryCache<unknown>({
  ttl: 10 * 60 * 1000, // 10분
  maxSize: 200,
});

// 정적 데이터 캐시 (매우 긴 TTL)
export const staticCache = new MemoryCache<unknown>({
  ttl: 60 * 60 * 1000, // 1시간
  maxSize: 100,
});

// ============================================================================
// 캐시 헬퍼 함수
// ============================================================================

/**
 * 캐시 우선 데이터 가져오기
 *
 * @description
 * 캐시에 있으면 캐시에서, 없으면 fetcher 실행 후 캐시
 *
 * @example
 * const user = await cacheFirst(
 *   `user:${userId}`,
 *   () => prisma.user.findUnique({ where: { id: userId } }),
 *   userCache,
 *   { ttl: 60000 }
 * );
 */
export async function cacheFirst<T>(
  key: string,
  fetcher: () => Promise<T>,
  cache: MemoryCache<T>,
  options?: { ttl?: number }
): Promise<T> {
  const cached = cache.get(key);

  if (cached !== undefined) {
    return cached;
  }

  const value = await fetcher();
  cache.set(key, value, options?.ttl);

  return value;
}

/**
 * 캐시 무효화 헬퍼
 *
 * @description
 * 데이터 변경 시 관련 캐시 무효화
 *
 * @example
 * await invalidateCache('user:123', [userCache, sessionCache]);
 */
export function invalidateCache(key: string, caches: MemoryCache<unknown>[]): void {
  for (const cache of caches) {
    cache.delete(key);
  }
}

/**
 * 패턴 기반 캐시 무효화
 *
 * @example
 * invalidateCachePattern(/^user:123:/, [sessionCache, statsCache]);
 */
export function invalidateCachePattern(
  pattern: RegExp,
  caches: MemoryCache<unknown>[]
): number {
  let total = 0;
  for (const cache of caches) {
    total += cache.deletePattern(pattern);
  }
  return total;
}

// ============================================================================
// 캐시 키 생성 헬퍼
// ============================================================================

/**
 * 사용자별 캐시 키 생성
 *
 * @security 사용자 데이터 격리
 */
export function userCacheKey(userId: string, resource: string): string {
  return `user:${userId}:${resource}`;
}

/**
 * 페이지네이션 캐시 키 생성
 */
export function paginatedCacheKey(
  base: string,
  params: { limit?: number; offset?: number; [key: string]: unknown }
): string {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(':');

  return `${base}:${sortedParams}`;
}

// ============================================================================
// Next.js 캐시 헤더
// ============================================================================

/**
 * 캐시 제어 헤더 생성
 *
 * @description
 * HTTP 캐시 헤더를 사용한 CDN/브라우저 캐싱
 */
export function getCacheHeaders(options: {
  maxAge?: number;
  staleWhileRevalidate?: number;
  isPrivate?: boolean;
}): Record<string, string> {
  const { maxAge = 60, staleWhileRevalidate = 60, isPrivate = true } = options;

  const directives = [
    isPrivate ? 'private' : 'public',
    `max-age=${maxAge}`,
    `stale-while-revalidate=${staleWhileRevalidate}`,
  ];

  return {
    'Cache-Control': directives.join(', '),
  };
}

/**
 * 캐시 비활성화 헤더
 */
export const noCacheHeaders: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};
