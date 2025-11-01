/**
 * 키워드 점수 계산 알고리즘
 * - 기회지수 계산: 검색량과 경쟁도를 기반으로 키워드의 기회도 측정
 * - 가중치 적용: 태그, CTR 등의 추가 요소 반영
 * - 정규화: 서로 다른 범위의 값들을 0-100 범위로 정규화
 */

import { Keyword, AlgorithmWeights, KeywordTag } from '../types';

/**
 * 키워드 점수 계산 결과 인터페이스
 */
export interface KeywordScoreResult {
  score: number; // 최종 기회지수 점수 (0-100)
  normalizedVolume: number; // 정규화된 검색량 (0-1)
  normalizedCompetition: number; // 정규화된 경쟁도 (0-1)
  tagWeight: number; // 태그 가중치 (0-1)
  breakdown: { // 점수 세부 분해
    volumeScore: number; // 검색량 점수
    competitionPenalty: number; // 경쟁도 패널티
    tagBonus: number; // 태그 보너스
    ctrBonus?: number; // CTR 보너스 (선택사항)
  };
  explanation: string; // 점수 산출 근거 설명
}

/**
 * 키워드 그룹별 통계 정보
 */
export interface KeywordGroupStats {
  minVolume: number;
  maxVolume: number;
  avgVolume: number;
  minCompetition: number;
  maxCompetition: number;
  avgCompetition: number;
  totalKeywords: number;
}

/**
 * 키워드 점수 계산기 클래스
 */
export class KeywordScorer {
  private weights: AlgorithmWeights;
  private groupStats: KeywordGroupStats | null = null;

  /**
   * 생성자
   * @param weights 알고리즘 가중치 설정
   */
  constructor(weights: AlgorithmWeights) {
    this.weights = weights;
  }

  /**
   * 키워드 그룹의 통계 정보 계산
   * - 정규화를 위해 전체 키워드 그룹의 최소/최대값 필요
   * @param keywords 전체 키워드 목록
   */
  calculateGroupStats(keywords: Keyword[]): KeywordGroupStats {
    if (keywords.length === 0) {
      return {
        minVolume: 0,
        maxVolume: 1,
        avgVolume: 0,
        minCompetition: 0,
        maxCompetition: 1,
        avgCompetition: 0,
        totalKeywords: 0,
      };
    }

    const volumes = keywords.map(k => k.volume);
    const competitions = keywords.map(k => k.competition);

    const stats: KeywordGroupStats = {
      minVolume: Math.min(...volumes),
      maxVolume: Math.max(...volumes),
      avgVolume: volumes.reduce((a, b) => a + b, 0) / volumes.length,
      minCompetition: Math.min(...competitions),
      maxCompetition: Math.max(...competitions),
      avgCompetition: competitions.reduce((a, b) => a + b, 0) / competitions.length,
      totalKeywords: keywords.length,
    };

    this.groupStats = stats;
    return stats;
  }

