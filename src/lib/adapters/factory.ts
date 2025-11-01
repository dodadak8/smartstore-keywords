/**
 * 데이터 어댑터 팩토리
 * - 환경변수에 따라 적절한 데이터 어댑터를 생성하고 관리
 * - 싱글톤 패턴으로 어댑터 인스턴스 관리
 * - 어댑터 교체시 코드 변경 최소화
 */

import { DataAdapter } from '../types';
import { LocalStorageAdapter } from './localstorage';
// import { FileSystemAdapter } from './filesystem'; // 향후 구현
// import { ApiAdapter } from './api'; // 향후 구현

/**
 * 지원되는 어댑터 타입들
 */
export type AdapterType = 'localstorage' | 'filesystem' | 'api';

/**
 * 어댑터 설정 인터페이스
 */
export interface AdapterConfig {
  type: AdapterType;
  options?: {
    // API 어댑터용 설정
    apiBaseUrl?: string;
    apiKey?: string;
    // 파일시스템 어댑터용 설정
    dataPath?: string;
    // 공통 설정
    timeout?: number;
    retryCount?: number;
  };
}

/**
 * 어댑터 팩토리 클래스
 * - 싱글톤 패턴으로 구현
 * - 환경변수나 설정에 따라 적절한 어댑터 생성
 */
class AdapterFactory {
  private static instance: AdapterFactory;
  private currentAdapter: DataAdapter | null = null;
  private currentConfig: AdapterConfig | null = null;

  /**
   * 싱글톤 인스턴스 반환
   */
  static getInstance(): AdapterFactory {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory();
    }
    return AdapterFactory.instance;
  }

  /**
   * 현재 어댑터 반환 (없으면 기본 어댑터 생성)
   */
  async getAdapter(): Promise<DataAdapter> {
    if (!this.currentAdapter) {
      await this.createDefaultAdapter();
    }
    return this.currentAdapter!;
  }

  /**
   * 어댑터 생성 및 설정
   */
  async createAdapter(config: AdapterConfig): Promise<DataAdapter> {
    // 기존 어댑터가 있으면 연결 해제
    if (this.currentAdapter) {
      await this.currentAdapter.disconnect();
      this.currentAdapter = null;
    }

    // 새 어댑터 생성
    const adapter = this.instantiateAdapter(config);
    
    // 어댑터 연결 및 초기화
    try {
      await adapter.connect();
      this.currentAdapter = adapter;
      this.currentConfig = config;
      
      console.log(`데이터 어댑터 생성 완료: ${config.type}`);
      return adapter;
    } catch (error) {
      console.error(`어댑터 연결 실패 (${config.type}):`, error);
      throw new Error(`데이터 어댑터 연결에 실패했습니다: ${error}`);
    }
  }

  /**
   * 기본 어댑터 생성 (환경변수 기반)
   */
  private async createDefaultAdapter(): Promise<void> {
    const config = this.getDefaultConfig();
    await this.createAdapter(config);
  }

  /**
   * 환경변수에서 기본 설정 읽기
   */
  private getDefaultConfig(): AdapterConfig {
    // 브라우저 환경에서는 process.env를 통해 환경변수 접근
    const adapterType = (process.env.NEXT_PUBLIC_DATA_ADAPTER as AdapterType) || 'localstorage';
    
    const config: AdapterConfig = {
      type: adapterType,
      options: {}
    };

    // 어댑터별 환경변수 설정
    switch (adapterType) {
      case 'api':
        config.options = {
          apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
          apiKey: process.env.API_KEY, // 클라이언트에 노출되지 않는 서버 사이드 전용
          timeout: parseInt(process.env.API_TIMEOUT || '10000'),
          retryCount: parseInt(process.env.API_RETRY_COUNT || '3'),
        };
        break;
        
      case 'filesystem':
        config.options = {
          dataPath: process.env.DATA_PATH || './data',
        };
        break;
        
      case 'localstorage':
        // 로컬스토리지는 특별한 설정 불필요
        break;
        
      default:
        console.warn(`알 수 없는 어댑터 타입: ${adapterType}, 로컬스토리지로 대체합니다.`);
        config.type = 'localstorage';
    }

    return config;
  }

  /**
   * 설정에 따라 어댑터 인스턴스 생성
   */
  public instantiateAdapter(config: AdapterConfig): DataAdapter {
    switch (config.type) {
      case 'localstorage':
        return new LocalStorageAdapter();
        
      case 'filesystem':
        // TODO: 파일시스템 어댑터 구현 후 활성화
        throw new Error('파일시스템 어댑터는 아직 구현되지 않았습니다.');
        // return new FileSystemAdapter(config.options);
        
      case 'api':
        // TODO: API 어댑터 구현 후 활성화
        throw new Error('API 어댑터는 아직 구현되지 않았습니다.');
        // return new ApiAdapter(config.options);
        
      default:
        throw new Error(`지원되지 않는 어댑터 타입: ${config.type}`);
    }
  }

  /**
   * 현재 어댑터 정보 반환
   */
  getAdapterInfo(): { type: AdapterType; connected: boolean } | null {
    if (!this.currentConfig) {
      return null;
    }
    
    return {
      type: this.currentConfig.type,
      connected: this.currentAdapter !== null,
    };
  }

  /**
   * 어댑터 연결 해제
   */
  async disconnect(): Promise<void> {
    if (this.currentAdapter) {
      await this.currentAdapter.disconnect();
      this.currentAdapter = null;
      this.currentConfig = null;
      console.log('데이터 어댑터 연결 해제 완료');
    }
  }

  /**
   * 어댑터 재연결
   */
  async reconnect(): Promise<DataAdapter> {
    if (this.currentConfig) {
      return await this.createAdapter(this.currentConfig);
    } else {
      await this.createDefaultAdapter();
      return this.currentAdapter!;
    }
  }

  /**
   * 어댑터 상태 확인
   */
  async healthCheck(): Promise<boolean> {
    try {
      const adapter = await this.getAdapter();
      // 간단한 연결 테스트 (설정 조회)
      await adapter.getSettings();
      return true;
    } catch (error) {
      console.error('어댑터 상태 확인 실패:', error);
      return false;
    }
  }
}

