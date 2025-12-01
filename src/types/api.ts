/**
 * @fileoverview API 타입 정의
 * @description API 요청/응답에 대한 타입 안전성을 제공합니다.
 *
 * @standards
 * - 모든 API 응답은 ApiResponse<T> 형식을 따름
 * - 에러 코드는 ApiErrorCode 열거형 사용
 * - 페이지네이션은 PaginatedResponse<T> 형식 사용
 */

import type {
  User,
  FocusSession,
  Garden,
  Task,
  UserStats,
  UserStreak,
  Subscription,
  Achievement,
  Soundscape,
  SessionType,
  SessionStatus,
  SubscriptionTier,
} from './index';

// ============================================================================
// 기본 API 응답 타입
// ============================================================================

/**
 * 표준 API 성공 응답
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

/**
 * 표준 API 에러 응답
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: ApiErrorDetail[];
  };
  meta: ApiMeta;
}

/**
 * API 응답 유니온 타입
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * API 메타데이터
 */
export interface ApiMeta {
  timestamp: string;
  requestId: string;
  /** 응답 처리 시간 (ms) */
  duration?: number;
}

/**
 * 에러 세부 정보
 */
export interface ApiErrorDetail {
  field: string;
  message: string;
  code?: string;
}

/**
 * API 에러 코드
 */
export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'SERVICE_UNAVAILABLE';

// ============================================================================
// 페이지네이션 타입
// ============================================================================

/**
 * 페이지네이션 요청 파라미터
 */
export interface PaginationParams {
  /** 페이지당 항목 수 (기본: 10, 최대: 100) */
  limit?: number;
  /** 건너뛸 항목 수 */
  offset?: number;
  /** 정렬 필드 */
  sortBy?: string;
  /** 정렬 방향 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  /** 현재 페이지의 항목 수 */
  count: number;
  /** 전체 항목 수 */
  total: number;
  /** 요청된 limit */
  limit: number;
  /** 요청된 offset */
  offset: number;
  /** 다음 페이지 존재 여부 */
  hasMore: boolean;
}

/**
 * 페이지네이션된 응답
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ============================================================================
// Auth API 타입
// ============================================================================

/**
 * 회원가입 요청
 */
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * 회원가입 응답
 */
export interface SignupResponse {
  user: Pick<User, 'id' | 'name' | 'email' | 'createdAt'>;
}

/**
 * 로그인 요청 (NextAuth credentials)
 */
export interface LoginRequest {
  email: string;
  password: string;
}

// ============================================================================
// Session API 타입
// ============================================================================

/**
 * 세션 생성 요청
 */
export interface CreateSessionRequest {
  type?: SessionType;
  plannedDuration?: number;
  taskId?: string;
  tags?: string[];
  soundscapeId?: string;
}

/**
 * 세션 생성 응답
 */
export interface CreateSessionResponse {
  session: FocusSession;
}

/**
 * 세션 업데이트 요청
 */
export interface UpdateSessionRequest {
  sessionId: string;
  status?: SessionStatus;
  actualDuration?: number;
  focusScore?: number;
  interruptions?: number;
  notes?: string;
}

/**
 * 세션 업데이트 응답
 */
export interface UpdateSessionResponse {
  session: FocusSession;
  rewards?: SessionRewards;
}

/**
 * 세션 보상 정보
 */
export interface SessionRewards {
  experience: number;
  coins: number;
  bonuses?: {
    type: string;
    multiplier: number;
  }[];
}

/**
 * 세션 목록 필터
 */
export interface SessionListFilter extends PaginationParams {
  status?: SessionStatus;
  type?: SessionType;
  startDate?: string;
  endDate?: string;
  taskId?: string;
}

/**
 * 세션 목록 응답
 */
export interface SessionListResponse {
  sessions: FocusSession[];
  pagination: PaginationMeta;
}

// ============================================================================
// Stats API 타입
// ============================================================================

/**
 * 사용자 통계 응답
 */
