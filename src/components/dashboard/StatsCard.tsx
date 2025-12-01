'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'warning' | 'success';
}

const VARIANT_STYLES = {
  default: {
    icon: 'bg-gray-100 text-gray-600',
    trend: 'text-gray-600',
  },
  primary: {
    icon: 'bg-primary-100 text-primary-600',
    trend: 'text-primary-600',
  },
  warning: {
    icon: 'bg-amber-100 text-amber-600',
    trend: 'text-amber-600',
  },
  success: {
    icon: 'bg-green-100 text-green-600',
    trend: 'text-green-600',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">{title}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
              )}
            </div>
            <div className={cn('rounded-xl p-3', styles.icon)}>
              <Icon className="h-5 w-5" />
            </div>
          </div>

          {trend && (
            <div className="mt-3 flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-400">지난 주 대비</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
