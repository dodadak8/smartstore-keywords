/**
 * CSV 내보내기/불러오기 페이지
 * - 키워드, 상품명, 카테고리 데이터 CSV 내보내기
 * - CSV 파일 업로드 및 가져오기
 * - 프로젝트 저장/불러오기
 * - 템플릿 제공
 */

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Keyword, ProductTitle, KeywordTag } from '@/lib/types';
import { getDataAdapter } from '@/lib/adapters';
import Navigation from '@/components/Navigation';

interface ExportData {
  keywords: Keyword[];
  titles: ProductTitle[];
  categories: unknown[];
  exportDate: string;
  projectName: string;
}

export default function ExportPage() {
  const [, setKeywords] = useState<Keyword[]>([]);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 데이터 로드
  const loadCurrentData = async () => {
    try {
      setLoading(true);
      const adapter = await getDataAdapter();
      const keywordResult = await adapter.getKeywords({}, { sortBy: 'score', order: 'desc' }, { page: 1, limit: 1000 });
      
      const data: ExportData = {
        keywords: keywordResult.items,
        titles: [], // TODO: 상품명 데이터 로드
        categories: [], // TODO: 카테고리 데이터 로드
        exportDate: new Date().toISOString(),
        projectName: projectName || '스마트스토어_키워드_프로젝트'
      };
      
      setExportData(data);
      setKeywords(keywordResult.items);
      setError(null);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // CSV 내보내기
  const exportToCSV = (type: 'keywords' | 'all') => {
    if (!exportData) {
      setError('먼저 데이터를 로드해주세요.');
      return;
    }

    try {
      let csvContent = '';
      let filename = '';

      if (type === 'keywords') {
        // 키워드만 내보내기
        csvContent = 'term,volume,competition,score,tags,notes\n';
        exportData.keywords.forEach(keyword => {
          const row = [
            `"${keyword.term}"`,
            keyword.volume.toString(),
            keyword.competition.toString(),
            (keyword.score || 0).toFixed(1),
            `"${keyword.tags.join(',')}"`,
            `"${keyword.notes || ''}"`
          ].join(',');
          csvContent += row + '\n';
        });
        filename = `keywords_${new Date().toISOString().slice(0, 10)}.csv`;
      } else {
        // 전체 프로젝트 데이터 내보내기 (JSON 형태)
        const dataToExport = {
          ...exportData,
          version: '1.0'
        };
        csvContent = JSON.stringify(dataToExport, null, 2);
        filename = `project_${exportData.projectName}_${new Date().toISOString().slice(0, 10)}.json`;
      }

      // 파일 다운로드
      const blob = new Blob([csvContent], { 
        type: type === 'keywords' ? 'text/csv;charset=utf-8;' : 'application/json' 
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);

      setSuccess(`${filename} 파일이 다운로드되었습니다.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('파일 내보내기에 실패했습니다.');
      console.error(err);
    }
  };

  // CSV 파일 업로드 처리
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        // JSON 프로젝트 파일 가져오기
        const projectData = JSON.parse(text) as ExportData;
        
        const adapter = await getDataAdapter();
        
        // 키워드 가져오기
        for (const keyword of projectData.keywords) {
          try {
            await adapter.createKeyword({
              term: keyword.term,
              volume: keyword.volume,
              competition: keyword.competition,
              weight: keyword.weight,
              tags: keyword.tags,
              notes: keyword.notes
            });
          } catch {
            // 중복 키워드는 무시
          }
        }
        
        setSuccess(`프로젝트 "${projectData.projectName}"를 성공적으로 가져왔습니다.`);
        await loadCurrentData();
        
      } else if (file.name.endsWith('.csv')) {
        // CSV 키워드 파일 가져오기
        const lines = text.split('\n');
        // Skip header line processing as we use static column mapping
        
        const adapter = await getDataAdapter();
        let importCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          
          if (values.length >= 3) {
            try {
              await adapter.createKeyword({
                term: values[0],
                volume: parseInt(values[1]) || 0,
                competition: parseInt(values[2]) || 0,
                weight: values[3] ? parseFloat(values[3]) : undefined,
                tags: values[4] ? values[4].split(',').map(t => t.trim()).filter(t => ['seasonal', 'event', 'longtail', 'trending', 'brand', 'category', 'feature', 'custom'].includes(t)) as KeywordTag[] : [],
                notes: values[5] || ''
              });
              importCount++;
            } catch {
              // 중복 키워드는 무시
            }
          }
        }
        
        setSuccess(`${importCount}개의 키워드를 성공적으로 가져왔습니다.`);
        await loadCurrentData();
      } else {
        setError('지원하지 않는 파일 형식입니다. CSV 또는 JSON 파일만 업로드 가능합니다.');
      }
    } catch (err) {
      setError('파일을 가져오는데 실패했습니다. 파일 형식을 확인해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 샘플 CSV 다운로드
  const downloadSampleCSV = () => {
    const sampleData = [
      'term,volume,competition,score,tags,notes',
      '"스마트폰",10000,85,75.2,"trending,category","모바일 디바이스"',
      '"갤럭시",8500,90,68.9,"brand,trending","삼성 브랜드"',
      '"아이폰",12000,95,72.1,"brand,trending","애플 브랜드"',
      '"무선이어폰",6000,70,80.3,"feature,trending","블루투스 이어폰"',
      '"게이밍마우스",3000,60,85.4,"feature,longtail","게임용 마우스"'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'keywords_sample.csv';
    link.click();
    URL.revokeObjectURL(link.href);

    setSuccess('샘플 CSV 파일이 다운로드되었습니다.');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 py-8 pt-28 sm:pt-32 md:pt-36">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 sm:mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 sm:mb-4">
            데이터 내보내기/가져오기
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            키워드와 프로젝트 데이터를 CSV 파일로 내보내거나 가져올 수 있습니다
          </p>
        </div>

        {/* 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-700">{success}</span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 왼쪽: 내보내기 */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">데이터 내보내기</h2>
              </div>
              
              {/* 프로젝트명 설정 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트명</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="프로젝트 이름을 입력하세요"
                  className="form-input"
                />
              </div>

              {/* 데이터 로드 */}
              <div className="mb-6">
                <button
                  onClick={loadCurrentData}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  {loading ? '로딩 중...' : '현재 데이터 로드'}
                </button>
              </div>

              {/* 내보내기 옵션 */}
              {exportData && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="font-bold text-lg mb-3 text-gray-800">로드된 데이터</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 키워드: {exportData.keywords.length}개</li>
                      <li>• 상품명: {exportData.titles.length}개</li>
                      <li>• 카테고리: {exportData.categories.length}개</li>
                      <li>• 생성일: {new Date(exportData.exportDate).toLocaleDateString()}</li>
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => exportToCSV('keywords')}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      키워드 CSV 다운로드
                    </button>
                    
                    <button
                      onClick={() => exportToCSV('all')}
                      className="bg-gradient-to-r from-gray-800 to-black text-white py-3 px-6 rounded-xl font-bold hover:from-gray-900 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      전체 프로젝트 다운로드 (JSON)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CSV 형식 안내 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center">
                <span className="text-2xl mr-2">💡</span>
                CSV 형식 안내
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>키워드 CSV 컬럼:</strong></p>
                <ul className="ml-4 space-y-1">
                  <li>• term: 키워드명 (필수)</li>
                  <li>• volume: 검색량 (필수)</li>
                  <li>• competition: 경쟁도 (필수)</li>
                  <li>• score: 기회지수 (선택)</li>
                  <li>• tags: 태그 (쉼표로 구분)</li>
                  <li>• notes: 메모 (선택)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 오른쪽: 가져오기 */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">데이터 가져오기</h2>
              </div>
              
              {/* 파일 업로드 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  파일 선택 (CSV 또는 JSON)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                />
              </div>

              {/* 샘플 파일 다운로드 */}
              <div className="mb-6">
                <button
                  onClick={downloadSampleCSV}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-700 text-white py-3 px-6 rounded-xl font-bold hover:from-gray-600 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  샘플 CSV 파일 다운로드
                </button>
              </div>

              {/* 가져오기 안내 */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-5 shadow-md">
                <h4 className="font-bold text-yellow-900 mb-3 text-lg flex items-center">
                  <span className="text-2xl mr-2">⚠️</span>
                  가져오기 주의사항
                </h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• 중복된 키워드는 자동으로 건너뛰어집니다</li>
                  <li>• CSV 파일은 UTF-8 인코딩으로 저장해주세요</li>
                  <li>• 필수 컬럼(term, volume, competition)이 없으면 오류가 발생합니다</li>
                  <li>• 대용량 파일은 업로드에 시간이 걸릴 수 있습니다</li>
                </ul>
              </div>
            </div>

            {/* 빠른 액션 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800">빠른 액션</h3>
              <div className="space-y-3">
                <Link
                  href="/keywords"
                  className="block w-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 py-3 px-4 rounded-xl font-bold hover:from-blue-200 hover:to-blue-300 transition-all duration-300 text-center transform hover:scale-105 shadow-md"
                >
                  키워드 리서치로 이동
                </Link>
                <Link
                  href="/titles"
                  className="block w-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 py-3 px-4 rounded-xl font-bold hover:from-purple-200 hover:to-purple-300 transition-all duration-300 text-center transform hover:scale-105 shadow-md"
                >
                  상품명 생성으로 이동
                </Link>
                <Link
                  href="/checklist"
                  className="block w-full bg-gradient-to-r from-green-100 to-green-200 text-green-700 py-3 px-4 rounded-xl font-bold hover:from-green-200 hover:to-green-300 transition-all duration-300 text-center transform hover:scale-105 shadow-md"
                >
                  품질 점검으로 이동
                </Link>
              </div>
            </div>

            {/* 도움말 */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-5 shadow-md">
              <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center">
                <span className="text-2xl mr-2">💼</span>
                사용 팁
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 정기적으로 프로젝트를 백업하세요</li>
                <li>• 키워드 데이터는 엑셀에서 편집 후 CSV로 저장하세요</li>
                <li>• 팀원과 데이터를 공유할 때 JSON 형식을 사용하세요</li>
                <li>• 대량 키워드 등록 시 CSV 업로드를 활용하세요</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}