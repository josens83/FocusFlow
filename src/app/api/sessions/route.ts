import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateSessionRewards } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const sessions = await prisma.focusSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startedAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        task: true,
        plantedTree: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: '세션을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { type, plannedDuration, taskId, tags, soundscapeId } = body;

    const focusSession = await prisma.focusSession.create({
      data: {
        userId: session.user.id,
        type: type || 'POMODORO_25',
        status: 'ACTIVE',
        plannedDuration: plannedDuration || 25,
        startedAt: new Date(),
        taskId,
        tags: tags || [],
        soundscapeId,
      },
    });

    return NextResponse.json({ session: focusSession });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: '세션 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, status, actualDuration, focusScore, distractionCount, reflection } = body;

    const focusSession = await prisma.focusSession.findUnique({
      where: { id: sessionId },
    });

    if (!focusSession || focusSession.userId !== session.user.id) {
      return NextResponse.json({ error: '세션을 찾을 수 없습니다.' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      status,
      actualDuration: actualDuration || focusSession.actualDuration,
      focusScore,
      distractionCount: distractionCount || focusSession.distractionCount,
      reflection,
    };

    if (status === 'COMPLETED' || status === 'ABANDONED') {
      updateData.endedAt = new Date();

      if (status === 'COMPLETED') {
        const rewards = calculateSessionRewards(
          actualDuration || focusSession.plannedDuration,
          focusScore || 80
        );
        updateData.experienceEarned = rewards.experience;
        updateData.coinsEarned = rewards.coins;

        // Update user stats
        await prisma.userStats.update({
          where: { userId: session.user.id },
          data: {
            totalFocusMinutes: { increment: actualDuration || focusSession.plannedDuration },
            totalSessions: { increment: 1 },
            completedSessions: { increment: 1 },
            experience: { increment: rewards.experience },
            coins: { increment: rewards.coins },
          },
        });

        // Update streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const streak = await prisma.userStreak.findUnique({
          where: { userId: session.user.id },
        });

        if (streak) {
          const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
          lastActive?.setHours(0, 0, 0, 0);

          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          let newStreak = streak.currentStreak;
          if (!lastActive || lastActive < yesterday) {
            newStreak = 1;
          } else if (lastActive.getTime() === yesterday.getTime()) {
            newStreak = streak.currentStreak + 1;
          }

          await prisma.userStreak.update({
            where: { userId: session.user.id },
            data: {
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, streak.longestStreak),
              lastActiveDate: new Date(),
            },
          });
        }
      } else {
        // Abandoned
        await prisma.userStats.update({
          where: { userId: session.user.id },
          data: {
            totalSessions: { increment: 1 },
            abandonedSessions: { increment: 1 },
          },
        });
      }
    }

    const updatedSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: '세션 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
