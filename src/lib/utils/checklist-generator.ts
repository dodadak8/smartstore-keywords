/**
 * 품질 체크리스트 생성기
 * - 스마트스토어 상품 등록 전 필수 점검 항목 생성
 * - 키워드, 카테고리, 이미지, 콘텐츠, SEO 등 종합 점검
 * - 자동 검증 및 수동 체크 항목 구분
 * - 점수 계산 및 개선 제안 제공
 */

import { 
  QualityCheckItem, 
  ChecklistResult, 
  Keyword, 
  ProductTitle, 
  CategorySuggestion,
  Project 
} from '../types';

/**
 * 체크리스트 카테고리별 가중치
 */
interface ChecklistWeights {
  keyword: number;      // 키워드 관련 (30%)
  category: number;     // 카테고리 관련 (20%)
  content: number;      // 콘텐츠 관련 (25%)
  image: number;        // 이미지 관련 (15%)
  seo: number;         // SEO 관련 (10%)
}

/**
 * 체크리스트 생성 설정
 */
interface ChecklistConfig {
  weights: ChecklistWeights;
  strictMode: boolean;        // 엄격 모드 (모든 항목 필수)
  includeOptional: boolean;   // 선택적 항목 포함
  autoCheck: boolean;         // 자동 검증 실행
}

/**
 * 체크리스트 통계
 */
interface ChecklistStats {
  totalItems: number;
  checkedItems: number;
  requiredItems: number;
  optionalItems: number;
  autoCheckedItems: number;
  manualCheckItems: number;
  criticalIssues: number;
  warnings: number;
}

/**
 * 체크리스트 생성기 클래스
 */
export class ChecklistGenerator {
  private config: ChecklistConfig;

  constructor(config?: Partial<ChecklistConfig>) {
    this.config = {
      weights: {
        keyword: 0.3,
        category: 0.2,
        content: 0.25,
        image: 0.15,
        seo: 0.1,
      },
      strictMode: false,
      includeOptional: true,
      autoCheck: true,
      ...config,
    };
  }

  /**
   * 프로젝트 기반 종합 체크리스트 생성
   * @param project 프로젝트 데이터
   * @returns 체크리스트 결과
   */
  generateComprehensiveChecklist(project: Project): ChecklistResult {
    const items: QualityCheckItem[] = [];
    
    // 1. 키워드 관련 체크리스트
    items.push(...this.generateKeywordChecklist(project.keywords));
    
    // 2. 상품명 관련 체크리스트
    if (project.titles.length > 0) {
      items.push(...this.generateTitleChecklist(project.titles[0]));
    }
    
    // 3. 카테고리 관련 체크리스트
    if (project.categories.length > 0) {
      items.push(...this.generateCategoryChecklist(project.categories[0]));
    }
    
    // 4. 이미지 관련 체크리스트
    items.push(...this.generateImageChecklist());
    
    // 5. 콘텐츠 관련 체크리스트
    items.push(...this.generateContentChecklist());
    
    // 6. SEO 관련 체크리스트
    items.push(...this.generateSEOChecklist());
    
    // 7. 자동 검증 실행
    if (this.config.autoCheck) {
      this.performAutoChecks(items, project);
    }
    
    // 8. 점수 및 통계 계산
    const stats = this.calculateStats(items);
    const overallScore = this.calculateOverallScore(items);
    const completionRate = (stats.checkedItems / stats.totalItems) * 100;
    const criticalIssues = this.identifyCriticalIssues(items);
    
    return {
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project_id: project.id,
      items,
      overall_score: overallScore,
      completion_rate: Math.round(completionRate * 100) / 100,
      critical_issues: criticalIssues,
    };
  }