export interface StatsResponse {
  stats: UserStats;
  streak: UserStreak;
  subscription: Subscription | null;
  todayStats: DailyStats;
  weekStats: WeeklyStats;
}

/**
 * 일일 통계
 */
export interface DailyStats {
  totalMinutes: number;
  sessionsCompleted: number;
  focusScore: number;
  coinsEarned: number;
  experienceEarned: number;
}

/**
 * 주간 통계
 */
export interface WeeklyStats {
  totalMinutes: number;
  sessionsCompleted: number;
  averageFocusScore: number;
  dailyBreakdown: {
    date: string;
    minutes: number;
    sessions: number;
  }[];
}

/**
 * 통계 범위 요청
 */
export interface StatsRangeRequest {
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}

// ============================================================================
// Garden API 타입
// ============================================================================

/**
 * 가든 응답
 */
export interface GardenResponse {
  garden: Garden & {
    plantedTrees: PlantedTreeWithPlant[];
  };
  availablePlants: Soundscape[];
}

/**
 * 심어진 나무 (식물 정보 포함)
 */
export interface PlantedTreeWithPlant {
  id: string;
  plantId: string;
  gardenId: string;
  positionX: number;
  positionY: number;
  plantedAt: Date;
  plant: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    rarity: string;
  };
}

/**
 * 나무 심기 요청
 */
export interface PlantTreeRequest {
  plantId: string;
  positionX: number;
  positionY: number;
}

/**
 * 나무 심기 응답
 */
export interface PlantTreeResponse {
  tree: PlantedTreeWithPlant;
  garden: {
    totalTrees: number;
  };
}

// ============================================================================
// Task API 타입
// ============================================================================

/**
 * 태스크 생성 요청
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  estimatedPomodoros?: number;
  projectId?: string;
  tags?: string[];
}

/**
 * 태스크 생성 응답
 */
export interface CreateTaskResponse {
  task: Task;
}

/**
 * 태스크 업데이트 요청
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  dueDate?: string;
  completedPomodoros?: number;
}

/**
 * 태스크 목록 필터
 */
export interface TaskListFilter extends PaginationParams {
  status?: string;
  priority?: string;
  projectId?: string;
  search?: string;
}

// ============================================================================
// Payment API 타입
// ============================================================================

/**
 * 결제 체크아웃 요청
 */
export interface CheckoutRequest {
  tier: SubscriptionTier;
  billingPeriod: 'monthly' | 'yearly';
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * 결제 체크아웃 응답
 */
export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

/**
 * 구독 상태 응답
 */
export interface SubscriptionStatusResponse {
  subscription: Subscription | null;
  features: SubscriptionFeatures;
}

/**
 * 구독 기능 목록
 */
export interface SubscriptionFeatures {
  maxDailyMinutes: number;
  maxSessions: number;
  soundscapesAccess: 'basic' | 'premium' | 'all';
  analyticsAccess: 'basic' | 'advanced' | 'full';
  teamFeatures: boolean;
  prioritySupport: boolean;
}

// ============================================================================
// Achievement API 타입
// ============================================================================

/**
 * 성취 목록 응답
 */
export interface AchievementListResponse {
  achievements: AchievementWithProgress[];
  totalUnlocked: number;
  recentlyUnlocked: AchievementWithProgress[];
}

/**
 * 성취 (진행도 포함)
 */
export interface AchievementWithProgress extends Achievement {
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  progressMax: number;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * API 응답이 성공인지 확인하는 타입 가드
 */
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * API 응답이 에러인지 확인하는 타입 가드
 */
export function isApiError<T>(
  response: ApiResponse<T>
): response is ApiErrorResponse {
  return response.success === false;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * API 핸들러 함수 타입
 */
export type ApiHandler<TReq, TRes> = (
  request: TReq
) => Promise<ApiResponse<TRes>>;

/**
 * 뮤테이션 결과 타입
 */
export type MutationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
