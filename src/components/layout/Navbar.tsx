'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Timer,
  TreeDeciduous,
  LayoutDashboard,
  Settings,
  LogOut,
  Crown,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const NAV_ITEMS = [
  { href: '/timer', label: '타이머', icon: Timer },
  { href: '/garden', label: '정원', icon: TreeDeciduous },
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/settings', label: '설정', icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
            <Timer className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">FocusFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn('gap-2', isActive && 'bg-primary-100 text-primary-700')}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Premium Badge */}
          <Link href="/pricing" className="hidden sm:block">
            <Badge variant="premium" className="cursor-pointer gap-1">
              <Crown className="h-3 w-3" />
              프리미엄
            </Badge>
          </Link>

          {/* User Menu */}
          {session ? (
            <div className="flex items-center gap-2">
              <Avatar
                src={session.user?.image}
                alt={session.user?.name || ''}
                fallback={session.user?.name || 'U'}
                size="sm"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => signOut()}
                className="hidden sm:flex"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">로그인</Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="border-t border-gray-200 bg-white p-4 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn('w-full justify-start gap-2', isActive && 'bg-primary-100')}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <hr className="my-2" />
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="premium" className="w-full gap-2">
                <Crown className="h-4 w-4" />
                프리미엄 업그레이드
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
