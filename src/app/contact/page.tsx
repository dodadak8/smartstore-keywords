/**
 * 문의 페이지
 * - 사용자 문의 폼 (이름, 이메일, 내용)
 * - 허니팟 스팸 방지
 * - 레이트 리밋 (클라이언트 사이드)
 * - 문의 유형별 분류
 * - 접근성 최적화된 폼
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

interface ContactForm {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  honeypot: string; // 스팸 방지용 허니팟 필드
}

interface ValidationErrors {
  [key: string]: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    honeypot: ''
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

  // 문의 카테고리 옵션
  const categories = [
    { value: 'general', label: '일반 문의' },
    { value: 'feature', label: '기능 제안' },
    { value: 'bug', label: '버그 신고' },
    { value: 'support', label: '사용법 문의' },
    { value: 'business', label: '비즈니스 문의' },
    { value: 'other', label: '기타' }
  ];

  // 폼 입력 처리
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // 이름 검증
    if (!form.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (form.name.trim().length < 2) {
      newErrors.name = '이름은 2글자 이상 입력해주세요.';
    }

    // 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }

    // 카테고리 검증
    if (!form.category) {
      newErrors.category = '문의 유형을 선택해주세요.';
    }

    // 제목 검증
    if (!form.subject.trim()) {
      newErrors.subject = '제목을 입력해주세요.';
    } else if (form.subject.trim().length < 5) {
      newErrors.subject = '제목은 5글자 이상 입력해주세요.';
    }

    // 내용 검증
    if (!form.message.trim()) {
      newErrors.message = '문의 내용을 입력해주세요.';
    } else if (form.message.trim().length < 10) {
      newErrors.message = '문의 내용은 10글자 이상 입력해주세요.';
    }

    // 허니팟 검증 (스팸 방지)
    if (form.honeypot) {
      newErrors.honeypot = '스팸으로 감지되었습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 레이트 리밋 검사
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const timeDiff = now - lastSubmitTime;
    const minInterval = 60000; // 1분

    if (timeDiff < minInterval) {
      const remainingTime = Math.ceil((minInterval - timeDiff) / 1000);
      setErrors({ submit: `너무 자주 문의를 보내고 있습니다. ${remainingTime}초 후에 다시 시도해주세요.` });
      return false;
    }

    return true;
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    // 레이트 리밋 검사
    if (!checkRateLimit()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // 서버 API 호출
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          category: form.category,
          subject: form.subject,
          message: form.message,
          honeypot: form.honeypot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 서버에서 에러 반환
        if (data.errors && Array.isArray(data.errors)) {
          setErrors({ submit: data.errors.join(', ') });
        } else {
          setErrors({ submit: data.error || '문의 전송에 실패했습니다.' });
        }
        return;
      }

      // 성공 처리
      setSubmitted(true);
      setLastSubmitTime(Date.now());

      // 폼 초기화
      setForm({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
        honeypot: ''
      });

      // 로컬 스토리지에 문의 내역 저장 (클라이언트 측 기록용)
      const inquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
      inquiries.push({
        ...form,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      });
      localStorage.setItem('inquiries', JSON.stringify(inquiries));

    } catch (error) {
      setErrors({ submit: '문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.' });
      console.error('Contact form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 새 문의 작성
  const startNewInquiry = () => {
    setSubmitted(false);
    setErrors({});
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navigation />

        {/* 성공 메시지 */}
        <main className="container mx-auto px-4 sm:px-6 py-8 pt-24 sm:pt-32">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl p-10 shadow-2xl">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">문의가 전송되었습니다!</h1>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                소중한 의견을 보내주셔서 감사합니다.<br />
                최대한 빠른 시일 내에 답변드리겠습니다.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={startNewInquiry}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  새 문의 작성하기
                </button>
                
                <Link
                  href="/"
                  className="block w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />

      <main className="container mx-auto px-4 sm:px-6 py-8 pt-24 sm:pt-28">
        {/* 페이지 헤더 */}
        <div className="text-center mb-8 sm:mb-12 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 sm:mb-6 shadow-2xl">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-3 sm:mb-4">
            문의하기
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            서비스 이용 중 궁금한 점이나 제안사항이 있으시면 언제든지 문의해주세요
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 px-4">
          {/* 왼쪽: 문의 정보 */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h2 className="text-xl font-bold mb-4 text-gray-800">빠른 도움말</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-blue-900">🚀 시작하기</h3>
                  <p className="text-sm text-blue-700">
                    키워드 리서치부터 시작하여 단계별로 진행하세요
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-medium text-green-900">📊 데이터 활용</h3>
                  <p className="text-sm text-green-700">
                    CSV 파일로 대량 키워드를 업로드할 수 있습니다
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-medium text-purple-900">🎯 최적화 팁</h3>
                  <p className="text-sm text-purple-700">
                    기회지수 70점 이상의 키워드를 우선 활용하세요
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h2 className="text-xl font-bold mb-4 text-gray-800">자주 묻는 질문</h2>
              <div className="space-y-3">
                <details className="cursor-pointer">
                  <summary className="font-medium text-gray-900">CSV 파일 형식이 맞지 않아요</summary>
                  <p className="text-sm text-gray-600 mt-2">
                    샘플 CSV 파일을 다운로드하여 형식을 확인해보세요. UTF-8 인코딩으로 저장해야 합니다.
                  </p>
                </details>
                
                <details className="cursor-pointer">
                  <summary className="font-medium text-gray-900">키워드 점수가 계산되지 않아요</summary>
                  <p className="text-sm text-gray-600 mt-2">
                    검색량과 경쟁도 데이터가 입력된 후 &apos;점수 계산하기&apos; 버튼을 클릭해주세요.
                  </p>
                </details>
                
                <details className="cursor-pointer">
                  <summary className="font-medium text-gray-900">생성된 상품명을 수정할 수 있나요?</summary>
                  <p className="text-sm text-gray-600 mt-2">
                    생성된 상품명을 복사한 후 직접 편집하여 사용하실 수 있습니다.
                  </p>
                </details>
              </div>
            </div>
          </div>

          {/* 오른쪽: 문의 폼 */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-8">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">문의 작성</h2>
              </div>
              
              {/* 에러 메시지 */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700">{errors.submit}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 허니팟 필드 (스팸 방지) */}
                <input
                  type="text"
                  name="honeypot"
                  value={form.honeypot}
                  onChange={handleInputChange}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid md:grid-cols-2 gap-6">
                  {/* 이름 */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      className={`form-input ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                      placeholder="홍길동"
                      required
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* 이메일 */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      className={`form-input ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                      placeholder="example@email.com"
                      required
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* 문의 유형 */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    문의 유형 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className={`form-input ${errors.category ? 'border-red-300 focus:border-red-500' : ''}`}
                    required
                    aria-describedby={errors.category ? 'category-error' : undefined}
                  >
                    <option value="">문의 유형을 선택해주세요</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p id="category-error" className="text-red-500 text-sm mt-1" role="alert">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* 제목 */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleInputChange}
                    className={`form-input ${errors.subject ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="문의 제목을 입력해주세요"
                    required
                    aria-describedby={errors.subject ? 'subject-error' : undefined}
                  />
                  {errors.subject && (
                    <p id="subject-error" className="text-red-500 text-sm mt-1" role="alert">
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* 문의 내용 */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    문의 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={`form-input ${errors.message ? 'border-red-300 focus:border-red-500' : ''}`}
                    placeholder="문의하실 내용을 자세히 작성해주세요"
                    required
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && (
                    <p id="message-error" className="text-red-500 text-sm mt-1" role="alert">
                      {errors.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    최소 10글자 이상 입력해주세요. ({form.message.length}/1000)
                  </p>
                </div>

                {/* 개인정보 처리 동의 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>개인정보 수집 및 이용 안내</strong><br />
                    • 수집 목적: 문의 접수 및 답변<br />
                    • 수집 항목: 이름, 이메일, 문의 내용<br />
                    • 보유 기간: 문의 처리 완료 후 1년<br />
                    • 귀하는 개인정보 수집에 거부할 권리가 있으나, 거부 시 문의 접수가 제한됩니다.
                  </p>
                </div>

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      전송 중...
                    </>
                  ) : (
                    '문의 보내기'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}