  /**
   * 키워드 관련 체크리스트 생성
   */
  private generateKeywordChecklist(keywords: Keyword[]): QualityCheckItem[] {
    const items: QualityCheckItem[] = [];

    // 키워드 기본 검증
    items.push({
      id: 'keyword-count',
      title: '키워드 개수 적정성',
      description: '최소 3개 이상의 키워드가 등록되어 있는지 확인',
      category: 'keyword',
      required: true,
      checked: keywords.length >= 3,
      issues: keywords.length < 3 ? [`현재 ${keywords.length}개, 최소 3개 필요`] : undefined,
    });

    items.push({
      id: 'keyword-volume',
      title: '키워드 검색량 분포',
      description: '높은 검색량과 낮은 검색량 키워드가 적절히 분포되어 있는지 확인',
      category: 'keyword',
      required: true,
      checked: false, // 자동 검증에서 설정
    });

    items.push({
      id: 'keyword-competition',
      title: '키워드 경쟁도 분석',
      description: '높은 경쟁도 키워드와 낮은 경쟁도 키워드가 균형있게 구성되어 있는지 확인',
      category: 'keyword',
      required: true,
      checked: false, // 자동 검증에서 설정
    });

    items.push({
      id: 'keyword-relevance',
      title: '키워드 관련성',
      description: '선택한 키워드가 실제 상품과 관련성이 높은지 확인',
      category: 'keyword',
      required: true,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'longtail-keywords',
      title: '롱테일 키워드 포함',
      description: '롱테일 키워드가 포함되어 있어 틈새 시장 공략이 가능한지 확인',
      category: 'keyword',
      required: false,
      checked: keywords.some(k => k.tags.includes('longtail')),
    });

    return items;
  }

  /**
   * 상품명 관련 체크리스트 생성
   */
  private generateTitleChecklist(title: ProductTitle): QualityCheckItem[] {
    const items: QualityCheckItem[] = [];

    items.push({
      id: 'title-length',
      title: '상품명 길이 적정성',
      description: '상품명이 적절한 길이(20-60자)로 구성되어 있는지 확인',
      category: 'content',
      required: true,
      checked: title.title_text.length >= 20 && title.title_text.length <= 60,
      issues: title.title_text.length < 20 ? ['상품명이 너무 짧습니다'] : 
              title.title_text.length > 60 ? ['상품명이 너무 깁니다'] : undefined,
    });

    items.push({
      id: 'title-keyword-placement',
      title: '키워드 배치',
      description: '중요한 키워드가 상품명 앞부분에 배치되어 있는지 확인',
      category: 'keyword',
      required: true,
      checked: false, // 자동 검증에서 설정
    });

    items.push({
      id: 'title-readability',
      title: '상품명 가독성',
      description: '상품명이 자연스럽고 읽기 쉬운지 확인',
      category: 'content',
      required: true,
      checked: title.score >= 70, // 품질 점수 기반
      issues: title.issues,
    });

    items.push({
      id: 'title-uniqueness',
      title: '상품명 독창성',
      description: '상품명이 경쟁 상품과 차별화되고 독창적인지 확인',
      category: 'content',
      required: false,
      checked: false, // 수동 확인 필요
    });

    return items;
  }

  /**
   * 카테고리 관련 체크리스트 생성
   */
  private generateCategoryChecklist(category: CategorySuggestion): QualityCheckItem[] {
    const items: QualityCheckItem[] = [];

    items.push({
      id: 'category-accuracy',
      title: '카테고리 정확성',
      description: '상품에 가장 적합한 카테고리가 선택되었는지 확인',
      category: 'category',
      required: true,
      checked: category.confidence >= 80,
      issues: category.confidence < 80 ? [`신뢰도 ${category.confidence}%, 80% 이상 권장`] : undefined,
    });

    items.push({
      id: 'category-attributes',
      title: '필수 속성 입력',
      description: '선택한 카테고리의 필수 속성이 모두 입력되었는지 확인',
      category: 'category',
      required: true,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'category-tags',
      title: '카테고리 태그',
      description: '상품과 관련된 적절한 태그가 설정되었는지 확인',
      category: 'category',
      required: false,
      checked: false, // 수동 확인 필요
    });

    return items;
  }

