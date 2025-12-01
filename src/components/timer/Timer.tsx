'use client';

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, SkipForward, Coffee, Settings, Volume2, VolumeX } from 'lucide-react';
import { useTimerStore } from '@/stores/timer-store';
import { useSoundStore } from '@/stores/sound-store';
import { formatTime } from '@/lib/utils';
import { CircularProgress } from './CircularProgress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SessionType } from '@/types';

const SESSION_LABELS: Record<SessionType, string> = {
  POMODORO_25: '포모도로 25분',
  POMODORO_50: '딥워크 50분',
  POMODORO_90: '울트라딥 90분',
  CUSTOM: '커스텀',
  FLOW_STATE: '플로우',
  MICRO_FOCUS: '마이크로 15분',
};

interface TimerProps {
  onSessionComplete?: (duration: number) => void;
  onSessionStart?: () => void;
}

export function Timer({ onSessionComplete, onSessionStart }: TimerProps) {
  const {
    timer,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tick,
    startBreak,
    skipBreak,
  } = useTimerStore();

  const { isPlaying: isSoundPlaying, toggle: toggleSound, isMuted, toggleMute } = useSoundStore();

  const [showSettings, setShowSettings] = useState(false);

  // Timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timer.status === 'running') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.status, tick]);

  // Handle completion
  useEffect(() => {
    if (timer.status === 'completed' && !timer.isBreak) {
      const duration = Math.floor((timer.totalTime - timer.timeRemaining) / 60);
      onSessionComplete?.(duration);
    }
  }, [timer.status, timer.isBreak, timer.totalTime, timer.timeRemaining, onSessionComplete]);

  const handleStart = useCallback((type: SessionType = 'POMODORO_25') => {
    startTimer(type);
    onSessionStart?.();
  }, [startTimer, onSessionStart]);

  const handleStop = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  const progress = ((timer.totalTime - timer.timeRemaining) / timer.totalTime) * 100;

  return (
    <div className="flex flex-col items-center">
      {/* Timer Display */}
      <CircularProgress
        progress={progress}
        size={320}
        isBreak={timer.isBreak}
        className="mb-8"
      >
        <div className="text-center">
          {/* Status Badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={timer.isBreak ? 'break' : 'focus'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Badge variant={timer.isBreak ? 'warning' : 'default'} className="mb-2">
                {timer.isBreak ? '휴식 시간' : SESSION_LABELS[timer.sessionType]}
              </Badge>
            </motion.div>
          </AnimatePresence>

          {/* Time */}
          <motion.div
            className="text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
            key={timer.timeRemaining}
            initial={{ scale: 1.02 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            {formatTime(timer.timeRemaining)}
          </motion.div>

          {/* Session count */}
          <p className="mt-2 text-sm text-gray-500">
            세션 {timer.currentSession} / {settings.sessionsBeforeLongBreak}
          </p>
        </div>
      </CircularProgress>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {timer.status === 'idle' && (
          <>
            <Button
              size="xl"
              onClick={() => handleStart('POMODORO_25')}
              className="gap-2 px-8"
            >
              <Play className="h-5 w-5" />
              시작하기
            </Button>
          </>
        )}

        {timer.status === 'running' && (
          <>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={handleStop}
            >
              <Square className="h-5 w-5" />
            </Button>
            <Button
              size="xl"
              onClick={pauseTimer}
              className="gap-2 px-8"
            >
              <Pause className="h-5 w-5" />
              일시정지
            </Button>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </>
        )}

        {timer.status === 'paused' && (
          <>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={handleStop}
            >
              <Square className="h-5 w-5" />
            </Button>
            <Button
              size="xl"
              onClick={resumeTimer}
              className="gap-2 px-8"
            >
              <Play className="h-5 w-5" />
              계속하기
            </Button>
          </>
        )}

        {timer.status === 'completed' && !timer.isBreak && (
          <>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleStart()}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              다음 세션
            </Button>
            <Button
              size="lg"
              onClick={startBreak}
              className="gap-2"
            >
              <Coffee className="h-4 w-4" />
              휴식하기
            </Button>
          </>
        )}

        {timer.isBreak && timer.status !== 'running' && (
          <Button
            variant="outline"
            size="lg"
            onClick={skipBreak}
            className="gap-2"
          >
            <SkipForward className="h-4 w-4" />
            휴식 건너뛰기
          </Button>
        )}
      </div>

      {/* Session Type Selection (when idle) */}
      {timer.status === 'idle' && (
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {(['POMODORO_25', 'POMODORO_50', 'POMODORO_90', 'MICRO_FOCUS'] as SessionType[]).map(
            (type) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleStart(type)}
                className={timer.sessionType === type ? 'bg-primary-100' : ''}
              >
                {SESSION_LABELS[type]}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
