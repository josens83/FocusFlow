import Link from 'next/link';
import { Timer, TreeDeciduous, Users, Brain, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FEATURES = [
  {
    icon: Timer,
    title: '스마트 포모도로',
    description: '25분, 50분, 90분 등 다양한 집중 세션으로 생산성을 높이세요.',
  },
  {
    icon: TreeDeciduous,
    title: '집중 정원',
    description: '집중할 때마다 나무가 자라요. 아름다운 정원을 가꿔보세요.',
  },
  {
    icon: Users,
    title: '가상 코워킹',
    description: '다른 사람들과 함께 집중하며 책임감을 높여보세요.',
  },
  {
    icon: Brain,
    title: 'AI 코칭',
    description: '당신의 패턴을 분석하고 맞춤형 생산성 조언을 제공해요.',
  },
];

const PRICING = [
  {
    name: '무료',
    price: '0',
    features: [
      '기본 포모도로 타이머',
      '일일 3세션 제한',
      '기본 사운드 3개',
      '주간 통계',
    ],
    cta: '무료로 시작하기',
    highlighted: false,
  },
  {
    name: '프리미엄',
    price: '6,900',
    period: '/월',
    features: [
      '무제한 세션',
      'AI 생산성 코칭',
      '모든 사운드스케이프',
      '상세 분석 & 인사이트',
      '프리미엄 식물 & 테마',
      '오프라인 사용',
    ],
    cta: '프리미엄 시작하기',
    highlighted: true,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500">
              <Timer className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FocusFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/signup">
              <Button>무료로 시작하기</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-amber-50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2">
              <Sparkles className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                당신의 뇌를 위한 퍼스널 트레이너
              </span>
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              집중력을 키우는{' '}
              <span className="text-primary-600">가장 똑똑한 방법</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
              스마트 포모도로, 게이미피케이션, AI 코칭이 결합된
              종합 생산성 플랫폼. 오늘부터 다른 차원의 집중력을 경험하세요.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup">
                <Button size="xl" className="gap-2 px-8">
                  무료로 시작하기
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/timer">
                <Button variant="outline" size="xl" className="px-8">
                  타이머 체험하기
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              신용카드 없이 시작 · 언제든 취소 가능
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              집중력 향상을 위한 모든 것
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              과학적으로 검증된 기법들을 하나의 플랫폼에서
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              심플한 가격, 강력한 기능
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              무료로 시작하고, 필요할 때 업그레이드하세요
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? 'bg-primary-600 text-white ring-4 ring-primary-600/20'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <h3 className={`text-xl font-semibold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    ₩{plan.price}
                  </span>
                  {plan.period && (
                    <span className={`ml-1 ${plan.highlighted ? 'text-primary-100' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className={`h-5 w-5 ${plan.highlighted ? 'text-primary-200' : 'text-primary-500'}`} />
                      <span className={plan.highlighted ? 'text-primary-50' : 'text-gray-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.highlighted ? '/pricing' : '/signup'}>
                  <Button
                    className="mt-8 w-full"
                    variant={plan.highlighted ? 'secondary' : 'default'}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              오늘부터 집중력을 키워보세요
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100">
              전 세계 수천 명의 사용자들이 FocusFlow로 생산성을 높이고 있어요.
            </p>
            <Link href="/signup">
              <Button variant="secondary" size="xl" className="mt-8 gap-2">
                무료로 시작하기
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                <Timer className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">FocusFlow</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-gray-700">이용약관</Link>
              <Link href="/privacy" className="hover:text-gray-700">개인정보처리방침</Link>
              <Link href="/contact" className="hover:text-gray-700">문의하기</Link>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 FocusFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
