'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TreeDeciduous, Lock, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Plant, PlantRarity } from '@/types';

interface PlantSelectorProps {
  plants: Plant[];
  unlockedPlantIds: string[];
  selectedPlantId: string | null;
  userCoins: number;
  userLevel: number;
  onSelect: (plantId: string) => void;
  onUnlock: (plantId: string) => void;
}

const RARITY_STYLES: Record<PlantRarity, { bg: string; border: string; badge: string }> = {
  COMMON: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'secondary' },
  RARE: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'default' },
  EPIC: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'default' },
  LEGENDARY: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'premium' },
};

const RARITY_LABELS: Record<PlantRarity, string> = {
  COMMON: '일반',
  RARE: '희귀',
  EPIC: '에픽',
  LEGENDARY: '전설',
};

export function PlantSelector({
  plants,
  unlockedPlantIds,
  selectedPlantId,
  userCoins,
  userLevel,
  onSelect,
  onUnlock,
}: PlantSelectorProps) {
  const [selectedFilter, setSelectedFilter] = useState<PlantRarity | 'ALL'>('ALL');

  const filteredPlants = plants.filter(
    (plant) => selectedFilter === 'ALL' || plant.rarity === selectedFilter
  );

  const isUnlocked = (plant: Plant) => unlockedPlantIds.includes(plant.id);
  const canUnlock = (plant: Plant) =>
    !isUnlocked(plant) &&
    userLevel >= plant.unlockLevel &&
    userCoins >= plant.unlockCoins &&
    !plant.isPremium;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        {(['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map((filter) => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedFilter(filter)}
          >
            {filter === 'ALL' ? '전체' : RARITY_LABELS[filter]}
          </Button>
        ))}
      </div>

      {/* Plant Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {filteredPlants.map((plant) => {
          const unlocked = isUnlocked(plant);
          const selected = selectedPlantId === plant.id;
          const styles = RARITY_STYLES[plant.rarity];

          return (
            <motion.button
              key={plant.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (unlocked) {
                  onSelect(plant.id);
                } else if (canUnlock(plant)) {
                  onUnlock(plant.id);
                }
              }}
              disabled={!unlocked && !canUnlock(plant)}
              className={cn(
                'relative flex flex-col items-center rounded-xl border-2 p-4 transition-all',
                styles.bg,
                selected ? 'border-primary-500 ring-2 ring-primary-500/20' : styles.border,
                !unlocked && 'opacity-60'
              )}
            >
              {/* Selected indicator */}
              {selected && (
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white">
                  <Check className="h-4 w-4" />
                </div>
              )}

              {/* Lock overlay */}
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/10">
                  <Lock className="h-6 w-6 text-gray-500" />
                </div>
              )}

              {/* Plant icon */}
              <div className="mb-2 h-12 w-12 text-green-600">
                <TreeDeciduous className="h-full w-full" />
              </div>

              {/* Name */}
              <p className="text-sm font-medium text-gray-900">{plant.nameKo}</p>

              {/* Rarity badge */}
              <Badge variant={styles.badge as 'default'} className="mt-1">
                {RARITY_LABELS[plant.rarity]}
              </Badge>

              {/* Unlock cost */}
              {!unlocked && plant.unlockCoins > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <Sparkles className="h-3 w-3" />
                  <span>{plant.unlockCoins}</span>
                </div>
              )}

              {/* Premium badge */}
              {plant.isPremium && (
                <Badge variant="premium" className="mt-1">
                  프리미엄
                </Badge>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
