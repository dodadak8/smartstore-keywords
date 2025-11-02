/**
 * 데이터 어댑터 기본 추상 클래스
 * - 모든 데이터 어댑터가 구현해야 하는 기본 인터페이스
 * - 어댑터 패턴을 통해 다양한 저장소(파일, 로컬스토리지, API 등)를 쉽게 교체 가능
 */

import {
  DataAdapter,
  Keyword,
  Project,
  SystemSettings,
  Inquiry,
  FavoriteKeyword,
  PaginatedResult,
  KeywordFilters,
  KeywordSortOptions,
  PaginationParams
} from '../types';

/**
 * 추상 데이터 어댑터 클래스
 * - 각 구체적인 어댑터(filesystem, localstorage, api 등)가 이 클래스를 상속받아 구현
 * - 공통적인 유틸리티 메서드들을 제공
 */
export abstract class BaseDataAdapter implements DataAdapter {
  
  /**
   * 어댑터 초기화 및 저장소 연결
   * - 파일시스템 어댑터: 폴더 생성
   * - API 어댑터: 인증 및 연결 테스트
   * - 로컬스토리지 어댑터: 브라우저 지원 확인
   */
  abstract connect(): Promise<void>;
  
  /**
   * 어댑터 연결 해제 및 정리
   * - 파일 핸들 닫기, 연결 종료 등
   */
  abstract disconnect(): Promise<void>;
  
  // ========================================
  // 키워드 관련 추상 메서드들
  // ========================================
  
