/**
 * 공통 유틸리티 함수들
 * - 프로젝트 전반에서 사용하는 범용 유틸리티 모음
 * - 날짜 처리, 문자열 처리, 검증, 포맷팅 등
 * - 모든 함수는 순수 함수로 구현하여 테스트 가능
 */

/**
 * 클래스명 조건부 결합
 * - Tailwind CSS와 함께 사용하기 적합
 * @param classes 클래스명 목록 (falsy 값 필터링됨)
 * @returns 결합된 클래스 문자열
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * 날짜 포맷팅 유틸리티
 */
export const formatDate = {
  /**
   * 상대적 시간 표시 (예: "3일 전", "방금 전")
   * @param date 날짜 문자열 또는 Date 객체
   * @returns 상대적 시간 문자열
   */
  relative: (date: string | Date): string => {
    const now = new Date();
    const target = new Date(date);
    const diffInMs = now.getTime() - target.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInDays < 7) return `${diffInDays}일 전`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}개월 전`;
    return `${Math.floor(diffInDays / 365)}년 전`;
  },

  /**
   * 한국어 날짜 포맷 (예: "2025년 8월 16일")
   * @param date 날짜 문자열 또는 Date 객체
   * @returns 한국어 날짜 문자열
   */
  korean: (date: string | Date): string => {
    const target = new Date(date);
    return target.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * 간단한 날짜 포맷 (예: "2025.08.16")
   * @param date 날짜 문자열 또는 Date 객체
   * @returns 간단한 날짜 문자열
   */
  simple: (date: string | Date): string => {
    const target = new Date(date);
    return target.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '.').replace('.', '');
  },

  /**
   * 시간 포함 포맷 (예: "2025.08.16 14:30")
   * @param date 날짜 문자열 또는 Date 객체
   * @returns 시간 포함 날짜 문자열
   */
  withTime: (date: string | Date): string => {
    const target = new Date(date);
    return target.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\. /g, '.').replace('.', '').replace(',', '');
  }
};

/**
 * 문자열 처리 유틸리티
 */
export const stringUtils = {
  /**
   * 텍스트를 지정된 길이로 자르고 말줄임표 추가
   * @param text 원본 텍스트
   * @param maxLength 최대 길이
   * @returns 잘린 텍스트
   */
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },

  /**
   * 슬러그 생성 (URL 친화적인 문자열)
   * @param text 원본 텍스트
   * @returns 슬러그 문자열
   */
  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // 특수문자 제거
      .replace(/[\s_-]+/g, '-') // 공백을 하이픈으로
      .replace(/^-+|-+$/g, ''); // 앞뒤 하이픈 제거
  },

  /**
   * HTML 태그 제거
   * @param html HTML 문자열
   * @returns 태그가 제거된 텍스트
   */
  stripHtml: (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  },

  /**
   * 이메일 마스킹 (예: "test@example.com" -> "te**@ex***.com")
   * @param email 이메일 주소
   * @returns 마스킹된 이메일
   */
  maskEmail: (email: string): string => {
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;

    const maskedLocal = local.length > 2 
      ? local.slice(0, 2) + '*'.repeat(local.length - 2)
      : local;

    const [domainName, tld] = domain.split('.');
    const maskedDomain = domainName.length > 2
      ? domainName.slice(0, 2) + '*'.repeat(domainName.length - 2)
      : domainName;

    return `${maskedLocal}@${maskedDomain}.${tld}`;
  },

  /**
   * 카멜케이스를 케밥케이스로 변환
   * @param str 카멜케이스 문자열
   * @returns 케밥케이스 문자열
   */
  camelToKebab: (str: string): string => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  },

  /**
   * 케밥케이스를 카멜케이스로 변환
   * @param str 케밥케이스 문자열
   * @returns 카멜케이스 문자열
   */
  kebabToCamel: (str: string): string => {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  },

  /**
   * 문자열 유사도 계산 (Levenshtein distance 기반)
   * @param str1 첫 번째 문자열
   * @param str2 두 번째 문자열
   * @returns 유사도 (0-1, 1이 완전 일치)
   */
  similarity: (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
};

/**
 * 유효성 검사 유틸리티
 */
export const validators = {
  /**
   * 이메일 유효성 검사
   * @param email 이메일 주소
   * @returns 유효 여부
   */
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * 한국 휴대폰 번호 유효성 검사
   * @param phone 휴대폰 번호
   * @returns 유효 여부
   */
  phoneKR: (phone: string): boolean => {
    const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * URL 유효성 검사
   * @param url URL 문자열
   * @returns 유효 여부
   */
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 비어있지 않은 문자열 검사
   * @param text 텍스트
   * @returns 비어있지 않음 여부
   */
  notEmpty: (text: string): boolean => {
    return text.trim().length > 0;
  },

  /**
   * 최소/최대 길이 검사
   * @param text 텍스트
   * @param min 최소 길이
   * @param max 최대 길이 (선택사항)
   * @returns 길이 조건 충족 여부
   */
  length: (text: string, min: number, max?: number): boolean => {
    const length = text.trim().length;
    if (length < min) return false;
    if (max && length > max) return false;
    return true;
  },

  /**
   * 숫자 범위 검사
   * @param value 숫자 값
   * @param min 최소값
   * @param max 최대값
   * @returns 범위 내 여부
   */
  numberRange: (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  },

  /**
   * 강력한 비밀번호 검사
   * @param password 비밀번호
   * @returns 강력한 비밀번호 여부
   */
  strongPassword: (password: string): boolean => {
    // 최소 8자, 대소문자, 숫자, 특수문자 포함
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }
};

/**
 * 숫자 포맷팅 유틸리티
 */
export const formatNumber = {
  /**
   * 천 단위 구분자 추가
   * @param num 숫자
   * @returns 포맷된 문자열
   */
  withCommas: (num: number): string => {
    return num.toLocaleString('ko-KR');
  },

  /**
   * 백분율 포맷
   * @param value 값 (0-1)
   * @param decimals 소수점 자릿수
   * @returns 백분율 문자열
   */
  percentage: (value: number, decimals: number = 1): string => {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * 파일 크기 포맷
   * @param bytes 바이트 수
   * @returns 포맷된 파일 크기
   */
  fileSize: (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${size.toFixed(1)} ${sizes[i]}`;
  },

  /**
   * 숫자를 한국어 단위로 변환
   * @param num 숫자
   * @returns 한국어 단위 문자열
   */
  koreanUnit: (num: number): string => {
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
    if (num >= 10000) return `${(num / 10000).toFixed(1)}만`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}천`;
    return num.toString();
  }
};

/**
 * 스팸 방지 유틸리티
 */
export const spamProtection = {
  /**
   * 허니팟 필드 검증
   * - 봇이 채우는 숨겨진 필드를 확인
   * @param honeypotValue 허니팟 필드 값
   * @returns 스팸 아님 여부
   */
  checkHoneypot: (honeypotValue: string): boolean => {
    return honeypotValue === '' || honeypotValue === undefined;
  },

  /**
   * 레이트 리밋 검사
   * - 같은 IP에서의 요청 빈도 제한
   * @param lastSubmissionTime 마지막 제출 시간
   * @param minInterval 최소 간격 (밀리초)
   * @returns 요청 가능 여부
   */
  checkRateLimit: (lastSubmissionTime: number, minInterval: number = 60000): boolean => {
    const now = Date.now();
    return (now - lastSubmissionTime) >= minInterval;
  },

  /**
   * 간단한 텍스트 스팸 검사
   * - 의심스러운 키워드나 패턴 확인
   * @param text 검사할 텍스트
   * @returns 스팸 아님 여부
   */
  checkSpamContent: (text: string): boolean => {
    const spamKeywords = [
      'viagra', 'casino', 'lottery', 'win money', 'click here',
      '클릭하세요', '돈벌기', '무료', '당첨', '상품권', '대출'
    ];
    
    const lowerText = text.toLowerCase();
    return !spamKeywords.some(keyword => lowerText.includes(keyword));
  }
};

/**
 * 성능 관련 유틸리티
 */
export const performance = {
  /**
   * 디바운스 함수
   * - 연속된 호출을 지연시켜 성능 최적화
   * @param func 실행할 함수
   * @param wait 대기 시간 (밀리초)
   * @returns 디바운스된 함수
   */
  debounce: <T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * 스로틀 함수
   * - 호출 빈도를 제한하여 성능 최적화
   * @param func 실행할 함수
   * @param limit 제한 시간 (밀리초)
   * @returns 스로틀된 함수
   */
  throttle: <T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * 함수 실행 시간 측정
   * @param func 실행할 함수
   * @param label 라벨 (선택사항)
   * @returns 실행 결과와 시간
   */
  measureTime: async <T>(
    func: () => Promise<T> | T,
    label?: string
  ): Promise<{ result: T; time: number }> => {
    const now = typeof globalThis.performance !== 'undefined' && globalThis.performance.now ? globalThis.performance.now.bind(globalThis.performance) : Date.now;
    const start = now();
    const result = await func();
    const time = now() - start;
    
    if (label) {
      console.log(`${label}: ${time.toFixed(2)}ms`);
    }
    
    return { result, time };
  }
};

/**
 * 브라우저 감지 및 기능 확인
 */
export const browser = {
  /**
   * 로컬스토리지 지원 여부 확인
   * @returns 지원 여부
   */
  supportsLocalStorage: (): boolean => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * 모바일 디바이스 여부 확인
   * @returns 모바일 여부
   */
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * 다크 모드 선호도 확인
   * @returns 다크 모드 선호 여부
   */
  prefersDarkMode: (): boolean => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  /**
   * 온라인 상태 확인
   * @returns 온라인 여부
   */
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  /**
   * 터치 지원 여부 확인
   * @returns 터치 지원 여부
   */
  supportsTouch: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }
};

/**
 * 객체 유틸리티
 */
export const objectUtils = {
  /**
   * 깊은 복사
   * @param obj 복사할 객체
   * @returns 복사된 객체
   */
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const cloned = {} as T;
      Object.keys(obj).forEach(key => {
        (cloned as Record<string, unknown>)[key] = objectUtils.deepClone((obj as Record<string, unknown>)[key]);
      });
      return cloned;
    }
    return obj;
  },

  /**
   * 객체가 비어있는지 확인
   * @param obj 확인할 객체
   * @returns 비어있는지 여부
   */
  isEmpty: (obj: object): boolean => {
    return Object.keys(obj).length === 0;
  },

  /**
   * 중첩된 속성 안전하게 가져오기
   * @param obj 객체
   * @param path 속성 경로 (예: 'user.profile.name')
   * @param defaultValue 기본값
   * @returns 속성 값 또는 기본값
   */
  safeGet: <T = unknown>(obj: Record<string, unknown>, path: string, defaultValue: T | null = null): T | null => {
    const keys = path.split('.');
    let current: unknown = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object' || !(key in current)) {
        return defaultValue;
      }
      current = (current as Record<string, unknown>)[key];
    }
    
    return current as T;
  }
};

/**
 * 색상 유틸리티
 */
export const colorUtils = {
  /**
   * HEX 색상을 RGB로 변환
   * @param hex HEX 색상 코드
   * @returns RGB 객체 또는 null
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  /**
   * RGB를 HEX 색상으로 변환
   * @param r 빨강 (0-255)
   * @param g 초록 (0-255)
   * @param b 파랑 (0-255)
   * @returns HEX 색상 코드
   */
  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },

  /**
   * 색상 밝기 계산 (0-255)
   * @param hex HEX 색상 코드
   * @returns 밝기 값
   */
  getBrightness: (hex: string): number => {
    const rgb = colorUtils.hexToRgb(hex);
    if (!rgb) return 0;
    return Math.round((rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000);
  }
};

// ========================================
// 내부 헬퍼 함수들
// ========================================

/**
 * Levenshtein distance 계산
 * @param str1 첫 번째 문자열
 * @param str2 두 번째 문자열
 * @returns 편집 거리
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}