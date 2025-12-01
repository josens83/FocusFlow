import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const [stats, streak, subscription] = await Promise.all([
      prisma.userStats.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.userStreak.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.subscription.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    // Get today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = await prisma.focusSession.findMany({
      where: {
        userId: session.user.id,
        startedAt: { gte: today },
      },
    });

    const todayStats = {
      sessions: todaySessions.length,
      completedSessions: todaySessions.filter((s) => s.status === 'COMPLETED').length,
      focusMinutes: todaySessions.reduce((sum, s) => sum + s.actualDuration, 0),
    };

    // Get this week's sessions
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const weekSessions = await prisma.focusSession.findMany({
      where: {
        userId: session.user.id,
        startedAt: { gte: weekStart },
      },
    });

    const weekStats = {
      sessions: weekSessions.length,
      completedSessions: weekSessions.filter((s) => s.status === 'COMPLETED').length,
      focusMinutes: weekSessions.reduce((sum, s) => sum + s.actualDuration, 0),
      avgFocusScore:
        weekSessions.length > 0
          ? Math.round(
              weekSessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) /
                weekSessions.filter((s) => s.focusScore).length
            )
          : 0,
    };

    return NextResponse.json({
      stats,
      streak,
      subscription,
      todayStats,
      weekStats,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: '통계를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
