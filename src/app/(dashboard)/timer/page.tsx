'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreeDeciduous, Volume2, Music } from 'lucide-react';
import { Timer } from '@/components/timer/Timer';
import { SessionComplete } from '@/components/timer/SessionComplete';
import { SoundPlayer } from '@/components/sounds/SoundPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTimerStore } from '@/stores/timer-store';
import type { Soundscape } from '@/types';

// Mock soundscapes
const SOUNDSCAPES: Soundscape[] = [
  { id: '1', name: 'Rain', nameKo: '빗소리', category: 'NATURE', audioUrl: '/sounds/rain.mp3', isLoop: true, isPremium: false },
  { id: '2', name: 'Forest', nameKo: '숲속', category: 'NATURE', audioUrl: '/sounds/forest.mp3', isLoop: true, isPremium: false },
  { id: '3', name: 'Cafe', nameKo: '카페', category: 'AMBIENT', audioUrl: '/sounds/cafe.mp3', isLoop: true, isPremium: false },
  { id: '4', name: 'Ocean', nameKo: '파도', category: 'NATURE', audioUrl: '/sounds/ocean.mp3', isLoop: true, isPremium: true },
  { id: '5', name: 'Lo-Fi', nameKo: '로파이', category: 'MUSIC', audioUrl: '/sounds/lofi.mp3', isLoop: true, isPremium: true },
  { id: '6', name: 'White Noise', nameKo: '화이트노이즈', category: 'WHITE_NOISE', audioUrl: '/sounds/white.mp3', isLoop: true, isPremium: false },
];

export default function TimerPage() {
  const { timer, startBreak, resetTimer } = useTimerStore();
  const [showSounds, setShowSounds] = useState(false);
  const [sessionResult, setSessionResult] = useState<{
    duration: number;
    focusScore: number;
    experienceEarned: number;
    coinsEarned: number;
    treeGrown: boolean;
  } | null>(null);

  const handleSessionComplete = useCallback((duration: number) => {
    // Calculate session result
    const focusScore = Math.min(100, 80 + Math.random() * 20);
    const experienceEarned = Math.floor(duration * (focusScore / 100));
    const coinsEarned = Math.floor(duration * 0.5 * (focusScore / 100));

    setSessionResult({
      duration,
      focusScore: Math.round(focusScore),
      experienceEarned,
      coinsEarned,
      treeGrown: duration >= 25,
    });
  }, []);

  const handleContinue = () => {
    setSessionResult(null);
    resetTimer();
  };

  const handleBreak = () => {
    setSessionResult(null);
    startBreak();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Timer Area */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {sessionResult ? (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <SessionComplete
                      {...sessionResult}
                      onContinue={handleContinue}
                      onBreak={handleBreak}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="timer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Timer onSessionComplete={handleSessionComplete} />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Plant */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TreeDeciduous className="h-5 w-5 text-primary-500" />
                심을 나무
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-100">
                  <TreeDeciduous className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">소나무</p>
                  <p className="text-sm text-gray-500">25분 집중 시 성장</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sound Control */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Music className="h-5 w-5 text-primary-500" />
                집중 사운드
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setShowSounds(!showSounds)}
              >
                <Volume2 className="h-4 w-4" />
                사운드 선택하기
              </Button>

              <AnimatePresence>
                {showSounds && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <SoundPlayer soundscapes={SOUNDSCAPES} />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Today Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">오늘의 기록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500">완료 세션</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">0분</p>
                  <p className="text-xs text-gray-500">집중 시간</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
