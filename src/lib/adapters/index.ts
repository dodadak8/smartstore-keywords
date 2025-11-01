/**
 * 데이터 어댑터 패키지 엔트리 포인트
 * - 모든 어댑터 관련 기능을 중앙에서 관리
 * - 다른 모듈에서 쉽게 import할 수 있도록 export
 */

// 기본 어댑터 클래스 및 에러
export { BaseDataAdapter, ValidationError, NotFoundError, AdapterError } from './base';

// 구체적인 어댑터 구현체들
export { LocalStorageAdapter } from './localstorage';
// export { FileSystemAdapter } from './filesystem'; // 향후 구현
// export { ApiAdapter } from './api'; // 향후 구현

// 어댑터 팩토리 및 유틸리티
export {
  adapterFactory,
  getDataAdapter,
  setDataAdapter,
  checkAdapterHealth,
  validateAdapterConfig,
  migrateData,
  type AdapterType,
  type AdapterConfig,
} from './factory';

// 타입 정의들 (재export)
export type {
  DataAdapter,
  Keyword,
  Project,
  SystemSettings,
  Inquiry,
  PaginatedResult,
  KeywordFilters,
  KeywordSortOptions,
  PaginationParams,
} from '../types';

/**
 * 어댑터 패키지 정보
 */
export const ADAPTER_PACKAGE_INFO = {
  version: '1.0.0',
  supportedAdapters: ['localstorage', 'filesystem', 'api'] as const,
  defaultAdapter: 'localstorage' as const,
} as const;