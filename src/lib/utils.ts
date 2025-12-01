import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}분`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
}

export function calculateLevel(experience: number): { level: number; progress: number; nextLevelExp: number } {
  // Level formula: level = floor(sqrt(exp / 100))
  // Experience needed for level n: n^2 * 100
  const level = Math.floor(Math.sqrt(experience / 100)) + 1;
  const currentLevelExp = Math.pow(level - 1, 2) * 100;
  const nextLevelExp = Math.pow(level, 2) * 100;
  const progress = ((experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;

  return { level, progress, nextLevelExp };
}

export function calculateSessionRewards(
  duration: number,
  focusScore: number,
  multipliers: { exp: number; coin: number } = { exp: 1, coin: 1 }
): { experience: number; coins: number } {
  // Base: 1 exp per minute, 0.5 coins per minute
  const baseExp = Math.floor(duration * (focusScore / 100));
  const baseCoins = Math.floor(duration * 0.5 * (focusScore / 100));

  return {
    experience: Math.floor(baseExp * multipliers.exp),
    coins: Math.floor(baseCoins * multipliers.coin),
  };
}

export function getStreakBonus(streakDays: number): number {
  // Bonus increases every 7 days, max 50%
  const bonus = Math.min(Math.floor(streakDays / 7) * 10, 50);
  return 1 + bonus / 100;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '늦은 밤이에요';
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '좋은 오후예요';
  return '좋은 저녁이에요';
}
