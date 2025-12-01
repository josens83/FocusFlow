'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Timer,
  Bell,
  Volume2,
  Shield,
  CreditCard,
  LogOut,
  Moon,
  Sun,
  Crown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useTimerStore } from '@/stores/timer-store';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { settings, updateSettings } = useTimerStore();
  const [isDark, setIsDark] = useState(false);

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="mt-1 text-gray-500">앱 설정을 관리하세요</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>프로필</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar
                src={session?.user?.image}
                alt={session?.user?.name || ''}
                fallback={session?.user?.name || 'U'}
                size="xl"
              />
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900">
                  {session?.user?.name || '게스트'}
                </p>
                <p className="text-gray-500">{session?.user?.email}</p>
                <Badge className="mt-2">무료 플랜</Badge>
              </div>
              <Button variant="outline" size="sm">
                프로필 수정
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary-500" />
              타이머 설정
            </CardTitle>
            <CardDescription>기본 포모도로 시간을 설정하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  집중 시간 (분)
                </label>
                <Input
                  type="number"
                  value={settings.defaultWorkDuration}
                  onChange={(e) =>
                    updateSettings({ defaultWorkDuration: parseInt(e.target.value) || 25 })
                  }
                  min={5}
                  max={120}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  짧은 휴식 (분)
                </label>
                <Input
                  type="number"
                  value={settings.defaultShortBreak}
                  onChange={(e) =>
                    updateSettings({ defaultShortBreak: parseInt(e.target.value) || 5 })
                  }
                  min={1}
                  max={30}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  긴 휴식 (분)
                </label>
                <Input
                  type="number"
                  value={settings.defaultLongBreak}
                  onChange={(e) =>
                    updateSettings({ defaultLongBreak: parseInt(e.target.value) || 15 })
                  }
                  min={5}
                  max={60}
                />
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <ToggleItem
                label="휴식 자동 시작"
                description="세션 완료 후 휴식을 자동으로 시작합니다"
                checked={settings.autoStartBreaks}
                onChange={(v) => handleToggle('autoStartBreaks', v)}
              />
              <ToggleItem
                label="다음 세션 자동 시작"
                description="휴식 후 다음 세션을 자동으로 시작합니다"
                checked={settings.autoStartNextSession}
                onChange={(v) => handleToggle('autoStartNextSession', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Strict Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-500" />
              엄격 모드
            </CardTitle>
            <CardDescription>세션 중 앱 이탈을 제한합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <ToggleItem
              label="엄격 모드 활성화"
              description="활성화 시 세션 중 앱을 나가면 나무가 시듭니다"
              checked={settings.strictMode}
              onChange={(v) => handleToggle('strictMode', v)}
            />
            {settings.strictMode && (
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  허용 이탈 시간 (초)
                </label>
                <Input
                  type="number"
                  value={settings.strictModeGracePeriod}
                  onChange={(e) =>
                    updateSettings({ strictModeGracePeriod: parseInt(e.target.value) || 10 })
                  }
                  min={0}
                  max={60}
                  className="max-w-[120px]"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary-500" />
              알림
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleItem
              label="소리 알림"
              description="세션 시작/종료 시 소리로 알려드립니다"
              checked={settings.soundEnabled}
              onChange={(v) => handleToggle('soundEnabled', v)}
            />
            <ToggleItem
              label="진동"
              description="모바일에서 진동으로 알려드립니다"
              checked={settings.vibrationEnabled}
              onChange={(v) => handleToggle('vibrationEnabled', v)}
            />
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDark ? <Moon className="h-5 w-5 text-primary-500" /> : <Sun className="h-5 w-5 text-primary-500" />}
              테마
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={!isDark ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setIsDark(false)}
              >
                <Sun className="h-4 w-4" />
                라이트
              </Button>
              <Button
                variant={isDark ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setIsDark(true)}
              >
                <Moon className="h-4 w-4" />
                다크
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600" />
              프리미엄
            </CardTitle>
            <CardDescription>모든 기능을 무제한으로 사용하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">월 6,900원</p>
                <p className="text-sm text-gray-500">또는 연 55,000원 (33% 할인)</p>
              </div>
              <Button variant="premium" className="gap-2">
                <Crown className="h-4 w-4" />
                업그레이드
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>계정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <CreditCard className="h-4 w-4" />
              결제 수단 관리
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function ToggleItem({ label, description, checked, onChange }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
          checked ? 'bg-primary-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          } mt-0.5`}
        />
      </button>
    </div>
  );
}
