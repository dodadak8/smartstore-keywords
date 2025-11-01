/**
 * 로컬스토리지 기반 데이터 어댑터
 * - 브라우저 로컬스토리지를 사용한 클라이언트 사이드 데이터 저장
 * - 초기 개발 및 프로토타입용으로 적합
 * - 서버 없이 동작 가능하여 저비용 운영에 유리
 */

import { 
  BaseDataAdapter, 
  ValidationError, 
  NotFoundError 
} from './base';
import {
  Keyword,
  Project,
  SystemSettings,
  Inquiry,
  PaginatedResult,
  KeywordFilters,
  KeywordSortOptions,
  PaginationParams
} from '../types';

/**
 * 로컬스토리지 키 상수들
 * - 데이터 타입별로 구분된 저장 키
 */
const STORAGE_KEYS = {
  KEYWORDS: 'smartstore_keywords',
  PROJECTS: 'smartstore_projects',
  SETTINGS: 'smartstore_settings',
  INQUIRIES: 'smartstore_inquiries',
  VERSION: 'smartstore_version', // 데이터 버전 관리용
} as const;

/**
 * 데이터 마이그레이션을 위한 버전 정보
 */
const CURRENT_VERSION = '1.0.0';

/**
 * 로컬스토리지 어댑터 구현 클래스
 */
export class LocalStorageAdapter extends BaseDataAdapter {
  
  /**
   * 로컬스토리지 지원 여부 확인 및 초기 데이터 설정
   */
  async connect(): Promise<void> {
    // 로컬스토리지 지원 여부 확인
    if (!this.isLocalStorageSupported()) {
      throw new Error('로컬스토리지가 지원되지 않는 환경입니다.');
    }
    
    // 데이터 버전 확인 및 마이그레이션
    await this.checkAndMigrateData();
    
    // 기본 설정이 없으면 초기화
    await this.initializeDefaultSettings();
    
    console.log('LocalStorageAdapter 연결 완료');
  }
  
  /**
   * 연결 해제 (로컬스토리지는 특별한 정리 작업 불필요)
   */
  async disconnect(): Promise<void> {
    console.log('LocalStorageAdapter 연결 해제');
  }
  
  // ========================================
  // 키워드 관련 메서드 구현
  // ========================================
  
  /**
   * 키워드 목록 조회 (필터링, 정렬, 페이지네이션 지원)
   */
  async getKeywords(
    filters?: KeywordFilters,
    sort?: KeywordSortOptions,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Keyword>> {
    let keywords = this.loadFromStorage<Keyword[]>(STORAGE_KEYS.KEYWORDS) || [];
    
    // 필터링 적용
    if (filters) {
      keywords = this.applyKeywordFilters(keywords, filters);
    }
    
    // 정렬 적용
    if (sort) {
      keywords = this.sortKeywords(keywords, sort);
    }
    
    // 페이지네이션 적용
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    
    return this.paginateArray(keywords, page, limit);
  }
  
  /**
   * 특정 키워드 조회
   */
  async getKeyword(id: string): Promise<Keyword | null> {
    const keywords = this.loadFromStorage<Keyword[]>(STORAGE_KEYS.KEYWORDS) || [];
    return keywords.find(keyword => keyword.id === id) || null;
  }
  
  /**
   * 새 키워드 생성
   */
  async createKeyword(keywordData: Omit<Keyword, 'id' | 'created_at' | 'updated_at'>): Promise<Keyword> {
    // 입력 데이터 검증
    this.validateKeywordData(keywordData);
    
    const keywords = this.loadFromStorage<Keyword[]>(STORAGE_KEYS.KEYWORDS) || [];
    
    // 중복 키워드 확인
    const existingKeyword = keywords.find(k => k.term.toLowerCase() === keywordData.term.toLowerCase());
    if (existingKeyword) {
      throw new ValidationError(`키워드 '${keywordData.term}'는 이미 존재합니다.`, 'term');
    }
    
    // 새 키워드 생성
    const newKeyword: Keyword = {
      ...keywordData,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    
    keywords.push(newKeyword);
    this.saveToStorage(STORAGE_KEYS.KEYWORDS, keywords);
    
    return newKeyword;
  }
  
  /**
   * 키워드 업데이트
   */
  async updateKeyword(id: string, updates: Partial<Keyword>): Promise<Keyword> {
    const keywords = this.loadFromStorage<Keyword[]>(STORAGE_KEYS.KEYWORDS) || [];
    const keywordIndex = keywords.findIndex(keyword => keyword.id === id);
    
    if (keywordIndex === -1) {
      throw new NotFoundError(`ID '${id}'인 키워드를 찾을 수 없습니다.`);
    }
    
    // 업데이트 데이터 검증
    if (updates.term !== undefined) {
      this.validateKeywordTerm(updates.term);
      
      // 중복 검사 (자기 자신 제외)
      const duplicateKeyword = keywords.find(k => 
        k.id !== id && k.term.toLowerCase() === updates.term!.toLowerCase()
      );
      if (duplicateKeyword) {
        throw new ValidationError(`키워드 '${updates.term}'는 이미 존재합니다.`, 'term');
      }
    }
    
    // 키워드 업데이트
    const updatedKeyword: Keyword = {
      ...keywords[keywordIndex],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    
    keywords[keywordIndex] = updatedKeyword;
    this.saveToStorage(STORAGE_KEYS.KEYWORDS, keywords);
    
    return updatedKeyword;
  }
  
  /**
   * 키워드 삭제
   */
  async deleteKeyword(id: string): Promise<boolean> {
    const keywords = this.loadFromStorage<Keyword[]>(STORAGE_KEYS.KEYWORDS) || [];
    const keywordIndex = keywords.findIndex(keyword => keyword.id === id);
    
    if (keywordIndex === -1) {
      return false;
    }
    
    keywords.splice(keywordIndex, 1);
    this.saveToStorage(STORAGE_KEYS.KEYWORDS, keywords);
    
    return true;
  }
  
  // ========================================
  // 프로젝트 관련 메서드 구현
  // ========================================
  
  /**
   * 프로젝트 목록 조회
   */
  async getProjects(pagination?: PaginationParams): Promise<PaginatedResult<Project>> {
    const projects = this.loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS) || [];
    
    // 생성일 기준 내림차순 정렬
    const sortedProjects = projects.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    
    return this.paginateArray(sortedProjects, page, limit);
  }
  
  /**
   * 특정 프로젝트 조회
   */
  async getProject(id: string): Promise<Project | null> {
    const projects = this.loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS) || [];
    return projects.find(project => project.id === id) || null;
  }
  
  /**
   * 새 프로젝트 생성
   */
  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    // 입력 데이터 검증
    this.validateProjectData(projectData);
    
    const projects = this.loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS) || [];
    
