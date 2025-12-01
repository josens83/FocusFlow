# FocusFlow - AI 집중력 & 생산성 관리 플랫폼

<p align="center">
  <img src="/public/logo.png" alt="FocusFlow Logo" width="120" />
</p>

<p align="center">
  <strong>당신의 뇌를 위한 퍼스널 트레이너</strong>
</p>

<p align="center">
  스마트 포모도로 | 집중 정원 | AI 코칭 | 가상 코워킹
</p>

---

## 주요 기능

### 스마트 포모도로 타이머
- 25분, 50분, 90분 등 다양한 집중 세션
- Web Worker 기반 정확한 타이머
- 적응형 세션 추천
- 집중 점수 측정

### 집중 정원 (Forest 스타일)
- 집중할 때마다 나무가 자라요
- 다양한 희귀도의 식물 수집
- 정원 테마 커스터마이징
- 친구들과 공유하는 정원

### AI 생산성 코칭
- 개인 패턴 분석
- 맞춤형 생산성 조언
- 최적 집중 시간대 추천
- 번아웃 예방 알림

### 가상 코워킹
- 다른 사람들과 함께 집중
- 책임감 향상
- 스터디 그룹
- 리더보드

## 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** + Custom Design System
- **Zustand** + **React Query**
- **Framer Motion**

### Backend
- **Next.js API Routes**
- **PostgreSQL** + **Prisma**
- **NextAuth.js**
- **Stripe** (결제)

### Infrastructure
- **Vercel** (추천)
- **Railway** / **Supabase** (DB)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 필요한 값들을 입력하세요:

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

# OAuth (선택)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
```

### 3. 데이터베이스 설정

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000`에서 확인하세요.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지
│   ├── (dashboard)/       # 메인 앱 페이지
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── timer/            # 타이머 관련
│   ├── garden/           # 정원 관련
│   ├── dashboard/        # 대시보드 관련
│   └── layout/           # 레이아웃
├── lib/                   # 유틸리티
├── stores/               # Zustand 스토어
├── hooks/                # 커스텀 훅
└── types/                # TypeScript 타입
```

## 구독 플랜

| 기능 | 무료 | 프리미엄 (₩6,900/월) |
|------|------|---------------------|
| 포모도로 타이머 | ✅ | ✅ |
| 일일 세션 | 3회 | 무제한 |
| 기본 사운드 | 3개 | 전체 |
| 정원 테마 | 1개 | 전체 |
| AI 코칭 | ❌ | ✅ |
| 상세 분석 | ❌ | ✅ |

## 배포

### Vercel (추천)

1. GitHub 저장소 연결
2. 환경 변수 설정
3. 자동 배포

### Docker

```bash
docker build -t focusflow .
docker run -p 3000:3000 focusflow
```

## 기여하기

1. Fork
2. Feature 브랜치 생성 (`git checkout -b feature/amazing`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Pull Request 생성

## 라이선스

MIT License

---

<p align="center">
  Made with ❤️ by FocusFlow Team
</p>