  /**
   * 키워드 목록 조회 (필터링, 정렬, 페이지네이션 지원)
   * @param filters 필터링 조건 (선택사항)
   * @param sort 정렬 조건 (선택사항)
   * @param pagination 페이지네이션 설정 (선택사항)
   * @returns 페이지네이션된 키워드 목록
   */
  abstract getKeywords(
    filters?: KeywordFilters, 
    sort?: KeywordSortOptions, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Keyword>>;
  
  /**
   * 특정 키워드 조회
   * @param id 키워드 ID
   * @returns 키워드 데이터 또는 null
   */
  abstract getKeyword(id: string): Promise<Keyword | null>;
  
  /**
   * 새 키워드 생성
   * @param keyword 키워드 데이터 (ID와 타임스탬프 제외)
   * @returns 생성된 키워드 데이터
   */
  abstract createKeyword(keyword: Omit<Keyword, 'id' | 'created_at' | 'updated_at'>): Promise<Keyword>;
  
  /**
   * 키워드 업데이트
   * @param id 키워드 ID
   * @param updates 업데이트할 필드들
   * @returns 업데이트된 키워드 데이터
   */
  abstract updateKeyword(id: string, updates: Partial<Keyword>): Promise<Keyword>;
  
  /**
   * 키워드 삭제
   * @param id 키워드 ID
   * @returns 삭제 성공 여부
   */
  abstract deleteKeyword(id: string): Promise<boolean>;

  // ========================================
  // 즐겨찾기 관련 추상 메서드들
  // ========================================

  /**
   * 즐겨찾기 목록 조회
   * @param pagination 페이지네이션 설정 (선택사항)
   * @returns 페이지네이션된 즐겨찾기 목록
   */
  abstract getFavorites(pagination?: PaginationParams): Promise<PaginatedResult<FavoriteKeyword>>;

  /**
   * 특정 키워드의 즐겨찾기 조회
   * @param keywordId 키워드 ID
   * @returns 즐겨찾기 데이터 또는 null
   */
  abstract getFavorite(keywordId: string): Promise<FavoriteKeyword | null>;

  /**
   * 즐겨찾기 추가
   * @param keywordId 키워드 ID
   * @param notes 메모 (선택사항)
   * @returns 생성된 즐겨찾기 데이터
   */
  abstract addFavorite(keywordId: string, notes?: string): Promise<FavoriteKeyword>;

  /**
   * 즐겨찾기 제거
   * @param keywordId 키워드 ID
   * @returns 삭제 성공 여부
   */
  abstract removeFavorite(keywordId: string): Promise<boolean>;

  /**
   * 키워드가 즐겨찾기인지 확인
   * @param keywordId 키워드 ID
   * @returns 즐겨찾기 여부
   */
  abstract isFavorite(keywordId: string): Promise<boolean>;

  // ========================================
  // 프로젝트 관련 추상 메서드들
  // ========================================
  
  /**
   * 프로젝트 목록 조회 (페이지네이션 지원)
   * @param pagination 페이지네이션 설정 (선택사항)
   * @returns 페이지네이션된 프로젝트 목록
   */
  abstract getProjects(pagination?: PaginationParams): Promise<PaginatedResult<Project>>;
  
  /**
   * 특정 프로젝트 조회
   * @param id 프로젝트 ID
   * @returns 프로젝트 데이터 또는 null
   */
  abstract getProject(id: string): Promise<Project | null>;
  
  /**
   * 새 프로젝트 생성
   * @param project 프로젝트 데이터 (ID와 타임스탬프 제외)
   * @returns 생성된 프로젝트 데이터
   */
  abstract createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project>;
  
  /**
   * 프로젝트 업데이트
   * @param id 프로젝트 ID
   * @param updates 업데이트할 필드들
   * @returns 업데이트된 프로젝트 데이터
   */
  abstract updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  
  /**
   * 프로젝트 삭제
   * @param id 프로젝트 ID
   * @returns 삭제 성공 여부
   */
  abstract deleteProject(id: string): Promise<boolean>;
  
  // ========================================
  // 설정 관련 추상 메서드들
  // ========================================
  
  /**
   * 시스템 설정 조회
   * @returns 시스템 설정 데이터
   */
  abstract getSettings(): Promise<SystemSettings>;
  
  /**
   * 시스템 설정 업데이트
   * @param updates 업데이트할 설정들
   * @returns 업데이트된 설정 데이터
   */
  abstract updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings>;
  
  // ========================================
  // 문의 관련 추상 메서드들
  // ========================================
  
  /**
   * 문의 목록 조회 (페이지네이션 지원)
   * @param pagination 페이지네이션 설정 (선택사항)
   * @returns 페이지네이션된 문의 목록
   */
  abstract getInquiries(pagination?: PaginationParams): Promise<PaginatedResult<Inquiry>>;
  
  /**
   * 새 문의 생성
   * @param inquiry 문의 데이터 (ID, 타임스탬프, 상태 제외)
   * @returns 생성된 문의 데이터
   */
  abstract createInquiry(inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Inquiry>;
  
  /**
   * 문의 업데이트 (관리자용)
   * @param id 문의 ID
   * @param updates 업데이트할 필드들
   * @returns 업데이트된 문의 데이터
   */
  abstract updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry>;
  
  // ========================================
  // 공통 유틸리티 메서드들
  // ========================================
  
  /**
   * 고유 ID 생성 유틸리티
   * - 날짜 기반 + 랜덤 문자열로 구성
   * @returns 고유 ID 문자열
   */
  protected generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}_${random}`;
  }
  
  /**
   * 현재 시간을 ISO 문자열로 반환
   * @returns ISO 형식의 현재 시간
   */
  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
  
  /**
   * 페이지네이션 계산 유틸리티
   * @param total 전체 아이템 수
   * @param page 현재 페이지 (1부터 시작)
   * @param limit 페이지당 아이템 수
   * @returns 페이지네이션 정보
   */
  protected calculatePagination(total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    
    return {
      total,
      page,
      limit,
      totalPages,
      offset,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
  
  /**
   * 배열을 페이지네이션하는 유틸리티
   * @param items 전체 아이템 배열
   * @param page 현재 페이지
   * @param limit 페이지당 아이템 수
   * @returns 페이지네이션된 결과
   */
  protected paginateArray<T>(items: T[], page: number = 1, limit: number = 10): PaginatedResult<T> {
    const total = items.length;
    const pagination = this.calculatePagination(total, page, limit);
    const startIndex = pagination.offset;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: pagination.totalPages,
    };
  }
  
  /**
   * 검증 오류 생성 유틸리티
   * @param message 오류 메시지
   * @param field 오류가 발생한 필드명
   * @returns ValidationError 인스턴스
   */
  protected createValidationError(message: string, field?: string): ValidationError {
    return new ValidationError(message, field);
  }
  
  /**
   * 데이터 존재 여부 확인 유틸리티
   * @param id 확인할 ID
   * @param entityName 엔티티명 (오류 메시지용)
   * @returns 존재하지 않으면 NotFoundError 발생
   */
  protected async ensureExists(): Promise<void> {
    // 구체적인 어댑터에서 override하여 실제 존재 여부 확인 로직 구현
    // 기본 구현은 비어있음 (각 어댑터에서 필요에 따라 구현)
  }
}

// ========================================
// 커스텀 에러 클래스들
// ========================================

/**
 * 검증 오류 클래스
 * - 입력 데이터 검증 실패시 사용
 */
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 데이터 없음 오류 클래스
 * - 요청한 데이터가 존재하지 않을 때 사용
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * 어댑터 연결 오류 클래스
 * - 데이터 저장소 연결 실패시 사용
 */
export class AdapterError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'AdapterError';
  }
}