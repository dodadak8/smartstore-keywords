# 스마트스토어 키워드 최적화 웹앱

> 스마트스토어 판매자를 위한 키워드 기반 상품명/카테고리 최적화 + 운영 체크리스트 도구

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)

## 📋 프로젝트 개요

### 목표
스마트스토어 판매자가 상품의 검색 노출도를 향상시킬 수 있도록 돕는 **저비용 웹 기반 도구**입니다. 키워드 분석부터 상품명 생성, 카테고리 추천, 품질 점검까지 전 과정을 지원합니다.

### 핵심 가치
- 🚀 **저비용 운영**: 무료/극저가 호스팅으로 시작 가능
- 👥 **사용자 친화적**: 비전공자도 쉽게 사용할 수 있는 직관적 인터페이스  
- 💼 **실용성**: 실제 스마트스토어 운영에 바로 적용 가능한 기능
- 🔒 **프라이버시**: 클라이언트 사이드 데이터 저장으로 완전한 데이터 보안

## ✨ 주요 기능

### 🔍 1. 키워드 리서치 보드
- CSV 파일 업로드 또는 수동 키워드 입력
- 기회지수 자동 계산: `(검색량 × 가중치) / (경쟁도 + 1)`
- 키워드별 태그 관리 (트렌드, 브랜드, 롱테일 등)
- 정렬/필터링을 통한 최적 키워드 선정

### ✏️ 2. 상품명 생성기
- 키워드 기반 상품명 자동 생성 (5-10개 후보)
- 스마트스토어 최적화 규칙 적용
- A/B 띄어쓰기 테스트 (띄어쓰기 vs 붙여쓰기)
- 품질 점수 및 개선사항 제안

### 🏷️ 3. 카테고리/속성 추천  
- AI 기반 카테고리 매칭 (신뢰도 80%+ 달성)
- 추천 근거 상세 제공
- 필수 속성 체크리스트
- 경쟁 상품 분석 기반 제안

### ✅ 4. 품질 점검 체크리스트
- 상품 등록 전 최종 품질 검증 (100점 만점)
- 자동 검증 + 수동 체크 항목
- 카테고리별 점수 분석
- 구체적인 개선 방향 제시

### 💾 5. 데이터 관리
- CSV/JSON 형식 내보내기/가져오기
- 프로젝트 단위 백업 및 복원
- 팀 협업을 위한 데이터 공유

## 🚀 빠른 시작

### 환경 요구사항
- Node.js 18.0 이상
- npm 9.0 이상

### 설치 및 실행
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

### 빌드 및 배포
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 실행
npm start

