/**
 * 알고리즘 패키지 엔트리 포인트
 * - 키워드 점수 계산, 상품명 생성, 카테고리 추천 등 핵심 알고리즘 기능 제공
 * - 각 알고리즘은 독립적으로 사용 가능하며 설정을 통해 커스터마이징 가능
 */

// 키워드 점수 계산 관련
export {
  KeywordScorer,
  KeywordRecommender,
  KeywordAnalytics,
  type KeywordScoreResult,
  type KeywordGroupStats,
} from './keyword-scoring';

// 상품명 생성 관련
export {
  TitleGenerator,
  DEFAULT_TITLE_CONFIG,
  type TitleGenerationConfig,
  type TitleQualityScore,
} from './title-generator';

// 카테고리 추천 관련
export {
  CategoryRecommender,
  CategoryAnalytics,
  type CategoryRule,
  type CategoryRecommendationDetail,
} from './category-recommender';

// 공통 타입들 (재export)
export type {
  Keyword,
  ProductTitleComponents,
  ProductTitle,
  TitleTemplate,
  CategorySuggestion,
  CategoryAttribute,
  AlgorithmWeights,
} from '../types';

/**
 * 알고리즘 패키지 정보
 */
export const ALGORITHM_PACKAGE_INFO = {
  version: '1.0.0',
  algorithms: {
    keywordScoring: '키워드 기회지수 계산',
    titleGeneration: '상품명 자동 생성',
    categoryRecommendation: '카테고리 추천',
  },
  features: [
    '키워드 점수 계산 및 추천',
    '다양한 패턴의 상품명 생성',
    '띄어쓰기 A/B 테스트 지원',
    '룰 기반 카테고리 추천',
    '품질 평가 및 개선 제안',
    '커스터마이징 가능한 설정',
  ],
} as const;