  /**
   * 단일 키워드 점수 계산
   * @param keyword 점수를 계산할 키워드
   * @param groupStats 그룹 통계 (선택사항, 없으면 기본값 사용)
   * @returns 키워드 점수 계산 결과
   */
  calculateScore(keyword: Keyword, groupStats?: KeywordGroupStats): KeywordScoreResult {
    const stats = groupStats || this.groupStats || this.getDefaultStats();

    // 1. 검색량 정규화 (0-1)
    const normalizedVolume = this.normalizeVolume(keyword.volume, stats);

    // 2. 경쟁도 정규화 (0-1, 이미 0-100 범위이므로 100으로 나누기)
    const normalizedCompetition = keyword.competition / 100;

    // 3. 태그 가중치 계산
    const tagWeight = this.calculateTagWeight(keyword.tags);

    // 4. 기본 기회지수 계산
    // 공식: (정규화된 검색량 * 검색량 가중치 + 태그 가중치 * 태그 가중치) / (정규화된 경쟁도 + 1)
    const volumeScore = normalizedVolume * this.weights.volume;
    const competitionPenalty = normalizedCompetition * this.weights.competition;
    const tagBonus = tagWeight * this.weights.tag;

    // 5. CTR 보너스 계산 (선택사항)
    let ctrBonus = 0;
    if (keyword.weight && this.weights.ctr) {
      ctrBonus = keyword.weight * this.weights.ctr;
    }

    // 6. 최종 점수 계산
    const rawScore = (volumeScore + tagBonus + ctrBonus) / (competitionPenalty + 1);
    
    // 7. 점수를 0-100 범위로 조정
    const finalScore = Math.min(100, Math.max(0, rawScore * 100));

    // 8. 설명 생성
    const explanation = this.generateExplanation(keyword, {
      normalizedVolume,
      normalizedCompetition,
      tagWeight,
      volumeScore,
      competitionPenalty,
      tagBonus,
      ctrBonus,
      finalScore,
    });

    return {
      score: Math.round(finalScore * 100) / 100, // 소수점 2자리
      normalizedVolume,
      normalizedCompetition,
      tagWeight,
      breakdown: {
        volumeScore,
        competitionPenalty,
        tagBonus,
        ctrBonus: ctrBonus > 0 ? ctrBonus : undefined,
      },
      explanation,
    };
  }

  /**
   * 키워드 목록 일괄 점수 계산
   * @param keywords 점수를 계산할 키워드 목록
   * @returns 점수가 계산된 키워드 목록
   */
  calculateScores(keywords: Keyword[]): Keyword[] {
    // 그룹 통계 계산
    const stats = this.calculateGroupStats(keywords);

    // 각 키워드 점수 계산
    return keywords.map(keyword => {
      const scoreResult = this.calculateScore(keyword, stats);
      return {
        ...keyword,
        score: scoreResult.score,
      };
    });
  }

  /**
   * 검색량 정규화 (0-1 범위)
   * - 로그 스케일을 사용하여 큰 차이나는 검색량을 부드럽게 정규화
   */
  private normalizeVolume(volume: number, stats: KeywordGroupStats): number {
    if (stats.maxVolume === stats.minVolume) {
      return 0.5; // 모든 값이 같으면 중간값
    }

    // 로그 정규화 (검색량이 매우 큰 차이날 수 있어서)
    const logVolume = Math.log(volume + 1);
    const logMin = Math.log(stats.minVolume + 1);
    const logMax = Math.log(stats.maxVolume + 1);

    return (logVolume - logMin) / (logMax - logMin);
  }

  /**
   * 태그 기반 가중치 계산
   * - 태그의 종류와 개수에 따라 가중치 부여
   */
  private calculateTagWeight(tags: KeywordTag[]): number {
    if (tags.length === 0) {
      return 0;
    }

    // 태그별 가중치 정의
    const tagWeights: Record<KeywordTag, number> = {
      trending: 0.8,     // 트렌드 키워드
      longtail: 0.6,     // 롱테일 키워드
      seasonal: 0.4,     // 계절성 키워드
      event: 0.3,        // 이벤트성 키워드
      brand: 0.7,        // 브랜드 키워드
      category: 0.5,     // 카테고리 키워드
      feature: 0.4,      // 특징/기능 키워드
      custom: 0.2,       // 사용자 정의 키워드
    };

    // 태그 가중치 평균 계산
    const totalWeight = tags.reduce((sum, tag) => sum + tagWeights[tag], 0);
    const avgWeight = totalWeight / tags.length;

    // 태그 수에 따른 보너스 (최대 3개까지)
    const tagCountBonus = Math.min(tags.length / 3, 1) * 0.2;

    return Math.min(1, avgWeight + tagCountBonus);
  }

