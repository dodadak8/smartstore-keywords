/**
 * 카테고리 추천 알고리즘
 * - 키워드와 상품 특성 기반 카테고리 추천
 * - 룰 기반 추천 시스템 (향후 ML 모델로 확장 가능)
 * - 신뢰도 점수 및 추천 근거 제공
 * - 필수 속성 및 스펙 체크리스트 생성
 */

import { 
  Keyword, 
  CategorySuggestion, 
  CategoryAttribute, 
  ProductTitleComponents 
} from '../types';

/**
 * 카테고리 매칭 규칙 인터페이스
 */
export interface CategoryRule {
  categoryName: string; // 카테고리명
  keywords: string[]; // 매칭되는 키워드들
  patterns: string[]; // 매칭되는 패턴 (정규식)
  weight: number; // 규칙 가중치 (0-1)
  confidence: number; // 기본 신뢰도 (0-100)
  reason: string; // 추천 근거
  attributes: CategoryAttribute[]; // 필수 속성들
}

/**
 * 카테고리 추천 결과 상세 정보
 */
export interface CategoryRecommendationDetail {
  suggestion: CategorySuggestion;
  matchedRules: CategoryRule[];
  keywordMatches: string[];
  patternMatches: string[];
  scoreBreakdown: {
    keywordScore: number;
    patternScore: number;
    frequencyScore: number;
    finalScore: number;
  };
}

/**
 * 카테고리 추천기 클래스
 */
export class CategoryRecommender {
  private rules: CategoryRule[];

  constructor(customRules?: CategoryRule[]) {
    this.rules = customRules || this.getDefaultRules();
  }

  /**
   * 카테고리 추천 실행
   * @param keywords 키워드 목록
   * @param components 상품 구성 요소 (선택사항)
   * @param maxSuggestions 최대 추천 개수 (기본 3개)
   * @returns 추천 카테고리 목록
   */
  recommendCategories(
    keywords: Keyword[],
    components?: ProductTitleComponents,
    maxSuggestions: number = 3
  ): CategoryRecommendationDetail[] {
    // 1. 키워드 텍스트 추출
    const keywordTexts = keywords.map(k => k.term.toLowerCase());
    
    // 2. 구성 요소에서 추가 텍스트 추출
    const additionalTexts = this.extractAdditionalTexts(components);
    
    // 3. 전체 분석 텍스트
    const allTexts = [...keywordTexts, ...additionalTexts];
    
    // 4. 각 카테고리별 점수 계산
    const categoryScores = this.calculateCategoryScores(allTexts, keywords);
    
    // 5. 점수순 정렬 및 상위 N개 선택
    const topCategories = categoryScores
      .sort((a, b) => b.scoreBreakdown.finalScore - a.scoreBreakdown.finalScore)
      .slice(0, maxSuggestions);
    
    return topCategories;
  }

  /**
   * 특정 카테고리의 필수 속성 체크리스트 생성
   * @param categoryName 카테고리명
   * @returns 필수 속성 체크리스트
   */
  getCategoryChecklist(categoryName: string): CategoryAttribute[] {
    const rule = this.rules.find(r => 
      r.categoryName.toLowerCase() === categoryName.toLowerCase()
    );
    
    return rule ? rule.attributes : [];
  }

  /**
   * 카테고리 규칙 추가/업데이트
   * @param rule 추가할 규칙
   */
  addRule(rule: CategoryRule): void {
    const existingIndex = this.rules.findIndex(r => r.categoryName === rule.categoryName);
    
    if (existingIndex >= 0) {
      this.rules[existingIndex] = rule;
    } else {
      this.rules.push(rule);
    }
  }

  /**
   * 카테고리별 점수 계산
   */
  private calculateCategoryScores(
    texts: string[], 
    keywords: Keyword[]
  ): CategoryRecommendationDetail[] {
    const results: CategoryRecommendationDetail[] = [];
    
    for (const rule of this.rules) {
      const detail = this.evaluateRule(rule, texts, keywords);
      if (detail.scoreBreakdown.finalScore > 0) {
        results.push(detail);
      }
    }
    
    return results;
  }

