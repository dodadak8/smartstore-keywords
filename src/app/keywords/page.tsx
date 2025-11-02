/**
 * 키워드 리서치 보드 페이지
 * - 키워드 업로드/입력 기능
 * - 검색량/경쟁도 기반 점수 계산
 * - 필터링 및 정렬 기능
 * - CSV 내보내기 지원
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Keyword, KeywordFilters, KeywordSortOptions, KeywordTag } from '@/lib/types';
import { getDataAdapter } from '@/lib/adapters';
import { KeywordScorer } from '@/lib/algorithms';

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<KeywordFilters>({});
  const [sortBy, setSortBy] = useState<KeywordSortOptions>({ sortBy: 'score', order: 'desc' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [favorites, setFavorites] = useState<Set<string>>(new Set()); // 즐겨찾기 키워드 ID 목록
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false); // 즐겨찾기만 보기 필터

  // 마우스 트래킹
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loadKeywords = useCallback(async () => {
    try {
      setLoading(true);
      const adapter = await getDataAdapter();
      const result = await adapter.getKeywords(filters, sortBy, { page: 1, limit: 100 });
      setKeywords(result.items);
    } catch (err) {
      setError('키워드를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy]);

  // 키워드 로드
  useEffect(() => {
    loadKeywords();
  }, [loadKeywords]);

  // 즐겨찾기 로드
  const loadFavorites = useCallback(async () => {
    try {
      const adapter = await getDataAdapter();
      const result = await adapter.getFavorites();
      const favoriteIds = new Set(result.items.map(fav => fav.keyword_id));
      setFavorites(favoriteIds);
    } catch (err) {
      console.error('즐겨찾기 로드 실패:', err);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // 즐겨찾기 토글
  const toggleFavorite = async (keywordId: string) => {
    try {
      const adapter = await getDataAdapter();
      const isFav = favorites.has(keywordId);

      if (isFav) {
        await adapter.removeFavorite(keywordId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(keywordId);
          return newSet;
        });
      } else {
        await adapter.addFavorite(keywordId);
        setFavorites(prev => new Set(prev).add(keywordId));
      }
    } catch (err) {
      console.error('즐겨찾기 토글 실패:', err);
      setError('즐겨찾기 변경에 실패했습니다.');
    }
  };

  // 샘플 데이터 추가
  const addSampleData = async () => {
    try {
      setLoading(true);
      const adapter = await getDataAdapter();
      
      const sampleKeywords = [
        { term: '스마트폰', volume: 10000, competition: 85, tags: ['trending', 'category'] as KeywordTag[], notes: '모바일 디바이스' },
        { term: '갤럭시', volume: 8500, competition: 90, tags: ['brand', 'trending'] as KeywordTag[], notes: '삼성 브랜드' },
        { term: '아이폰', volume: 12000, competition: 95, tags: ['brand', 'trending'] as KeywordTag[], notes: '애플 브랜드' },
        { term: '무선이어폰', volume: 6000, competition: 70, tags: ['feature', 'trending'] as KeywordTag[], notes: '블루투스 이어폰' },
        { term: '게이밍마우스', volume: 3000, competition: 60, tags: ['feature', 'longtail'] as KeywordTag[], notes: '게임용 마우스' },
      ];

      for (const keywordData of sampleKeywords) {
        await adapter.createKeyword(keywordData);
      }

      await loadKeywords();
      setError(null);
    } catch (err) {
      setError('샘플 데이터 추가에 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 점수 계산
  const calculateScores = async () => {
    if (keywords.length === 0) return;

    try {
      setLoading(true);
      const scorer = new KeywordScorer({ volume: 0.7, competition: 0.3, tag: 0.1 });
      const scoredKeywords = scorer.calculateScores(keywords);
      
      const adapter = await getDataAdapter();
      for (const keyword of scoredKeywords) {
        await adapter.updateKeyword(keyword.id, { score: keyword.score });
      }
      
      await loadKeywords();
    } catch (err) {
      setError('점수 계산에 실패했습니다.');
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

            {/* 네비게이션 메뉴 */}
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                href="/keywords" 
                className="px-4 py-2 rounded-lg bg-white/20 text-white font-medium transition-all duration-200 text-sm"
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
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-4 hover:scale-105 transition-transform duration-300"
            style={{
              textShadow: '0 0 30px rgba(59, 130, 246, 0.3)'
            }}
          >
            키워드 리서치 보드
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            키워드를 분석하여 검색량과 경쟁도 기반의 기회지수를 계산합니다
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 mb-8 hover:bg-white/90 transition-all duration-300">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={addSampleData}
              disabled={loading}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
            >
              <span className="relative z-10">샘플 데이터 추가</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            <button
              onClick={calculateScores}
              disabled={loading || keywords.length === 0}
              className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/30"
            >
              <span className="relative z-10">점수 계산하기</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-6 mb-6 backdrop-blur-sm shadow-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* 필터 및 정렬 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8 mb-8 hover:bg-white/90 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">필터 및 정렬</h3>
            {/* 즐겨찾기만 보기 토글 */}
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${showFavoritesOnly ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${showFavoritesOnly ? 'translate-x-7' : 'translate-x-0'} shadow-lg`}></div>
              </div>
              <span className={`ml-3 font-medium transition-colors ${showFavoritesOnly ? 'text-orange-600' : 'text-gray-600'}`}>
                ⭐ 즐겨찾기만 보기 ({favorites.size})
              </span>
            </label>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
              <select
                value={sortBy.sortBy}
                onChange={(e) => setSortBy({ ...sortBy, sortBy: e.target.value as 'score' | 'volume' | 'competition' | 'term' })}
                className="form-input"
              >
                <option value="score">기회지수</option>
                <option value="volume">검색량</option>
                <option value="competition">경쟁도</option>
                <option value="term">키워드명</option>
                <option value="created_at">등록일</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
              <select
                value={sortBy.order}
                onChange={(e) => setSortBy({ ...sortBy, order: e.target.value as 'asc' | 'desc' })}
                className="form-input"
              >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                placeholder="키워드 검색..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* 키워드 목록 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:bg-white/90 transition-all duration-300">
          <div className="p-8 border-b border-gray-200/50">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              키워드 목록 ({showFavoritesOnly ? keywords.filter(k => favorites.has(k.id)).length : keywords.length}개)
              {showFavoritesOnly && <span className="text-orange-500 ml-2">⭐ 즐겨찾기만 표시 중</span>}
            </h3>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 font-medium">로딩 중...</p>
            </div>
          ) : keywords.length === 0 ? (
            <div className="p-16 text-center">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">키워드가 없습니다</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">샘플 데이터를 추가하거나 CSV 파일을 업로드하여 시작하세요</p>
              <button
                onClick={addSampleData}
                className="group relative overflow-hidden bg-gradient-to-r from-gray-800 to-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-black hover:to-gray-900 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <span className="relative z-10">샘플 데이터 추가하기</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700 uppercase tracking-wider w-16">
                      ⭐
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      키워드
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      검색량
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      경쟁도
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      기회지수
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      태그
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                      메모
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-200/50">
                  {keywords.filter(keyword => !showFavoritesOnly || favorites.has(keyword.id)).map((keyword) => (
                    <tr key={keyword.id} className="hover:bg-white/80 hover:shadow-md transition-all duration-200">
                      <td className="px-4 py-6 text-center">
                        <button
                          onClick={() => toggleFavorite(keyword.id)}
                          className={`text-2xl transition-all duration-300 transform hover:scale-125 ${
                            favorites.has(keyword.id)
                              ? 'hover:rotate-12 filter drop-shadow-lg'
                              : 'opacity-30 hover:opacity-100 grayscale hover:grayscale-0'
                          }`}
                          title={favorites.has(keyword.id) ? '즐겨찾기 제거' : '즐겨찾기 추가'}
                        >
                          {favorites.has(keyword.id) ? '⭐' : '☆'}
                        </button>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">{keyword.term}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-base font-semibold text-blue-600">{keyword.volume.toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-base font-semibold text-orange-600">{keyword.competition}%</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {keyword.score ? (
                          <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-2xl shadow-md transform hover:scale-105 transition-all duration-200 ${
                            keyword.score >= 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                            keyword.score >= 50 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                            'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                          }`}>
                            {keyword.score.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-base font-medium">미계산</span>
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {keyword.tags.map((tag) => (
                            <span key={tag} className="inline-block px-3 py-1 text-xs font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-gray-700 max-w-xs truncate font-medium">
                          {keyword.notes || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 다음 단계 안내 */}
        {keywords.length > 0 && (
          <div className="mt-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border border-blue-200/50 rounded-3xl p-8 shadow-xl backdrop-blur-sm">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">다음 단계</h3>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              키워드 분석이 완료되었습니다. 이제 상품명을 생성하거나 카테곤0리를 추천받아보세요.
            </p>
            <div className="flex gap-6 justify-center">
              <Link
                href="/titles"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/30"
              >
                <span className="relative z-10">상품명 생성하기</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Link>
              <Link
                href="/category"
                className="group relative overflow-hidden border-2 border-purple-500 text-purple-600 bg-white/80 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-purple-500 hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/30"
              >
                <span className="relative z-10">카테고리 추천받기</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}