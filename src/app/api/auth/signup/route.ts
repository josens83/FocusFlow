/**
 * @fileoverview 회원가입 API 엔드포인트
 *
 * @description
 * 새 사용자 계정을 생성하고 초기 데이터를 설정합니다.
 *
 * @security
 * - 이메일 형식 검증
 * - 비밀번호 강도 검증 (대소문자, 숫자, 특수문자)
 * - Rate Limiting (IP당 분당 5회)
 * - 비밀번호 bcrypt 해싱 (salt rounds: 12)
 *
 * @performance
 * - 사용자 초기화 데이터는 병렬 생성
 * - 트랜잭션으로 원자성 보장
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signupSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  handleError,
  checkRateLimit,
  auditLog,
} from '@/lib/api-utils';

// Rate limit: 분당 5회 (Brute force 방지)
const SIGNUP_RATE_LIMIT = 5;
const SIGNUP_RATE_WINDOW = 60 * 1000;

/**
 * POST /api/auth/signup
 *
 * @param request - { name: string, email: string, password: string }
 * @returns { user: { id, name, email } }
 *
 * @throws 400 - 입력값 검증 실패
 * @throws 409 - 이메일 중복
 * @throws 429 - Rate limit 초과
 * @throws 500 - 서버 오류
 */
export async function POST(request: Request) {
  try {
    // 1. Rate Limiting 체크
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(
      `signup:${ip}`,
      SIGNUP_RATE_LIMIT,
      SIGNUP_RATE_WINDOW
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '회원가입 요청이 너무 많습니다. 1분 후 다시 시도해주세요.',
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (rateLimit.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // 2. 요청 본문 파싱 및 검증
    const body = await request.json();
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return errorResponse('VALIDATION_ERROR', '입력값이 올바르지 않습니다.', 400, errors);
    }

    const { name, email, password } = validationResult.data;

    // 3. 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return errorResponse('CONFLICT', '이미 사용 중인 이메일입니다.', 409);
    }

    // 4. 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. 트랜잭션으로 사용자 및 초기 데이터 생성
    const user = await prisma.$transaction(async (tx) => {
      // 사용자 생성
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      // 초기 데이터 병렬 생성
      await Promise.all([
        tx.userStats.create({ data: { userId: newUser.id } }),
        tx.userStreak.create({ data: { userId: newUser.id } }),
        tx.userSettings.create({ data: { userId: newUser.id } }),
        tx.garden.create({
          data: {
            userId: newUser.id,
            name: '나의 정원',
          },
        }),
        tx.subscription.create({
          data: {
            userId: newUser.id,
            plan: 'FREE',
          },
        }),
      ]);

      return newUser;
    });

    // 6. 감사 로그
    auditLog('USER_SIGNUP', user.id, {
      email: user.email,
      ip,
    });

    // 7. 성공 응답 (비밀번호 제외)
    return successResponse(
      {
        message: '회원가입이 완료되었습니다.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      201
    );
  } catch (error) {
    return handleError(error, 'POST /api/auth/signup');
  }
}
