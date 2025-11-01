/**
 * 스마트스토어 키워드 최적화 웹앱 루트 레이아웃
 * - 전체 애플리케이션의 기본 구조 및 설정
 * - 폰트, 메타데이터, 글로벌 스타일 적용
 * - 접근성 및 SEO 최적화
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 한국어 지원이 우수한 Inter 폰트 사용
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // 폰트 로딩 최적화
});

/**
 * 페이지 메타데이터 설정
 * - SEO 최적화를 위한 기본 메타데이터
 * - 소셜 미디어 공유를 위한 Open Graph 설정
 */
export const metadata: Metadata = {
  title: {
    default: "파워셀러",
    template: "%s | 파워셀러",
  },
  description: "스마트스토어 파워셀러를 위한 판매 최적화 도구. 키워드 리서치부터 상품명 생성까지 한 번에 해결하세요.",
  keywords: [
    "스마트스토어",
    "키워드 최적화",
    "상품명 생성",
    "카테고리 추천",
    "SEO",
    "전자상거래",
    "마케팅 도구"
  ],
  authors: [{ name: "SmartStore Keywords Team" }],
  creator: "SmartStore Keywords",
  publisher: "SmartStore Keywords",
  
  // Open Graph 설정 (소셜 미디어 공유용)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "파워셀러",
    title: "파워셀러",
    description: "스마트스토어 파워셀러를 위한 판매 최적화 도구",
  },
  
  // Twitter 카드 설정
  twitter: {
    card: "summary_large_image",
    title: "파워셀러",
    description: "스마트스토어 파워셀러를 위한 판매 최적화 도구",
  },
  
  // 기타 메타데이터
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

/**
 * 루트 레이아웃 컴포넌트
 * - 전체 애플리케이션의 기본 HTML 구조
 * - 글로벌 스타일 및 폰트 적용
 * - 접근성 기능 포함
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={inter.variable}>
      <head>
        {/* 파비콘 설정 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* 웹 앱 매니페스트 */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* 테마 색상 */}
        <meta name="theme-color" content="#000000" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased bg-white text-gray-900 min-h-screen`}>
        {/* 스크린 리더용 건너뛰기 링크 */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-black text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
        >
          메인 콘텐츠로 바로가기
        </a>
        
        {/* 메인 애플리케이션 영역 */}
        <div className="flex flex-col min-h-screen">
          {/* 네비게이션 영역 (추후 추가) */}
          
          {/* 메인 콘텐츠 영역 */}
          <main 
            id="main-content" 
            className="flex-1"
            role="main"
            aria-label="메인 콘텐츠"
          >
            {children}
          </main>
          
          {/* 푸터 영역 (추후 추가) */}
        </div>
        
        {/* 토스트 알림 컨테이너 (추후 추가) */}
        <div id="toast-container" aria-live="polite" aria-atomic="true" />
        
        {/* 모달 컨테이너 (추후 추가) */}
        <div id="modal-container" />
      </body>
    </html>
  );
}
