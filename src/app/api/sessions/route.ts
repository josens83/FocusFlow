/**
 * @fileoverview Focus Session API 엔드포인트
 *
 * @description
 * 집중 세션의 CRUD 작업을 처리합니다.
 * - GET: 사용자 세션 목록 조회
 * - POST: 새 세션 시작
 * - PATCH: 세션 업데이트 (완료/중단)
 *
 * @security
 * - 인증 필수 (NextAuth)
 * - Rate Limiting
 * - 입력 검증 (Zod)
 * - 소유권 검증 (자신의 세션만 수정 가능)
 *
 * @performance
 * - 페이지네이션 적용
 * - 필요한 필드만 선택 조회
 */

import prisma from '@/lib/prisma';
import {
  createSessionSchema,
  updateSessionSchema,
  paginationSchema,
} from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  handleError,
  authenticateWithRateLimit,
  auditLog,
} from '@/lib/api-utils';
import { calculateSessionRewards } from '@/lib/utils';

// ============================================================================
// GET /api/sessions - 세션 목록 조회
// ============================================================================

/**
 * 사용자의 집중 세션 목록을 조회합니다.
 *
 * @param request - Query params: limit (1-100), offset (0+)
 * @returns { sessions: FocusSession[], pagination: {...} }
 *
 * @example GET /api/sessions?limit=20&offset=0
 */
export async function GET(request: Request) {
  try {
    // 1. 인증 및 Rate Limiting
    const auth = await authenticateWithRateLimit(request, 100, 60 * 1000);
    if ('error' in auth) return auth.error;

    // 2. 쿼리 파라미터 검증
    const { searchParams } = new URL(request.url);
    const paginationResult = paginationSchema.safeParse({
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    });

    if (!paginationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        '페이지네이션 파라미터가 올바르지 않습니다.',
        400
      );
    }

    const { limit, offset } = paginationResult.data;

    // 3. 세션 조회 (병렬로 총 개수도 조회)
    const [sessions, total] = await Promise.all([
      prisma.focusSession.findMany({
        where: { userId: auth.userId },
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          task: { select: { id: true, title: true } },
          plantedTree: { select: { id: true, status: true, growthStage: true } },
        },
      }),
      prisma.focusSession.count({ where: { userId: auth.userId } }),
    ]);

    return successResponse({
      sessions,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    return handleError(error, 'GET /api/sessions');
  }
}

// ============================================================================
// POST /api/sessions - 새 세션 시작
// ============================================================================

/**
 * 새로운 집중 세션을 시작합니다.
 *
 * @param request - { type, plannedDuration, taskId?, tags?, soundscapeId? }
 * @returns { session: FocusSession }
 *
 * @sideEffects 활성 세션이 있으면 자동으로 중단 처리
 */
export async function POST(request: Request) {
  try {
    // 1. 인증 및 Rate Limiting (분당 30회)
    const auth = await authenticateWithRateLimit(request, 30, 60 * 1000);
    if ('error' in auth) return auth.error;

    // 2. 요청 본문 검증
    const body = await request.json();
    const validationResult = createSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        '입력값이 올바르지 않습니다.',
        400,
        validationResult.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      );
    }

    const data = validationResult.data;

    // 3. 기존 활성 세션 확인 및 자동 중단
    const activeSession = await prisma.focusSession.findFirst({
      where: { userId: auth.userId, status: { in: ['ACTIVE', 'PAUSED'] } },
    });

    if (activeSession) {
      await prisma.focusSession.update({
        where: { id: activeSession.id },
        data: { status: 'ABANDONED', endedAt: new Date() },
      });
      auditLog('SESSION_AUTO_ABANDONED', auth.userId, {
        sessionId: activeSession.id,
        reason: 'new_session_started',
      });
    }

    // 4. 새 세션 생성
    const focusSession = await prisma.focusSession.create({
      data: {
        userId: auth.userId,
        type: data.type,
        status: 'ACTIVE',
        plannedDuration: data.plannedDuration,
        startedAt: new Date(),
        taskId: data.taskId,
        tags: data.tags,
        soundscapeId: data.soundscapeId,
      },
    });

    auditLog('SESSION_STARTED', auth.userId, {
      sessionId: focusSession.id,
      type: data.type,
      duration: data.plannedDuration,
    });

    return successResponse({ session: focusSession }, 201);
  } catch (error) {
    return handleError(error, 'POST /api/sessions');
  }
}