    // 프로젝트명 중복 확인
    const existingProject = projects.find(p => p.name === projectData.name);
    if (existingProject) {
      throw new ValidationError(`프로젝트명 '${projectData.name}'는 이미 존재합니다.`, 'name');
    }
    
    // 새 프로젝트 생성
    const newProject: Project = {
      ...projectData,
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    
    projects.push(newProject);
    this.saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    
    return newProject;
  }
  
  /**
   * 프로젝트 업데이트
   */
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const projects = this.loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS) || [];
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      throw new NotFoundError(`ID '${id}'인 프로젝트를 찾을 수 없습니다.`);
    }
    
    // 프로젝트명 중복 검사 (자기 자신 제외)
    if (updates.name !== undefined) {
      const duplicateProject = projects.find(p => 
        p.id !== id && p.name === updates.name
      );
      if (duplicateProject) {
        throw new ValidationError(`프로젝트명 '${updates.name}'는 이미 존재합니다.`, 'name');
      }
    }
    
    // 프로젝트 업데이트
    const updatedProject: Project = {
      ...projects[projectIndex],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    
    projects[projectIndex] = updatedProject;
    this.saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    
    return updatedProject;
  }
  
  /**
   * 프로젝트 삭제
   */
  async deleteProject(id: string): Promise<boolean> {
    const projects = this.loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS) || [];
    const projectIndex = projects.findIndex(project => project.id === id);
    
    if (projectIndex === -1) {
      return false;
    }
    
    projects.splice(projectIndex, 1);
    this.saveToStorage(STORAGE_KEYS.PROJECTS, projects);
    
    return true;
  }
  
  // ========================================
  // 설정 관련 메서드 구현
  // ========================================
  
  /**
   * 시스템 설정 조회
   */
  async getSettings(): Promise<SystemSettings> {
    const settings = this.loadFromStorage<SystemSettings>(STORAGE_KEYS.SETTINGS);
    
    if (!settings) {
      // 기본 설정 생성
      return await this.createDefaultSettings();
    }
    
    return settings;
  }
  
  /**
   * 시스템 설정 업데이트
   */
  async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    const currentSettings = await this.getSettings();
    
    const updatedSettings: SystemSettings = {
      ...currentSettings,
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    
    this.saveToStorage(STORAGE_KEYS.SETTINGS, updatedSettings);
    
    return updatedSettings;
  }
  
  // ========================================
  // 문의 관련 메서드 구현
  // ========================================
  
  /**
   * 문의 목록 조회
   */
  async getInquiries(pagination?: PaginationParams): Promise<PaginatedResult<Inquiry>> {
    const inquiries = this.loadFromStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES) || [];
    
    // 생성일 기준 내림차순 정렬
    const sortedInquiries = inquiries.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    
    return this.paginateArray(sortedInquiries, page, limit);
  }
  
  /**
   * 새 문의 생성
   */
  async createInquiry(inquiryData: Omit<Inquiry, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<Inquiry> {
    // 입력 데이터 검증
    this.validateInquiryData(inquiryData);
    
    const inquiries = this.loadFromStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES) || [];
    
    // 새 문의 생성
    const newInquiry: Inquiry = {
      ...inquiryData,
      id: this.generateId(),
      status: 'pending',
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
    };
    
    inquiries.push(newInquiry);
    this.saveToStorage(STORAGE_KEYS.INQUIRIES, inquiries);
    
    return newInquiry;
  }
  
  /**
   * 문의 업데이트 (관리자용)
   */
  async updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry> {
    const inquiries = this.loadFromStorage<Inquiry[]>(STORAGE_KEYS.INQUIRIES) || [];
    const inquiryIndex = inquiries.findIndex(inquiry => inquiry.id === id);
    
    if (inquiryIndex === -1) {
      throw new NotFoundError(`ID '${id}'인 문의를 찾을 수 없습니다.`);
    }
    
    // 답변 시간 자동 설정
    if (updates.admin_reply && !updates.replied_at) {
      updates.replied_at = this.getCurrentTimestamp();
    }
    
    // 문의 업데이트
    const updatedInquiry: Inquiry = {
      ...inquiries[inquiryIndex],
      ...updates,
      updated_at: this.getCurrentTimestamp(),
    };
    
    inquiries[inquiryIndex] = updatedInquiry;
    this.saveToStorage(STORAGE_KEYS.INQUIRIES, inquiries);
    
    return updatedInquiry;
  }
  
  // ========================================
  // 로컬스토리지 유틸리티 메서드들
  // ========================================
  
  /**
   * 로컬스토리지 지원 여부 확인
   */
  private isLocalStorageSupported(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * 로컬스토리지에서 데이터 로드
   */
  private loadFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`로컬스토리지에서 '${key}' 로드 실패:`, error);
      return null;
    }
  }
  
  /**
   * 로컬스토리지에 데이터 저장
   */
  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`로컬스토리지에 '${key}' 저장 실패:`, error);
      throw new Error(`데이터 저장에 실패했습니다: ${error}`);
    }
  }
  
  /**
   * 데이터 버전 확인 및 마이그레이션
   */
  private async checkAndMigrateData(): Promise<void> {
    const currentVersion = this.loadFromStorage<string>(STORAGE_KEYS.VERSION);
    
    if (!currentVersion) {
      // 첫 설치 - 현재 버전으로 설정
      this.saveToStorage(STORAGE_KEYS.VERSION, CURRENT_VERSION);
      return;
    }
    
    if (currentVersion !== CURRENT_VERSION) {
      // 버전이 다르면 마이그레이션 로직 실행
      await this.migrateData(currentVersion, CURRENT_VERSION);
      this.saveToStorage(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    }
  }
  
  /**
   * 데이터 마이그레이션 로직
   */
  private async migrateData(fromVersion: string, toVersion: string): Promise<void> {
    console.log(`데이터 마이그레이션: ${fromVersion} → ${toVersion}`);
    
    // 향후 버전 업데이트시 마이그레이션 로직 추가
    // 예: v1.0.0 → v1.1.0일 때 새 필드 추가 등
  }
  
  /**
   * 기본 설정 초기화
   */
  private async initializeDefaultSettings(): Promise<void> {
    const existingSettings = this.loadFromStorage<SystemSettings>(STORAGE_KEYS.SETTINGS);
    
    if (!existingSettings) {
      await this.createDefaultSettings();
    }
  }
  
  /**
   * 기본 설정 생성
   */
  private async createDefaultSettings(): Promise<SystemSettings> {
    const defaultSettings: SystemSettings = {
      id: this.generateId(),
      created_at: this.getCurrentTimestamp(),
      updated_at: this.getCurrentTimestamp(),
      stopwords: [
        // 한국어 금칙어
        '무료', '할인', '이벤트', '증정', '당첨', '공짜',
        // 영어 금칙어
        'free', 'sale', 'discount', 'win', 'prize'
      ],
      templates: [
        {
          name: '기본 템플릿',
          pattern: '{keywords} {category} {features}',
          required_components: ['keywords'],
          max_length: 60,
          separator: ' '
        }
      ],
      spacing_rules: [
        {
          pattern: '([가-힣]+)([A-Za-z]+)',
          replacement: '$1 $2',
          description: '한글과 영문 사이 띄어쓰기'
        }
      ],
      title_length_limit: 60,
      default_weights: {
        volume: 0.7,
        competition: 0.3,
        tag: 0.1
      }
    };
    
    this.saveToStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
    return defaultSettings;
  }
  
  // ========================================
  // 데이터 검증 메서드들
  // ========================================
  
  /**
   * 키워드 데이터 검증
   */
  private validateKeywordData(data: Partial<Keyword>): void {
    if (data.term !== undefined) {
      this.validateKeywordTerm(data.term);
    }
    
    if (data.volume !== undefined && (data.volume < 0 || !Number.isInteger(data.volume))) {
      throw new ValidationError('검색량은 0 이상의 정수여야 합니다.', 'volume');
    }
    
    if (data.competition !== undefined && (data.competition < 0 || data.competition > 100)) {
      throw new ValidationError('경쟁도는 0-100 사이의 값이어야 합니다.', 'competition');
    }
    
    if (data.weight !== undefined && (data.weight < 0 || data.weight > 1)) {
      throw new ValidationError('가중치는 0-1 사이의 값이어야 합니다.', 'weight');
    }
  }
  
  /**
   * 키워드 용어 검증
   */
  private validateKeywordTerm(term: string): void {
    if (!term || term.trim().length === 0) {
      throw new ValidationError('키워드는 필수 항목입니다.', 'term');
    }
    
    if (term.trim().length > 100) {
      throw new ValidationError('키워드는 100자 이하여야 합니다.', 'term');
    }
  }
  
  /**
   * 프로젝트 데이터 검증
   */
  private validateProjectData(data: Partial<Project>): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('프로젝트명은 필수 항목입니다.', 'name');
    }
    
    if (data.name.trim().length > 100) {
      throw new ValidationError('프로젝트명은 100자 이하여야 합니다.', 'name');
    }
  }
  
  /**
   * 문의 데이터 검증
   */
  private validateInquiryData(data: Partial<Inquiry>): void {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('이름은 필수 항목입니다.', 'name');
    }
    
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new ValidationError('유효한 이메일 주소를 입력해주세요.', 'email');
    }
    
    if (!data.message || data.message.trim().length === 0) {
      throw new ValidationError('문의 내용은 필수 항목입니다.', 'message');
    }
    
    if (data.message.trim().length > 2000) {
      throw new ValidationError('문의 내용은 2000자 이하여야 합니다.', 'message');
    }
  }
  
  /**
   * 이메일 형식 검증
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // ========================================
  // 키워드 필터링 및 정렬 메서드들
  // ========================================
  
  /**
   * 키워드 필터링 적용
   */
  private applyKeywordFilters(keywords: Keyword[], filters: KeywordFilters): Keyword[] {
    return keywords.filter(keyword => {
      // 태그 필터
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => keyword.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      // 검색량 범위 필터
      if (filters.volumeMin !== undefined && keyword.volume < filters.volumeMin) return false;
      if (filters.volumeMax !== undefined && keyword.volume > filters.volumeMax) return false;
      
      // 경쟁도 범위 필터
      if (filters.competitionMin !== undefined && keyword.competition < filters.competitionMin) return false;
      if (filters.competitionMax !== undefined && keyword.competition > filters.competitionMax) return false;
      
      // 점수 범위 필터
      if (filters.scoreMin !== undefined && (keyword.score || 0) < filters.scoreMin) return false;
      
      // 텍스트 검색 필터
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const termMatch = keyword.term.toLowerCase().includes(searchLower);
        const notesMatch = keyword.notes?.toLowerCase().includes(searchLower) || false;
        if (!termMatch && !notesMatch) return false;
      }
      
      return true;
    });
  }
  
  /**
   * 키워드 정렬 적용
   */
  private sortKeywords(keywords: Keyword[], sort: KeywordSortOptions): Keyword[] {
    return keywords.sort((a, b) => {
      let comparison = 0;
      
      switch (sort.sortBy) {
        case 'score':
          comparison = (a.score || 0) - (b.score || 0);
          break;
        case 'volume':
          comparison = a.volume - b.volume;
          break;
        case 'competition':
          comparison = a.competition - b.competition;
          break;
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'term':
          comparison = a.term.localeCompare(b.term, 'ko-KR');
          break;
        default:
          comparison = 0;
      }
      
      return sort.order === 'desc' ? -comparison : comparison;
    });
  }
}