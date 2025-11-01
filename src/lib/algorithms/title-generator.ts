/**
 * 상품명 생성 알고리즘
 * - 키워드 기반 스마트스토어 최적화 상품명 생성
 * - 템플릿 시스템을 통한 유연한 상품명 구성
 * - 금칙어 필터링 및 길이 제한 검증
 * - 띄어쓰기 A/B 테스트 지원
 */

import { 
  Keyword, 
  ProductTitleComponents, 
  ProductTitle, 
  TitleTemplate,
  ValidationResult,
  FormError
} from '../types';

/**
 * 상품명 생성 설정 인터페이스
 */
export interface TitleGenerationConfig {
  template: TitleTemplate; // 사용할 템플릿
  stopwords: string[]; // 금칙어 목록
  maxLength: number; // 최대 길이
  minKeywords: number; // 최소 키워드 개수
  maxKeywords: number; // 최대 키워드 개수
  prioritizeKeywords: boolean; // 키워드 우선 배치
  removeDuplicates: boolean; // 중복 단어 제거
  generateSpacingVariants: boolean; // 띄어쓰기 변형 생성
}

/**
 * 상품명 품질 평가 결과
 */
export interface TitleQualityScore {
  overall: number; // 전체 점수 (0-100)
  breakdown: {
    keywordPlacement: number; // 키워드 배치 점수
    readability: number; // 가독성 점수
    length: number; // 길이 적정성 점수
    uniqueness: number; // 고유성 점수
  };
  issues: string[]; // 발견된 문제점들
  suggestions: string[]; // 개선 제안들
}

/**
 * 상품명 생성기 클래스
 */
export class TitleGenerator {
  private config: TitleGenerationConfig;

  constructor(config: TitleGenerationConfig) {
    this.config = config;
  }

