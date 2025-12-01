import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, plantId } = body;

    // Get the session
    const focusSession = await prisma.focusSession.findUnique({
      where: { id: sessionId },
    });

    if (!focusSession || focusSession.userId !== session.user.id) {
      return NextResponse.json({ error: '세션을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (focusSession.status !== 'COMPLETED') {
      return NextResponse.json({ error: '완료된 세션만 나무를 심을 수 있습니다.' }, { status: 400 });
    }

    // Get the garden
    const garden = await prisma.garden.findUnique({
      where: { userId: session.user.id },
      include: { plantedTrees: true },
    });

    if (!garden) {
      return NextResponse.json({ error: '정원을 찾을 수 없습니다.' }, { status: 404 });
    }

    // Find empty position
    const occupiedPositions = new Set(
      garden.plantedTrees.map((t) => `${t.positionX},${t.positionY}`)
    );

    let position = { x: 0, y: 0 };
    outer: for (let y = 0; y < garden.height; y++) {
      for (let x = 0; x < garden.width; x++) {
        if (!occupiedPositions.has(`${x},${y}`)) {
          position = { x, y };
          break outer;
        }
      }
    }

    // Get the plant
    const plant = await prisma.plant.findUnique({
      where: { id: plantId },
    });

    if (!plant) {
      return NextResponse.json({ error: '식물을 찾을 수 없습니다.' }, { status: 404 });
    }

    // Calculate growth stage based on focus duration
    const growthStage = Math.min(
      plant.growthStages,
      Math.floor(focusSession.actualDuration / (plant.minFocusMinutes / plant.growthStages)) + 1
    );

    // Plant the tree
    const plantedTree = await prisma.plantedTree.create({
      data: {
        gardenId: garden.id,
        plantId: plant.id,
        sessionId: focusSession.id,
        positionX: position.x,
        positionY: position.y,
        growthStage,
        status: growthStage >= plant.growthStages ? 'GROWN' : 'GROWING',
        grownAt: growthStage >= plant.growthStages ? new Date() : undefined,
      },
      include: {
        plant: true,
      },
    });

    // Update user stats
    await prisma.userStats.update({
      where: { userId: session.user.id },
      data: {
        totalTreesPlanted: { increment: 1 },
        ...(plantedTree.status === 'GROWN' && { totalTreesGrown: { increment: 1 } }),
      },
    });

    return NextResponse.json({ plantedTree });
  } catch (error) {
    console.error('Plant tree error:', error);
    return NextResponse.json(
      { error: '나무를 심는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Wither a tree (for abandoned sessions)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { treeId } = body;

    const tree = await prisma.plantedTree.findUnique({
      where: { id: treeId },
      include: { garden: true },
    });

    if (!tree || tree.garden.userId !== session.user.id) {
      return NextResponse.json({ error: '나무를 찾을 수 없습니다.' }, { status: 404 });
    }

    const witheredTree = await prisma.plantedTree.update({
      where: { id: treeId },
      data: { status: 'WITHERED' },
    });

    await prisma.userStats.update({
      where: { userId: session.user.id },
      data: { totalTreesWithered: { increment: 1 } },
    });

    return NextResponse.json({ tree: witheredTree });
  } catch (error) {
    console.error('Wither tree error:', error);
    return NextResponse.json(
      { error: '나무 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
