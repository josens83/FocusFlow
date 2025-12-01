'use client';

import { useState } from 'react';
import { TreeDeciduous, Sparkles, Settings } from 'lucide-react';
import { GardenView } from '@/components/garden/GardenView';
import { PlantSelector } from '@/components/garden/PlantSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import type { Garden, Plant } from '@/types';

// Mock data
const MOCK_GARDEN: Garden = {
  id: '1',
  name: '나의 정원',
  theme: 'ZEN_GARDEN',
  width: 5,
  height: 5,
  plantedTrees: [
    {
      id: '1',
      plantId: '1',
      plant: {
        id: '1',
        name: 'Pine Tree',
        nameKo: '소나무',
        description: '기본 소나무',
        rarity: 'COMMON',
        minFocusMinutes: 25,
        growthStages: 3,
        experienceMultiplier: 1,
        coinMultiplier: 1,
        spriteUrl: 'tree',
        isPremium: false,
        unlockLevel: 1,
        unlockCoins: 0,
      },
      positionX: 1,
      positionY: 1,
      growthStage: 3,
      status: 'GROWN',
      plantedAt: new Date(),
      grownAt: new Date(),
    },
    {
      id: '2',
      plantId: '2',
      plant: {
        id: '2',
        name: 'Cherry Blossom',
        nameKo: '벚나무',
        description: '아름다운 벚나무',
        rarity: 'RARE',
        minFocusMinutes: 50,
        growthStages: 4,
        experienceMultiplier: 1.2,
        coinMultiplier: 1.1,
        spriteUrl: 'flower',
        isPremium: false,
        unlockLevel: 5,
        unlockCoins: 100,
      },
      positionX: 3,
      positionY: 2,
      growthStage: 2,
      status: 'GROWING',
      plantedAt: new Date(),
    },
  ],
};

const MOCK_PLANTS: Plant[] = [
  {
    id: '1',
    name: 'Pine Tree',
    nameKo: '소나무',
    description: '기본 소나무',
    rarity: 'COMMON',
    minFocusMinutes: 25,
    growthStages: 3,
    experienceMultiplier: 1,
    coinMultiplier: 1,
    spriteUrl: 'tree',
    isPremium: false,
    unlockLevel: 1,
    unlockCoins: 0,
  },
  {
    id: '2',
    name: 'Cherry Blossom',
    nameKo: '벚나무',
    description: '아름다운 벚나무',
    rarity: 'RARE',
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
    id: '3',
    name: 'Golden Oak',
    nameKo: '황금 참나무',
    description: '희귀한 황금빛 참나무',
    rarity: 'EPIC',
    minFocusMinutes: 90,
    growthStages: 5,
    experienceMultiplier: 1.5,
    coinMultiplier: 2,
    spriteUrl: 'tree',
    specialEffect: 'COIN_MAGNET',
    isPremium: false,
    unlockLevel: 15,
    unlockCoins: 500,
  },
  {
    id: '4',
    name: 'World Tree',
    nameKo: '세계수',
    description: '전설의 세계수',
    rarity: 'LEGENDARY',
    minFocusMinutes: 120,
    growthStages: 6,
    experienceMultiplier: 2,
    coinMultiplier: 2,
    spriteUrl: 'tree',
    specialEffect: 'TEAM_AURA',
    isPremium: true,
    unlockLevel: 30,
    unlockCoins: 2000,
  },
];

export default function GardenPage() {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>('1');
  const [showPlantModal, setShowPlantModal] = useState(false);

  const unlockedPlantIds = ['1', '2'];
  const userCoins = 150;
  const userLevel = 10;

  const selectedPlant = MOCK_PLANTS.find((p) => p.id === selectedPlantId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">나의 정원</h1>
          <p className="mt-1 text-gray-500">집중할 때마다 정원이 자라요</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="font-semibold text-amber-700">{userCoins}</span>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Garden View */}
        <div className="lg:col-span-2">
          <GardenView garden={MOCK_GARDEN} />

          {/* Garden Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {MOCK_GARDEN.plantedTrees.length}
                </p>
                <p className="text-sm text-gray-500">심은 나무</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {MOCK_GARDEN.plantedTrees.filter((t) => t.status === 'GROWN').length}
                </p>
                <p className="text-sm text-gray-500">자란 나무</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">시든 나무</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Plant */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TreeDeciduous className="h-5 w-5 text-primary-500" />
                선택된 나무
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPlant ? (
                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100">
                    <TreeDeciduous className="h-10 w-10 text-primary-600" />
                  </div>
                  <p className="mt-3 font-semibold text-gray-900">{selectedPlant.nameKo}</p>
                  <Badge className="mt-1">{selectedPlant.rarity}</Badge>
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedPlant.minFocusMinutes}분 집중 시 성장
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => setShowPlantModal(true)}
                  >
                    다른 나무 선택
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setShowPlantModal(true)}
                >
                  나무 선택하기
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Unlocked Plants */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">보유 식물</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {unlockedPlantIds.length} / {MOCK_PLANTS.length} 해금됨
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {MOCK_PLANTS.slice(0, 4).map((plant) => (
                  <div
                    key={plant.id}
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      unlockedPlantIds.includes(plant.id)
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    <TreeDeciduous className="h-6 w-6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Plant Selection Modal */}
      <Modal
        isOpen={showPlantModal}
        onClose={() => setShowPlantModal(false)}
        title="나무 선택"
        description="다음 세션에 심을 나무를 선택하세요"
        size="lg"
      >
        <PlantSelector
          plants={MOCK_PLANTS}
          unlockedPlantIds={unlockedPlantIds}
          selectedPlantId={selectedPlantId}
          userCoins={userCoins}
          userLevel={userLevel}
          onSelect={(id) => {
            setSelectedPlantId(id);
            setShowPlantModal(false);
          }}
          onUnlock={(id) => {
            console.log('Unlock plant:', id);
          }}
        />
      </Modal>
    </div>
  );
}