/**
 * 어댑터 팩토리 싱글톤 인스턴스
 */
export const adapterFactory = AdapterFactory.getInstance();

/**
 * 편의 함수: 현재 어댑터 반환
 * - 컴포넌트나 API 핸들러에서 쉽게 사용할 수 있도록 제공
 */
export async function getDataAdapter(): Promise<DataAdapter> {
  return await adapterFactory.getAdapter();
}

/**
 * 편의 함수: 어댑터 설정 변경
 * - 런타임에 어댑터를 변경해야 할 때 사용
 */
export async function setDataAdapter(config: AdapterConfig): Promise<DataAdapter> {
  return await adapterFactory.createAdapter(config);
}

/**
 * 편의 함수: 어댑터 상태 확인
 */
export async function checkAdapterHealth(): Promise<boolean> {
  return await adapterFactory.healthCheck();
}

/**
 * 어댑터 설정 검증 함수
 */
export function validateAdapterConfig(config: AdapterConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 기본 검증
  if (!config.type) {
    errors.push('어댑터 타입이 지정되지 않았습니다.');
  } else if (!['localstorage', 'filesystem', 'api'].includes(config.type)) {
    errors.push(`지원되지 않는 어댑터 타입: ${config.type}`);
  }

  // 어댑터별 설정 검증
  switch (config.type) {
    case 'api':
      if (!config.options?.apiBaseUrl) {
        errors.push('API 어댑터는 apiBaseUrl이 필요합니다.');
      }
      break;
      
    case 'filesystem':
      if (!config.options?.dataPath) {
        errors.push('파일시스템 어댑터는 dataPath가 필요합니다.');
      }
      break;
      
    case 'localstorage':
      // 브라우저 환경 확인
      if (typeof window === 'undefined') {
        errors.push('로컬스토리지 어댑터는 브라우저 환경에서만 사용 가능합니다.');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 어댑터 마이그레이션 함수
 * - 한 어댑터에서 다른 어댑터로 데이터를 이전할 때 사용
 */
export async function migrateData(
  sourceConfig: AdapterConfig,
  targetConfig: AdapterConfig,
  options: {
    includeKeywords?: boolean;
    includeProjects?: boolean;
    includeSettings?: boolean;
    includeInquiries?: boolean;
  } = {}
): Promise<void> {
  // 기본적으로 모든 데이터 포함
  const migrationOptions = {
    includeKeywords: true,
    includeProjects: true,
    includeSettings: true,
    includeInquiries: true,
    ...options,
  };

  console.log('데이터 마이그레이션 시작...');

  // 소스 어댑터 생성
  const sourceAdapter = AdapterFactory.getInstance().instantiateAdapter(sourceConfig);
  await sourceAdapter.connect();

  // 타겟 어댑터 생성
  const targetAdapter = AdapterFactory.getInstance().instantiateAdapter(targetConfig);
  await targetAdapter.connect();

  try {
    // 키워드 마이그레이션
    if (migrationOptions.includeKeywords) {
      console.log('키워드 데이터 마이그레이션 중...');
      const keywordResult = await sourceAdapter.getKeywords({}, { sortBy: 'created_at', order: 'asc' }, { page: 1, limit: 1000 });
      for (const keyword of keywordResult.items) {
        const { id, created_at, updated_at, ...keywordData } = keyword;
        // Exclude system fields from migration
        void id; void created_at; void updated_at;
        await targetAdapter.createKeyword(keywordData);
      }
    }

    // 프로젝트 마이그레이션
    if (migrationOptions.includeProjects) {
      console.log('프로젝트 데이터 마이그레이션 중...');
      const projectResult = await sourceAdapter.getProjects({ page: 1, limit: 1000 });
      for (const project of projectResult.items) {
        const { id, created_at, updated_at, ...projectData } = project;
        // Exclude system fields from migration
        void id; void created_at; void updated_at;
        await targetAdapter.createProject(projectData);
      }
    }

    // 설정 마이그레이션
    if (migrationOptions.includeSettings) {
      console.log('설정 데이터 마이그레이션 중...');
      const settings = await sourceAdapter.getSettings();
      const { id, created_at, updated_at, ...settingsData } = settings;
      // Exclude system fields from migration
      void id; void created_at; void updated_at;
      await targetAdapter.updateSettings(settingsData);
    }

    // 문의 마이그레이션
    if (migrationOptions.includeInquiries) {
      console.log('문의 데이터 마이그레이션 중...');
      const inquiryResult = await sourceAdapter.getInquiries({ page: 1, limit: 1000 });
      for (const inquiry of inquiryResult.items) {
        const { id, created_at, updated_at, status, ...inquiryData } = inquiry;
        // Exclude system fields from migration
        void id; void created_at; void updated_at; void status;
        await targetAdapter.createInquiry(inquiryData);
      }
    }

    console.log('데이터 마이그레이션 완료');
  } catch (error) {
    console.error('데이터 마이그레이션 실패:', error);
    throw error;
  } finally {
    // 연결 해제
    await sourceAdapter.disconnect();
    await targetAdapter.disconnect();
  }
}