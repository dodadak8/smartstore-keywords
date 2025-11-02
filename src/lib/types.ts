/**
 * 스마트스토어 키워드 최적화 웹앱 타입 정의
 * - 프로젝트 전반에서 사용하는 데이터 타입들
 * - TypeScript 타입 안전성 보장
 */

// ========================================
// 기본 공통 타입들
// ========================================

/**
 * 기본 엔티티 인터페이스
 * - 모든 데이터 모델의 기본이 되는 공통 필드들
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * 페이지네이션을 위한 공통 인터페이스
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * 페이지네이션 결과 인터페이스
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================================
// 키워드 관련 타입들
// ========================================

/**
 * 키워드 태그 타입
 * - 키워드의 성격이나 특성을 분류하는 용도
 */
export type KeywordTag =
  | 'seasonal' // 계절성
  | 'event' // 이벤트성
  | 'longtail' // 롱테일
  | 'trending' // 트렌드
  | 'brand' // 브랜드
  | 'category' // 카테고리
  | 'feature' // 특징/기능
  | 'custom'; // 사용자 정의

/**
 * 즐겨찾기 키워드
 * - 사용자가 북마크한 키워드
 */
export interface FavoriteKeyword extends BaseEntity {
  keyword_id: string; // 원본 키워드 ID
  keyword: Keyword; // 키워드 전체 데이터
  notes?: string; // 즐겨찾기 메모
}

/**
 * 키워드 데이터 모델
 * - 키워드 리서치 보드에서 사용하는 핵심 데이터
 */
export interface Keyword extends BaseEntity {
  term: string; // 키워드 텍스트
  volume: number; // 검색량 (월 평균)
  competition: number; // 경쟁도 (0-100)
  weight?: number; // CTR 가중치 (선택사항)
  notes?: string; // 메모
  tags: KeywordTag[]; // 태그 목록
  score?: number; // 계산된 기회지수 점수
}

/**
 * 키워드 업로드를 위한 CSV 데이터 형식
 */
export interface KeywordCSVRow {
  term: string;
  volume: string | number;
  competition: string | number;
  weight?: string | number;
  notes?: string;
  tags?: string; // 쉼표로 구분된 태그 문자열
}

/**
 * 키워드 필터링 옵션
 */
export interface KeywordFilters {
  tags?: KeywordTag[];
  volumeMin?: number;
  volumeMax?: number;
  competitionMin?: number;
  competitionMax?: number;
  scoreMin?: number;
  search?: string; // 텍스트 검색
}

/**
 * 키워드 정렬 옵션
 */
export type KeywordSortBy = 
  | 'score' // 기회지수 점수순
  | 'volume' // 검색량순
  | 'competition' // 경쟁도순
  | 'created_at' // 생성일순
  | 'term'; // 키워드명순

export type SortOrder = 'asc' | 'desc';

export interface KeywordSortOptions {
  sortBy: KeywordSortBy;
  order: SortOrder;
}

// ========================================
// 상품명 생성 관련 타입들
// ========================================

/**
 * 상품명 구성 요소 타입
 */
export interface ProductTitleComponents {
  category?: string; // 카테고리
  demographic?: string; // 성별/연령
  keywords: string[]; // 핵심 키워드 (1-3개)
  features?: string[]; // 특징/재질/사이즈
  usage?: string; // 용도/시즌
}

/**
 * 상품명 생성 결과
 */
export interface ProductTitle extends BaseEntity {
  keyword_ids: string[]; // 사용된 키워드 ID 목록
  components: ProductTitleComponents; // 구성 요소
  title_text: string; // 생성된 상품명
  score: number; // 품질 점수 (0-100)
  issues: string[]; // 문제점 목록 (길이 초과, 금칙어 등)
  spacing_variants?: { // 띄어쓰기 변형
    spaced: string; // 띄어쓰기 버전
    unspaced: string; // 붙여쓰기 버전
  };
}

/**
 * 상품명 생성 템플릿 설정
 */
export interface TitleTemplate {
  name: string; // 템플릿 이름
  pattern: string; // 생성 패턴 (예: "{category} {keywords} {features}")
  required_components: (keyof ProductTitleComponents)[]; // 필수 구성 요소
  max_length: number; // 최대 길이
  separator: string; // 구분자 (기본 공백)
}

// ========================================
// 카테고리 관련 타입들
// ========================================

/**
 * 카테고리 추천 결과
 */
export interface CategorySuggestion extends BaseEntity {
  name: string; // 카테고리명
  reasons: string[]; // 추천 근거 목록
  attributes: CategoryAttribute[]; // 필수 속성 목록
  confidence: number; // 신뢰도 (0-100)
}

/**
 * 카테고리 속성 정의
 */
export interface CategoryAttribute {
  name: string; // 속성명
  type: 'text' | 'number' | 'select' | 'boolean'; // 속성 타입
  required: boolean; // 필수 여부
  options?: string[]; // 선택 옵션 (select 타입용)
  placeholder?: string; // 입력 힌트
}

// ========================================
// 체크리스트 관련 타입들
// ========================================

/**
 * 품질 점검 항목
 */
export interface QualityCheckItem {
  id: string;
  title: string; // 점검 항목명
  description: string; // 설명
  category: 'keyword' | 'category' | 'image' | 'content' | 'seo'; // 카테고리
  required: boolean; // 필수 여부
  checked: boolean; // 완료 여부
  issues?: string[]; // 발견된 문제점
}

/**
 * 체크리스트 결과
 */
