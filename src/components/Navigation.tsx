/**
 * Navigation 컴포넌트
 * - 모든 페이지에서 공통으로 사용하는 네비게이션
 * - 반응형 디자인
 * - 로그인 버튼 통합
 */

'use client';

import Link from 'next/link';
import AuthButton from '@/components/AuthButton';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 backdrop-blur-xl border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link
            href="/"
            className="group relative flex items-center gap-2.5 py-2 focus:outline-none"
          >
            {/* 로고 아이콘 */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-white to-blue-100 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 flex items-center justify-center transform group-hover:scale-105">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>

            {/* 로고 텍스트 */}
            <div className="flex flex-col justify-center">
              <span className="text-lg font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent group-hover:from-blue-100 group-hover:via-white group-hover:to-blue-100 transition-all duration-300 leading-tight">
                파워셀러
              </span>
              <span className="text-[10px] font-medium text-white/70 group-hover:text-white/90 transition-all duration-300 leading-tight">
                Smart Store Optimizer
              </span>
            </div>
          </Link>

          {/* 데스크톱 네비게이션 메뉴 */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/keywords"
              className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all duration-200 text-sm"
            >
              키워드 리서치
            </Link>

            <Link
              href="/titles"
              className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all duration-200 text-sm"
            >
              상품명 생성
            </Link>

            <Link
              href="/category"
              className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all duration-200 text-sm"
            >
              카테고리 추천
            </Link>

            <Link
              href="/checklist"
              className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all duration-200 text-sm"
            >
              품질 점검
            </Link>

            <AuthButton />
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
