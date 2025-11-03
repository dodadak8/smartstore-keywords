/**
 * 스마트스토어 키워드 최적화 홈페이지
 * - 서비스 소개 및 주요 기능 안내
 * - CTA 버튼으로 사용자 유도
 * - 반응형 디자인 및 접근성 최적화
 */

'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';
import AuthButton from '@/components/AuthButton';

// 배너 데이터
const banners = [
  {
    id: 1,
    title: "스마트스토어 판매 최적화가\n처음이신가요?",
    subtitle: "파워셀러",
    description: "키워드 리서치부터 상품명 생성, 카테고리 추천까지 모든 기능을 무료로 이용하세요",
    gradient: "from-blue-600 to-purple-600",
    bgGradient: "from-gray-50 via-blue-50 to-purple-50",
    iconBg: "from-blue-400/20 to-purple-400/20"
  },
  {
    id: 2,
    title: "AI 기반 상품명 자동 생성",
    subtitle: "클릭 한 번으로 완벽한 상품명을",
    description: "검색 최적화된 상품명을 AI가 자동으로 생성해드립니다",
    gradient: "from-purple-600 to-pink-600",
    bgGradient: "from-purple-50 via-pink-50 to-red-50",
    iconBg: "from-purple-400/20 to-pink-400/20"
  },
  {
    id: 3,
    title: "실시간 키워드 트렌드 분석",
    subtitle: "경쟁자보다 한발 앞서가세요",
    description: "검색량과 경쟁도를 실시간으로 분석하여 최적의 키워드를 찾아드립니다",
    gradient: "from-orange-600 to-red-600",
    bgGradient: "from-orange-50 via-red-50 to-pink-50",
    iconBg: "from-orange-400/20 to-red-400/20"
  },
  {
    id: 4,
    title: "완벽한 카테고리 매칭",
    subtitle: "AI가 추천하는 최적의 카테고리",
    description: "상품 특성을 분석하여 가장 적합한 카테고리를 추천해드립니다",
    gradient: "from-green-600 to-emerald-600",
    bgGradient: "from-green-50 via-emerald-50 to-teal-50",
    iconBg: "from-green-400/20 to-emerald-400/20"
  }
];

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000); // 6초마다 자동 전환

    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % banners.length);
      setTimeout(() => setIsAnimating(false), 800);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
      setTimeout(() => setIsAnimating(false), 800);
    }
  };

  const goToSlide = (index: number) => {
    if (!isAnimating && index !== currentSlide) {
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 800);
    }
  };
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* 애플 스타일 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-red-50/30"></div>
      
      {/* 마우스 따라다니는 인터랙티브 배경 */}
      <div 
        className="absolute w-96 h-96 bg-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl transition-all duration-1000 ease-out pointer-events-none"
        style={{
          left: `${mousePosition.x - 192}px`,
          top: `${mousePosition.y - 192}px`,
        }}
      ></div>
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400/15 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-red-400/15 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-pulse" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500/15 rounded-full mix-blend-multiply filter blur-3xl opacity-80 animate-pulse" style={{animationDelay: '4s'}}></div>
      
      {/* 컨텐츠 레이어 */}
      <div className="relative z-10">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <Link
              href="/"
              className="group relative flex items-center gap-2.5 py-2 focus:outline-none"
            >
              {/* 로고 아이콘 */}
              <div className="relative flex-shrink-0 focus:outline-none">
                <div className="w-9 h-9 bg-gradient-to-br from-white to-blue-100 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 flex items-center justify-center transform group-hover:scale-105 focus:outline-none">
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
              <button className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 히어로 섹션 - 3D 회전 캐러셀 */}
      <main className="pb-16">
        {/* 전체 화면 히어로 배너 캐러셀 */}
        <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden" style={{perspective: '1000px'}}>
          {/* 슬라이드 컨테이너 */}
          {banners.map((banner, index) => {
            const isActive = index === currentSlide;
            const isPrev = index === (currentSlide - 1 + banners.length) % banners.length;
            const isNext = index === (currentSlide + 1) % banners.length;

            let transform = 'translateX(100%) rotateY(45deg)';
            let opacity = 0;
            let zIndex = 0;

            if (isActive) {
              transform = 'translateX(0) rotateY(0deg)';
              opacity = 1;
              zIndex = 20;
            } else if (isPrev) {
              transform = 'translateX(-100%) rotateY(-45deg)';
              opacity = 0.3;
              zIndex = 10;
            } else if (isNext) {
              transform = 'translateX(100%) rotateY(45deg)';
              opacity = 0.3;
              zIndex = 10;
            }

            return (
              <div
                key={banner.id}
                className={`absolute inset-0 w-full min-h-screen flex items-center justify-center bg-gradient-to-br ${banner.bgGradient} transition-all duration-800 ease-in-out`}
                style={{
                  transform,
                  opacity,
                  zIndex,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* 배경 장식 요소 */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className={`absolute -top-1/2 -left-1/4 w-96 h-96 bg-gradient-to-br ${banner.iconBg} rounded-full mix-blend-multiply filter blur-3xl animate-pulse`}></div>
                  <div className={`absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-gradient-to-br ${banner.iconBg} rounded-full mix-blend-multiply filter blur-3xl animate-pulse`} style={{animationDelay: '2s'}}></div>
                </div>

                {/* 메인 콘텐츠 */}
                <div className="relative z-10 text-center px-4 sm:px-6 py-20 sm:py-24 md:py-32 max-w-5xl mx-auto">
                  {/* 로고 아이콘 */}
                  <div className="flex justify-center mb-8 sm:mb-12 md:mb-14">
                    <div className="relative">
                      <div className={`w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 bg-gradient-to-br ${banner.gradient} rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300`}>
                        <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      {/* 장식 요소 */}
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  {/* 메인 카피 */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2 sm:px-4 whitespace-pre-line">
                    {banner.title}
                  </h1>

                  <p className="text-lg sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 px-2 sm:px-4">
                    <span className={`bg-gradient-to-r ${banner.gradient} bg-clip-text text-transparent`}>
                      {banner.subtitle}
                    </span>
                    {index === 0 && <span className="text-gray-900">에서 차근차근 배워가세요.</span>}
                  </p>

                  <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-4 sm:px-6">
                    {banner.description}
                  </p>

                  {/* CTA 버튼 */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/keywords"
                      className={`group bg-gradient-to-r ${banner.gradient} hover:opacity-90 text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-105`}
                    >
                      무료로 시작하기
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      href="#features"
                      className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 px-10 py-4 rounded-full font-semibold text-lg transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl"
                    >
                      더 알아보기
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 좌우 화살표 버튼 */}
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/80 hover:bg-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label="이전 슬라이드"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-14 h-14 bg-white/80 hover:bg-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label="다음 슬라이드"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 하단 인디케이터 */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'w-12 h-3 bg-white'
                    : 'w-3 h-3 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`슬라이드 ${index + 1}로 이동`}
              />
            ))}
          </div>

          {/* 스크롤 다운 힌트 */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 animate-bounce">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* 주요 기능 소개 - 애플 스타일 큰 카드 */}
        <div id="features" className="w-full max-w-7xl mx-auto px-4 space-y-12">
          {/* 키워드 리서치 */}
          <Link href="/keywords" className="block group">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
              <div className="grid md:grid-cols-2 gap-8 p-12">
                <div className="flex flex-col justify-center">
                  <h3 className="text-4xl font-bold text-gray-900 mb-4">키워드 리서치</h3>
                  <p className="text-xl text-gray-600 mb-6">
                    검색량과 경쟁도를 실시간으로 분석하여 최적의 키워드를 찾아드립니다
                  </p>
                  <div className="text-blue-600 font-semibold inline-flex items-center group-hover:translate-x-2 transition-transform">
                    시작하기
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-12">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* 상품명 생성 */}
          <Link href="/titles" className="block group">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
              <div className="grid md:grid-cols-2 gap-8 p-12">
                <div className="flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-12 md:order-1">
                  <div className="w-48 h-48 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col justify-center md:order-2">
                  <h3 className="text-4xl font-bold text-gray-900 mb-4">상품명 생성</h3>
                  <p className="text-xl text-gray-600 mb-6">
                    AI 기반으로 최적화된 상품명을 자동으로 생성해드립니다
                  </p>
                  <div className="text-blue-600 font-semibold inline-flex items-center group-hover:translate-x-2 transition-transform">
                    시작하기
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* 카테고리 추천 + 품질 점검 */}
          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/category" className="block group">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] h-full">
                <div className="p-8 flex flex-col h-full">
                  <div className="flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl p-12 mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">카테고리 추천</h3>
                  <p className="text-gray-600 mb-4 flex-grow">
                    상품에 최적화된 카테고리를 AI가 추천해드립니다
                  </p>
                  <div className="text-blue-600 font-semibold inline-flex items-center group-hover:translate-x-2 transition-transform">
                    시작하기
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/checklist" className="block group">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] h-full">
                <div className="p-8 flex flex-col h-full">
                  <div className="flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-12 mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">품질 점검</h3>
                  <p className="text-gray-600 mb-4 flex-grow">
                    상품 등록 전 필수 항목을 체크리스트로 확인하세요
                  </p>
                  <div className="text-blue-600 font-semibold inline-flex items-center group-hover:translate-x-2 transition-transform">
                    시작하기
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* 최종 CTA 섹션 */}
        <div className="mt-32 mb-24 text-center max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            무료로 시작하고 스마트스토어 판매를 최적화하세요
          </p>
          <Link
            href="/keywords"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-full font-semibold text-lg transition-all duration-200 inline-flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            무료로 시작하기
          </Link>
        </div>

        {/* 간단한 장점 섹션 */}
        <div className="mt-24 bg-gray-50 rounded-3xl p-8 md:p-12 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-bold text-black mb-2 text-lg">빠르고 간편</h4>
              <p className="text-gray-600 text-sm">복잡한 설정 없이 즉시 시작</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-bold text-black mb-2 text-lg">완전 무료</h4>
              <p className="text-gray-600 text-sm">모든 기능을 무료로 사용</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h4 className="font-bold text-black mb-2 text-lg">스마트스토어 최적화</h4>
              <p className="text-gray-600 text-sm">네이버에 특화된 알고리즘</p>
            </div>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-gray-200 mt-24">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-black mb-4">파워셀러</h3>
              <p className="text-gray-600 text-sm transition-all duration-300 group-hover:text-gray-800">
                스마트스토어 파워셀러를 위한 판매 최적화 도구
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">주요 기능</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/keywords" className="hover:text-black">키워드 리서치</Link></li>
                <li><Link href="/titles" className="hover:text-black">상품명 생성</Link></li>
                <li><Link href="/category" className="hover:text-black">카테고리 추천</Link></li>
                <li><Link href="/checklist" className="hover:text-black">품질 점검</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">지원</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/contact" className="hover:text-black">문의하기</Link></li>
                <li><Link href="/export" className="hover:text-black">CSV 가이드</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">정보</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/policy" className="hover:text-black">이용약관</Link></li>
                <li><Link href="/policy" className="hover:text-black">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            © 2025 파워셀러. 모든 권리 보유.
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