  /**
   * 이미지 관련 체크리스트 생성
   */
  private generateImageChecklist(): QualityCheckItem[] {
    const items: QualityCheckItem[] = [];

    items.push({
      id: 'main-image',
      title: '대표 이미지',
      description: '고화질의 대표 이미지가 등록되었는지 확인 (최소 800x800px)',
      category: 'image',
      required: true,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'image-count',
      title: '이미지 개수',
      description: '다양한 각도의 상품 이미지가 충분히 등록되었는지 확인 (최소 3장)',
      category: 'image',
      required: true,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'image-quality',
      title: '이미지 품질',
      description: '이미지가 선명하고 조명이 적절한지 확인',
      category: 'image',
      required: true,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'image-background',
      title: '배경 처리',
      description: '대표 이미지의 배경이 깔끔하게 처리되었는지 확인',
      category: 'image',
      required: false,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'image-alt-text',
      title: '이미지 대체 텍스트',
      description: '이미지에 적절한 대체 텍스트(alt)가 설정되었는지 확인',
      category: 'seo',
      required: false,
      checked: false, // 수동 확인 필요
    });

    return items;
  }

  /**
   * 콘텐츠 관련 체크리스트 생성
   */
  private generateContentChecklist(): QualityCheckItem[] {
    const items: QualityCheckItem[] = [];

    items.push({
      id: 'product-description',
      title: '상품 설명',
      description: '상세하고 정확한 상품 설명이 작성되었는지 확인',
      category: 'content',
      required: true,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'key-features',
      title: '주요 특징 강조',
      description: '상품의 주요 특징과 장점이 명확히 설명되었는지 확인',
      category: 'content',
      required: true,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'specifications',
      title: '상품 스펙',
      description: '상품의 상세 스펙(크기, 재질, 무게 등)이 정확히 기재되었는지 확인',
      category: 'content',
      required: true,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'usage-instructions',
      title: '사용법 안내',
      description: '상품 사용법이나 주의사항이 명시되었는지 확인',
      category: 'content',
      required: false,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'content-formatting',
      title: '콘텐츠 포맷팅',
      description: '텍스트가 읽기 쉽게 구조화되고 포맷팅되었는지 확인',
      category: 'content',
      required: false,
      checked: false, // 수동 확인 필요
    });

    return items;
  }

  /**
   * SEO 관련 체크리스트 생성
   */
  private generateSEOChecklist(): QualityCheckItem[] {
    const items: QualityCheckItem[] = [];

    items.push({
      id: 'meta-title',
      title: '메타 제목',
      description: '검색 엔진 최적화를 위한 메타 제목이 설정되었는지 확인',
      category: 'seo',
      required: false,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'meta-description',
      title: '메타 설명',
      description: '상품을 잘 설명하는 메타 설명이 작성되었는지 확인',
      category: 'seo',
      required: false,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'url-optimization',
      title: 'URL 최적화',
      description: '상품 URL이 SEO 친화적으로 구성되었는지 확인',
      category: 'seo',
      required: false,
      checked: false, // 수동 확인 필요
    });

    items.push({
      id: 'structured-data',
      title: '구조화된 데이터',
      description: '상품 정보가 검색 엔진이 이해하기 쉽게 구조화되었는지 확인',
      category: 'seo',
      required: false,
      checked: false, // 수동 확인 필요
    });

    return items;
  }

  /**
   * 자동 검증 실행
   */
  private performAutoChecks(items: QualityCheckItem[], project: Project): void {
    items.forEach(item => {
      switch (item.id) {
        case 'keyword-volume':
          this.checkKeywordVolumeDistribution(item, project.keywords);
          break;
        case 'keyword-competition':
          this.checkKeywordCompetitionBalance(item, project.keywords);
          break;
        case 'title-keyword-placement':
          if (project.titles.length > 0) {
            this.checkTitleKeywordPlacement(item, project.titles[0], project.keywords);
          }
          break;
        // 추가 자동 검증 케이스들...
      }
    });
  }

