/**
 * @fileoverview Zod 스키마 정의 - 모든 API 입력 검증에 사용
 * @description 타입 안전성과 런타임 검증을 동시에 제공
 *
 * @security 모든 외부 입력은 이 스키마를 통해 검증되어야 함
 */

import { z } from 'zod';

// ============================================================================
// 공통 스키마
// ============================================================================

/**
 * 이메일 검증 스키마
 * - 표준 이메일 형식 검증
 * - XSS 방지를 위한 특수문자 이스케이프
 */
export const emailSchema = z
  .string()
  .email('유효한 이메일 주소를 입력해주세요.')
  .max(255, '이메일은 255자 이하여야 합니다.')
  .transform((email) => email.toLowerCase().trim());

/**
 * 비밀번호 검증 스키마
 * - 최소 8자, 최대 128자
 * - 대문자, 소문자, 숫자, 특수문자 각 1개 이상 필수
 * @security OWASP 비밀번호 가이드라인 준수
 */
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .max(128, '비밀번호는 128자 이하여야 합니다.')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    '비밀번호는 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 각각 1개 이상 포함해야 합니다.'
  );

/**
 * 사용자 이름 검증 스키마
 * - XSS 방지를 위해 HTML 태그 제거
 */
export const nameSchema = z
  .string()
  .min(2, '이름은 최소 2자 이상이어야 합니다.')
  .max(50, '이름은 50자 이하여야 합니다.')
  .transform((name) => name.trim().replace(/<[^>]*>/g, ''));

/**
 * UUID 검증 스키마
 */
export const uuidSchema = z.string().cuid();

/**
 * 페이지네이션 스키마
 * @security limit에 최대값 제한으로 DoS 방지
 */
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

// ============================================================================
// 인증 관련 스키마
// ============================================================================

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

// ============================================================================
// 세션 관련 스키마
// ============================================================================

export const sessionTypeSchema = z.enum([
  'POMODORO_25',
  'POMODORO_50',
  'POMODORO_90',
  'CUSTOM',
  'FLOW_STATE',
  'MICRO_FOCUS',
]);

export const sessionStatusSchema = z.enum([
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'ABANDONED',
]);

export const createSessionSchema = z.object({
  type: sessionTypeSchema.default('POMODORO_25'),
  plannedDuration: z.number().int().min(1).max(180).default(25),
  taskId: uuidSchema.optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  soundscapeId: uuidSchema.optional().nullable(),
});

export const updateSessionSchema = z.object({
  sessionId: uuidSchema,
  status: sessionStatusSchema.optional(),
  actualDuration: z.number().int().min(0).max(180).optional(),
  focusScore: z.number().int().min(0).max(100).optional(),
  distractionCount: z.number().int().min(0).optional(),
  reflection: z.string().max(1000).optional().nullable(),
});

// ============================================================================
// 정원 관련 스키마
// ============================================================================

export const gardenThemeSchema = z.enum([
  'ZEN_GARDEN',
  'FOREST',
  'TROPICAL',
  'DESERT',
  'UNDERWATER',
  'SPACE',
  'PIXEL',
]);

export const updateGardenSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  theme: gardenThemeSchema.optional(),
});

export const plantTreeSchema = z.object({
  sessionId: uuidSchema,
  plantId: uuidSchema,
});

// ============================================================================
// 태스크 관련 스키마
// ============================================================================

export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200).transform((s) => s.trim()),
  description: z.string().max(2000).optional().nullable(),
  projectId: uuidSchema.optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  estimatedMinutes: z.number().int().min(1).max(480).optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
  priority: taskPrioritySchema.default('MEDIUM'),
});

export const updateTaskSchema = z.object({
  taskId: uuidSchema,
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  deadline: z.coerce.date().optional().nullable(),
});

// ============================================================================
// 설정 관련 스키마
// ============================================================================

export const updateSettingsSchema = z.object({
  defaultWorkDuration: z.number().int().min(5).max(120).optional(),
  defaultShortBreak: z.number().int().min(1).max(30).optional(),
  defaultLongBreak: z.number().int().min(5).max(60).optional(),
  sessionsBeforeLongBreak: z.number().int().min(1).max(10).optional(),
  autoStartBreaks: z.boolean().optional(),
  autoStartNextSession: z.boolean().optional(),
  strictMode: z.boolean().optional(),
  strictModeGracePeriod: z.number().int().min(0).max(60).optional(),
  soundEnabled: z.boolean().optional(),
  vibrationEnabled: z.boolean().optional(),
  notificationSound: z.string().max(50).optional(),
  dailySessionGoal: z.number().int().min(1).max(50).optional(),
  dailyFocusMinuteGoal: z.number().int().min(10).max(720).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

// ============================================================================
// 결제 관련 스키마
// ============================================================================

export const checkoutSchema = z.object({
  planId: z.enum(['premium_monthly', 'premium_yearly', 'team']),
});

// ============================================================================
// 타입 내보내기
// ============================================================================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type UpdateGardenInput = z.infer<typeof updateGardenSchema>;
export type PlantTreeInput = z.infer<typeof plantTreeSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