  /**
   * 상품명 후보 생성 (5-10개)
   * @param components 상품명 구성 요소
   * @param keywords 사용할 키워드 목록
   * @returns 생성된 상품명 후보들
   */
  generateTitles(
    components: ProductTitleComponents, 
    keywords: Keyword[]
  ): ProductTitle[] {
    // 1. 입력 검증
    const validation = this.validateInput(components, keywords);
    if (!validation.isValid) {
      throw new Error(`입력 검증 실패: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // 2. 키워드 선택 및 정렬
    const selectedKeywords = this.selectAndSortKeywords(keywords, components.keywords);

    // 3. 다양한 패턴으로 상품명 생성
    const titleCandidates = this.generateTitleCandidates(components, selectedKeywords);

    // 4. 후처리 (금칙어 제거, 중복 제거 등)
    const processedTitles = titleCandidates.map(title => this.postProcessTitle(title));

    // 5. 품질 평가 및 정렬
    const scoredTitles = processedTitles.map(title => ({
      ...title,
      ...this.evaluateTitle(title.title_text),
    }));

    // 6. 상위 10개 선택
    const topTitles = scoredTitles
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return topTitles;
  }

  /**
   * 단일 상품명의 띄어쓰기 변형 생성
   * @param title 원본 상품명
   * @returns 띄어쓰기 변형 (spaced/unspaced)
   */
  generateSpacingVariants(title: string): { spaced: string; unspaced: string } {
    // 1. 띄어쓰기 버전 (기본)
    const spaced = this.normalizeSpacing(title);

    // 2. 붙여쓰기 버전
    const unspaced = this.removeSpacing(spaced);

    return { spaced, unspaced };
  }

  /**
   * 상품명 품질 평가
   * @param title 평가할 상품명
   * @returns 품질 평가 결과
   */
  evaluateTitle(title: string): TitleQualityScore {
    const breakdown = {
      keywordPlacement: this.evaluateKeywordPlacement(title),
      readability: this.evaluateReadability(title),
      length: this.evaluateLengthScore(title),
      uniqueness: this.evaluateUniqueness(title),
    };

    const overall = Object.values(breakdown).reduce((sum, score) => sum + score, 0) / 4;

    const { issues, suggestions } = this.analyzeIssues(title, breakdown);

    return {
      overall: Math.round(overall * 100) / 100,
      breakdown,
      issues,
      suggestions,
    };
  }

  /**
   * 상품명 후보 생성 (다양한 패턴)
   */
  private generateTitleCandidates(
    components: ProductTitleComponents, 
    keywords: string[]
  ): ProductTitle[] {
    const candidates: ProductTitle[] = [];
    const timestamp = new Date().toISOString();

    // 패턴 1: 키워드 우선 (기본)
    candidates.push(this.createTitleFromPattern(
      `${keywords.join(' ')} ${components.category || ''} ${(components.features || []).join(' ')} ${components.usage || ''}`.trim(),
      components,
      keywords,
      timestamp
    ));

    // 패턴 2: 카테고리 우선
    if (components.category) {
      candidates.push(this.createTitleFromPattern(
        `${components.category} ${keywords.join(' ')} ${(components.features || []).join(' ')} ${components.usage || ''}`.trim(),
        components,
        keywords,
        timestamp
      ));
    }

    // 패턴 3: 특징 강조
    if (components.features && components.features.length > 0) {
      candidates.push(this.createTitleFromPattern(
        `${keywords.join(' ')} ${components.features[0]} ${components.category || ''} ${components.usage || ''}`.trim(),
        components,
        keywords,
        timestamp
      ));
    }

    // 패턴 4: 타겟 고객 우선
    if (components.demographic) {
      candidates.push(this.createTitleFromPattern(
        `${components.demographic} ${keywords.join(' ')} ${components.category || ''} ${(components.features || []).join(' ')}`.trim(),
        components,
        keywords,
        timestamp
      ));
    }

    // 패턴 5: 용도/시즌 강조
    if (components.usage) {
      candidates.push(this.createTitleFromPattern(
        `${components.usage} ${keywords.join(' ')} ${components.category || ''} ${(components.features || []).join(' ')}`.trim(),
        components,
        keywords,
        timestamp
      ));
    }

    // 패턴 6-10: 키워드 조합 변경
    if (keywords.length >= 2) {
      const keywordCombinations = this.generateKeywordCombinations(keywords);
      keywordCombinations.slice(0, 5).forEach(combination => {
        candidates.push(this.createTitleFromPattern(
          `${combination.join(' ')} ${components.category || ''} ${(components.features || []).join(' ')} ${components.usage || ''}`.trim(),
          components,
          combination,
          timestamp
        ));
      });
    }

    return candidates.filter(candidate => candidate.title_text.length > 0);
  }

  /**
   * 패턴으로부터 ProductTitle 객체 생성
   */
  private createTitleFromPattern(
    titleText: string,
    components: ProductTitleComponents,
    keywords: string[],
    timestamp: string
  ): ProductTitle {
    return {
      id: this.generateId(),
      created_at: timestamp,
      updated_at: timestamp,
      keyword_ids: [], // 실제로는 Keyword 객체의 ID들이 들어가야 함
      components,
      title_text: titleText,
      score: 0, // 나중에 계산됨
      issues: [],
    };
  }

  /**
   * 키워드 조합 생성
   */
  private generateKeywordCombinations(keywords: string[]): string[][] {
    const combinations: string[][] = [];
    
    // 2개 조합
    for (let i = 0; i < keywords.length - 1; i++) {
      for (let j = i + 1; j < keywords.length; j++) {
        combinations.push([keywords[i], keywords[j]]);
        combinations.push([keywords[j], keywords[i]]); // 순서 바꾼 버전
      }
    }

    // 3개 조합 (키워드가 3개 이상일 때)
    if (keywords.length >= 3) {
      for (let i = 0; i < keywords.length - 2; i++) {
        for (let j = i + 1; j < keywords.length - 1; j++) {
          for (let k = j + 1; k < keywords.length; k++) {
            combinations.push([keywords[i], keywords[j], keywords[k]]);
          }
        }
      }
    }

    return combinations;
  }

  /**
   * 키워드 선택 및 정렬
   */
  private selectAndSortKeywords(allKeywords: Keyword[], requestedKeywords: string[]): string[] {
    // 요청된 키워드 우선
    const keywordMap = new Map(allKeywords.map(k => [k.term.toLowerCase(), k]));
    const selectedKeywords: { term: string; score: number }[] = [];

    requestedKeywords.forEach(term => {
      const keyword = keywordMap.get(term.toLowerCase());
      selectedKeywords.push({
        term,
        score: keyword?.score || 0,
      });
    });

    // 점수순 정렬
    selectedKeywords.sort((a, b) => b.score - a.score);

    // 개수 제한 적용
    const limitedKeywords = selectedKeywords.slice(0, this.config.maxKeywords);

    return limitedKeywords.map(k => k.term);
  }

  /**
   * 상품명 후처리 (금칙어 제거, 중복 제거 등)
   */
  private postProcessTitle(title: ProductTitle): ProductTitle {
    let processedText = title.title_text;
    const issues: string[] = [];

    // 1. 금칙어 제거
    const { text: filteredText, removedWords } = this.removeStopwords(processedText);
    processedText = filteredText;
    
    if (removedWords.length > 0) {
      issues.push(`금칙어 제거됨: ${removedWords.join(', ')}`);
    }

    // 2. 중복 단어 제거
    if (this.config.removeDuplicates) {
      const { text: dedupedText, removedDuplicates } = this.removeDuplicateWords(processedText);
      processedText = dedupedText;
      
      if (removedDuplicates.length > 0) {
        issues.push(`중복 단어 제거됨: ${removedDuplicates.join(', ')}`);
      }
    }

    // 3. 길이 검증
    if (processedText.length > this.config.maxLength) {
      issues.push(`길이 초과 (${processedText.length}/${this.config.maxLength}자)`);
    }

    // 4. 띄어쓰기 변형 생성
    let spacingVariants;
    if (this.config.generateSpacingVariants) {
      spacingVariants = this.generateSpacingVariants(processedText);
    }

    return {
      ...title,
      title_text: processedText,
      issues: [...title.issues, ...issues],
      spacing_variants: spacingVariants,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * 금칙어 제거
   */
  private removeStopwords(text: string): { text: string; removedWords: string[] } {
    const words = text.split(/\s+/);
    const removedWords: string[] = [];
    
    const filteredWords = words.filter(word => {
      const isStopword = this.config.stopwords.some(stopword => 
        word.toLowerCase().includes(stopword.toLowerCase())
      );
      
      if (isStopword) {
        removedWords.push(word);
        return false;
      }
      return true;
    });

    return {
      text: filteredWords.join(' '),
      removedWords,
    };
  }

  /**
   * 중복 단어 제거
   */
  private removeDuplicateWords(text: string): { text: string; removedDuplicates: string[] } {
    const words = text.split(/\s+/);
    const seenWords = new Set<string>();
    const removedDuplicates: string[] = [];
    
    const uniqueWords = words.filter(word => {
      const lowerWord = word.toLowerCase();
      if (seenWords.has(lowerWord)) {
        removedDuplicates.push(word);
        return false;
      }
      seenWords.add(lowerWord);
      return true;
    });

    return {
      text: uniqueWords.join(' '),
      removedDuplicates,
    };
  }

  /**
   * 띄어쓰기 정규화
   */
  private normalizeSpacing(text: string): string {
    return text
      .replace(/\s+/g, ' ') // 연속 공백을 하나로
      .replace(/([가-힣])([A-Za-z])/g, '$1 $2') // 한글-영문 사이 띄어쓰기
      .replace(/([A-Za-z])([가-힣])/g, '$1 $2') // 영문-한글 사이 띄어쓰기
      .replace(/([0-9])([가-힣])/g, '$1 $2') // 숫자-한글 사이 띄어쓰기
      .trim();
  }

  /**
   * 띄어쓰기 제거
   */
  private removeSpacing(text: string): string {
    return text.replace(/\s/g, '');
  }

  /**
   * 키워드 배치 점수 평가
   */
  private evaluateKeywordPlacement(title: string): number {
    const words = title.split(/\s+/);
    if (words.length === 0) return 0;

    // 키워드가 앞쪽에 배치될수록 높은 점수
    let score = 0;
    const keywordTerms = this.config.template.required_components.includes('keywords') ? 
      this.getKeywordsFromTitle(title) : [];

    keywordTerms.forEach((keyword) => {
      const position = words.findIndex(word => 
        word.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (position !== -1) {
        // 위치가 앞쪽일수록 높은 점수 (최대 1.0)
        const positionScore = Math.max(0, 1 - (position / words.length));
        score += positionScore;
      }
    });

    return keywordTerms.length > 0 ? score / keywordTerms.length : 0.5;
  }

  /**
   * 가독성 점수 평가
   */
  private evaluateReadability(title: string): number {
    let score = 1.0;

    // 길이 적정성 (20-50자 사이가 이상적)
    const length = title.length;
    if (length < 10 || length > 80) {
      score -= 0.3;
    }

    // 단어 수 적정성 (3-8개 사이가 이상적)
    const wordCount = title.split(/\s+/).length;
    if (wordCount < 2 || wordCount > 12) {
      score -= 0.2;
    }

    // 특수문자 과다 사용 체크
    const specialCharCount = (title.match(/[^\w\s가-힣]/g) || []).length;
    if (specialCharCount > 3) {
      score -= 0.2;
    }

    // 연속 대문자 체크
    if (/[A-Z]{3,}/.test(title)) {
      score -= 0.1;
    }

    return Math.max(0, score);
  }

  /**
   * 길이 점수 평가
   */
  private evaluateLengthScore(title: string): number {
    const length = title.length;
    const maxLength = this.config.maxLength;

    if (length > maxLength) {
      return 0; // 길이 초과시 0점
    }

    // 이상적 길이 범위 (최대 길이의 60-90%)
    const idealMin = maxLength * 0.6;
    const idealMax = maxLength * 0.9;

    if (length >= idealMin && length <= idealMax) {
      return 1.0; // 이상적 범위면 만점
    }

    if (length < idealMin) {
      return length / idealMin; // 짧으면 비례적으로 감점
    }

    // 이상적 범위 초과하면 선형적으로 감점
    return 1.0 - ((length - idealMax) / (maxLength - idealMax)) * 0.3;
  }

  /**
   * 고유성 점수 평가
   */
  private evaluateUniqueness(title: string): number {
    let uniquenessScore = 1.0;

    // 일반적인 표현 사용시 감점
    const commonPhrases = ['최고', '최저가', '특가', '할인', '이벤트', '무료배송'];
    commonPhrases.forEach(phrase => {
      if (title.includes(phrase)) {
        uniquenessScore -= 0.1;
      }
    });

    // 숫자 과다 사용 체크
    const numberCount = (title.match(/\d/g) || []).length;
    if (numberCount > 5) {
      uniquenessScore -= 0.1;
    }

    return Math.max(0, uniquenessScore);
  }

  /**
   * 문제점 및 개선 제안 분석
   */
  private analyzeIssues(title: string, breakdown: Record<string, unknown>): { issues: string[]; suggestions: string[] } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 키워드 배치 문제
    const keywordPlacement = breakdown.keywordPlacement as number;
    if (keywordPlacement < 0.7) {
      issues.push('키워드가 뒤쪽에 배치되어 있습니다');
      suggestions.push('중요한 키워드를 제목 앞부분에 배치하세요');
    }

    // 가독성 문제
    const readability = breakdown.readability as number;
    if (readability < 0.7) {
      issues.push('가독성이 낮습니다');
      suggestions.push('적절한 띄어쓰기와 단어 배치를 확인하세요');
    }

    // 길이 문제
    const length = breakdown.length as number;
    if (length < 0.8) {
      if (title.length > this.config.maxLength) {
        issues.push('제목이 너무 깁니다');
        suggestions.push('불필요한 단어를 제거하여 길이를 줄이세요');
      } else {
        issues.push('제목이 너무 짧습니다');
        suggestions.push('제품의 특징이나 용도를 추가하세요');
      }
    }

    // 고유성 문제
    const uniqueness = breakdown.uniqueness as number;
    if (uniqueness < 0.8) {
      issues.push('일반적인 표현이 많이 사용되었습니다');
      suggestions.push('제품만의 고유한 특징을 강조하세요');
    }

    return { issues, suggestions };
  }

  /**
   * 제목에서 키워드 추출
   */
  private getKeywordsFromTitle(title: string): string[] {
    // 간단한 구현: 실제로는 더 정교한 키워드 매칭 필요
    return title.split(/\s+/).slice(0, 3);
  }

  /**
   * 입력 검증
   */
  private validateInput(components: ProductTitleComponents, keywords: Keyword[]): ValidationResult {
    const errors: FormError[] = [];

    // 키워드 필수 검증
    if (!components.keywords || components.keywords.length === 0) {
      errors.push({ field: 'keywords', message: '최소 1개의 키워드가 필요합니다' });
    }

    if (components.keywords && components.keywords.length > this.config.maxKeywords) {
      errors.push({ 
        field: 'keywords', 
        message: `키워드는 최대 ${this.config.maxKeywords}개까지 선택 가능합니다` 
      });
    }

    // 키워드 존재 여부 확인
    const availableKeywords = new Set(keywords.map(k => k.term.toLowerCase()));
    const missingKeywords = components.keywords?.filter(term => 
      !availableKeywords.has(term.toLowerCase())
    ) || [];

    if (missingKeywords.length > 0) {
      errors.push({ 
        field: 'keywords', 
        message: `존재하지 않는 키워드: ${missingKeywords.join(', ')}` 
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
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
  updateConfig(newConfig: Partial<TitleGenerationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 현재 설정 반환
   */
  getConfig(): TitleGenerationConfig {
    return { ...this.config };
  }
}

/**
 * 기본 상품명 생성 설정
 */
export const DEFAULT_TITLE_CONFIG: TitleGenerationConfig = {
  template: {
    name: '기본 템플릿',
    pattern: '{keywords} {category} {features} {usage}',
    required_components: ['keywords'],
    max_length: 60,
    separator: ' ',
  },
  stopwords: [
    '무료', '할인', '이벤트', '증정', '당첨', '공짜', '최저가', '특가',
    'free', 'sale', 'discount', 'win', 'prize', 'cheap'
  ],
  maxLength: 60,
  minKeywords: 1,
  maxKeywords: 3,
  prioritizeKeywords: true,
  removeDuplicates: true,
  generateSpacingVariants: true,
};