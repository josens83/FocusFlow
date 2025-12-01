'use client';

import { create } from 'zustand';
import type { UserStats, UserStreak, Subscription, Garden, Plant, Achievement } from '@/types';

interface UserStore {
  // User Data
  stats: UserStats | null;
  streak: UserStreak | null;
  subscription: Subscription | null;
  garden: Garden | null;
  plants: Plant[];
  selectedPlant: Plant | null;
  achievements: Achievement[];

  // Loading States
  isLoading: boolean;

  // Actions
  setStats: (stats: UserStats) => void;
  setStreak: (streak: UserStreak) => void;
  setSubscription: (subscription: Subscription) => void;
  setGarden: (garden: Garden) => void;
  setPlants: (plants: Plant[]) => void;
  setSelectedPlant: (plant: Plant | null) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setLoading: (loading: boolean) => void;

  // Mutations
  addExperience: (amount: number) => void;
  addCoins: (amount: number) => void;
  incrementStreak: () => void;

  // Computed
  isPremium: () => boolean;

  // Reset
  reset: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  stats: null,
  streak: null,
  subscription: null,
  garden: null,
  plants: [],
  selectedPlant: null,
  achievements: [],
  isLoading: true,

  setStats: (stats) => set({ stats }),
  setStreak: (streak) => set({ streak }),
  setSubscription: (subscription) => set({ subscription }),
  setGarden: (garden) => set({ garden }),
  setPlants: (plants) => set({ plants }),
  setSelectedPlant: (plant) => set({ selectedPlant: plant }),
  setAchievements: (achievements) => set({ achievements }),
  setLoading: (loading) => set({ isLoading: loading }),

  addExperience: (amount) =>
    set((state) => ({
      stats: state.stats
        ? { ...state.stats, experience: state.stats.experience + amount }
        : null,
    })),

  addCoins: (amount) =>
    set((state) => ({
      stats: state.stats
        ? { ...state.stats, coins: state.stats.coins + amount }
        : null,
    })),

  incrementStreak: () =>
    set((state) => ({
      streak: state.streak
        ? {
            ...state.streak,
            currentStreak: state.streak.currentStreak + 1,
            longestStreak: Math.max(
              state.streak.longestStreak,
              state.streak.currentStreak + 1
            ),
            lastActiveDate: new Date(),
          }
        : null,
    })),

  isPremium: () => {
    const { subscription } = get();
    return subscription?.plan === 'PREMIUM' || subscription?.plan === 'TEAM';
  },

  reset: () =>
    set({
      stats: null,
      streak: null,
      subscription: null,
      garden: null,
      plants: [],
      selectedPlant: null,
      achievements: [],
      isLoading: true,
    }),
}));