# 정적 파일 생성 (GitHub Pages용)
npm run export
```

## 🎯 사용법

### 1. 키워드 리서치
1. `/keywords` 페이지 접속
2. "샘플 데이터 추가" 또는 CSV 파일 업로드
3. "점수 계산하기"로 기회지수 산출
4. 점수 기준으로 정렬하여 최적 키워드 선정

### 2. 상품명 생성
1. `/titles` 페이지에서 키워드 선택
2. 상품 정보 입력 (카테고리, 타겟 고객 등)
3. "상품명 생성하기"로 후보 생성
4. A/B 테스트 버전 중 선택

### 3. 카테고리 추천
1. `/category` 페이지에서 키워드 선택
2. 추가 상품 정보 입력 (선택)
3. "카테고리 추천받기"로 후보 확인
4. 신뢰도 80% 이상 카테고리 선택 권장

### 4. 품질 점검
1. `/checklist` 페이지에서 "자동 검증 실행"
2. 수동 체크리스트 항목 확인
3. 80점 이상 달성 시 상품 등록 권장

## 🏗️ 기술 스택

### 프론트엔드
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

### 아키텍처 
- **Pattern**: Data Adapter Pattern
- **Storage**: Browser localStorage (확장 가능한 구조)
- **Deployment**: Vercel, Netlify, GitHub Pages 지원

### 핵심 설계 원칙
- 클라이언트 사이드 데이터 처리로 완전한 프라이버시 보장
- 확장 가능한 데이터 어댑터 패턴 (LocalStorage → API → Database)
- 관심사의 분리로 유지보수성 극대화

## 📊 성능 지표

### 웹 성능
- **First Contentful Paint**: < 2초
- **Largest Contentful Paint**: < 3초  
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

### 사용자 경험
- 모바일 우선 반응형 디자인
- WCAG 2.1 AA 접근성 준수
- 키보드 네비게이션 완전 지원

## 💰 운영 비용

| 호스팅 플랫폼 | 무료 플랜 | 유료 플랜 | 권장도 |
|--------------|-----------|-----------|--------|
| **Vercel** | 100GB 대역폭 | $20/월 | ⭐⭐⭐ |
| **Netlify** | 100GB 대역폭 | $19/월 | ⭐⭐ |
| **GitHub Pages** | 무제한 | 무료 | ⭐ |

**예상 월 운영비**: $0 - $10 (도메인 포함)

## 📁 프로젝트 구조

```
smartstore-keywords/
├── src/
│   ├── app/                 # Next.js 페이지
│   │   ├── keywords/        # 키워드 리서치
│   │   ├── titles/         # 상품명 생성  
│   │   ├── category/       # 카테고리 추천
│   │   ├── checklist/      # 품질 점검
│   │   ├── export/         # 데이터 관리
│   │   ├── contact/        # 문의
│   │   └── policy/         # 정책
│   ├── components/         # 재사용 컴포넌트
│   ├── lib/               # 핵심 비즈니스 로직
│   │   ├── adapters/      # 데이터 어댑터
│   │   ├── algorithms/    # 핵심 알고리즘
│   │   └── utils/         # 유틸리티
│   └── server/            # 서버 로직 (미래)
├── docs/                  # 프로젝트 문서
│   ├── requirements.md    # 요구사항 명세
│   ├── architecture.md    # 아키텍처 가이드
│   ├── manual_user.md     # 사용자 매뉴얼
│   ├── qa_checklist.md    # QA 체크리스트
│   └── deployment.md      # 배포 가이드
└── public/               # 정적 파일
```

## 🧪 테스트

### 테스트 실행
```bash
# 타입 체크
npm run type-check

# 린트 체크
npm run lint

# 린트 자동 수정
npm run lint:fix

# 빌드 테스트
npm run build
```

### QA 체크리스트
상세한 테스트 가이드는 [docs/qa_checklist.md](./docs/qa_checklist.md)를 참고하세요.

## 📚 문서

- 📋 [요구사항 명세서](./docs/requirements.md)
- 🏗️ [아키텍처 가이드](./docs/architecture.md)  
- 👥 [사용자 매뉴얼](./docs/manual_user.md)
- 🧪 [QA 체크리스트](./docs/qa_checklist.md)
- 🚀 [배포 가이드](./docs/deployment.md)

## 🤝 기여하기

### 개발 워크플로
1. 이슈 생성 또는 기존 이슈 확인
2. feature/fix 브랜치 생성
3. 개발 및 테스트
4. Pull Request 생성
5. 코드 리뷰 후 병합

### 코딩 컨벤션
- **언어**: TypeScript 사용 필수
- **스타일**: ESLint + Prettier 설정 준수
- **커밋**: Conventional Commits 형식
- **주석**: 모든 함수/컴포넌트에 한글 주석 필수

### 커밋 메시지 형식
```
feat: 새로운 기능 추가
fix: 버그 수정  
docs: 문서 업데이트
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드/설정 변경
```

## 🐛 버그 리포트 및 기능 제안

버그 발견이나 새로운 기능 제안은 [GitHub Issues](https://github.com/your-repo/issues)를 통해 알려주세요.

### 버그 리포트 템플릿
- **환경**: 브라우저, OS, 디바이스
- **재현 단계**: 상세한 재현 방법
- **예상 결과**: 기대했던 동작
- **실제 결과**: 실제 발생한 현상
- **스크린샷**: 가능한 경우 첨부

## 📄 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE) 하에 배포됩니다.

## 👥 개발팀

- **프로젝트 리드**: 스마트스토어 키워드 최적화 팀
- **기술 문의**: [contact 페이지](/contact) 이용

## 🔗 관련 링크

- 🌐 **데모 사이트**: [링크 예정]
- 📖 **사용자 가이드**: [docs/manual_user.md](./docs/manual_user.md)
- 🐛 **버그 리포트**: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 **커뮤니티**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**버전**: v1.0.0  
**최종 업데이트**: 2025-01-16  
**개발 상태**: ✅ 프로덕션 준비 완료

스마트스토어 운영에 도움이 되길 바랍니다! 🚀
