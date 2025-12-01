import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Initialize user data
    await Promise.all([
      prisma.userStats.create({
        data: { userId: user.id },
      }),
      prisma.userStreak.create({
        data: { userId: user.id },
      }),
      prisma.userSettings.create({
        data: { userId: user.id },
      }),
      prisma.garden.create({
        data: {
          userId: user.id,
          name: '나의 정원',
        },
      }),
      prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'FREE',
        },
      }),
    ]);

    return NextResponse.json({
      message: '회원가입이 완료되었습니다.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
