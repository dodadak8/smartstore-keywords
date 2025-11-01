/**
 * 카테고리 추천 페이지
 * - 키워드 기반 카테고리 자동 추천
 * - 추천 근거 및 신뢰도 제시
 * - 필수 속성 체크리스트 제공
 * - 룰 기반 추천 시스템
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Keyword, ProductTitleComponents, CategoryAttribute } from '@/lib/types';
import { getDataAdapter } from '@/lib/adapters';
import { CategoryRecommender, CategoryRecommendationDetail } from '@/lib/algorithms';

export default function CategoryPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [productInfo, setProductInfo] = useState<ProductTitleComponents>({
    keywords: [],
    category: '',
    demographic: '',
    features: [],
    usage: ''
  });
  const [recommendations, setRecommendations] = useState<CategoryRecommendationDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 키워드 로드
  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      const adapter = await getDataAdapter();
      const result = await adapter.getKeywords({}, { sortBy: 'score', order: 'desc' }, { page: 1, limit: 50 });
      setKeywords(result.items);
    } catch (err) {
      setError('키워드를 불러오는데 실패했습니다.');
      console.error(err);
    }
  };

  // 키워드 선택 토글
  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => {
      const newSelection = prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword];
      
      setProductInfo(prevInfo => ({
        ...prevInfo,
        keywords: newSelection
      }));
      
      return newSelection;
    });
  };

  // 카테고리 추천 실행
  const getRecommendations = async () => {
    if (selectedKeywords.length === 0) {
      setError('최소 1개 이상의 키워드를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const selectedKeywordObjects = keywords.filter(k => selectedKeywords.includes(k.term));
      const recommender = new CategoryRecommender();
      const results = recommender.recommendCategories(selectedKeywordObjects, productInfo, 5);
      
      setRecommendations(results);
    } catch (err) {
      setError('카테고리 추천에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* 로고 */}
            <Link
              href="/"
              className="group relative flex items-center gap-2.5 py-2"
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

            {/* 네비게이션 메뉴 */}
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
                className="px-4 py-2 rounded-lg bg-white/20 text-white font-medium transition-all duration-200 text-sm"
              >
                카테고리 추천
              </Link>
              
              <Link 
                href="/checklist" 
                className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all duration-200 text-sm"
              >
                품질 점검
              </Link>
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

      <main>
        {/* Apple 스타일 히어로 섹션 */}
        <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 pt-16">
          {/* 배경 장식 요소 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-red-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="relative z-10 text-center px-4 py-20 max-w-5xl mx-auto">
            {/* 로고 아이콘 */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                  <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* 배지 */}
            <div className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-orange-200/50 mb-6 shadow-lg">
              <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-sm font-semibold text-orange-600">AI 카테고리 분석</span>
            </div>

            {/* 메인 타이틀 */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              카테고리 추천
            </h1>

            {/* 서브타이틀 */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              키워드와 상품 특성을 AI로 분석하여<br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-semibold"> 최적의 카테고리</span>를 추천해드립니다
            </p>

            {/* 스크롤 힌트 */}
            <div className="mt-12 animate-bounce">
              <svg className="w-6 h-6 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-12">

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* 왼쪽: 입력 패널 */}
          <div className="space-y-6">
            {/* 키워드 선택 */}
            <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">키워드 선택</h3>
              </div>
              {keywords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg">등록된 키워드가 없습니다.</p>
                  <Link
                    href="/keywords"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    키워드 리서치 하러가기
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {keywords.map((keyword) => (
                    <label
                      key={keyword.id}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        selectedKeywords.includes(keyword.term)
                          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedKeywords.includes(keyword.term)}
                        onChange={() => toggleKeyword(keyword.term)}
                        className="sr-only"
                      />
                      <div className={`font-semibold text-sm mb-1 ${
                        selectedKeywords.includes(keyword.term) ? 'text-blue-700' : 'text-gray-900'
                      }`}>
                        {keyword.term}
                      </div>
                      <div className={`text-xs flex items-center ${
                        selectedKeywords.includes(keyword.term) ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        점수: {keyword.score?.toFixed(1) || '미계산'}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 상품 정보 (선택사항) */}
            <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">추가 상품 정보 <span className="text-sm font-normal text-gray-500">(선택사항)</span></h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">타겟 고객</label>
                  <input
                    type="text"
                    value={productInfo.demographic || ''}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, demographic: e.target.value }))}
                    placeholder="예: 남성, 여성, 20대, 중년"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">용도/시즌</label>
                  <input
                    type="text"
                    value={productInfo.usage || ''}
                    onChange={(e) => setProductInfo(prev => ({ ...prev, usage: e.target.value }))}
                    placeholder="예: 겨울용, 운동용, 일상용"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">주요 특징</label>
                  <input
                    type="text"
                    value={productInfo.features?.join(', ') || ''}
                    onChange={(e) => setProductInfo(prev => ({ 
                      ...prev, 
                      features: e.target.value.split(',').map(f => f.trim()).filter(f => f) 
                    }))}
                    placeholder="예: 방수, 무선, 고화질 (쉼표로 구분)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 추천 버튼 */}
            <button
              onClick={getRecommendations}
              disabled={loading || selectedKeywords.length === 0}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                loading || selectedKeywords.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  AI 분석 중...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  카테고리 추천받기
                </div>
              )}
            </button>
          </div>

          {/* 오른쪽: 결과 패널 */}
          <div className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-red-800 mb-1">오류 발생</div>
                    <div className="text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 추천 결과 */}
            {recommendations.length > 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">추천 카테고리</h3>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200">
                    <span className="text-sm font-semibold text-blue-700">{recommendations.length}개 발견</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {recommendations.map((rec, index) => (
                    <div key={rec.suggestion.id} className={`relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                      rec.suggestion.confidence >= 80 
                        ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                        : rec.suggestion.confidence >= 60
                        ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50'
                        : 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-900">{rec.suggestion.name}</h4>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-md ${
                          rec.suggestion.confidence >= 80
                            ? 'bg-green-500 text-white'
                            : rec.suggestion.confidence >= 60
                            ? 'bg-yellow-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}>
                          신뢰도 {rec.suggestion.confidence}%
                        </div>
                      </div>

                      {/* 추천 근거 */}
                      <div className="mb-6">
                        <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          추천 근거
                        </h5>
                        <div className="space-y-2">
                          {rec.suggestion.reasons.map((reason: string, reasonIndex: number) => (
                            <div key={reasonIndex} className="flex items-start bg-white/70 rounded-lg p-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-sm text-gray-700 leading-relaxed">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 매칭된 키워드 */}
                      {rec.keywordMatches.length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            매칭 키워드
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {rec.keywordMatches.map((keyword: string, kwIndex: number) => (
                              <span key={kwIndex} className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200 shadow-sm">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 필수 속성 */}
                      {rec.suggestion.attributes.length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            필수 입력 속성
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            {rec.suggestion.attributes.map((attr: CategoryAttribute, attrIndex: number) => (
                              <div key={attrIndex} className="bg-white/70 rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center mb-1">
                                  <span className="font-semibold text-sm text-gray-800">{attr.name}</span>
                                  {attr.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                                </div>
                                {attr.type === 'select' && attr.options && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    <span className="font-medium">옵션:</span> {attr.options.slice(0, 3).join(', ')}
                                    {attr.options.length > 3 && <span className="text-blue-600"> 외 {attr.options.length - 3}개</span>}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 점수 세부사항 */}
                      <div className="border-t border-gray-200 pt-4">
                        <details className="group">
                          <summary className="cursor-pointer flex items-center justify-between text-sm font-bold text-gray-700 hover:text-gray-900 transition-colors">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-2 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              분석 세부사항
                            </span>
                          </summary>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-600 mb-1">키워드 점수</div>
                              <div className="text-lg font-bold text-blue-600">{(rec.scoreBreakdown.keywordScore * 100).toFixed(1)}%</div>
                            </div>
                            <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-600 mb-1">패턴 점수</div>
                              <div className="text-lg font-bold text-green-600">{(rec.scoreBreakdown.patternScore * 100).toFixed(1)}%</div>
                            </div>
                            <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-600 mb-1">빈도 점수</div>
                              <div className="text-lg font-bold text-purple-600">{(rec.scoreBreakdown.frequencyScore * 100).toFixed(1)}%</div>
                            </div>
                            <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                              <div className="text-xs text-gray-600 mb-1">최종 점수</div>
                              <div className="text-lg font-bold text-orange-600">{(rec.scoreBreakdown.finalScore * 100).toFixed(1)}%</div>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200/50 p-12 text-center shadow-sm">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">카테고리를 추천받아보세요</h3>
                <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                  키워드를 선택하고 상품 정보를 입력한 후<br/>
                  AI가 최적의 카테고리를 추천해드립니다
                </p>
              </div>
            )}

            {/* 도움말 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-blue-900">카테고리 선택 팁</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start bg-white/70 rounded-lg p-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 font-medium">신뢰도 80% 이상의 카테고리를 우선 고려하세요</span>
                </div>
                <div className="flex items-start bg-white/70 rounded-lg p-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 font-medium">필수 속성을 모두 입력할 수 있는지 확인하세요</span>
                </div>
                <div className="flex items-start bg-white/70 rounded-lg p-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 font-medium">경쟁 상품들이 어떤 카테고리를 사용하는지 참고하세요</span>
                </div>
                <div className="flex items-start bg-white/70 rounded-lg p-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 font-medium">여러 카테고리가 가능하다면 더 구체적인 카테고리를 선택하세요</span>
                </div>
              </div>
            </div>

            {/* 다음 단계 안내 */}
            {recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900">다음 단계</h3>
                </div>
                <p className="text-green-700 mb-6 text-lg leading-relaxed">
                  카테고리 추천을 성공적으로 받았습니다! 이제 품질 점검을 통해 최종 확인을 해보세요.
                </p>
                <Link
                  href="/checklist"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  품질 점검하기
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #f7fafc;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f7fafc;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
}