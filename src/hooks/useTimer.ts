'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '@/stores/timer-store';

export function useTimer() {
  const workerRef = useRef<Worker | null>(null);
  const { timer, tick, settings } = useTimerStore();

  useEffect(() => {
    // Create Web Worker for accurate timing
    if (typeof window !== 'undefined' && !workerRef.current) {
      const workerCode = `
        let intervalId = null;

        self.onmessage = function(e) {
          if (e.data.action === 'start') {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
              self.postMessage({ type: 'tick' });
            }, 1000);
          } else if (e.data.action === 'stop') {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      workerRef.current = new Worker(URL.createObjectURL(blob));

      workerRef.current.onmessage = (e) => {
        if (e.data.type === 'tick') {
          tick();
        }
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [tick]);

  useEffect(() => {
    if (timer.status === 'running') {
      workerRef.current?.postMessage({ action: 'start' });
    } else {
      workerRef.current?.postMessage({ action: 'stop' });
    }
  }, [timer.status]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (settings.soundEnabled) {
      const audio = new Audio(`/sounds/${settings.notificationSound}.mp3`);
      audio.play().catch(console.error);
    }

    if (settings.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [settings.soundEnabled, settings.vibrationEnabled, settings.notificationSound]);

  // Send browser notification
  const sendNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
      });
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return {
    timer,
    playNotificationSound,
    sendNotification,
    requestNotificationPermission,
  };
}
