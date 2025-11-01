# 배포 가이드 - 스마트스토어 키워드 최적화

## 📋 개요
이 문서는 스마트스토어 키워드 최적화 웹앱의 배포 과정과 운영 가이드를 제공합니다. 저비용 호스팅 환경에서의 배포 방법을 중심으로 설명합니다.

---

## 🚀 배포 환경 준비

### 시스템 요구사항
- **Node.js**: 18.0 이상
- **npm**: 9.0 이상 또는 yarn 1.22 이상
- **Git**: 최신 버전
- **브라우저**: 최신 버전 (테스트용)

### 개발 환경 설정
```bash
# 저장소 클론
git clone <repository-url>
cd smartstore-keywords

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 확인
open http://localhost:3000
```

### 환경 변수 설정
프로젝트 루트에 `.env.local` 파일 생성:
```bash
# 기본 설정 (선택사항)
NEXT_PUBLIC_APP_NAME="스마트스토어 키워드 최적화"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# 분석 도구 (선택사항)
NEXT_PUBLIC_GA_ID=""
NEXT_PUBLIC_HOTJAR_ID=""

# API 설정 (미래 확장용)
# API_URL=""
# API_KEY=""
```

---

## 🌐 호스팅 플랫폼별 배포 가이드

### 1. Vercel (권장)

#### 장점
- ✅ Next.js 최적화
- ✅ 자동 배포
- ✅ 무료 플랜 제공
- ✅ CDN 자동 적용
- ✅ HTTPS 기본 제공

#### 배포 과정
1. **Vercel 계정 생성**
   - [vercel.com](https://vercel.com) 접속
   - GitHub 계정으로 로그인

2. **프로젝트 연결**
   ```bash
   # Vercel CLI 설치
   npm i -g vercel
   
   # 프로젝트 배포
   vercel
   
   # 프로덕션 배포
   vercel --prod
   ```

3. **자동 배포 설정**
   - GitHub 저장소와 연결
   - main 브랜치 푸시 시 자동 배포
   - 프리뷰 배포 지원

#### 설정 파일 (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/page.tsx": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### 2. Netlify

#### 장점
- ✅ 폼 처리 기능
- ✅ 무료 플랜 제공
- ✅ 쉬운 설정
- ✅ 리다이렉트 관리

#### 배포 과정
1. **프로젝트 빌드 설정**
   ```bash
   # Build command
   npm run build && npm run export
   
   # Publish directory
   out
   ```

2. **netlify.toml 설정**
   ```toml
   [build]
     publish = "out"
     command = "npm run build && npm run export"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### 3. GitHub Pages

#### 장점
- ✅ 완전 무료
- ✅ GitHub 통합
- ✅ 간단한 설정

#### 배포 과정
1. **next.config.js 수정**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     },
     basePath: process.env.NODE_ENV === 'production' ? '/repo-name' : '',
     assetPrefix: process.env.NODE_ENV === 'production' ? '/repo-name/' : ''
   }

   module.exports = nextConfig
   ```

2. **GitHub Actions 설정 (.github/workflows/deploy.yml)**
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v3

         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'

         - name: Install dependencies
           run: npm ci

         - name: Build
           run: npm run build

         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./out
   ```

---

## 📦 빌드 및 최적화

### 빌드 명령어
```bash
# 개발 빌드
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm run start

# 정적 내보내기 (GitHub Pages용)
npm run export
```

### 성능 최적화

#### 1. 번들 크기 최적화
```javascript
// next.config.js
const nextConfig = {
  // 불필요한 로케일 제거
  i18n: {
    locales: ['ko'],
    defaultLocale: 'ko',
  },
  
  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  
  // 번들 분석
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
    }
    return config;
  }
}
```

#### 2. 코드 스플리팅
```typescript
// 동적 import 사용
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>로딩 중...</p>,
  ssr: false
});
```

#### 3. 메타데이터 최적화
```typescript
// app/layout.tsx
export const metadata = {
  title: '스마트스토어 키워드 최적화',
  description: '스마트스토어 판매자를 위한 키워드 최적화 도구',
  keywords: '스마트스토어, 키워드, 최적화, 상품명, 카테고리',
  openGraph: {
    title: '스마트스토어 키워드 최적화',
    description: '키워드 기반 상품명/카테고리 최적화 도구',
    type: 'website',
    locale: 'ko_KR',
  }
}
```

---

## 🔧 배포 환경별 설정

### 환경 구분
```bash
# 개발 환경
NODE_ENV=development

# 스테이징 환경  
NODE_ENV=staging

