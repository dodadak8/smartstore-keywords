/**
 * CSV 파싱 유틸리티
 * - 키워드 데이터 CSV 파일 파싱
 * - 업로드 파일 검증 및 변환
 * - 에러 처리 및 데이터 정제
 * - Excel/Google Sheets 호환성
 */

import { KeywordCSVRow, Keyword, KeywordTag, ValidationResult, FormError } from '../types';

/**
 * CSV 파싱 설정 인터페이스
 */
export interface CSVParseConfig {
  delimiter: string; // 구분자 (기본: ',')
  hasHeader: boolean; // 헤더 행 존재 여부
  maxRows: number; // 최대 행 수 제한
  maxFileSize: number; // 최대 파일 크기 (bytes)
  requiredFields: string[]; // 필수 필드명
  encoding: string; // 인코딩 (기본: 'utf-8')
}

/**
 * CSV 파싱 결과 인터페이스
 */
export interface CSVParseResult {
  success: boolean;
  data: KeywordCSVRow[];
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    validRows: number;
    errorRows: number;
    skippedRows: number;
  };
}

/**
 * 키워드 변환 결과 인터페이스
 */
export interface KeywordConversionResult {
  keywords: Omit<Keyword, 'id' | 'created_at' | 'updated_at'>[];
  errors: string[];
  warnings: string[];
}

/**
 * CSV 파서 클래스
 */
export class CSVParser {
  private config: CSVParseConfig;

  constructor(config?: Partial<CSVParseConfig>) {
    this.config = {
      delimiter: ',',
      hasHeader: true,
      maxRows: 1000,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      requiredFields: ['term', 'volume', 'competition'],
      encoding: 'utf-8',
      ...config,
    };
  }

