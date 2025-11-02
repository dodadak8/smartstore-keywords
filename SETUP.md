# Contact Form Backend 설정 가이드

Contact form backend가 구현되었습니다! 이제 Resend API 키를 설정하면 실제로 이메일을 받을 수 있습니다.

## 1. Resend API 키 발급

1. [Resend](https://resend.com)에 가입합니다
2. Dashboard → API Keys → Create API Key
3. API 키를 복사합니다

## 2. Vercel 환경 변수 설정

### 방법 1: Vercel Dashboard에서 설정 (권장)

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택
3. Settings → Environment Variables 메뉴로 이동
4. 다음 환경 변수들을 추가:

```
RESEND_API_KEY = [Resend에서 발급받은 API 키]
CONTACT_EMAIL = [문의를 받을 이메일 주소]
```

5. Production, Preview, Development 모두 체크
6. Save 클릭
7. Deployments 탭으로 가서 "Redeploy" 클릭 (환경 변수 적용)

### 방법 2: Vercel CLI로 설정

```bash
# Vercel CLI 설치 (아직 설치 안했다면)
npm i -g vercel

# 프로젝트 디렉토리에서 실행
vercel env add RESEND_API_KEY
# API 키 입력

vercel env add CONTACT_EMAIL
# 이메일 주소 입력

# 재배포
vercel --prod
```

## 3. 로컬 개발 환경 설정

`.env.local` 파일에 다음 내용을 추가하세요:

```env
RESEND_API_KEY=re_123456789
CONTACT_EMAIL=your-email@example.com
```

## 4. 테스트

1. Contact 페이지로 이동: `/contact`
2. 폼 작성 후 제출
3. 설정한 이메일 주소로 문의 내용이 전송됩니다

## 주요 기능

✅ **Resend 이메일 전송**: 실제 이메일로 문의 내용 수신
✅ **Rate Limiting**: IP당 1시간에 5회로 제한 (스팸 방지)
✅ **Honeypot 스팸 방지**: 봇 차단
✅ **폼 유효성 검증**: 서버 사이드 + 클라이언트 사이드
✅ **예쁜 이메일 템플릿**: HTML 이메일로 깔끔하게 수신

## 문제 해결

### "이메일 서비스가 설정되지 않았습니다" 에러
→ Vercel 환경 변수에 `RESEND_API_KEY`를 추가했는지 확인하세요.

### 이메일이 오지 않아요
→ Resend의 무료 플랜은 `onboarding@resend.dev`에서만 발송 가능합니다.
→ 커스텀 도메인을 사용하려면 Resend에서 도메인을 등록해야 합니다.

### Rate Limit에 걸렸어요
→ 1시간 동안 5회 이상 제출하면 제한됩니다. 1시간 후 다시 시도하세요.

## 다음 단계

Contact form이 완료되었습니다! 다음 기능을 구현할 준비가 되었습니다:

- [ ] Keyword Favorites (북마크 기능)
- [ ] Search History (검색 기록)
- [ ] Data Export (CSV 다운로드)
- [ ] User Authentication (로그인)
