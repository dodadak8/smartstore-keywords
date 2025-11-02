/**
 * 체크리스트 & 품질 점검 페이지
 * - 상품 등록 전 필수 항목 체크
 * - 키워드, 상품명, 카테고리 검증
 * - 개선 사항 제안
 * - 최종 점수 산출
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Keyword } from '@/lib/types';
import { getDataAdapter } from '@/lib/adapters';

interface ChecklistItem {
  id: string;
  category: '기본정보' | '키워드' | '상품명' | '카테고리' | '속성' | '최적화';
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  score: number;
  recommendations?: string[];
}

interface QualityReport {
  overallScore: number;
  completedItems: number;
  totalItems: number;
  requiredItems: number;
  completedRequiredItems: number;
  categoryScores: Record<string, number>;
  improvements: string[];
}

export default function ChecklistPage() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기 체크리스트 생성
  useEffect(() => {
    generateChecklist();
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      const adapter = await getDataAdapter();
      const result = await adapter.getKeywords({}, { sortBy: 'score', order: 'desc' }, { page: 1, limit: 100 });
      setKeywords(result.items);
    } catch (err) {
      console.error('키워드 로드 실패:', err);
    }
  };

  const generateChecklist = () => {
    const initialChecklist: ChecklistItem[] = [
      // 기본정보
      {
        id: 'basic-keywords',
        category: '기본정보',
        title: '키워드 리서치 완료',
        description: '최소 3개 이상의 키워드가 등록되어 있는지 확인',
        required: true,
        completed: false,
        score: 0,
        recommendations: ['키워드 리서치 페이지에서 키워드를 추가하세요', '검색량과 경쟁도가 분석된 키워드를 사용하세요']
      },
      {
        id: 'basic-title',
        category: '기본정보',
        title: '상품명 생성 완료',
        description: '최적화된 상품명이 생성되었는지 확인',
        required: true,
        completed: false,
        score: 0,
        recommendations: ['상품명 생성기를 통해 여러 옵션을 생성하세요', '키워드가 포함된 상품명을 선택하세요']
      },
      {
        id: 'basic-category',
        category: '기본정보',
        title: '카테고리 선택 완료',
        description: '적절한 카테고리가 선택되었는지 확인',
        required: true,
        completed: false,
        score: 0,
        recommendations: ['카테고리 추천 기능을 활용하세요', '신뢰도 80% 이상의 카테고리를 선택하세요']
      },

      // 키워드 최적화
      {
        id: 'keyword-score',
        category: '키워드',
        title: '키워드 점수 70점 이상',
        description: '주요 키워드의 기회지수가 70점 이상인지 확인',
        required: false,
        completed: false,
        score: 0,
        recommendations: ['검색량 대비 경쟁도가 낮은 키워드를 선택하세요', '롱테일 키워드를 활용하세요']
      },
      {
        id: 'keyword-diversity',
        category: '키워드',
        title: '키워드 다양성',
        description: '브랜드, 카테고리, 특징 키워드가 균형있게 포함되었는지 확인',
        required: false,
        completed: false,
        score: 0,
        recommendations: ['다양한 유형의 키워드를 조합하세요', '타겟 고객층을 고려한 키워드를 추가하세요']
      },

      // 상품명 최적화
      {
        id: 'title-length',
        category: '상품명',
        title: '상품명 길이 적정성',
        description: '상품명이 20-50자 범위 내에 있는지 확인',
        required: false,
        completed: false,
        score: 0,
        recommendations: ['너무 짧거나 긴 상품명은 피하세요', '핵심 키워드를 앞쪽에 배치하세요']
      },
      {
        id: 'title-keywords',
        category: '상품명',
        title: '핵심 키워드 포함',
        description: '상품명에 주요 키워드가 자연스럽게 포함되었는지 확인',
        required: true,
        completed: false,
        score: 0,
        recommendations: ['검색량이 높은 키워드를 우선 포함하세요', '키워드 스터핑을 피하세요']
      },
      {
        id: 'title-readability',
        category: '상품명',
        title: '가독성 및 자연스러움',
        description: '상품명이 자연스럽고 읽기 쉬운지 확인',
        required: false,
        completed: false,
        score: 0,
        recommendations: ['띄어쓰기를 적절히 사용하세요', '특수문자 남용을 피하세요']
      },

      // 카테고리 및 속성
      {
        id: 'category-accuracy',
        category: '카테고리',
        title: '카테고리 정확성',
        description: '선택된 카테고리가 상품과 정확히 일치하는지 확인',
        required: true,
        completed: false,
        score: 0,
        recommendations: ['가장 구체적인 카테고리를 선택하세요', '경쟁 상품의 카테고리를 참고하세요']
      },
      {
        id: 'required-attributes',
        category: '속성',
        title: '필수 속성 입력',
        description: '카테고리의 필수 속성이 모두 입력되었는지 확인',
        required: true,
        completed: false,
        score: 0,
        recommendations: ['카테고리별 필수 속성을 확인하세요', '정확한 정보를 입력하세요']
      },

      // 최적화
      {
        id: 'seo-optimization',
        category: '최적화',
        title: 'SEO 최적화',
        description: '검색 최적화가 잘 되어있는지 확인',
        required: false,
        completed: false,
        score: 0,
        recommendations: ['메타 태그를 활용하세요', '이미지 alt 텍스트를 설정하세요']
      },
      {
        id: 'mobile-optimization',
        category: '최적화',
        title: '모바일 최적화',
        description: '모바일에서의 표시가 최적화되었는지 확인',
        required: false,
        completed: false,
        score: 0,
        recommendations: ['모바일 화면 크기를 고려하세요', '터치 인터페이스를 고려하세요']
      }
    ];

    setChecklist(initialChecklist);
  };

  // 체크리스트 항목 토글
  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const newCompleted = !item.completed;
          const newScore = newCompleted ? (item.required ? 20 : 10) : 0;
          return { ...item, completed: newCompleted, score: newScore };
        }
        return item;
      });
      
      // 품질 보고서 업데이트
      updateQualityReport(updated);
      return updated;
    });
  };

  // 자동 검증 실행
  const runAutoValidation = async () => {
    try {
      setLoading(true);
      const updatedChecklist = [...checklist];

      // 키워드 검증
      if (keywords.length >= 3) {
        const keywordItem = updatedChecklist.find(item => item.id === 'basic-keywords');
        if (keywordItem) {
          keywordItem.completed = true;
          keywordItem.score = 20;
        }
      }

      // 키워드 점수 검증
      const highScoreKeywords = keywords.filter(k => k.score && k.score >= 70);
      if (highScoreKeywords.length > 0) {
        const scoreItem = updatedChecklist.find(item => item.id === 'keyword-score');
        if (scoreItem) {
          scoreItem.completed = true;
          scoreItem.score = 10;
        }
      }

      // 키워드 다양성 검증
      const brandKeywords = keywords.filter(k => k.tags.includes('brand'));
      const categoryKeywords = keywords.filter(k => k.tags.includes('category'));
      const featureKeywords = keywords.filter(k => k.tags.includes('feature'));
      
      if (brandKeywords.length > 0 && categoryKeywords.length > 0 && featureKeywords.length > 0) {
        const diversityItem = updatedChecklist.find(item => item.id === 'keyword-diversity');
        if (diversityItem) {
          diversityItem.completed = true;
          diversityItem.score = 10;
        }
      }

      setChecklist(updatedChecklist);
      updateQualityReport(updatedChecklist);
      setError(null);
    } catch (err) {
      setError('자동 검증에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 품질 보고서 업데이트
  const updateQualityReport = (checklistItems: ChecklistItem[]) => {
    const completedItems = checklistItems.filter(item => item.completed).length;
    const totalItems = checklistItems.length;
    const requiredItems = checklistItems.filter(item => item.required).length;
    const completedRequiredItems = checklistItems.filter(item => item.required && item.completed).length;
    
    const totalScore = checklistItems.reduce((sum, item) => sum + item.score, 0);
    const maxScore = checklistItems.reduce((sum, item) => sum + (item.required ? 20 : 10), 0);
    const overallScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    const categoryScores: Record<string, number> = {};
    const categories = ['기본정보', '키워드', '상품명', '카테고리', '속성', '최적화'];
    
    categories.forEach(category => {
      const categoryItems = checklistItems.filter(item => item.category === category);
      const categoryScore = categoryItems.reduce((sum, item) => sum + item.score, 0);
      const categoryMaxScore = categoryItems.reduce((sum, item) => sum + (item.required ? 20 : 10), 0);
      categoryScores[category] = categoryMaxScore > 0 ? Math.round((categoryScore / categoryMaxScore) * 100) : 0;
    });

    const improvements: string[] = [];
    checklistItems.forEach(item => {
      if (!item.completed && item.required) {
        improvements.push(`필수: ${item.title}`);
      } else if (!item.completed && !item.required) {
        improvements.push(`권장: ${item.title}`);
      }
    });

    setQualityReport({
      overallScore,
      completedItems,
      totalItems,
      requiredItems,
      completedRequiredItems,
      categoryScores,
      improvements
    });
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
                className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all duration-200 text-sm"
              >
                카테고리 추천
              </Link>
              
              <Link 
                href="/checklist" 
                className="px-4 py-2 rounded-lg bg-white/20 text-white font-medium transition-all duration-200 text-sm"
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

      <main className="container mx-auto px-6 py-8" style={{paddingTop: '100px'}}>
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-4 hover:scale-105 transition-transform duration-300"
            style={{
              textShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
            }}
          >
            품질 점검 체크리스트
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            상품 등록 전 필수 항목을 체크하고 AI가 최종 품질 점수를 산출해드립니다
          </p>
        </div>

        <div className="py-12">

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* 왼쪽: 체크리스트 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 자동 검증 버튼 */}
            <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">AI 자동 검증</h3>
                </div>
                <button
                  onClick={runAutoValidation}
                  disabled={loading}
                  className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      AI 검증 중...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      자동 검증 실행
                    </div>
                  )}
                </button>
              </div>
              <p className="text-gray-600 leading-relaxed">
                등록된 키워드와 데이터를 AI가 분석하여 자동으로 체크리스트를 검증합니다
              </p>
            </div>

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

            {/* 카테고리별 체크리스트 */}
            {['기본정보', '키워드', '상품명', '카테고리', '속성', '최적화'].map(category => {
              const categoryItems = checklist.filter(item => item.category === category);
              
              const getCategoryIcon = (category: string) => {
                const icons = {
                  '기본정보': <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                  '키워드': <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
                  '상품명': <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
                  '카테고리': <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
                  '속성': <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
                  '최적화': <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                };
                return icons[category as keyof typeof icons] || icons['기본정보'];
              };

              const getCategoryColor = (category: string) => {
                const colors = {
                  '기본정보': 'from-blue-500 to-indigo-500',
                  '키워드': 'from-green-500 to-emerald-500',
                  '상품명': 'from-purple-500 to-pink-500',
                  '카테고리': 'from-orange-500 to-red-500',
                  '속성': 'from-teal-500 to-cyan-500',
                  '최적화': 'from-yellow-500 to-orange-500'
                };
                return colors[category as keyof typeof colors] || colors['기본정보'];
              };

              return (
                <div key={category} className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${getCategoryColor(category)} flex items-center justify-center mr-4`}>
                        {getCategoryIcon(category)}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{category}</h3>
                    </div>
                    {qualityReport && (
                      <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-md ${
                        (qualityReport.categoryScores[category] || 0) >= 80
                          ? 'bg-green-500 text-white'
                          : (qualityReport.categoryScores[category] || 0) >= 60
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {qualityReport.categoryScores[category] || 0}점
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {categoryItems.map(item => (
                      <div
                        key={item.id}
                        className={`relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 transform hover:-translate-y-1 ${
                          item.completed 
                            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                            : item.required
                            ? 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
                            : 'border-gray-200 bg-white hover:shadow-md'
                        }`}
                      >
                        <label className="flex items-start gap-4 cursor-pointer w-full">
                          <div className="relative mt-1">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleChecklistItem(item.id)}
                              className="sr-only"
                            />
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              item.completed
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}>
                              {item.completed && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`font-bold text-lg ${
                                item.completed ? 'text-green-800 line-through' : 'text-gray-900'
                              }`}>
                                {item.title}
                              </span>
                              {item.required && (
                                <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded-full">
                                  필수
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                item.completed
                                  ? 'text-green-600 bg-green-100'
                                  : 'text-blue-600 bg-blue-100'
                              }`}>
                                +{item.required ? 20 : 10}점
                              </span>
                            </div>
                            <p className={`text-sm mb-4 leading-relaxed ${
                              item.completed ? 'text-green-700' : 'text-gray-600'
                            }`}>
                              {item.description}
                            </p>
                            
                            {item.recommendations && !item.completed && (
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                  </div>
                                  <div className="font-bold text-sm text-blue-800">개선 방법</div>
                                </div>
                                <div className="space-y-2">
                                  {item.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start bg-white/70 rounded-lg p-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                                      <span className="text-sm text-blue-700 leading-relaxed">{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 오른쪽: 품질 보고서 */}
          <div className="space-y-6">
            {qualityReport && (
              <>
                {/* 전체 점수 */}
                <div className={`relative overflow-hidden rounded-2xl border-2 p-8 shadow-lg ${
                  qualityReport.overallScore >= 80
                    ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
                    : qualityReport.overallScore >= 60
                    ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50'
                    : 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50'
                }`}>
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/70 border border-gray-200 mb-6">
                      <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">전체 품질 점수</span>
                    </div>
                    <div className={`text-6xl font-bold mb-4 ${
                      qualityReport.overallScore >= 80
                        ? 'text-green-600'
                        : qualityReport.overallScore >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {qualityReport.overallScore}점
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-4 mb-6 shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          qualityReport.overallScore >= 80
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : qualityReport.overallScore >= 60
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                            : 'bg-gradient-to-r from-red-400 to-pink-500'
                        }`}
                        style={{ width: `${qualityReport.overallScore}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">완료 항목</div>
                        <div className="text-2xl font-bold text-gray-800">{qualityReport.completedItems}/{qualityReport.totalItems}</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-3 border border-gray-200">
                        <div className="text-sm text-gray-600 mb-1">필수 완료</div>
                        <div className="text-2xl font-bold text-gray-800">{qualityReport.completedRequiredItems}/{qualityReport.requiredItems}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 카테고리별 점수 */}
                <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">카테고리별 점수</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(qualityReport.categoryScores).map(([category, score]) => (
                      <div key={category} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">{category}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            score >= 80
                              ? 'bg-green-100 text-green-700'
                              : score >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {score}점
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              score >= 80
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                : score >= 60
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                : 'bg-gradient-to-r from-red-400 to-pink-500'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 개선 사항 */}
                {qualityReport.improvements.length > 0 && (
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200/50 rounded-2xl p-8 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-orange-900">개선 사항</h3>
                    </div>
                    <div className="space-y-3">
                      {qualityReport.improvements.slice(0, 5).map((improvement, index) => (
                        <div key={index} className="flex items-start bg-white/70 rounded-lg p-3 border border-orange-200">
                          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                          </div>
                          <span className="text-sm text-orange-800 leading-relaxed font-medium">{improvement}</span>
                        </div>
                      ))}
                      {qualityReport.improvements.length > 5 && (
                        <div className="text-center pt-2">
                          <span className="text-sm text-orange-600 font-medium">외 {qualityReport.improvements.length - 5}개 항목 더 있음</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="bg-white rounded-2xl border border-gray-200/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">다음 단계</h3>
                  </div>
                  
                  {qualityReport.completedRequiredItems < qualityReport.requiredItems ? (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-red-800">필수 항목 미완료</div>
                          <div className="text-sm text-red-700">모든 필수 항목을 완료해주세요</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-green-800">필수 항목 완료</div>
                          <div className="text-sm text-green-700">모든 필수 항목이 완료되었습니다!</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Link
                      href="/keywords"
                      className="flex items-center justify-center w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-6 py-4 rounded-xl font-semibold hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-200 hover:shadow-md transform hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      키워드 추가하기
                    </Link>
                    <Link
                      href="/titles"
                      className="flex items-center justify-center w-full bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 px-6 py-4 rounded-xl font-semibold hover:from-purple-100 hover:to-pink-100 transition-all duration-300 border border-purple-200 hover:shadow-md transform hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      상품명 재생성하기
                    </Link>
                    
                    {qualityReport.overallScore >= 80 && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-6 mt-6 shadow-sm">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <div className="text-green-800 font-bold text-lg mb-2">최적화 완료!</div>
                          <div className="text-sm text-green-700 leading-relaxed">
                            품질 점수가 우수합니다. 이제 스마트스토어에 상품을 등록하세요.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* 도움말 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-blue-900">체크리스트 활용 팁</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start bg-white/70 rounded-lg p-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 font-medium">필수 항목을 먼저 완료하세요</span>
                </div>
                <div className="flex items-start bg-white/70 rounded-lg p-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 font-medium">AI 자동 검증으로 시간을 절약하세요</span>
                </div>
                <div className="flex items-start bg-white/70 rounded-lg p-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 font-medium">80점 이상을 목표로 하세요</span>
                </div>
                <div className="flex items-start bg-white/70 rounded-lg p-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 font-medium">개선 방법을 참고하여 최적화하세요</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}