  /**
   * CSV 파일 파싱 (File 객체)
   * @param file 업로드된 CSV 파일
   * @returns 파싱 결과
   */
  async parseFile(file: File): Promise<CSVParseResult> {
    // 1. 파일 검증
    const fileValidation = this.validateFile(file);
    if (!fileValidation.isValid) {
      return {
        success: false,
        data: [],
        errors: fileValidation.errors.map(e => e.message),
        warnings: [],
        stats: { totalRows: 0, validRows: 0, errorRows: 0, skippedRows: 0 },
      };
    }

    try {
      // 2. 파일 내용 읽기
      const content = await this.readFileContent(file);
      
      // 3. CSV 텍스트 파싱
      return this.parseText(content);
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [`파일 읽기 실패: ${error}`],
        warnings: [],
        stats: { totalRows: 0, validRows: 0, errorRows: 0, skippedRows: 0 },
      };
    }
  }

  /**
   * CSV 텍스트 직접 파싱
   * @param csvText CSV 형식의 텍스트
   * @returns 파싱 결과
   */
  parseText(csvText: string): CSVParseResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const data: KeywordCSVRow[] = [];
    
    try {
      // 1. 행별 분리
      const lines = this.splitLines(csvText);
      
      if (lines.length === 0) {
        return {
          success: false,
          data: [],
          errors: ['빈 파일입니다.'],
          warnings: [],
          stats: { totalRows: 0, validRows: 0, errorRows: 0, skippedRows: 0 },
        };
      }

      // 2. 헤더 처리
      let startRow = 0;
      let headers: string[] = [];
      
      if (this.config.hasHeader) {
        headers = this.parseRow(lines[0]);
        startRow = 1;
        
        // 헤더 검증
        const headerValidation = this.validateHeaders(headers);
        if (!headerValidation.isValid) {
          errors.push(...headerValidation.errors.map(e => e.message));
        }
      } else {
        // 기본 헤더 사용
        headers = ['term', 'volume', 'competition', 'weight', 'notes', 'tags'];
      }

      // 3. 데이터 행 처리
      let validRows = 0;
      let errorRows = 0;
      let skippedRows = 0;

      for (let i = startRow; i < lines.length && i - startRow < this.config.maxRows; i++) {
        const line = lines[i].trim();
        
        // 빈 행 건너뛰기
        if (!line) {
          skippedRows++;
          continue;
        }

        try {
          const values = this.parseRow(line);
          const rowData = this.convertRowToKeywordData(headers, values);
          
          if (rowData) {
            data.push(rowData);
            validRows++;
          } else {
            errorRows++;
          }
        } catch (error) {
          errors.push(`${i + 1}행 파싱 실패: ${error}`);
          errorRows++;
        }
      }

      // 4. 행 수 제한 경고
      if (lines.length - startRow > this.config.maxRows) {
        warnings.push(`최대 ${this.config.maxRows}행까지만 처리됩니다. 총 ${lines.length - startRow}행 중 ${this.config.maxRows}행 처리됨.`);
      }

      return {
        success: validRows > 0,
        data,
        errors,
        warnings,
        stats: {
          totalRows: lines.length - startRow,
          validRows,
          errorRows,
          skippedRows,
        },
      };

    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [`CSV 파싱 실패: ${error}`],
        warnings: [],
        stats: { totalRows: 0, validRows: 0, errorRows: 0, skippedRows: 0 },
      };
    }
  }

  /**
   * KeywordCSVRow를 Keyword 객체로 변환
   * @param csvData CSV 파싱된 데이터
   * @returns 키워드 변환 결과
   */
  convertToKeywords(csvData: KeywordCSVRow[]): KeywordConversionResult {
    const keywords: Omit<Keyword, 'id' | 'created_at' | 'updated_at'>[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    csvData.forEach((row, index) => {
      try {
        // 필수 필드 검증
        if (!row.term || row.term.trim() === '') {
          errors.push(`${index + 1}행: 키워드(term)는 필수입니다.`);
          return;
        }

        // 데이터 타입 변환
        const volume = this.parseNumber(row.volume);
        const competition = this.parseNumber(row.competition);
        
        if (volume === null || competition === null) {
          errors.push(`${index + 1}행: 검색량과 경쟁도는 숫자여야 합니다.`);
          return;
        }

        // 범위 검증
        if (volume < 0) {
          errors.push(`${index + 1}행: 검색량은 0 이상이어야 합니다.`);
          return;
        }

        if (competition < 0 || competition > 100) {
          errors.push(`${index + 1}행: 경쟁도는 0-100 사이여야 합니다.`);
          return;
        }

        // 가중치 처리 (선택사항)
        let weight: number | undefined;
        if (row.weight !== undefined && row.weight !== '') {
          const parsedWeight = this.parseNumber(row.weight);
          if (parsedWeight !== null) {
            if (parsedWeight < 0 || parsedWeight > 1) {
              warnings.push(`${index + 1}행: 가중치는 0-1 사이 값을 권장합니다.`);
            }
            weight = parsedWeight;
          }
        }

        // 태그 처리
        const tags = this.parseTags(row.tags);

        // 키워드 객체 생성
        const keyword: Omit<Keyword, 'id' | 'created_at' | 'updated_at'> = {
          term: row.term.trim(),
          volume,
          competition,
          weight,
          notes: row.notes?.trim() || undefined,
          tags,
        };

        keywords.push(keyword);

      } catch (error) {
        errors.push(`${index + 1}행 변환 실패: ${error}`);
      }
    });

    return { keywords, errors, warnings };
  }

  /**
   * 샘플 CSV 템플릿 생성
   * @returns CSV 형식의 샘플 데이터
   */
  generateSampleCSV(): string {
    const headers = ['term', 'volume', 'competition', 'weight', 'notes', 'tags'];
    const sampleData = [
      ['스마트폰', '10000', '85', '0.8', '모바일 디바이스', 'trending,category'],
      ['갤럭시', '8500', '90', '0.9', '삼성 브랜드', 'brand,trending'],
      ['아이폰', '12000', '95', '0.95', '애플 브랜드', 'brand,trending'],
      ['무선이어폰', '6000', '70', '0.7', '블루투스 이어폰', 'feature,trending'],
      ['게이밍마우스', '3000', '60', '0.6', '게임용 마우스', 'feature,custom'],
    ];

    const csvLines = [
      headers.join(','),
      ...sampleData.map(row => row.join(',')),
    ];

    return csvLines.join('\n');
  }

  /**
   * 파일 검증
   */
  private validateFile(file: File): ValidationResult {
    const errors: FormError[] = [];

    // 파일 크기 검증
    if (file.size > this.config.maxFileSize) {
      errors.push({
        field: 'file',
        message: `파일 크기가 ${this.config.maxFileSize / 1024 / 1024}MB를 초과합니다.`,
      });
    }

    // 파일 타입 검증
    const allowedTypes = [
      'text/csv', 
      'application/vnd.ms-excel',
      'application/csv',
      'text/plain'
    ];
    
    const hasValidType = allowedTypes.includes(file.type) || 
                        file.name.toLowerCase().endsWith('.csv');

    if (!hasValidType) {
      errors.push({
        field: 'file',
        message: 'CSV 파일만 업로드 가능합니다.',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 파일 내용 읽기
   */
  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error('파일 읽기 실패'));
      };
      
      reader.readAsText(file, this.config.encoding);
    });
  }

  /**
   * CSV 텍스트를 행으로 분리
   */
  private splitLines(csvText: string): string[] {
    // Windows, Unix, Mac 줄바꿈 모두 처리
    return csvText.split(/\r\n|\r|\n/);
  }

  /**
   * CSV 행 파싱 (따옴표 처리 포함)
   */
  private parseRow(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (!inQuotes) {
        if (char === '"' || char === "'") {
          inQuotes = true;
          quoteChar = char;
        } else if (char === this.config.delimiter) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      } else {
        if (char === quoteChar) {
          if (nextChar === quoteChar) {
            // 연속된 따옴표는 이스케이프
            current += char;
            i++; // 다음 문자 건너뛰기
          } else {
            // 따옴표 종료
            inQuotes = false;
            quoteChar = '';
          }
        } else {
          current += char;
        }
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * 헤더 검증
   */
  private validateHeaders(headers: string[]): ValidationResult {
    const errors: FormError[] = [];
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

    // 필수 필드 확인
    this.config.requiredFields.forEach(field => {
      if (!normalizedHeaders.includes(field.toLowerCase())) {
        errors.push({
          field: 'headers',
          message: `필수 필드 '${field}'가 헤더에 없습니다.`,
        });
      }
    });

    // 중복 헤더 확인
    const duplicates = headers.filter((header, index) => 
      headers.indexOf(header) !== index
    );

    if (duplicates.length > 0) {
      errors.push({
        field: 'headers',
        message: `중복된 헤더: ${duplicates.join(', ')}`,
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * 행 데이터를 KeywordCSVRow로 변환
   */
  private convertRowToKeywordData(
    headers: string[], 
    values: string[]
  ): KeywordCSVRow | null {
    if (values.length === 0) return null;

    const rowData: Record<string, unknown> = {};
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

    // 헤더와 값 매핑
    normalizedHeaders.forEach((header, index) => {
      const value = values[index] || '';
      
      switch (header) {
        case 'term':
        case 'keyword':
        case '키워드':
          rowData.term = value;
          break;
        case 'volume':
        case 'search_volume':
        case '검색량':
          rowData.volume = value;
          break;
        case 'competition':
        case 'comp':
        case '경쟁도':
          rowData.competition = value;
          break;
        case 'weight':
        case 'ctr':
        case '가중치':
          rowData.weight = value;
          break;
        case 'notes':
        case 'memo':
        case '메모':
          rowData.notes = value;
          break;
        case 'tags':
        case 'tag':
        case '태그':
          rowData.tags = value;
          break;
      }
    });

    // 필수 필드 확인
    if (!rowData.term) {
      return null;
    }

    return rowData as unknown as KeywordCSVRow;
  }

  /**
   * 문자열을 숫자로 변환
   */
  private parseNumber(value: string | number): number | null {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value !== 'string' || value.trim() === '') {
      return null;
    }

    // 쉼표 제거 및 공백 제거
    const cleanValue = value.replace(/,/g, '').trim();
    const parsed = parseFloat(cleanValue);

    if (isNaN(parsed)) {
      return null;
    }

    return parsed;
  }

  /**
   * 태그 문자열 파싱
   */
  private parseTags(tagString?: string): KeywordTag[] {
    if (!tagString || tagString.trim() === '') {
      return [];
    }

    const validTags: KeywordTag[] = [
      'seasonal', 'event', 'longtail', 'trending', 
      'brand', 'category', 'feature', 'custom'
    ];

    return tagString
      .split(/[,;|]/) // 쉼표, 세미콜론, 파이프로 분리
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => validTags.includes(tag as KeywordTag))
      .map(tag => tag as KeywordTag);
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<CSVParseConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 현재 설정 반환
   */
  getConfig(): CSVParseConfig {
    return { ...this.config };
  }
}

/**
 * CSV 내보내기 유틸리티
 */
export class CSVExporter {
  /**
   * 키워드 목록을 CSV로 변환
   * @param keywords 키워드 목록
   * @param includeScore 점수 포함 여부
   * @returns CSV 문자열
   */
  static exportKeywords(keywords: Keyword[], includeScore: boolean = true): string {
    const headers = ['term', 'volume', 'competition', 'weight', 'notes', 'tags'];
    if (includeScore) {
      headers.push('score');
    }

    const rows = keywords.map(keyword => {
      const row = [
        this.escapeCSVField(keyword.term),
        keyword.volume.toString(),
        keyword.competition.toString(),
        keyword.weight?.toString() || '',
        this.escapeCSVField(keyword.notes || ''),
        keyword.tags.join('|'),
      ];

      if (includeScore) {
        row.push(keyword.score?.toString() || '');
      }

      return row.join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * CSV 필드 이스케이프 처리
   */
  private static escapeCSVField(value: string): string {
    if (!value) return '';
    
    // 쉼표, 따옴표, 줄바꿈이 포함된 경우 따옴표로 감싸기
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }

  /**
   * 파일 다운로드 트리거
   * @param content CSV 내용
   * @param filename 파일명
   */
  static downloadCSV(content: string, filename: string = 'keywords.csv'): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
}