  /**
   * 키워드 검색량 분포 확인
   */
  private checkKeywordVolumeDistribution(item: QualityCheckItem, keywords: Keyword[]): void {
    if (keywords.length === 0) {
      item.checked = false;
      item.issues = ['키워드가 없습니다'];
      return;
    }

    const volumes = keywords.map(k => k.volume);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const highVolumeCount = volumes.filter(v => v > avgVolume * 1.5).length;
    const lowVolumeCount = volumes.filter(v => v < avgVolume * 0.5).length;

    const hasGoodDistribution = highVolumeCount > 0 && lowVolumeCount > 0;
    
    item.checked = hasGoodDistribution;
    if (!hasGoodDistribution) {
      item.issues = ['검색량 분포가 고르지 않습니다. 다양한 검색량의 키워드를 포함하세요.'];
    }
  }

  /**
   * 키워드 경쟁도 균형 확인
   */
  private checkKeywordCompetitionBalance(item: QualityCheckItem, keywords: Keyword[]): void {
    if (keywords.length === 0) {
      item.checked = false;
      item.issues = ['키워드가 없습니다'];
      return;
    }

    const competitions = keywords.map(k => k.competition);
    const highCompCount = competitions.filter(c => c > 70).length;
    const lowCompCount = competitions.filter(c => c < 30).length;

    const hasBalance = highCompCount > 0 && lowCompCount > 0;
    
    item.checked = hasBalance;
    if (!hasBalance) {
      item.issues = ['경쟁도가 편중되어 있습니다. 높은 경쟁도와 낮은 경쟁도 키워드를 적절히 조합하세요.'];
    }
  }

  /**
   * 상품명 키워드 배치 확인
   */
  private checkTitleKeywordPlacement(
    item: QualityCheckItem, 
    title: ProductTitle, 
    keywords: Keyword[]
  ): void {
    const titleWords = title.title_text.split(/\s+/);
    const keywordTerms = keywords.map(k => k.term.toLowerCase());
    
    // 첫 3단어 내에 키워드가 포함되어 있는지 확인
    const firstThreeWords = titleWords.slice(0, 3).map(w => w.toLowerCase()).join(' ');
    const hasEarlyKeyword = keywordTerms.some(term => 
      firstThreeWords.includes(term.toLowerCase())
    );

    item.checked = hasEarlyKeyword;
    if (!hasEarlyKeyword) {
      item.issues = ['중요한 키워드를 상품명 앞부분에 배치하세요.'];
    }
  }

  /**
   * 체크리스트 통계 계산
   */
  private calculateStats(items: QualityCheckItem[]): ChecklistStats {
    return {
      totalItems: items.length,
      checkedItems: items.filter(item => item.checked).length,
      requiredItems: items.filter(item => item.required).length,
      optionalItems: items.filter(item => !item.required).length,
      autoCheckedItems: items.filter(item => item.checked && !item.issues).length,
      manualCheckItems: items.filter(item => !item.checked).length,
      criticalIssues: items.filter(item => item.required && !item.checked).length,
      warnings: items.filter(item => !item.required && !item.checked).length,
    };
  }

  /**
   * 전체 점수 계산
   */
  private calculateOverallScore(items: QualityCheckItem[]): number {
    let totalScore = 0;
    let maxScore = 0;

    const categoryScores = {
      keyword: 0,
      category: 0,
      content: 0,
      image: 0,
      seo: 0,
    };

    const categoryCounts = {
      keyword: 0,
      category: 0,
      content: 0,
      image: 0,
      seo: 0,
    };

    // 카테고리별 점수 계산
    items.forEach(item => {
      const weight = item.required ? 1 : 0.5; // 필수 항목은 가중치 1, 선택 항목은 0.5
      const score = item.checked ? weight : 0;
      
      categoryScores[item.category] += score;
      categoryCounts[item.category] += weight;
    });

    // 가중 평균 계산
    Object.keys(categoryScores).forEach(category => {
      const cat = category as keyof typeof categoryScores;
      if (categoryCounts[cat] > 0) {
        const categoryScore = categoryScores[cat] / categoryCounts[cat];
        totalScore += categoryScore * this.config.weights[cat];
        maxScore += this.config.weights[cat];
      }
    });

    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  }

