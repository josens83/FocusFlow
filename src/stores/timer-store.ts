'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionType, TimerState, TimerSettings } from '@/types';

interface TimerStore {
  // Timer State
  timer: TimerState;
  settings: TimerSettings;

  // Active Session
  activeSessionId: string | null;
  selectedTaskId: string | null;
  selectedSoundscapeId: string | null;
  selectedPlantId: string | null;

  // Actions
  setTimer: (timer: Partial<TimerState>) => void;
  startTimer: (sessionType?: SessionType, customDuration?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  startBreak: () => void;
  skipBreak: () => void;

  // Settings
  updateSettings: (settings: Partial<TimerSettings>) => void;

  // Session
  setActiveSessionId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  setSelectedSoundscapeId: (id: string | null) => void;
  setSelectedPlantId: (id: string | null) => void;

  // Reset
  resetTimer: () => void;
}

const defaultSettings: TimerSettings = {
  defaultWorkDuration: 25,
  defaultShortBreak: 5,
  defaultLongBreak: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartNextSession: false,
  strictMode: false,
  strictModeGracePeriod: 10,
  soundEnabled: true,
  vibrationEnabled: true,
  notificationSound: 'bell',
};

const defaultTimer: TimerState = {
  status: 'idle',
  timeRemaining: 25 * 60,
  totalTime: 25 * 60,
  sessionType: 'POMODORO_25',
  currentSession: 1,
  isBreak: false,
};

const getSessionDuration = (type: SessionType, settings: TimerSettings): number => {
  switch (type) {
    case 'POMODORO_25':
      return 25;
    case 'POMODORO_50':
      return 50;
    case 'POMODORO_90':
      return 90;
    case 'MICRO_FOCUS':
      return 15;
    case 'FLOW_STATE':
      return 120; // No limit, but start with 2 hours
    default:
      return settings.defaultWorkDuration;
  }
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      timer: defaultTimer,
      settings: defaultSettings,
      activeSessionId: null,
      selectedTaskId: null,
      selectedSoundscapeId: null,
      selectedPlantId: null,

      setTimer: (timer) =>
        set((state) => ({
          timer: { ...state.timer, ...timer },
        })),

      startTimer: (sessionType = 'POMODORO_25', customDuration) => {
        const { settings } = get();
        const duration = customDuration || getSessionDuration(sessionType, settings);
        const totalSeconds = duration * 60;

        set({
          timer: {
            status: 'running',
            timeRemaining: totalSeconds,
            totalTime: totalSeconds,
            sessionType,
            currentSession: get().timer.currentSession,
            isBreak: false,
          },
        });
      },

      pauseTimer: () =>
        set((state) => ({
          timer: { ...state.timer, status: 'paused' },
        })),

      resumeTimer: () =>
        set((state) => ({
          timer: { ...state.timer, status: 'running' },
        })),

      stopTimer: () =>
        set({
          timer: { ...defaultTimer, currentSession: get().timer.currentSession },
          activeSessionId: null,
        }),

      tick: () => {
        const { timer, settings } = get();
        if (timer.status !== 'running') return;

        const newTimeRemaining = timer.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          if (timer.isBreak) {
            // Break finished
            set({
              timer: {
                ...timer,
                status: settings.autoStartNextSession ? 'running' : 'idle',
                timeRemaining: getSessionDuration(timer.sessionType, settings) * 60,
                totalTime: getSessionDuration(timer.sessionType, settings) * 60,
                isBreak: false,
              },
            });
          } else {
            // Work session finished
            set({
              timer: {
                ...timer,
                status: 'completed',
                timeRemaining: 0,
              },
            });
          }
        } else {
          set({
            timer: { ...timer, timeRemaining: newTimeRemaining },
          });
        }
      },

      startBreak: () => {
        const { timer, settings } = get();
        const isLongBreak =
          timer.currentSession % settings.sessionsBeforeLongBreak === 0;
        const breakDuration = isLongBreak
          ? settings.defaultLongBreak
          : settings.defaultShortBreak;
        const breakSeconds = breakDuration * 60;

        set({
          timer: {
            ...timer,
            status: settings.autoStartBreaks ? 'running' : 'paused',
            timeRemaining: breakSeconds,
            totalTime: breakSeconds,
            isBreak: true,
            currentSession: timer.currentSession + 1,
          },
        });
      },

      skipBreak: () => {
        const { timer, settings } = get();
        const duration = getSessionDuration(timer.sessionType, settings);

        set({
          timer: {
            ...timer,
            status: 'idle',
            timeRemaining: duration * 60,
            totalTime: duration * 60,
            isBreak: false,
          },
        });
      },

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      setActiveSessionId: (id) => set({ activeSessionId: id }),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setSelectedSoundscapeId: (id) => set({ selectedSoundscapeId: id }),
      setSelectedPlantId: (id) => set({ selectedPlantId: id }),

      resetTimer: () =>
        set({
          timer: defaultTimer,
          activeSessionId: null,
        }),
    }),
    {
      name: 'focusflow-timer',
      partialize: (state) => ({
        settings: state.settings,
        selectedPlantId: state.selectedPlantId,
      }),
    }
  )
);