// ============================================================================
// PATCH /api/sessions - 세션 업데이트
// ============================================================================

/**
 * 세션을 업데이트합니다 (일시정지, 완료, 중단 등).
 *
 * @param request - { sessionId, status?, actualDuration?, focusScore?, ... }
 * @returns { session: FocusSession }
 *
 * @security 자신의 세션만 수정 가능
 */
export async function PATCH(request: Request) {
  try {
    // 1. 인증 및 Rate Limiting
    const auth = await authenticateWithRateLimit(request, 60, 60 * 1000);
    if ('error' in auth) return auth.error;

    // 2. 요청 본문 검증
    const body = await request.json();
    const validationResult = updateSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        'VALIDATION_ERROR',
        '입력값이 올바르지 않습니다.',
        400,
        validationResult.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      );
    }

    const data = validationResult.data;

    // 3. 세션 조회 및 소유권 확인
    const focusSession = await prisma.focusSession.findUnique({
      where: { id: data.sessionId },
    });

    if (!focusSession) {
      return errorResponse('NOT_FOUND', '세션을 찾을 수 없습니다.', 404);
    }

    if (focusSession.userId !== auth.userId) {
      auditLog('SECURITY_VIOLATION', auth.userId, {
        action: 'access_other_session',
        targetSessionId: data.sessionId,
      });
      return errorResponse('FORBIDDEN', '접근 권한이 없습니다.', 403);
    }

    // 4. 업데이트 데이터 구성
    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.actualDuration !== undefined) updateData.actualDuration = data.actualDuration;
    if (data.focusScore !== undefined) updateData.focusScore = data.focusScore;
    if (data.distractionCount !== undefined) updateData.distractionCount = data.distractionCount;
    if (data.reflection !== undefined) updateData.reflection = data.reflection;

    // 5. 상태 변경에 따른 추가 처리
    if (data.status === 'COMPLETED' || data.status === 'ABANDONED') {
      updateData.endedAt = new Date();

      if (data.status === 'COMPLETED') {
        const duration = data.actualDuration || focusSession.plannedDuration;
        const score = data.focusScore || 80;
        const rewards = calculateSessionRewards(duration, score);

        updateData.experienceEarned = rewards.experience;
        updateData.coinsEarned = rewards.coins;

        // 통계 및 스트릭 업데이트
        await Promise.all([
          prisma.userStats.update({
            where: { userId: auth.userId },
            data: {
              totalFocusMinutes: { increment: duration },
              totalSessions: { increment: 1 },
              completedSessions: { increment: 1 },
              experience: { increment: rewards.experience },
              coins: { increment: rewards.coins },
            },
          }),
          updateStreak(auth.userId),
        ]);

        auditLog('SESSION_COMPLETED', auth.userId, {
          sessionId: data.sessionId,
          duration,
          rewards,
        });
      } else {
        await prisma.userStats.update({
          where: { userId: auth.userId },
          data: {
            totalSessions: { increment: 1 },
            abandonedSessions: { increment: 1 },
          },
        });
        auditLog('SESSION_ABANDONED', auth.userId, { sessionId: data.sessionId });
      }
    }

    // 6. 세션 업데이트
    const updatedSession = await prisma.focusSession.update({
      where: { id: data.sessionId },
      data: updateData,
    });

    return successResponse({ session: updatedSession });
  } catch (error) {
    return handleError(error, 'PATCH /api/sessions');
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 스트릭 업데이트
 * @description 오늘 첫 완료 세션인 경우에만 스트릭 업데이트
 */
async function updateStreak(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.userStreak.findUnique({ where: { userId } });
  if (!streak) return;

  const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
  lastActive?.setHours(0, 0, 0, 0);

  // 오늘 이미 활동했으면 스킵
  if (lastActive && lastActive.getTime() === today.getTime()) return;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = streak.currentStreak;
  if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
    newStreak = 1; // 스트릭 리셋
  } else if (lastActive.getTime() === yesterday.getTime()) {
    newStreak = streak.currentStreak + 1; // 스트릭 연장
  }

  await prisma.userStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streak.longestStreak),
      lastActiveDate: new Date(),
    },
  });
}