# 프로덕션 환경
NODE_ENV=production
```

### 환경별 설정 파일
```typescript
// lib/config.ts
const config = {
  development: {
    APP_URL: 'http://localhost:3000',
    DEBUG: true,
  },
  staging: {
    APP_URL: 'https://staging-smartstore-keywords.vercel.app',
    DEBUG: false,
  },
  production: {
    APP_URL: 'https://smartstore-keywords.vercel.app',
    DEBUG: false,
  }
}

export default config[process.env.NODE_ENV || 'development'];
```

---

## 📊 모니터링 및 분석

### 1. Vercel Analytics (무료)
```javascript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Google Analytics
```javascript
// lib/gtag.js
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

export const pageview = (url) => {
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const event = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
```

### 3. 에러 모니터링
```typescript
// lib/error-tracking.ts
export function trackError(error: Error, context?: any) {
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션에서만 에러 트래킹
    console.error('Error tracked:', error, context);
    
    // 여기에 Sentry 등 에러 트래킹 서비스 연동
  } else {
    console.error('Development error:', error, context);
  }
}
```

---

## 🔒 보안 설정

### 1. 보안 헤더 설정
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
}
```

### 2. Content Security Policy
```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com;
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self' fonts.gstatic.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, '')
  }
];
```

---

## 💰 비용 최적화

### 호스팅 비용 비교
| 플랫폼 | 무료 플랜 | 유료 플랜 | 특징 |
|--------|-----------|-----------|------|
| Vercel | 100GB 대역폭 | $20/월 | Next.js 최적화 |
| Netlify | 100GB 대역폭 | $19/월 | 폼 처리 기능 |
| GitHub Pages | 100GB 저장소 | 무료 | 완전 무료 |

### 최적화 전략
1. **이미지 최적화**: WebP 포맷 사용
2. **번들 최소화**: Tree shaking 적용
3. **캐싱 전략**: CDN 활용
4. **불필요한 기능 제거**: 사용하지 않는 라이브러리 제거

---

## 🔄 CI/CD 파이프라인

### GitHub Actions 설정
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run build
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 배포 스크립트
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# 1. 코드 품질 검사
echo "📝 Checking code quality..."
npm run lint
npm run type-check

# 2. 빌드
echo "🔨 Building application..."
npm run build

# 3. 테스트 (향후 추가)
# echo "🧪 Running tests..."
# npm test

# 4. 배포
echo "🌐 Deploying to production..."
vercel --prod

echo "✅ Deployment completed!"
```

---

## 📈 성능 모니터링

### Core Web Vitals 측정
```typescript
// lib/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Google Analytics에 메트릭 전송
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
}

export function measureWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}
```

### 성능 목표
- **First Contentful Paint (FCP)**: < 2초
- **Largest Contentful Paint (LCP)**: < 3초
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

---

## 🛠 트러블슈팅

### 일반적인 문제들

#### 1. 빌드 에러
```bash
# 타입 에러
npm run type-check

# ESLint 에러  
npm run lint -- --fix

# 의존성 문제
npm ci
rm -rf node_modules package-lock.json && npm install
```

#### 2. 배포 실패
```bash
# Vercel 로그 확인
vercel logs

# 빌드 로그 확인
npm run build

# 환경 변수 확인
vercel env list
```

#### 3. 성능 문제
```bash
# 번들 분석
npm run build
npm run analyze

# 메모리 사용량 확인
node --inspect-brk npm run build
```

### 로그 관리
```typescript
// lib/logger.ts
const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // 프로덕션에서는 에러 트래킹 서비스로 전송
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};

export default logger;
```

---

## 📋 배포 체크리스트

### 배포 전 확인사항
- [ ] 모든 기능 테스트 완료
- [ ] 성능 최적화 적용
- [ ] 보안 설정 완료
- [ ] 환경 변수 설정
- [ ] 에러 처리 검증

### 배포 후 확인사항
- [ ] 사이트 접근 가능
- [ ] 모든 페이지 로딩 확인
- [ ] 모바일 반응형 확인
- [ ] 브라우저 호환성 확인
- [ ] 성능 메트릭 확인

### 운영 모니터링
- [ ] 에러 로그 모니터링
- [ ] 성능 지표 추적
- [ ] 사용자 피드백 수집
- [ ] 보안 업데이트 적용

---

## 📞 지원 및 문의

### 기술 지원
- **문서**: 이 배포 가이드
- **이슈 트래킹**: GitHub Issues
- **커뮤니티**: GitHub Discussions

### 긴급 문제 대응
1. **서비스 다운**: 호스팅 플랫폼 상태 확인
2. **성능 저하**: 모니터링 도구 확인
3. **보안 이슈**: 즉시 패치 및 재배포

---

**문서 버전**: v1.0  
**최종 업데이트**: 2025-01-16  
**작성자**: 스마트스토어 키워드 최적화 팀