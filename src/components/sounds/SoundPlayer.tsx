'use client';

import { useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { useSoundStore } from '@/stores/sound-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Soundscape } from '@/types';

interface SoundPlayerProps {
  soundscapes: Soundscape[];
  className?: string;
}

export function SoundPlayer({ soundscapes, className }: SoundPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentSound,
    isPlaying,
    volume,
    isMuted,
    setCurrentSound,
    play,
    pause,
    setVolume,
    toggleMute,
  } = useSoundStore();

  // Handle audio playback
  useEffect(() => {
    if (!currentSound) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(currentSound.audioUrl);
      audioRef.current.loop = currentSound.isLoop;
    } else if (audioRef.current.src !== currentSound.audioUrl) {
      audioRef.current.src = currentSound.audioUrl;
      audioRef.current.loop = currentSound.isLoop;
    }

    audioRef.current.volume = isMuted ? 0 : volume;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentSound, isPlaying, volume, isMuted]);

  const handleSelectSound = (sound: Soundscape) => {
    if (currentSound?.id === sound.id) {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    } else {
      setCurrentSound(sound);
      play();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-gray-400" />
          ) : (
            <Volume2 className="h-5 w-5 text-gray-600" />
          )}
        </Button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary-500"
        />
      </div>

      {/* Sound Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {soundscapes.map((sound) => {
          const isSelected = currentSound?.id === sound.id;
          const isActive = isSelected && isPlaying;

          return (
            <button
              key={sound.id}
              onClick={() => handleSelectSound(sound)}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                isSelected
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300',
                sound.isPremium && 'opacity-60'
              )}
            >
              {/* Play indicator */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                {isActive ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </div>

              <span className="text-sm font-medium text-gray-700">
                {sound.nameKo}
              </span>

              {/* Playing animation */}
              {isActive && (
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-500" />
                </div>
              )}

              {/* Premium badge */}
              {sound.isPremium && (
                <span className="absolute top-1 right-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                  PRO
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
