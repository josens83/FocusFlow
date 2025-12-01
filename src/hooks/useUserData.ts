'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/stores/user-store';

export function useUserData() {
  const { data: session, status } = useSession();
  const { setStats, setStreak, setSubscription, setGarden, setLoading, reset } = useUserStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['userData', session?.user?.id],
    queryFn: async () => {
      const [statsRes, gardenRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/garden'),
      ]);

      const [statsData, gardenData] = await Promise.all([
        statsRes.json(),
        gardenRes.json(),
      ]);

      return {
        stats: statsData.stats,
        streak: statsData.streak,
        subscription: statsData.subscription,
        todayStats: statsData.todayStats,
        weekStats: statsData.weekStats,
        garden: gardenData.garden,
      };
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (status === 'unauthenticated') {
      reset();
      return;
    }

    if (data) {
      setStats(data.stats);
      setStreak(data.streak);
      setSubscription(data.subscription);
      setGarden(data.garden);
      setLoading(false);
    }
  }, [status, data, setStats, setStreak, setSubscription, setGarden, setLoading, reset]);

  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading' || isLoading,
    user: session?.user,
    data,
    refetch,
  };
}
