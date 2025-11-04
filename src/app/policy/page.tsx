/**
 * 정책 페이지 (약관 및 개인정보처리방침)
 * - 이용약관
 * - 개인정보처리방침
 * - 서비스 정책
 * - 탭 기반 네비게이션
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

type PolicyTab = 'terms' | 'privacy' | 'service';

export default function PolicyPage() {
  const [activeTab, setActiveTab] = useState<PolicyTab>('terms');

  const tabs = [
    { id: 'terms' as PolicyTab, label: '이용약관', icon: '📋' },
    { id: 'privacy' as PolicyTab, label: '개인정보처리방침', icon: '🔒' },
    { id: 'service' as PolicyTab, label: '서비스 정책', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 py-8 pt-28 sm:pt-32 md:pt-36">
        {/* 페이지 헤더 */}
        <div className="mb-8 sm:mb-12 md:mb-16 text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-black mb-2">서비스 정책</h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 px-4">
            스마트스토어 키워드 최적화 서비스 이용을 위한 약관 및 정책을 확인하세요
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          {/* 탭 네비게이션 */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6 sm:mb-8">
            <div className="border-b border-gray-200 overflow-x-auto">
              <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max sm:min-w-none" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } transition-colors`}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4 sm:p-8">
              {/* 이용약관 */}
              {activeTab === 'terms' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">이용약관</h2>

                  <div className="space-y-4 sm:space-y-6 text-xs sm:text-base text-gray-700">
                    <section>
                      <h3 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3">제1조 (목적)</h3>
                      <p>
                        이 약관은 스마트스토어 키워드 최적화 서비스(이하 &quot;서비스&quot;)의 이용과 관련하여 
                        서비스 제공자와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">제2조 (정의)</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>&quot;서비스&quot;란 스마트스토어 판매자를 위한 키워드 최적화 도구를 의미합니다.</li>
                        <li>&quot;이용자&quot;란 본 약관에 따라 서비스를 이용하는 자를 의미합니다.</li>
                        <li>&quot;콘텐츠&quot;란 서비스에서 제공되는 모든 정보, 데이터, 텍스트, 그래픽 등을 의미합니다.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">제3조 (약관의 효력 및 변경)</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>본 약관은 서비스를 이용하는 모든 이용자에게 적용됩니다.</li>
                        <li>회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
                        <li>약관이 변경되는 경우, 변경 내용과 적용일자를 명시하여 공지합니다.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">제4조 (서비스 이용)</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>서비스는 무료로 제공되며, 별도의 회원가입 없이 이용 가능합니다.</li>
                        <li>이용자는 서비스를 상업적 목적으로 활용할 수 있습니다.</li>
                        <li>이용자는 서비스를 통해 생성된 결과물에 대한 책임을 집니다.</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">제5조 (금지사항)</h3>
                      <p>이용자는 다음과 같은 행위를 하여서는 안 됩니다:</p>
                      <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>서비스의 안정적 운영을 방해하는 행위</li>
                        <li>다른 이용자의 서비스 이용을 방해하는 행위</li>
                        <li>불법적이거나 부정한 목적으로 서비스를 이용하는 행위</li>
                        <li>서비스의 소스코드를 무단으로 복제하거나 배포하는 행위</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">제6조 (면책사항)</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>회사는 서비스를 통해 제공되는 정보의 정확성, 완전성을 보장하지 않습니다.</li>
                        <li>서비스 이용으로 인한 이용자의 손해에 대해 회사는 책임을 지지 않습니다.</li>
                        <li>불가항력적 사유로 인한 서비스 중단에 대해서는 책임을 지지 않습니다.</li>
                      </ul>
                    </section>
                  </div>
                </div>
              )}

              {/* 개인정보처리방침 */}
              {activeTab === 'privacy' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">개인정보처리방침</h2>

                  <div className="space-y-4 sm:space-y-6 text-xs sm:text-base text-gray-700">
                    <section>
                      <h3 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3">1. 개인정보 수집 및 이용목적</h3>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="font-medium mb-2">문의 접수 및 처리</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>수집항목: 이름, 이메일, 문의내용</li>
                          <li>수집방법: 문의 폼을 통한 직접 입력</li>
                          <li>이용목적: 이용자 문의 접수 및 답변 제공</li>
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">2. 개인정보 보유 및 이용기간</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>문의 접수: 문의 처리 완료 후 1년간 보관 후 자동 삭제</li>
                        <li>이용자가 개인정보 삭제를 요청하는 경우 즉시 삭제</li>
                        <li>관련 법령에 의한 보존 의무가 있는 경우 해당 기간 동안 보관</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">3. 개인정보 제3자 제공</h3>
                      <p>
                        회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 
                        다만, 다음의 경우에는 예외로 합니다:
                      </p>
                      <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>이용자가 사전에 동의한 경우</li>
                        <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">4. 개인정보 처리 위탁</h3>
                      <p>
                        현재 개인정보 처리를 위탁하고 있지 않습니다. 향후 위탁이 필요한 경우 
                        관련 내용을 공지하고 이용자의 동의를 받겠습니다.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">5. 이용자의 권리</h3>
                      <p>이용자는 다음과 같은 권리를 가집니다:</p>
                      <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>개인정보 처리현황에 대한 열람 요구권</li>
                        <li>개인정보 오류 등에 대한 정정·삭제 요구권</li>
                        <li>개인정보 처리정지 요구권</li>
                        <li>개인정보 손해에 대한 배상 요구권</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">6. 개인정보 보호책임자</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p><strong>연락처:</strong> 문의 페이지를 통해 연락 가능</p>
                        <p className="text-sm mt-1">
                          개인정보 처리와 관련된 불만이나 문의사항이 있으시면 언제든 연락해 주시기 바랍니다.
                        </p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">7. 개인정보 처리방침 변경</h3>
                      <p>
                        이 개인정보 처리방침은 2025년 1월 1일부터 적용됩니다. 
                        개인정보 처리방침이 변경되는 경우 변경 사항을 공지하겠습니다.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* 서비스 정책 */}
              {activeTab === 'service' && (
                <div className="prose max-w-none">
                  <h2 className="text-xl sm:text-2xl font-bold text-black mb-4 sm:mb-6">서비스 정책</h2>

                  <div className="space-y-4 sm:space-y-6 text-xs sm:text-base text-gray-700">
                    <section>
                      <h3 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3">서비스 제공 방식</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>웹 기반 서비스로 인터넷 연결 시 언제든 이용 가능</li>
                        <li>별도의 소프트웨어 설치 불필요</li>
                        <li>모든 기능은 클라이언트 사이드에서 처리되어 데이터 보안 강화</li>
                        <li>브라우저의 로컬 스토리지를 활용한 데이터 저장</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3">데이터 저장 정책</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <h4 className="font-medium text-blue-900 mb-2 text-xs sm:text-sm">🔐 데이터 보안</h4>
                        <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                          <li>• 키워드 데이터는 이용자의 브라우저에만 저장됩니다</li>
                          <li>• 서버로 전송되지 않아 완전한 프라이버시 보장</li>
                          <li>• CSV 내보내기를 통한 데이터 백업 권장</li>
                          <li>• 브라우저 캐시 삭제 시 데이터가 손실될 수 있음</li>
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">서비스 이용 제한</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>과도한 요청으로 인한 서비스 부하 방지를 위해 레이트 리밋 적용</li>
                        <li>문의 폼: 1분에 1회로 제한</li>
                        <li>대량 데이터 처리 시 브라우저 성능에 따른 제한 있음</li>
                        <li>JavaScript 비활성화 시 서비스 이용 불가</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3">지원 브라우저</h3>
                      <div className="grid md:grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                          <h4 className="font-medium text-green-900 mb-2 text-xs sm:text-sm">✅ 권장 브라우저</h4>
                          <ul className="text-xs sm:text-sm text-green-800 space-y-1">
                            <li>• Chrome 90 이상</li>
                            <li>• Firefox 88 이상</li>
                            <li>• Safari 14 이상</li>
                            <li>• Edge 90 이상</li>
                          </ul>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                          <h4 className="font-medium text-yellow-900 mb-2 text-xs sm:text-sm">⚠️ 제한 브라우저</h4>
                          <ul className="text-xs sm:text-sm text-yellow-800 space-y-1">
                            <li>• Internet Explorer (지원 안함)</li>
                            <li>• 모바일 브라우저 일부 기능 제한</li>
                            <li>• 구버전 브라우저 성능 제한</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">서비스 업데이트</h3>
                      <ul className="list-disc list-inside space-y-2">
                        <li>정기적인 기능 개선 및 버그 수정</li>
                        <li>스마트스토어 정책 변경에 따른 알고리즘 업데이트</li>
                        <li>업데이트 시 별도 공지 없이 자동 적용</li>
                        <li>중요한 변경사항은 홈페이지를 통해 공지</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-black mb-3">서비스 중단</h3>
                      <p>다음의 경우 서비스가 일시적으로 중단될 수 있습니다:</p>
                      <ul className="list-disc list-inside space-y-2 mt-2">
                        <li>정기 점검 및 시스템 업그레이드</li>
                        <li>호스팅 서비스 장애</li>
                        <li>네트워크 또는 시스템 장애</li>
                        <li>기타 불가항력적 사유</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3">문의 및 지원</h3>
                      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <p className="mb-2 text-xs sm:text-sm">서비스 이용 중 문의사항이 있으시면:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                          <li>문의 페이지를 통한 온라인 문의</li>
                          <li>일반적으로 24-48시간 내 답변</li>
                          <li>기술적 문제는 우선 처리</li>
                        </ul>
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 하단 안내 */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center">
            <h3 className="text-base sm:text-lg font-semibold text-black mb-2">추가 문의사항이 있으신가요?</h3>
            <p className="text-xs sm:text-base text-gray-600 mb-4">
              정책에 대한 문의나 서비스 이용 중 궁금한 점이 있으시면 언제든지 연락해주세요.
            </p>
            <Link
              href="/contact"
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              문의하기
            </Link>
          </div>

          {/* 최종 업데이트 정보 */}
          <div className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
            <p>최종 업데이트: 2025년 1월 1일</p>
            <p>이 정책은 지속적으로 개선되며, 변경 시 공지를 통해 안내드립니다.</p>
          </div>
        </div>
      </main>
    </div>
  );
}