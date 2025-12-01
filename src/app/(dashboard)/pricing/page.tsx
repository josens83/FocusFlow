'use client';

import { useState } from 'react';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PLANS = [
  {
    id: 'free',
    name: '무료',
    price: 0,
    period: '',
    description: '기본 기능으로 시작하세요',
    features: [
      '기본 포모도로 타이머',
      '일일 3세션 제한',
      '기본 사운드 3개',
      '주간 통계',
      '정원 1개',
    ],
    limitations: [
      'AI 코칭 제한',
      '프리미엄 식물 잠금',
      '상세 분석 제한',
    ],
    cta: '현재 플랜',
    popular: false,
  },
  {
    id: 'premium_monthly',
    name: '프리미엄',
    price: 6900,
    period: '월',
    description: '모든 기능을 무제한으로',
    features: [
      '무제한 세션',
      'AI 생산성 코칭',
      '모든 사운드스케이프',
      '무제한 코워킹 매칭',
      '상세 분석 & 인사이트',
      '모든 정원 테마',
      '프리미엄 식물',
      '오프라인 사용',
      '데이터 내보내기',
      '우선 지원',
    ],
    cta: '시작하기',
    popular: true,
  },
  {
    id: 'premium_yearly',
    name: '프리미엄 연간',
    price: 55000,
    period: '년',
    originalPrice: 82800,
    description: '33% 할인된 가격',
    features: [
      '모든 프리미엄 기능',
      '2개월 무료',
      '독점 연간 보너스',
    ],
    cta: '가장 인기',
    popular: false,
    highlight: true,
  },
];

const TEAM_PLAN = {
  name: '팀',
  price: 9900,
  period: '인/월',
  minUsers: 5,
  description: '팀 전체의 생산성을 높이세요',
  features: [
    '모든 프리미엄 기능',
    '팀 대시보드',
    '팀 챌린지 & 리더보드',
    '관리자 콘솔',
    'Slack, Notion 연동',
    '전담 지원',
    'SSO 지원',
  ],
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async (planId: string) => {
    // Redirect to Stripe checkout
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });

    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <Badge variant="premium" className="mb-4 gap-1">
          <Sparkles className="h-3 w-3" />
          프리미엄
        </Badge>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          집중력 향상을 위한 투자
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          하루 커피 한 잔 가격으로 생산성을 몇 배로 높이세요.
          무료로 시작하고, 필요할 때 업그레이드하세요.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            월간
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            연간
            <span className="ml-1 text-primary-600">-33%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative ${
              plan.popular
                ? 'border-2 border-primary-500 ring-4 ring-primary-500/10'
                : plan.highlight
                  ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50'
                  : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="gap-1">
                  <Zap className="h-3 w-3" />
                  가장 인기
                </Badge>
              </div>
            )}

            <CardHeader className="pt-8">
              <CardTitle className="flex items-center gap-2">
                {plan.id !== 'free' && <Crown className="h-5 w-5 text-amber-500" />}
                {plan.name}
              </CardTitle>
              <p className="text-sm text-gray-500">{plan.description}</p>
            </CardHeader>

            <CardContent>
              <div className="mb-6">
                <div className="flex items-baseline">
                  {plan.originalPrice && (
                    <span className="mr-2 text-lg text-gray-400 line-through">
                      ₩{plan.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
                  </span>
                  {plan.period && (
                    <span className="ml-1 text-gray-500">/{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
                {plan.limitations?.map((limitation) => (
                  <li key={limitation} className="flex items-start gap-2 opacity-50">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" />
                    <span className="text-gray-400 line-through">{limitation}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.popular ? 'default' : plan.highlight ? 'premium' : 'outline'}
                size="lg"
                disabled={plan.id === 'free'}
                onClick={() => handleSubscribe(plan.id)}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Plan */}
      <Card className="mt-12 border-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl font-bold text-gray-900">{TEAM_PLAN.name} 플랜</h3>
              <p className="mt-1 text-gray-500">{TEAM_PLAN.description}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                {TEAM_PLAN.features.slice(0, 4).map((feature) => (
                  <Badge key={feature} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                ₩{TEAM_PLAN.price.toLocaleString()}
                <span className="text-lg font-normal text-gray-500">
                  /{TEAM_PLAN.period}
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                최소 {TEAM_PLAN.minUsers}명부터
              </p>
              <Button className="mt-4" size="lg">
                팀 플랜 문의하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          자주 묻는 질문
        </h2>
        <div className="mx-auto max-w-2xl space-y-4">
          {[
            {
              q: '무료 플랜으로도 충분한가요?',
              a: '기본적인 포모도로 타이머와 정원 기능은 무료로 이용 가능합니다. 더 많은 세션과 고급 기능이 필요하시면 프리미엄을 추천드립니다.',
            },
            {
              q: '언제든 구독을 취소할 수 있나요?',
              a: '네, 언제든지 취소 가능합니다. 취소 후에도 결제 기간이 끝날 때까지 프리미엄 기능을 사용하실 수 있습니다.',
            },
            {
              q: '환불 정책은 어떻게 되나요?',
              a: '구독 후 7일 이내에 불만족하시면 전액 환불해 드립니다. 문의 사항은 고객지원으로 연락해 주세요.',
            },
          ].map((faq) => (
            <Card key={faq.q}>
              <CardContent className="p-4">
                <p className="font-medium text-gray-900">{faq.q}</p>
                <p className="mt-2 text-gray-600">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
