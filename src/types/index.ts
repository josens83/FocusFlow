// Session Types
export type SessionType =
  | 'POMODORO_25'
  | 'POMODORO_50'
  | 'POMODORO_90'
  | 'CUSTOM'
  | 'FLOW_STATE'
  | 'MICRO_FOCUS';

export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';

export interface FocusSession {
  id: string;
  userId: string;
  type: SessionType;
  status: SessionStatus;
  plannedDuration: number;
  actualDuration: number;
  startedAt: Date;
  endedAt?: Date;
  pausedAt?: Date;
  totalPauseDuration: number;
  taskId?: string;
  tags: string[];
  focusScore?: number;
  distractionCount: number;
  soundscapeId?: string;
  experienceEarned: number;
  coinsEarned: number;
  reflection?: string;
}

// Timer Types
export interface TimerState {
  status: 'idle' | 'running' | 'paused' | 'break' | 'completed';
  timeRemaining: number;
  totalTime: number;
  sessionType: SessionType;
  currentSession: number;
  isBreak: boolean;
}

export interface TimerSettings {
  defaultWorkDuration: number;
  defaultShortBreak: number;
  defaultLongBreak: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartNextSession: boolean;
  strictMode: boolean;
  strictModeGracePeriod: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationSound: string;
}

// Garden Types
export type GardenTheme =
  | 'ZEN_GARDEN'
  | 'FOREST'
  | 'TROPICAL'
  | 'DESERT'
  | 'UNDERWATER'
  | 'SPACE'
  | 'PIXEL';

export type PlantRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type PlantEffect = 'FOCUS_BOOST' | 'COIN_MAGNET' | 'SHIELD' | 'TIME_FREEZE' | 'TEAM_AURA';
export type TreeStatus = 'GROWING' | 'GROWN' | 'WITHERED';

export interface Plant {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  rarity: PlantRarity;
  minFocusMinutes: number;
  growthStages: number;
  experienceMultiplier: number;
  coinMultiplier: number;
  spriteUrl: string;
  specialEffect?: PlantEffect;
  isPremium: boolean;
  unlockLevel: number;
  unlockCoins: number;
}

export interface PlantedTree {
  id: string;
  plantId: string;
  plant: Plant;
  positionX: number;
  positionY: number;
  growthStage: number;
  status: TreeStatus;
  plantedAt: Date;
  grownAt?: Date;
}

export interface Garden {
  id: string;
  name: string;
  theme: GardenTheme;
  width: number;
  height: number;
  plantedTrees: PlantedTree[];
}

// Task Types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  tags: string[];
  estimatedMinutes?: number;
  actualMinutes: number;
  deadline?: Date;
  status: TaskStatus;
  priority: TaskPriority;
  completedPomodoros: number;
  createdAt: Date;
  completedAt?: Date;
}

// Stats Types
export interface UserStats {
  totalFocusMinutes: number;
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  totalTreesPlanted: number;
  totalTreesGrown: number;
  totalTreesWithered: number;
  totalTasksCompleted: number;
  level: number;
  experience: number;
  coins: number;
  avgFocusScore: number;
  longestSession: number;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
}

// Sound Types
export type SoundCategory = 'NATURE' | 'AMBIENT' | 'MUSIC' | 'BINAURAL' | 'WHITE_NOISE' | 'ASMR';

export interface Soundscape {
  id: string;
  name: string;
  nameKo: string;
  category: SoundCategory;
  audioUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  isLoop: boolean;
  isPremium: boolean;
}

// Subscription Types
export type SubscriptionPlan = 'FREE' | 'PREMIUM' | 'TEAM';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING';

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCurrentPeriodEnd?: Date;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  icon: string;
  type: string;
  requirement: number;
  experienceReward: number;
  coinReward: number;
  unlockedAt?: Date;
}