  /**
   * 점수 계산 설명 생성
   */
  private generateExplanation(keyword: Keyword, breakdown: Record<string, unknown>): string {
    const explanations: string[] = [];

    // 검색량 설명
    const normalizedVolume = breakdown.normalizedVolume as number;
    if (normalizedVolume > 0.8) {
      explanations.push('높은 검색량으로 노출 기회가 많습니다');
    } else if (normalizedVolume > 0.5) {
      explanations.push('적당한 검색량으로 안정적인 노출이 가능합니다');
    } else {
      explanations.push('낮은 검색량이지만 틈새 시장 공략이 가능합니다');
    }

    // 경쟁도 설명
    const normalizedCompetition = breakdown.normalizedCompetition as number;
    if (normalizedCompetition < 0.3) {
      explanations.push('낮은 경쟁도로 상위 노출이 유리합니다');
    } else if (normalizedCompetition < 0.7) {
      explanations.push('중간 경쟁도로 적절한 노력이 필요합니다');
    } else {
      explanations.push('높은 경쟁도로 치열한 경쟁이 예상됩니다');
    }

    // 태그 설명
    if (keyword.tags.length > 0) {
      const tagDescriptions: Record<KeywordTag, string> = {
        trending: '트렌딩 키워드',
        longtail: '롱테일 키워드',
        seasonal: '계절성 키워드',
        event: '이벤트성 키워드',
        brand: '브랜드 키워드',
        category: '카테고리 키워드',
        feature: '특징 키워드',
        custom: '커스텀 키워드',
      };

      const tagNames = keyword.tags.map(tag => tagDescriptions[tag]).join(', ');
      explanations.push(`${tagNames} 특성을 가집니다`);
    }

    // CTR 보너스 설명
    const ctrBonus = breakdown.ctrBonus as number;
    if (ctrBonus > 0) {
      explanations.push('높은 CTR 가중치가 적용되었습니다');
    }

    return explanations.join('. ') + '.';
  }

  /**
   * 기본 통계값 반환 (그룹 통계가 없을 때 사용)
   */
  private getDefaultStats(): KeywordGroupStats {
    return {
      minVolume: 0,
      maxVolume: 10000,
      avgVolume: 1000,
      minCompetition: 0,
      maxCompetition: 100,
      avgCompetition: 50,
      totalKeywords: 1,
    };
  }

  /**
   * 가중치 업데이트
   */
  updateWeights(weights: AlgorithmWeights): void {
    this.weights = weights;
  }

  /**
   * 현재 가중치 반환
   */
  getWeights(): AlgorithmWeights {
    return { ...this.weights };
  }
}

/**
 * 키워드 추천 알고리즘
 * - 점수 기반으로 상위 N개 키워드 추천
 * - 다양성을 고려한 추천 (같은 태그 키워드만 추천하지 않도록)
 */
export class KeywordRecommender {
  private scorer: KeywordScorer;

  constructor(weights: AlgorithmWeights) {
    this.scorer = new KeywordScorer(weights);
  }

  /**
   * 상위 N개 키워드 추천
   * @param keywords 전체 키워드 목록
   * @param count 추천할 키워드 수
   * @param diversityFactor 다양성 계수 (0-1, 높을수록 다양한 태그 선호)
   * @returns 추천 키워드 목록과 추천 이유
   */
  recommend(
    keywords: Keyword[], 
    count: number = 10, 
    diversityFactor: number = 0.3
  ): Array<{ keyword: Keyword; score: number; reason: string }> {
    // 1. 모든 키워드 점수 계산
    const scoredKeywords = this.scorer.calculateScores(keywords);

    // 2. 점수순 정렬
    const sortedKeywords = scoredKeywords.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 3. 다양성을 고려한 추천
    const recommendations: Array<{ keyword: Keyword; score: number; reason: string }> = [];
    const usedTags = new Set<KeywordTag>();

    for (const keyword of sortedKeywords) {
      if (recommendations.length >= count) break;

      // 다양성 검사
      const keywordTags = new Set(keyword.tags);
      const tagOverlap = Array.from(keywordTags).some(tag => usedTags.has(tag));

      // 점수가 매우 높거나, 태그 중복이 없거나, 다양성 요구가 낮으면 추천
      const shouldRecommend = 
        (keyword.score || 0) > 80 || // 매우 높은 점수
        !tagOverlap || // 태그 중복 없음
        Math.random() > diversityFactor; // 다양성 요구 확률적 적용

      if (shouldRecommend) {
        recommendations.push({
          keyword,
          score: keyword.score || 0,
          reason: this.generateRecommendationReason(keyword),
        });

        // 사용된 태그 추가
        keyword.tags.forEach(tag => usedTags.add(tag));
      }
    }

    return recommendations;
  }

