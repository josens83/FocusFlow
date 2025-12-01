'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Soundscape } from '@/types';

interface SoundStore {
  // Sound State
  currentSound: Soundscape | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;

  // Actions
  setCurrentSound: (sound: Soundscape | null) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  stop: () => void;
}

export const useSoundStore = create<SoundStore>()(
  persist(
    (set, get) => ({
      currentSound: null,
      isPlaying: false,
      volume: 0.7,
      isMuted: false,

      setCurrentSound: (sound) => set({ currentSound: sound }),

      play: () => set({ isPlaying: true }),

      pause: () => set({ isPlaying: false }),

      toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      stop: () => set({ isPlaying: false, currentSound: null }),
    }),
    {
      name: 'focusflow-sound',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
      }),
    }
  )
);
