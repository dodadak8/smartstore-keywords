/**
 * 개인정보처리방침 페이지
 * - 개인정보 수집 및 이용 목적
 * - 개인정보 보유 및 이용 기간
 * - 개인정보 제3자 제공
 * - 이용자의 권리와 의무
 * - 개인정보 보호 조치
 */

'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 backdrop-blur-xl border-b-4 border-white/30 shadow-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-black text-white hover:text-blue-100 transition-all duration-300 transform hover:scale-105 tracking-tight">
              파워셀러
            </Link>
            <div className="flex space-x-2">
              <Link href="/keywords" className="nav-link">키워드 리서치</Link>
              <Link href="/titles" className="nav-link">상품명 생성</Link>
              <Link href="/category" className="nav-link">카테고리 추천</Link>
              <Link href="/checklist" className="nav-link">품질 점검</Link>
              <Link href="/export" className="nav-link">내보내기</Link>
              <Link href="/contact" className="nav-link">문의하기</Link>
              <Link href="/privacy" className="nav-link nav-link-active">개인정보처리방침</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8 pt-28">
        {/* 페이지 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            개인정보처리방침
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            파워셀러 서비스의 개인정보 처리방침입니다
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* 기본 정보 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">기본 정보</h2>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>처리방침 시행일자:</strong> 2024년 1월 1일<br />
                <strong>처리방침 변경일자:</strong> 2024년 1월 1일
              </p>
              <p>
                파워셀러(이하 &apos;회사&apos;)는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 수립·공개합니다.
              </p>
            </div>
          </div>

          {/* 개인정보 수집 및 이용 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m5-2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">개인정보 수집 및 이용</h2>
            </div>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">1. 수집하는 개인정보의 항목</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">필수항목:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>문의 시: 이름, 이메일 주소, 문의 내용</li>
                    <li>서비스 이용 시: IP 주소, 접속 로그, 쿠키, 서비스 이용 기록</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2. 개인정보 수집 및 이용목적</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>서비스 제공:</strong> 키워드 리서치, 상품명 생성, 카테고리 추천 등 서비스 기능 제공</li>
                  <li><strong>고객 지원:</strong> 문의사항 처리, 서비스 안내, 기술적 문제 해결</li>
                  <li><strong>서비스 개선:</strong> 서비스 품질 향상, 새로운 기능 개발을 위한 통계 분석</li>
                  <li><strong>법적 의무:</strong> 관련 법령에 따른 의무 이행</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">3. 개인정보의 보유 및 이용기간</h3>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>문의 내역: 문의 처리 완료 후 1년</li>
                    <li>서비스 이용 기록: 서비스 종료 시까지</li>
                    <li>법령에 따른 보존 의무가 있는 경우 해당 법령에서 정한 기간</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 개인정보 제3자 제공 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">개인정보 제3자 제공</h2>
            </div>

            <div className="text-gray-700">
              <p className="mb-4">
                회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 
                다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                <li>서비스 제공에 따른 요금정산을 위하여 필요한 경우</li>
              </ul>
            </div>
          </div>

          {/* 이용자의 권리 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">이용자의 권리와 의무</h2>
            </div>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">1. 이용자의 권리</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>개인정보 처리현황에 대한 통지 요구</li>
                  <li>개인정보 처리정지 요구</li>
                  <li>개인정보 수정·삭제 요구</li>
                  <li>손해배상 청구</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">2. 권리 행사 방법</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm">
                    개인정보보호법에 따른 권리 행사는 서면, 전화, 전자우편, 모사전송 등을 통하여 하실 수 있으며, 
                    회사는 이에 대해 지체 없이 조치하겠습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 개인정보 보호조치 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-red-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">개인정보 보호조치</h2>
            </div>

            <div className="text-gray-700">
              <p className="mb-4">
                회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보 조치를 취하고 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>관리적 조치:</strong> 개인정보 처리 직원의 최소화 및 교육</li>
                <li><strong>기술적 조치:</strong> 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치</li>
                <li><strong>물리적 조치:</strong> 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </div>
          </div>

          {/* 연락처 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">개인정보 보호책임자</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm">
                  <strong>개인정보 보호책임자</strong><br />
                  담당부서: 서비스 운영팀<br />
                  연락처: <Link href="/contact" className="text-indigo-600 hover:text-indigo-800">문의하기 페이지</Link>를 통해 문의해주세요
                </p>
              </div>
            </div>
          </div>

          {/* 정책 변경 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">📋</span>
              <h2 className="text-xl font-bold text-blue-900">정책 변경</h2>
            </div>
            
            <div className="text-blue-700">
              <p className="mb-4">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
              <p>
                개인정보 처리와 관련하여 궁금한 사항이 있으시면 언제든지 문의해 주시기 바랍니다.
              </p>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              문의하기
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}