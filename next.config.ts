import type { NextConfig } from "next";

/**
 * 스마트스토어 키워드 최적화 웹앱 Next.js 설정
 * - 저비용 호스팅을 위한 정적 사이트 생성 지원
 * - 성능 최적화 설정
 * - 접근성 및 SEO 최적화
 */
const nextConfig: NextConfig = {
  // 정적 사이트 생성을 위한 설정 (저비용 호스팅용)
  // output: 'export', // 필요시 활성화하여 정적 배포 가능
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // 이미지 최적화 (정적 배포에서는 기본 로더 사용)
  images: {
    unoptimized: true,
    domains: [], // 외부 이미지 도메인 추가시 여기에 입력
  },
  
  // 성능 최적화
  experimental: {
    // optimizeCss: true, // CSS 최적화 (필요시 활성화)
    // turbo: { // Turbopack 설정 (개발 환경 최적화)
    //   rules: {},
    // },
  },
  
  // 컴파일러 최적화
  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // error, warn은 유지
    } : false,
  },
  
  // 환경변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // 리다이렉트 설정 (필요시)
  async redirects() {
    return [
      // 예시: 구 URL에서 새 URL로 리다이렉트
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;
