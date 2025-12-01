import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default plants
  const plants = [
    {
      name: 'Pine Tree',
      nameKo: '소나무',
      description: '기본 소나무입니다. 25분 집중하면 자랍니다.',
      rarity: 'COMMON' as const,
      minFocusMinutes: 25,
      growthStages: 3,
      experienceMultiplier: 1.0,
      coinMultiplier: 1.0,
      spriteUrl: 'tree',
      isPremium: false,
      unlockLevel: 1,
      unlockCoins: 0,
    },
    {
      name: 'Cherry Blossom',
      nameKo: '벚나무',
      description: '아름다운 벚꽃이 피는 나무입니다.',
      rarity: 'RARE' as const,
      minFocusMinutes: 50,
      growthStages: 4,
      experienceMultiplier: 1.2,
      coinMultiplier: 1.1,
      spriteUrl: 'flower',
      isPremium: false,
      unlockLevel: 5,
      unlockCoins: 100,
    },
    {
      name: 'Bamboo',
      nameKo: '대나무',
      description: '빠르게 자라는 대나무입니다.',
      rarity: 'COMMON' as const,
      minFocusMinutes: 15,
      growthStages: 3,
      experienceMultiplier: 0.8,
      coinMultiplier: 1.2,
      spriteUrl: 'shrub',
      isPremium: false,
      unlockLevel: 3,
      unlockCoins: 50,
    },
    {
      name: 'Golden Oak',
      nameKo: '황금 참나무',
      description: '희귀한 황금빛 참나무입니다. 코인 획득량이 증가합니다.',
      rarity: 'EPIC' as const,
      minFocusMinutes: 90,
      growthStages: 5,
      experienceMultiplier: 1.5,
      coinMultiplier: 2.0,
      spriteUrl: 'tree',
      specialEffect: 'COIN_MAGNET' as const,
      isPremium: false,
      unlockLevel: 15,
      unlockCoins: 500,
    },
    {
      name: 'World Tree',
      nameKo: '세계수',
      description: '전설의 세계수입니다. 모든 보상이 2배가 됩니다.',
      rarity: 'LEGENDARY' as const,
      minFocusMinutes: 120,
      growthStages: 6,
      experienceMultiplier: 2.0,
      coinMultiplier: 2.0,
      spriteUrl: 'tree',
      specialEffect: 'TEAM_AURA' as const,
      isPremium: true,
      unlockLevel: 30,
      unlockCoins: 2000,
    },
    {
      name: 'Crystal Flower',
      nameKo: '수정 꽃',
      description: '반짝이는 수정으로 된 꽃입니다.',
      rarity: 'EPIC' as const,
      minFocusMinutes: 50,
      growthStages: 4,
      experienceMultiplier: 1.3,
      coinMultiplier: 1.5,
      spriteUrl: 'flower',
      specialEffect: 'FOCUS_BOOST' as const,
      isPremium: true,
      unlockLevel: 20,
      unlockCoins: 800,
    },
  ];

  for (const plant of plants) {
    await prisma.plant.upsert({
      where: { name: plant.name },
      update: plant,
      create: plant,
    });
  }

  // Create default achievements
  const achievements = [
    {
      name: 'First Step',
      nameKo: '첫 걸음',
      description: '첫 번째 집중 세션을 완료했습니다.',
      icon: 'trophy',
      type: 'TOTAL_SESSIONS' as const,
      requirement: 1,
      experienceReward: 10,
      coinReward: 5,
    },
    {
      name: 'Focus Starter',
      nameKo: '집중 입문자',
      description: '10개의 세션을 완료했습니다.',
      icon: 'medal',
      type: 'TOTAL_SESSIONS' as const,
      requirement: 10,
      experienceReward: 50,
      coinReward: 25,
    },
    {
      name: 'Hour of Focus',
      nameKo: '집중의 한 시간',
      description: '총 60분 동안 집중했습니다.',
      icon: 'clock',
      type: 'TOTAL_FOCUS_MINUTES' as const,
      requirement: 60,
      experienceReward: 30,
      coinReward: 15,
    },
    {
      name: 'Week Streak',
      nameKo: '주간 스트릭',
      description: '7일 연속 집중했습니다.',
      icon: 'flame',
      type: 'STREAK_DAYS' as const,
      requirement: 7,
      experienceReward: 100,
      coinReward: 50,
    },
    {
      name: 'Forest Keeper',
      nameKo: '숲의 수호자',
      description: '나무 10그루를 키웠습니다.',
      icon: 'tree',
      type: 'TREES_GROWN' as const,
      requirement: 10,
      experienceReward: 75,
      coinReward: 40,
    },
    {
      name: 'Deep Worker',
      nameKo: '딥워커',
      description: '90분 세션을 완료했습니다.',
      icon: 'brain',
      type: 'TOTAL_SESSIONS' as const,
      requirement: 1,
      experienceReward: 50,
      coinReward: 30,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement,
    });
  }

  // Create default soundscapes
  const soundscapes = [
    {
      name: 'Rain',
      nameKo: '빗소리',
      category: 'NATURE' as const,
      audioUrl: '/sounds/rain.mp3',
      isLoop: true,
      isPremium: false,
    },
    {
      name: 'Forest',
      nameKo: '숲속',
      category: 'NATURE' as const,
      audioUrl: '/sounds/forest.mp3',
      isLoop: true,
      isPremium: false,
    },
    {
      name: 'Cafe',
      nameKo: '카페',
      category: 'AMBIENT' as const,
      audioUrl: '/sounds/cafe.mp3',
      isLoop: true,
      isPremium: false,
    },
    {
      name: 'Ocean Waves',
      nameKo: '파도 소리',
      category: 'NATURE' as const,
      audioUrl: '/sounds/ocean.mp3',
      isLoop: true,
      isPremium: true,
    },
    {
      name: 'Lo-Fi Beats',
      nameKo: '로파이 비트',
      category: 'MUSIC' as const,
      audioUrl: '/sounds/lofi.mp3',
      isLoop: true,
      isPremium: true,
    },
    {
      name: 'White Noise',
      nameKo: '화이트 노이즈',
      category: 'WHITE_NOISE' as const,
      audioUrl: '/sounds/white-noise.mp3',
      isLoop: true,
      isPremium: false,
    },
    {
      name: 'Fireplace',
      nameKo: '벽난로',
      category: 'AMBIENT' as const,
      audioUrl: '/sounds/fireplace.mp3',
      isLoop: true,
      isPremium: true,
    },
    {
      name: 'Alpha Waves',
      nameKo: '알파파 (집중)',
      category: 'BINAURAL' as const,
      audioUrl: '/sounds/alpha.mp3',
      isLoop: true,
      isPremium: true,
    },
  ];

  for (const soundscape of soundscapes) {
    await prisma.soundscape.upsert({
      where: { name: soundscape.name },
      update: soundscape,
      create: soundscape,
    });
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
