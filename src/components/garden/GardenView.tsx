'use client';

import { motion } from 'framer-motion';
import { TreeDeciduous, Flower2, TreePine, Shrub } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Garden, PlantedTree, TreeStatus, PlantRarity } from '@/types';

interface GardenViewProps {
  garden: Garden;
  className?: string;
}

const PLANT_ICONS: Record<string, React.ReactNode> = {
  tree: <TreeDeciduous className="h-full w-full" />,
  flower: <Flower2 className="h-full w-full" />,
  pine: <TreePine className="h-full w-full" />,
  shrub: <Shrub className="h-full w-full" />,
};

const RARITY_COLORS: Record<PlantRarity, string> = {
  COMMON: 'text-green-500',
  RARE: 'text-blue-500',
  EPIC: 'text-purple-500',
  LEGENDARY: 'text-amber-500',
};

const STATUS_STYLES: Record<TreeStatus, string> = {
  GROWING: 'opacity-60',
  GROWN: 'opacity-100',
  WITHERED: 'opacity-40 grayscale',
};

function PlantCell({ tree }: { tree: PlantedTree }) {
  const sizeByGrowth = tree.growthStage * 8 + 16;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.5 }}
      className={cn(
        'flex items-center justify-center',
        STATUS_STYLES[tree.status],
        RARITY_COLORS[tree.plant.rarity]
      )}
      style={{ width: sizeByGrowth, height: sizeByGrowth }}
    >
      {PLANT_ICONS[tree.plant.spriteUrl] || <TreeDeciduous className="h-full w-full" />}
    </motion.div>
  );
}

export function GardenView({ garden, className }: GardenViewProps) {
  const { width, height, plantedTrees } = garden;

  // Create grid
  const grid: (PlantedTree | null)[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(null));

  // Place trees on grid
  plantedTrees.forEach((tree) => {
    if (tree.positionY < height && tree.positionX < width) {
      grid[tree.positionY][tree.positionX] = tree;
    }
  });

  return (
    <div className={cn('rounded-2xl bg-gradient-to-b from-green-50 to-green-100 p-6', className)}>
      {/* Garden Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">{garden.name}</h3>
        <span className="text-sm text-gray-500">
          {plantedTrees.length} 나무
        </span>
      </div>

      {/* Garden Grid */}
      <div
        className="grid gap-1 rounded-xl bg-green-200/50 p-4"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="flex aspect-square items-center justify-center rounded-lg bg-green-100/50 transition-colors hover:bg-green-200/50"
            >
              {cell ? <PlantCell tree={cell} /> : null}
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span>일반</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span>희귀</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-purple-500" />
          <span>에픽</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <span>전설</span>
        </div>
      </div>
    </div>
  );
}
