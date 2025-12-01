'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Timer, TreeDeciduous, LayoutDashboard, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/timer', label: '타이머', icon: Timer },
  { href: '/garden', label: '정원', icon: TreeDeciduous },
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/settings', label: '설정', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 h-1 w-8 rounded-full bg-primary-500"
                  transition={{ type: 'spring', duration: 0.3 }}
                />
              )}
              <item.icon
                className={cn(
                  'h-6 w-6 transition-colors',
                  isActive ? 'text-primary-600' : 'text-gray-400'
                )}
              />
              <span
                className={cn(
                  'text-xs transition-colors',
                  isActive ? 'font-medium text-primary-600' : 'text-gray-500'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
