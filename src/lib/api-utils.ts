/**
 * @fileoverview API 유틸리티 함수들
 * @description 표준화된 API 응답, 에러 처리, Rate Limiting
 *
 * @security
 * - 에러 메시지에 민감한 정보 노출 방지
 * - Rate limiting으로 DoS 공격 방지
 * - 요청 로깅 및 감사 추적
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

// ============================================================================
// 타입 정의
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'CONFLICT'
  | 'BAD_REQUEST';

// ============================================================================
// Rate Limiting (In-Memory - 프로덕션에서는 Redis 사용 권장)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Rate Limiting 체크
 *
 * @param identifier - 사용자 식별자 (IP 또는 userId)
 * @param limit - 시간 창 내 최대 요청 수
 * @param windowMs - 시간 창 (밀리초)
 * @returns { allowed: boolean, remaining: number, resetAt: number }
 *
 * @security DoS 공격 방지
 * @performance O(1) - Map 사용
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    // 새 윈도우 시작
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

// 주기적으로 만료된 엔트리 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000);

// ============================================================================
// 표준 API 응답 헬퍼
// ============================================================================

/**
 * 성공 응답 생성
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
    },
  };

  return NextResponse.json(response, { status });
}

/**
 * 에러 응답 생성
 *
 * @security 내부 에러 세부사항을 클라이언트에 노출하지 않음
 */
export function errorResponse(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && details ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: generateRequestId(),
    },
  };

  return NextResponse.json(response, { status });
}

// ============================================================================
// 에러 핸들러
// ============================================================================

/**
 * Zod 검증 에러 처리
 */
export function handleValidationError(error: ZodError): NextResponse {
  const formattedErrors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return errorResponse(
    'VALIDATION_ERROR',
    '입력값이 올바르지 않습니다.',
    400,
    formattedErrors
  );
}

/**
 * 범용 에러 핸들러
 *
 * @security 프로덕션에서는 상세 에러 정보를 숨김
 */
export function handleError(error: unknown, context: string): NextResponse {
  // 에러 로깅 (프로덕션에서는 외부 로깅 서비스로 전송)
  console.error(`[${context}] Error:`, {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  if (error instanceof ZodError) {
    return handleValidationError(error);
  }

  // Prisma 에러 처리
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };

    switch (prismaError.code) {
      case 'P2002':
        return errorResponse(
          'CONFLICT',
          '이미 존재하는 데이터입니다.',
          409
        );
      case 'P2025':
        return errorResponse(
          'NOT_FOUND',
          '요청한 리소스를 찾을 수 없습니다.',
          404
        );
      default:
        break;
    }
  }

  return errorResponse(
    'INTERNAL_ERROR',
    '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    500
  );
}

// ============================================================================
// 인증 헬퍼
// ============================================================================

/**
 * 인증된 사용자 정보 가져오기
 *
 * @returns 인증된 사용자 ID 또는 에러 응답
 */
export async function getAuthenticatedUser(): Promise<
  { userId: string } | { error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: errorResponse('UNAUTHORIZED', '로그인이 필요합니다.', 401),
    };
  }

  return { userId: session.user.id };
}

/**
 * Rate Limit 검증이 포함된 인증 체크
 */
export async function authenticateWithRateLimit(
  request: Request,
  limit: number = 60,
  windowMs: number = 60 * 1000
): Promise<{ userId: string } | { error: NextResponse }> {
  // IP 기반 Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = checkRateLimit(`ip:${ip}`, limit, windowMs);

  if (!rateLimit.allowed) {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      ),
    };
  }

  return getAuthenticatedUser();
}

// ============================================================================
// 유틸리티
// ============================================================================

/**
 * 요청 ID 생성 (추적 및 디버깅용)
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 안전한 JSON 파싱
 */
export async function safeParseJson<T>(request: Request): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * 감사 로그 기록
 *
 * @security 중요 작업에 대한 감사 추적
 */
export function auditLog(
  action: string,
  userId: string,
  details: Record<string, unknown>
): void {
  console.log(
    JSON.stringify({
      type: 'AUDIT',
      action,
      userId,
      details,
      timestamp: new Date().toISOString(),
      // 프로덕션에서는 외부 감사 로그 서비스로 전송
    })
  );
}
