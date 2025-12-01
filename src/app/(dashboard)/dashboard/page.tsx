'use client';

import { Clock, TreeDeciduous, Target, Flame, TrendingUp, Calendar } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatMinutes } from '@/lib/utils';
import type { UserStreak } from '@/types';

// Mock data
const MOCK_STATS = {
  totalFocusMinutes: 1250,
  totalSessions: 48,
  completedSessions: 45,
  abandonedSessions: 3,
  totalTreesPlanted: 45,
  totalTreesGrown: 42,
  totalTreesWithered: 3,
  totalTasksCompleted: 32,
  level: 8,
  experience: 640,
  coins: 320,
  avgFocusScore: 85,
  longestSession: 90,
};

const MOCK_STREAK: UserStreak = {
  currentStreak: 5,
  longestStreak: 12,
  lastActiveDate: new Date(),
};

const MOCK_GOALS = [
  { name: '주간 집중 시간', current: 420, target: 600, unit: '분' },
  { name: '주간 세션', current: 16, target: 20, unit: '회' },
  { name: '연속 출석', current: 5, target: 7, unit: '일' },
];

const MOCK_RECENT_SESSIONS = [
  { date: '오늘', sessions: 3, minutes: 75, focusScore: 88 },
  { date: '어제', sessions: 4, minutes: 100, focusScore: 92 },
  { date: '2일 전', sessions: 2, minutes: 50, focusScore: 78 },
  { date: '3일 전', sessions: 5, minutes: 125, focusScore: 85 },
];

export default function DashboardPage() {
  const nextLevelExp = Math.pow(MOCK_STATS.level, 2) * 100;
  const currentLevelExp = Math.pow(MOCK_STATS.level - 1, 2) * 100;
  const levelProgress =
    ((MOCK_STATS.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-gray-500">당신의 집중력 여정을 확인하세요</p>
      </div>

      {/* Level Progress */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="premium" className="text-lg px-3 py-1">
                  Lv.{MOCK_STATS.level}
                </Badge>
                <span className="text-gray-500">집중 마스터</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                다음 레벨까지 {nextLevelExp - MOCK_STATS.experience} XP
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{MOCK_STATS.experience}</p>
              <p className="text-sm text-gray-500">총 경험치</p>
            </div>
          </div>
          <Progress value={levelProgress} className="mt-4" size="lg" />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="총 집중 시간"
          value={formatMinutes(MOCK_STATS.totalFocusMinutes)}
          icon={Clock}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="완료 세션"
          value={MOCK_STATS.completedSessions}
          subtitle={`${MOCK_STATS.totalSessions}회 중`}
          icon={Target}
          variant="success"
        />
        <StatsCard
          title="자란 나무"
          value={MOCK_STATS.totalTreesGrown}
          icon={TreeDeciduous}
          variant="primary"
        />
        <StatsCard
          title="평균 집중 점수"
          value={`${MOCK_STATS.avgFocusScore}점`}
          icon={TrendingUp}
          variant="warning"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Streak */}
          <StreakCard streak={MOCK_STREAK} />

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-500" />
                최근 기록
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_RECENT_SESSIONS.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{session.date}</p>
                      <p className="text-sm text-gray-500">
                        {session.sessions}세션 · {session.minutes}분
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary-600">
                        {session.focusScore}점
                      </p>
                      <p className="text-xs text-gray-400">집중 점수</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Goals Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary-500" />
                주간 목표
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_GOALS.map((goal) => (
                <div key={goal.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{goal.name}</span>
                    <span className="font-medium text-gray-900">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <Progress
                    value={(goal.current / goal.target) * 100}
                    className="mt-2"
                    variant={
                      goal.current >= goal.target
                        ? 'success'
                        : goal.current >= goal.target * 0.7
                          ? 'warning'
                          : 'default'
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">이번 주 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">16</p>
                  <p className="text-xs text-gray-500">세션</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">7시간</p>
                  <p className="text-xs text-gray-500">집중 시간</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">15</p>
                  <p className="text-xs text-gray-500">나무 성장</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">87점</p>
                  <p className="text-xs text-gray-500">평균 점수</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coins */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700">보유 코인</p>
                  <p className="text-3xl font-bold text-amber-800">
                    {MOCK_STATS.coins}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200">
                  <span className="text-2xl">🪙</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