  /**
   * 추천 이유 생성
   */
  private generateRecommendationReason(keyword: Keyword): string {
    const scoreResult = this.scorer.calculateScore(keyword);
    const score = scoreResult.score;

    if (score >= 90) {
      return '매우 높은 기회지수로 최우선 추천 키워드입니다';
    } else if (score >= 70) {
      return '높은 기회지수로 적극 추천하는 키워드입니다';
    } else if (score >= 50) {
      return '적당한 기회지수로 고려해볼만한 키워드입니다';
    } else {
      return '낮은 경쟁도나 특별한 태그 특성으로 추천된 키워드입니다';
    }
  }
}

/**
 * 키워드 분석 유틸리티 함수들
 */
export const KeywordAnalytics = {
  /**
   * 키워드 분포 분석
   */
  analyzeDistribution(keywords: Keyword[]): {
    volumeDistribution: { low: number; medium: number; high: number };
    competitionDistribution: { low: number; medium: number; high: number };
    tagDistribution: Record<KeywordTag, number>;
  } {
    const scorer = new KeywordScorer({ volume: 0.7, competition: 0.3, tag: 0.1 });
    const stats = scorer.calculateGroupStats(keywords);

    const volumeDistribution = { low: 0, medium: 0, high: 0 };
    const competitionDistribution = { low: 0, medium: 0, high: 0 };
    const tagDistribution = {} as Record<KeywordTag, number>;

    keywords.forEach(keyword => {
      // 검색량 분포
      const volumePercentile = keyword.volume / stats.maxVolume;
      if (volumePercentile < 0.33) volumeDistribution.low++;
      else if (volumePercentile < 0.67) volumeDistribution.medium++;
      else volumeDistribution.high++;

      // 경쟁도 분포
      if (keyword.competition < 33) competitionDistribution.low++;
      else if (keyword.competition < 67) competitionDistribution.medium++;
      else competitionDistribution.high++;

      // 태그 분포
      keyword.tags.forEach(tag => {
        tagDistribution[tag] = (tagDistribution[tag] || 0) + 1;
      });
    });

    return { volumeDistribution, competitionDistribution, tagDistribution };
  },

  /**
   * 기회 키워드 식별 (높은 검색량 + 낮은 경쟁도)
   */
  findOpportunityKeywords(keywords: Keyword[], threshold: number = 70): Keyword[] {
    const scorer = new KeywordScorer({ volume: 0.7, competition: 0.3, tag: 0.1 });
    const scoredKeywords = scorer.calculateScores(keywords);
    
    return scoredKeywords.filter(keyword => (keyword.score || 0) >= threshold);
  },

  /**
   * 키워드 갭 분석 (경쟁자는 없지만 우리가 놓친 키워드)
   */
  findKeywordGaps(
    ourKeywords: Keyword[], 
    competitorKeywords: string[]
  ): { missing: string[]; opportunities: string[] } {
    const ourTerms = new Set(ourKeywords.map(k => k.term.toLowerCase()));
    const competitorTerms = competitorKeywords.map(t => t.toLowerCase());

    const missing = competitorTerms.filter(term => !ourTerms.has(term));
    
    // 경쟁도가 낮은 키워드들을 기회로 분류
    const opportunities = missing.filter(() => Math.random() < 0.3); // 임시: 실제로는 경쟁도 데이터 필요

    return { missing, opportunities };
  },
};