'use client';

import { motion } from 'framer-motion';
import { TreeDeciduous, Sparkles, Clock, Target, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatMinutes } from '@/lib/utils';

interface SessionCompleteProps {
  duration: number;
  focusScore: number;
  experienceEarned: number;
  coinsEarned: number;
  treeGrown: boolean;
  onContinue: () => void;
  onBreak: () => void;
}

export function SessionComplete({
  duration,
  focusScore,
  experienceEarned,
  coinsEarned,
  treeGrown,
  onContinue,
  onBreak,
}: SessionCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center"
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100"
      >
        <TreeDeciduous className="h-12 w-12 text-primary-600" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-2 text-2xl font-bold text-gray-900"
      >
        {treeGrown ? '나무가 자랐어요!' : '세션 완료!'}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6 text-gray-600"
      >
        {formatMinutes(duration)} 동안 집중했어요. 정말 대단해요!
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8 grid grid-cols-2 gap-4"
      >
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <Target className="h-5 w-5 text-primary-600" />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">집중 점수</p>
              <p className="text-lg font-semibold">{focusScore}점</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">획득</p>
              <p className="text-lg font-semibold">+{experienceEarned} XP</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4"
      >
        <Button variant="outline" size="lg" onClick={onContinue}>
          다음 세션
        </Button>
        <Button size="lg" onClick={onBreak} className="gap-2">
          <Coffee className="h-4 w-4" />
          휴식하기
        </Button>
      </motion.div>
    </motion.div>
  );
}