  /**
   * 치명적 문제점 식별
   */
  private identifyCriticalIssues(items: QualityCheckItem[]): string[] {
    const criticalIssues: string[] = [];

    items.forEach(item => {
      if (item.required && !item.checked) {
        criticalIssues.push(`${item.title}: ${item.description}`);
      }
    });

    return criticalIssues;
  }

  /**
   * 개선 제안 생성
   */
  generateImprovementSuggestions(result: ChecklistResult): string[] {
    const suggestions: string[] = [];

    // 점수 기반 제안
    if (result.overall_score < 60) {
      suggestions.push('전체적인 품질 개선이 필요합니다. 필수 항목부터 차례로 완료하세요.');
    } else if (result.overall_score < 80) {
      suggestions.push('기본적인 품질은 갖추었지만, 추가 개선을 통해 더 나은 결과를 얻을 수 있습니다.');
    }

    // 카테고리별 제안
    const categoryIssues = this.analyzeCategoryIssues(result.items);
    
    if (categoryIssues.keyword > 2) {
      suggestions.push('키워드 전략을 재검토하고 더 관련성 높은 키워드를 선택하세요.');
    }
    
    if (categoryIssues.content > 2) {
      suggestions.push('상품 설명과 콘텐츠를 더 상세하고 매력적으로 작성하세요.');
    }
    
    if (categoryIssues.image > 1) {
      suggestions.push('고화질의 다양한 상품 이미지를 추가하여 구매 전환율을 높이세요.');
    }

    // 완료율 기반 제안
    if (result.completion_rate < 50) {
      suggestions.push('체크리스트의 50% 이상을 완료한 후 상품을 등록하는 것을 권장합니다.');
    }

    return suggestions;
  }

  /**
   * 카테고리별 문제점 분석
   */
  private analyzeCategoryIssues(items: QualityCheckItem[]): Record<string, number> {
    const issues = {
      keyword: 0,
      category: 0,
      content: 0,
      image: 0,
      seo: 0,
    };

    items.forEach(item => {
      if (!item.checked) {
        issues[item.category]++;
      }
    });

    return issues;
  }

  /**
   * ID 생성 유틸리티
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<ChecklistConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 현재 설정 반환
   */
  getConfig(): ChecklistConfig {
    return { ...this.config };
  }
}

/**
 * 기본 체크리스트 생성기 인스턴스
 */
export const defaultChecklistGenerator = new ChecklistGenerator();

/**
 * 체크리스트 템플릿 생성 유틸리티
 */
export const ChecklistTemplates = {
  /**
   * 기본 체크리스트 템플릿
   */
  basic: (): QualityCheckItem[] => {
    return [
      {
        id: 'basic-keyword',
        title: '키워드 설정',
        description: '상품과 관련된 키워드가 설정되었는지 확인',
        category: 'keyword',
        required: true,
        checked: false,
      },
      {
        id: 'basic-title',
        title: '상품명 작성',
        description: '적절한 길이의 상품명이 작성되었는지 확인',
        category: 'content',
        required: true,
        checked: false,
      },
      {
        id: 'basic-category',
        title: '카테고리 선택',
        description: '적절한 카테고리가 선택되었는지 확인',
        category: 'category',
        required: true,
        checked: false,
      },
      {
        id: 'basic-image',
        title: '상품 이미지',
        description: '대표 이미지가 등록되었는지 확인',
        category: 'image',
        required: true,
        checked: false,
      },
    ];
  },

  /**
   * 상세 체크리스트 템플릿
   */
  detailed: (): QualityCheckItem[] => {
    const generator = new ChecklistGenerator();
    const dummyProject: Project = {
      id: 'dummy',
      name: 'Template',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      keywords: [],
      titles: [],
      categories: [],
      settings: {
        algorithm_weights: { volume: 0.7, competition: 0.3, tag: 0.1 },
        title_template: {
          name: '기본',
          pattern: '{keywords}',
          required_components: ['keywords'],
          max_length: 60,
          separator: ' ',
        },
        stopwords: [],
        spacing_rules: [],
      },
    };
    
    const result = generator.generateComprehensiveChecklist(dummyProject);
    return result.items;
  },
};