  /**
   * 개별 규칙 평가
   */
  private evaluateRule(
    rule: CategoryRule, 
    texts: string[], 
    keywords: Keyword[]
  ): CategoryRecommendationDetail {
    const keywordMatches: string[] = [];
    const patternMatches: string[] = [];
    
    // 1. 키워드 매칭 점수 계산
    let keywordScore = 0;
    const allText = texts.join(' ');
    
    rule.keywords.forEach(keyword => {
      if (allText.includes(keyword.toLowerCase())) {
        keywordMatches.push(keyword);
        keywordScore += 1;
      }
    });
    
    // 키워드 점수 정규화 (0-1)
    keywordScore = rule.keywords.length > 0 ? 
      keywordScore / rule.keywords.length : 0;
    
    // 2. 패턴 매칭 점수 계산
    let patternScore = 0;
    
    rule.patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(allText)) {
        patternMatches.push(pattern);
        patternScore += 1;
      }
    });
    
    // 패턴 점수 정규화 (0-1)
    patternScore = rule.patterns.length > 0 ? 
      patternScore / rule.patterns.length : 0;
    
    // 3. 키워드 빈도/중요도 점수
    let frequencyScore = 0;
    const highScoreKeywords = keywords.filter(k => (k.score || 0) > 70);
    
    highScoreKeywords.forEach(keyword => {
      if (keywordMatches.some(match => 
        keyword.term.toLowerCase().includes(match.toLowerCase())
      )) {
        frequencyScore += (keyword.score || 0) / 100;
      }
    });
    
    frequencyScore = Math.min(1, frequencyScore / Math.max(1, keywords.length));
    
    // 4. 최종 점수 계산
    const finalScore = (
      keywordScore * 0.4 + 
      patternScore * 0.3 + 
      frequencyScore * 0.3
    ) * rule.weight * (rule.confidence / 100);
    
    // 5. 추천 근거 생성
    const reasons = this.generateReasons(rule, keywordMatches, patternMatches);
    
    // 6. CategorySuggestion 객체 생성
    const suggestion: CategorySuggestion = {
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      name: rule.categoryName,
      reasons,
      attributes: rule.attributes,
      confidence: Math.round(finalScore * 100),
    };
    
    return {
      suggestion,
      matchedRules: [rule],
      keywordMatches,
      patternMatches,
      scoreBreakdown: {
        keywordScore,
        patternScore,
        frequencyScore,
        finalScore,
      },
    };
  }

  /**
   * 추천 근거 생성
   */
  private generateReasons(
    rule: CategoryRule,
    keywordMatches: string[],
    patternMatches: string[]
  ): string[] {
    const reasons: string[] = [];
    
    // 기본 근거
    reasons.push(rule.reason);
    
    // 키워드 매칭 근거
    if (keywordMatches.length > 0) {
      reasons.push(`'${keywordMatches.join(', ')}' 키워드가 매칭됨`);
    }
    
    // 패턴 매칭 근거
    if (patternMatches.length > 0) {
      reasons.push('상품 특성 패턴이 일치함');
    }
    
    return reasons;
  }

  /**
   * 구성 요소에서 추가 텍스트 추출
   */
  private extractAdditionalTexts(components?: ProductTitleComponents): string[] {
    if (!components) return [];
    
    const texts: string[] = [];
    
    if (components.category) texts.push(components.category.toLowerCase());
    if (components.demographic) texts.push(components.demographic.toLowerCase());
    if (components.features) {
      texts.push(...components.features.map(f => f.toLowerCase()));
    }
    if (components.usage) texts.push(components.usage.toLowerCase());
    
    return texts;
  }

  /**
   * 기본 카테고리 규칙 정의
   */
  private getDefaultRules(): CategoryRule[] {
    return [
      // 의류 카테고리
      {
        categoryName: '남성의류',
        keywords: ['남성', '남자', '맨즈', '셔츠', '바지', '정장', '캐주얼'],
        patterns: ['남[성자]', '맨즈', '정장', '셔츠'],
        weight: 1.0,
        confidence: 85,
        reason: '남성 의류 관련 키워드가 포함됨',
        attributes: [
          { name: '사이즈', type: 'select', required: true, options: ['S', 'M', 'L', 'XL', 'XXL'] },
          { name: '소재', type: 'text', required: true, placeholder: '예: 면 100%' },
          { name: '색상', type: 'text', required: true, placeholder: '예: 블랙, 네이비' },
          { name: '시즌', type: 'select', required: false, options: ['봄/가을', '여름', '겨울', '사계절'] },
        ],
      },
      {
        categoryName: '여성의류',
        keywords: ['여성', '여자', '레이디', '원피스', '블라우스', '스커트', '드레스'],
        patterns: ['여[성자]', '레이디', '원피스', '블라우스'],
        weight: 1.0,
        confidence: 85,
        reason: '여성 의류 관련 키워드가 포함됨',
        attributes: [
          { name: '사이즈', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL'] },
          { name: '소재', type: 'text', required: true, placeholder: '예: 폴리에스터 100%' },
          { name: '색상', type: 'text', required: true, placeholder: '예: 핑크, 화이트' },
          { name: '스타일', type: 'select', required: false, options: ['캐주얼', '오피스', '파티', '데일리'] },
        ],
      },
      
      // 전자제품 카테고리
      {
        categoryName: '스마트폰/태블릿',
        keywords: ['스마트폰', '폰', '아이폰', '갤럭시', '태블릿', '아이패드'],
        patterns: ['스마트폰', '아이폰', '갤럭시', '태블릿'],
        weight: 1.0,
        confidence: 90,
        reason: '모바일 디바이스 관련 키워드가 포함됨',
        attributes: [
          { name: '브랜드', type: 'select', required: true, options: ['삼성', '애플', 'LG', '기타'] },
          { name: '모델명', type: 'text', required: true, placeholder: '예: Galaxy S24' },
          { name: '저장용량', type: 'select', required: true, options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
          { name: '색상', type: 'text', required: true, placeholder: '예: 미드나이트 블랙' },
          { name: 'A/S 기간', type: 'text', required: false, placeholder: '예: 1년' },
        ],
      },
      {
        categoryName: '컴퓨터/노트북',
        keywords: ['컴퓨터', '노트북', '랩톱', 'PC', '데스크톱', '게이밍'],
        patterns: ['노트북', '랩톱', 'PC', '게이밍'],
        weight: 1.0,
        confidence: 88,
        reason: '컴퓨터 관련 키워드가 포함됨',
        attributes: [
          { name: 'CPU', type: 'text', required: true, placeholder: '예: Intel i7-12700H' },
          { name: 'RAM', type: 'select', required: true, options: ['8GB', '16GB', '32GB', '64GB'] },
          { name: '저장장치', type: 'text', required: true, placeholder: '예: SSD 512GB' },
          { name: 'OS', type: 'select', required: true, options: ['Windows 11', 'macOS', 'Chrome OS', 'Linux'] },
          { name: '화면크기', type: 'text', required: false, placeholder: '예: 15.6인치' },
        ],
      },
      
      // 식품 카테고리
      {
        categoryName: '신선식품',
        keywords: ['신선', '과일', '채소', '고기', '생선', '유기농', '국산'],
        patterns: ['신선', '과일', '채소', '유기농'],
        weight: 1.0,
        confidence: 80,
        reason: '신선식품 관련 키워드가 포함됨',
        attributes: [
          { name: '원산지', type: 'text', required: true, placeholder: '예: 국산' },
          { name: '보관방법', type: 'select', required: true, options: ['냉장', '냉동', '실온', '건조'] },
          { name: '유통기한', type: 'text', required: true, placeholder: '예: 제조일로부터 7일' },
          { name: '중량/용량', type: 'text', required: true, placeholder: '예: 1kg' },
          { name: '등급', type: 'select', required: false, options: ['특', '상', '보통'] },
        ],
      },
      {
        categoryName: '가공식품',
        keywords: ['라면', '과자', '음료', '커피', '차', '즉석', '냉동'],
        patterns: ['라면', '과자', '음료', '즉석', '냉동'],
        weight: 1.0,
        confidence: 82,
        reason: '가공식품 관련 키워드가 포함됨',
        attributes: [
          { name: '제조사', type: 'text', required: true, placeholder: '예: 농심' },
          { name: '용량', type: 'text', required: true, placeholder: '예: 120g' },
          { name: '유통기한', type: 'text', required: true, placeholder: '예: 제조일로부터 6개월' },
          { name: '알레르기 정보', type: 'text', required: false, placeholder: '예: 밀, 대두 함유' },
          { name: '보관방법', type: 'select', required: true, options: ['실온', '냉장', '냉동'] },
        ],
      },
      
      // 뷰티/화장품 카테고리
      {
        categoryName: '스킨케어',
        keywords: ['스킨케어', '화장품', '로션', '크림', '세럼', '토너', '클렌징'],
        patterns: ['스킨케어', '로션', '크림', '세럼'],
        weight: 1.0,
        confidence: 87,
        reason: '스킨케어 제품 관련 키워드가 포함됨',
        attributes: [
          { name: '브랜드', type: 'text', required: true, placeholder: '예: 설화수' },
          { name: '용량', type: 'text', required: true, placeholder: '예: 150ml' },
          { name: '피부타입', type: 'select', required: true, options: ['모든피부', '건성', '지성', '복합성', '민감성'] },
          { name: '주요성분', type: 'text', required: false, placeholder: '예: 히알루론산, 나이아신아마이드' },
          { name: '사용법', type: 'text', required: false, placeholder: '예: 아침/저녁 세안 후 사용' },
        ],
      },
      
      // 생활용품 카테고리
      {
        categoryName: '청소/세탁용품',
        keywords: ['세제', '청소', '세탁', '섬유유연제', '표백제', '클리너'],
        patterns: ['세제', '청소', '세탁', '클리너'],
        weight: 1.0,
        confidence: 85,
        reason: '청소/세탁용품 관련 키워드가 포함됨',
        attributes: [
          { name: '용도', type: 'select', required: true, options: ['의류세탁', '주방청소', '화장실청소', '다목적'] },
          { name: '용량', type: 'text', required: true, placeholder: '예: 2.5L' },
          { name: '성분', type: 'text', required: false, placeholder: '예: 계면활성제, 효소' },
          { name: '향', type: 'select', required: false, options: ['무향', '라벤더', '시트러스', '기타'] },
        ],
      },
      
      // 스포츠/레저 카테고리
      {
        categoryName: '운동용품',
        keywords: ['운동', '헬스', '요가', '런닝', '피트니스', '덤벨', '매트'],
        patterns: ['운동', '헬스', '요가', '피트니스'],
        weight: 1.0,
        confidence: 83,
        reason: '운동용품 관련 키워드가 포함됨',
        attributes: [
          { name: '운동종목', type: 'select', required: true, options: ['헬스', '요가', '필라테스', '러닝', '기타'] },
          { name: '소재', type: 'text', required: true, placeholder: '예: 천연고무, 스테인리스스틸' },
          { name: '크기/중량', type: 'text', required: true, placeholder: '예: 5kg, 183cm' },
          { name: '사용법', type: 'text', required: false, placeholder: '사용 방법 및 주의사항' },
        ],
      },
      
      // 반려동물 카테고리
      {
        categoryName: '반려동물용품',
        keywords: ['강아지', '고양이', '반려동물', '사료', '간식', '장난감', '용품'],
        patterns: ['강아지', '고양이', '반려동물', '사료'],
        weight: 1.0,
        confidence: 86,
        reason: '반려동물용품 관련 키워드가 포함됨',
        attributes: [
          { name: '대상동물', type: 'select', required: true, options: ['강아지', '고양이', '공통'] },
          { name: '연령대', type: 'select', required: true, options: ['퍼피/키튼', '어덜트', '시니어', '전연령'] },
          { name: '크기', type: 'select', required: false, options: ['소형견', '중형견', '대형견', '모든크기'] },
          { name: '주요기능', type: 'text', required: false, placeholder: '예: 치석제거, 면역력강화' },
        ],
      },
    ];
  }

  /**
   * ID 생성 유틸리티
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 현재 규칙 목록 반환
   */
  getRules(): CategoryRule[] {
    return [...this.rules];
  }

  /**
   * 카테고리 규칙 삭제
   */
  removeRule(categoryName: string): boolean {
    const index = this.rules.findIndex(r => r.categoryName === categoryName);
    if (index >= 0) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 카테고리 검색
   */
  searchCategories(query: string): CategoryRule[] {
    const lowerQuery = query.toLowerCase();
    return this.rules.filter(rule => 
      rule.categoryName.toLowerCase().includes(lowerQuery) ||
      rule.keywords.some(keyword => keyword.includes(lowerQuery))
    );
  }
}

/**
 * 카테고리 통계 분석 유틸리티
 */
export const CategoryAnalytics = {
  /**
   * 키워드별 카테고리 분포 분석
   */
  analyzeCategoryDistribution(
    keywords: Keyword[],
    recommender: CategoryRecommender
  ): Record<string, number> {
    const categoryCount: Record<string, number> = {};
    
    keywords.forEach(keyword => {
      const recommendations = recommender.recommendCategories([keyword], undefined, 1);
      if (recommendations.length > 0) {
        const category = recommendations[0].suggestion.name;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });
    
    return categoryCount;
  },

  /**
   * 신뢰도별 추천 품질 분석
   */
  analyzeRecommendationQuality(
    recommendations: CategoryRecommendationDetail[]
  ): {
    averageConfidence: number;
    highConfidenceCount: number;
    lowConfidenceCount: number;
    qualityScore: number;
  } {
    if (recommendations.length === 0) {
      return {
        averageConfidence: 0,
        highConfidenceCount: 0,
        lowConfidenceCount: 0,
        qualityScore: 0,
      };
    }

    const confidences = recommendations.map(r => r.suggestion.confidence);
    const averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const highConfidenceCount = confidences.filter(c => c >= 80).length;
    const lowConfidenceCount = confidences.filter(c => c < 50).length;
    const qualityScore = (highConfidenceCount / recommendations.length) * 100;

    return {
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      highConfidenceCount,
      lowConfidenceCount,
      qualityScore: Math.round(qualityScore * 100) / 100,
    };
  },
};