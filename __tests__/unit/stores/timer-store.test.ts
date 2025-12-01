/**
 * @fileoverview Timer Store 테스트
 *
 * @description
 * Zustand 타이머 스토어의 상태 관리를 테스트합니다.
 */

import { act, renderHook } from '@testing-library/react';
import { useTimerStore } from '@/stores/timer-store';

describe('Timer Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useTimerStore());
    act(() => {
      result.current.resetTimer();
    });
  });

  // ==========================================================================
  // Initial State Tests
  // ==========================================================================
  describe('initial state', () => {
    it('should have correct initial timer state', () => {
      const { result } = renderHook(() => useTimerStore());

      expect(result.current.timer).toEqual({
        status: 'idle',
        timeRemaining: 25 * 60,
        totalTime: 25 * 60,
        sessionType: 'POMODORO_25',
        currentSession: 1,
        isBreak: false,
      });
    });

    it('should have correct default settings', () => {
      const { result } = renderHook(() => useTimerStore());

      expect(result.current.settings).toEqual({
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
      });
    });
  });

  // ==========================================================================
  // Timer Actions Tests
  // ==========================================================================
  describe('timer actions', () => {
    it('should start timer with correct duration', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startTimer('POMODORO_25');
      });

      expect(result.current.timer.status).toBe('running');
      expect(result.current.timer.timeRemaining).toBe(25 * 60);
      expect(result.current.timer.sessionType).toBe('POMODORO_25');
    });

    it('should start 50min session correctly', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startTimer('POMODORO_50');
      });

      expect(result.current.timer.timeRemaining).toBe(50 * 60);
      expect(result.current.timer.sessionType).toBe('POMODORO_50');
    });

    it('should start custom duration session', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startTimer('CUSTOM', 45);
      });

      expect(result.current.timer.timeRemaining).toBe(45 * 60);
    });

    it('should pause timer', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startTimer();
        result.current.pauseTimer();
      });

      expect(result.current.timer.status).toBe('paused');
    });

    it('should resume timer', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startTimer();
        result.current.pauseTimer();
        result.current.resumeTimer();
      });

      expect(result.current.timer.status).toBe('running');
    });

    it('should stop timer and reset', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startTimer();
        result.current.stopTimer();
      });

      expect(result.current.timer.status).toBe('idle');
      expect(result.current.activeSessionId).toBeNull();
    });
  });

  // ==========================================================================
  // Tick Tests
  // ==========================================================================
  describe('tick', () => {
    it('should decrement time when running', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startTimer();
      });

      const initialTime = result.current.timer.timeRemaining;

      act(() => {
        result.current.tick();
      });

      expect(result.current.timer.timeRemaining).toBe(initialTime - 1);
    });

    it('should not tick when paused', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startTimer();
        result.current.pauseTimer();
      });

      const pausedTime = result.current.timer.timeRemaining;

      act(() => {
        result.current.tick();
      });

      expect(result.current.timer.timeRemaining).toBe(pausedTime);
    });

    it('should complete session when time reaches 0', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startTimer();
        result.current.setTimer({ timeRemaining: 1 });
        result.current.tick();
      });

      expect(result.current.timer.status).toBe('completed');
    });
  });

  // ==========================================================================
  // Break Tests
  // ==========================================================================
  describe('break handling', () => {
    it('should start short break', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startBreak();
      });

      expect(result.current.timer.isBreak).toBe(true);
      expect(result.current.timer.timeRemaining).toBe(5 * 60);
    });

    it('should start long break after 4 sessions', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.setTimer({ currentSession: 4 });
        result.current.startBreak();
      });

      expect(result.current.timer.timeRemaining).toBe(15 * 60);
    });

    it('should skip break', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.startBreak();
        result.current.skipBreak();
      });

      expect(result.current.timer.isBreak).toBe(false);
      expect(result.current.timer.status).toBe('idle');
    });
  });

  // ==========================================================================
  // Settings Tests
  // ==========================================================================
  describe('settings', () => {
    it('should update settings', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.updateSettings({
          defaultWorkDuration: 30,
          strictMode: true,
        });
      });

      expect(result.current.settings.defaultWorkDuration).toBe(30);
      expect(result.current.settings.strictMode).toBe(true);
      // Other settings should remain unchanged
      expect(result.current.settings.defaultShortBreak).toBe(5);
    });
  });

  // ==========================================================================
  // Session Management Tests
  // ==========================================================================
  describe('session management', () => {
    it('should set active session ID', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.setActiveSessionId('session-123');
      });

      expect(result.current.activeSessionId).toBe('session-123');
    });

    it('should set selected task ID', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.setSelectedTaskId('task-123');
      });

      expect(result.current.selectedTaskId).toBe('task-123');
    });

    it('should set selected soundscape ID', () => {
      const { result } = renderHook(() => useTimerStore());

      act(() => {
        result.current.setSelectedSoundscapeId('sound-123');
      });

      expect(result.current.selectedSoundscapeId).toBe('sound-123');
    });
  });
});
