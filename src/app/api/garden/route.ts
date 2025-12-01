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

    const garden = await prisma.garden.findUnique({
      where: { userId: session.user.id },
      include: {
        plantedTrees: {
          include: {
            plant: true,
            session: true,
          },
          orderBy: { plantedAt: 'desc' },
        },
      },
    });

    if (!garden) {
      // Create default garden
      const newGarden = await prisma.garden.create({
        data: {
          userId: session.user.id,
          name: '나의 정원',
        },
        include: {
          plantedTrees: true,
        },
      });
      return NextResponse.json({ garden: newGarden });
    }

    return NextResponse.json({ garden });
  } catch (error) {
    console.error('Get garden error:', error);
    return NextResponse.json(
      { error: '정원을 불러오는 중 오류가 발생했습니다.' },
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
    const { name, theme } = body;

    const garden = await prisma.garden.update({
      where: { userId: session.user.id },
      data: {
        ...(name && { name }),
        ...(theme && { theme }),
      },
    });

    return NextResponse.json({ garden });
  } catch (error) {
    console.error('Update garden error:', error);
    return NextResponse.json(
      { error: '정원 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
