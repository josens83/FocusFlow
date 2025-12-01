'use client';

import { motion } from 'framer-motion';
import { Flame, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { UserStreak } from '@/types';

interface StreakCardProps {
  streak: UserStreak;
}

export function StreakCard({ streak }: StreakCardProps) {
  const { currentStreak, longestStreak } = streak;

  // Get last 7 days (mock for now)
  const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
  const today = new Date().getDay();
  const activeDays = Array(7)
    .fill(false)
    .map((_, i) => i < currentStreak % 7);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">현재 스트릭</p>
            <div className="mt-1 flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Flame className="h-6 w-6 text-orange-500" />
              </motion.div>
              <span className="text-3xl font-bold text-gray-900">
                {currentStreak}
              </span>
              <span className="text-lg text-gray-500">일</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-600">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">최고 기록</span>
            </div>
            <p className="mt-1 text-xl font-semibold text-gray-900">
              {longestStreak}일
            </p>
          </div>
        </div>

        {/* Week visualization */}
        <div className="mt-4 flex justify-between">
          {weekDays.map((day, i) => {
            const isActive = activeDays[i];
            const isToday = i === (today === 0 ? 6 : today - 1);

            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : isToday
                        ? 'border-2 border-primary-500 bg-white'
                        : 'bg-gray-100'
                  }`}
                >
                  {isActive && <Flame className="h-4 w-4" />}
                </motion.div>
                <span
                  className={`text-xs ${
                    isToday ? 'font-medium text-primary-600' : 'text-gray-400'
                  }`}
                >
                  {day}
                </span>
              </div>
            );
          })}
        </div>

        {/* Motivation message */}
        <div className="mt-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-3 text-center">
          <p className="text-sm text-amber-700">
            {currentStreak === 0
              ? '오늘 첫 세션을 시작해보세요!'
              : currentStreak < 7
                ? `${7 - currentStreak}일만 더 달성하면 주간 스트릭!`
                : '대단해요! 꾸준함이 성공의 비결이에요.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
