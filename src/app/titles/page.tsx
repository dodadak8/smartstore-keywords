/**
 * 상품명 생성기 페이지
 * - 키워드 기반 상품명 자동 생성
 * - 템플릿 및 구성 요소 설정
 * - A/B 띄어쓰기 테스트
 * - 품질 점수 및 개선 제안
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Keyword, ProductTitle, ProductTitleComponents } from '@/lib/types';
import { getDataAdapter } from '@/lib/adapters';
import { TitleGenerator, DEFAULT_TITLE_CONFIG } from '@/lib/algorithms';

export default function TitlesPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [components, setComponents] = useState<ProductTitleComponents>({
    keywords: [],
    category: '',
    demographic: '',
    features: [],
    usage: ''
  });
  const [generatedTitles, setGeneratedTitles] = useState<ProductTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // 마우스 트래킹
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      
      setComponents(prevComp => ({
        ...prevComp,
        keywords: newSelection
      }));
      
      return newSelection;
    });
  };

  // 특징 추가
  const addFeature = () => {
    const feature = prompt('추가할 특징을 입력하세요:');
    if (feature && feature.trim()) {
      setComponents(prev => ({
        ...prev,
        features: [...(prev.features || []), feature.trim()]
      }));
    }
  };

  // 특징 제거
  const removeFeature = (index: number) => {
    setComponents(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  // 상품명 생성
  const generateTitles = async () => {
    if (selectedKeywords.length === 0) {
      setError('최소 1개 이상의 키워드를 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const selectedKeywordObjects = keywords.filter(k => selectedKeywords.includes(k.term));
      const generator = new TitleGenerator(DEFAULT_TITLE_CONFIG);
      const titles = generator.generateTitles(components, selectedKeywordObjects);
      
      setGeneratedTitles(titles);
    } catch (err) {
      setError('상품명 생성에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* 마우스 따라다니는 그라디언트 */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15), transparent 70%)`
        }}
      />
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
                className="px-4 py-2 rounded-lg bg-white/20 text-white font-medium transition-all duration-200 text-sm"
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

      <main className="relative z-10 container mx-auto px-4 py-8" style={{paddingTop: '100px'}}>
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1 
            className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-500 bg-clip-text text-transparent mb-4 hover:scale-105 transition-transform duration-300"
            style={{
              textShadow: '0 0 30px rgba(147, 51, 234, 0.3)'
            }}
          >
            상품명 생성기
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            키워드와 상품 정보를 바탕으로 최적화된 상품명을 자동 생성합니다
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 왼쪽: 설정 패널 */}
          <div className="space-y-8">
            {/* 키워드 선택 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 hover:bg-white/90 transition-all duration-300">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">키워드 선택</h3>
              {keywords.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600 mb-6">등록된 키워드가 없습니다.</p>
                  <Link
                    href="/keywords"
                    className="group relative overflow-hidden bg-gradient-to-r from-gray-800 to-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-black hover:to-gray-900 transform hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <span className="relative z-10">키워드 리서치 하러가기</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {keywords.map((keyword) => (
                    <label
                      key={keyword.id}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        selectedKeywords.includes(keyword.term)
                          ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                          : 'border-gray-200 hover:border-purple-300 bg-white/80 hover:bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedKeywords.includes(keyword.term)}
                        onChange={() => toggleKeyword(keyword.term)}
                        className="sr-only"
                      />
                      <div className="font-bold text-sm">{keyword.term}</div>
                      <div className={`text-xs font-medium ${selectedKeywords.includes(keyword.term) ? 'text-purple-100' : 'text-gray-500'}`}>
                        점수: {keyword.score?.toFixed(1) || '미계산'}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 상품 정보 입력 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 hover:bg-white/90 transition-all duration-300">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">상품 정보</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                  <input
                    type="text"
                    value={components.category || ''}
                    onChange={(e) => setComponents(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="예: 스마트폰, 의류, 화장품"
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">타겟 고객</label>
                  <input
                    type="text"
                    value={components.demographic || ''}
                    onChange={(e) => setComponents(prev => ({ ...prev, demographic: e.target.value }))}
                    placeholder="예: 남성, 여성, 20대, 중년"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">용도/시즌</label>
                  <input
                    type="text"
                    value={components.usage || ''}
                    onChange={(e) => setComponents(prev => ({ ...prev, usage: e.target.value }))}
                    placeholder="예: 겨울용, 운동용, 일상용"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">특징/재질</label>
                  <div className="space-y-2">
                    {components.features?.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm">{feature}</span>
                        <button
                          onClick={() => removeFeature(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addFeature}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                    >
                      + 특징 추가
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 생성 버튼 */}
            <button
              onClick={generateTitles}
              disabled={loading || selectedKeywords.length === 0}
              className="group relative overflow-hidden w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
            >
              <span className="relative z-10">{loading ? '생성 중...' : '상품명 생성하기'}</span>
              {!loading && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
            </button>
          </div>

          {/* 오른쪽: 결과 패널 */}
          <div className="space-y-8">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* 생성된 상품명 */}
            {generatedTitles.length > 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 hover:bg-white/90 transition-all duration-300">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">생성된 상품명 ({generatedTitles.length}개)</h3>
                <div className="space-y-6">
                  {generatedTitles.map((title, index) => (
                    <div key={title.id} className="border-2 border-purple-200 rounded-2xl p-6 bg-gradient-to-br from-white to-purple-50 hover:border-purple-400 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900">옵션 {index + 1}</h4>
                        <span className={`px-4 py-2 text-sm font-bold rounded-2xl shadow-md transform hover:scale-105 transition-all duration-200 ${
                          title.score >= 80 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                          title.score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                          'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                        }`}>
                          {title.score.toFixed(1)}점
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-xl font-bold text-gray-900 mb-2 p-3 bg-white/80 rounded-xl border border-purple-200">{title.title_text}</div>
                        <div className="text-sm text-gray-600 font-medium">
                          길이: {title.title_text.length}자
                        </div>
                      </div>

                      {/* 띄어쓰기 변형 */}
                      {title.spacing_variants && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-blue-200">
                          <div className="text-base font-bold text-blue-900 mb-3">띄어쓰기 A/B 테스트</div>
                          <div className="space-y-2">
                            <div className="text-sm bg-white/80 p-2 rounded-lg">
                              <span className="font-bold text-blue-700">띄어쓰기:</span> <span className="font-medium">{title.spacing_variants.spaced}</span>
                            </div>
                            <div className="text-sm bg-white/80 p-2 rounded-lg">
                              <span className="font-bold text-blue-700">붙여쓰기:</span> <span className="font-medium">{title.spacing_variants.unspaced}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 문제점 */}
                      {title.issues && title.issues.length > 0 && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
                          <div className="text-base font-bold text-yellow-800 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            개선 사항
                          </div>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {title.issues.map((issue, issueIndex) => (
                              <li key={issueIndex} className="flex items-start">
                                <span className="mr-2 mt-1">•</span>
                                <span className="font-medium">{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 복사 버튼 */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-purple-200">
                        <button
                          onClick={() => navigator.clipboard.writeText(title.title_text)}
                          className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl font-bold text-sm hover:from-gray-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-300 shadow-md"
                        >
                          <span className="relative z-10">복사</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>
                        {title.spacing_variants && (
                          <>
                            <button
                              onClick={() => navigator.clipboard.writeText(title.spacing_variants!.spaced)}
                              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-md"
                            >
                              <span className="relative z-10">띄어쓰기 복사</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(title.spacing_variants!.unspaced)}
                              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-md"
                            >
                              <span className="relative z-10">붙여쓰기 복사</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-16 text-center">
                <svg className="w-20 h-20 text-gray-400 mx-auto mb-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">상품명을 생성해보세요</h3>
                <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                  키워드를 선택하고 상품 정보를 입력한 후 상품명을 생성하세요
                </p>
              </div>
            )}

            {/* 다음 단계 안내 */}
            {generatedTitles.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border border-purple-200/50 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">다음 단계</h3>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  마음에 드는 상품명을 선택했다면, 카테고리 추천을 받거나 품질 점검을 진행하세요.
                </p>
                <div className="flex gap-6 justify-center">
                  <Link
                    href="/category"
                    className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
                  >
                    <span className="relative z-10">카테고리 추천받기</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Link>
                  <Link
                    href="/checklist"
                    className="group relative overflow-hidden border-2 border-pink-500 text-pink-600 bg-white/80 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-pink-500 hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-pink-500/30"
                  >
                    <span className="relative z-10">품질 점검하기</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}