export interface ChecklistResult extends BaseEntity {
  project_id: string; // 프로젝트 ID
  items: QualityCheckItem[]; // 점검 항목 목록
  overall_score: number; // 전체 점수 (0-100)
  completion_rate: number; // 완료율 (0-100)
  critical_issues: string[]; // 치명적 문제점
}

// ========================================
// 프로젝트 관리 타입들
// ========================================

/**
 * 프로젝트 데이터 모델
 * - 키워드, 상품명, 체크리스트 등을 묶는 작업 단위
 */
export interface Project extends BaseEntity {
  name: string; // 프로젝트명
  description?: string; // 설명
  keywords: Keyword[]; // 키워드 목록
  titles: ProductTitle[]; // 상품명 목록
  categories: CategorySuggestion[]; // 카테고리 추천 목록
  checklist?: ChecklistResult; // 체크리스트 결과
  settings: ProjectSettings; // 프로젝트별 설정
}

/**
 * 프로젝트 설정
 */
export interface ProjectSettings {
  algorithm_weights: AlgorithmWeights; // 알고리즘 가중치
  title_template: TitleTemplate; // 상품명 템플릿
  stopwords: string[]; // 금칙어 목록
  spacing_rules: SpacingRule[]; // 띄어쓰기 규칙
}

/**
 * 알고리즘 가중치 설정
 */
export interface AlgorithmWeights {
  volume: number; // 검색량 가중치 (기본 0.7)
  competition: number; // 경쟁도 가중치 (기본 0.3)
  tag: number; // 태그 가중치 (기본 0.1)
  ctr?: number; // CTR 가중치 (선택사항)
}

/**
 * 띄어쓰기 규칙
 */
export interface SpacingRule {
  pattern: string; // 매칭 패턴 (정규식)
  replacement: string; // 치환 결과
  description: string; // 규칙 설명
}

// ========================================
// 시스템 설정 타입들
// ========================================

/**
 * 전역 시스템 설정
 */
export interface SystemSettings extends BaseEntity {
  stopwords: string[]; // 전역 금칙어 목록
  templates: TitleTemplate[]; // 기본 템플릿 목록
  spacing_rules: SpacingRule[]; // 기본 띄어쓰기 규칙
  title_length_limit: number; // 기본 제목 길이 제한
  default_weights: AlgorithmWeights; // 기본 알고리즘 가중치
}

// ========================================
// 사용자 문의 타입들
// ========================================

/**
 * 문의 상태
 */
export type InquiryStatus = 'pending' | 'processing' | 'resolved' | 'closed';

/**
 * 사용자 문의 데이터 모델
 */
export interface Inquiry extends BaseEntity {
  name: string; // 문의자명
  email: string; // 이메일
  message: string; // 문의 내용
  status: InquiryStatus; // 처리 상태
  admin_reply?: string; // 관리자 답변
  replied_at?: string; // 답변 일시
}

// ========================================
// API 응답 타입들
// ========================================

/**
 * API 성공 응답 형식
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * API 에러 응답 형식
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * API 응답 타입 (성공 또는 에러)
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ========================================
// 데이터 어댑터 인터페이스
// ========================================

/**
 * 데이터 어댑터 기본 인터페이스
 * - 다양한 저장소(파일, 로컬스토리지, API 등)에 대한 통일된 인터페이스
 */
export interface DataAdapter {
  // 초기화 및 연결
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // 키워드 관련 메서드
  getKeywords(filters?: KeywordFilters, sort?: KeywordSortOptions, pagination?: PaginationParams): Promise<PaginatedResult<Keyword>>;
  getKeyword(id: string): Promise<Keyword | null>;
  createKeyword(keyword: Omit<Keyword, 'id' | 'created_at' | 'updated_at'>): Promise<Keyword>;
  updateKeyword(id: string, updates: Partial<Keyword>): Promise<Keyword>;
  deleteKeyword(id: string): Promise<boolean>;

  // 즐겨찾기 관련 메서드
  getFavorites(pagination?: PaginationParams): Promise<PaginatedResult<FavoriteKeyword>>;
  getFavorite(keywordId: string): Promise<FavoriteKeyword | null>;
  addFavorite(keywordId: string, notes?: string): Promise<FavoriteKeyword>;
  removeFavorite(keywordId: string): Promise<boolean>;
  isFavorite(keywordId: string): Promise<boolean>;
  
  // 프로젝트 관련 메서드
  getProjects(pagination?: PaginationParams): Promise<PaginatedResult<Project>>;
  getProject(id: string): Promise<Project | null>;
  createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<boolean>;
  
  // 설정 관련 메서드
  getSettings(): Promise<SystemSettings>;
  updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings>;
  
  // 문의 관련 메서드
  getInquiries(pagination?: PaginationParams): Promise<PaginatedResult<Inquiry>>;
  createInquiry(inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Inquiry>;
  updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry>;
}

// ========================================
// 유틸리티 타입들
// ========================================

/**
 * 부분적 업데이트를 위한 유틸리티 타입
 * - BaseEntity 필드는 제외하고 나머지만 선택적으로 만듦
 */
export type PartialUpdate<T extends BaseEntity> = Partial<Omit<T, keyof BaseEntity>>;

/**
 * 생성용 타입 (ID와 타임스탬프 제외)
 */
export type CreateInput<T extends BaseEntity> = Omit<T, keyof BaseEntity>;

/**
 * 폼 검증 에러 타입
 */
export interface FormError {
  field: string;
  message: string;
}

/**
 * 폼 검증 결과
 */
export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}