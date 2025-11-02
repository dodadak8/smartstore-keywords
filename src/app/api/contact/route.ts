/**
 * Contact Form API Route
 * - Resend를 사용한 이메일 전송
 * - 폼 유효성 검증
 * - Rate limiting (서버 사이드)
 * - 스팸 방지 (허니팟)
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend 초기화
const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting을 위한 Map (실제 프로덕션에서는 Redis 사용 권장)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit 체크 함수
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    // 새로운 rate limit 설정 (1시간에 5회)
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + 60 * 60 * 1000, // 1시간
    });
    return true;
  }

  if (limit.count >= 5) {
    return false;
  }

  limit.count++;
  return true;
}

// 폼 데이터 유효성 검증
function validateFormData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 이름 검증
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('이름은 2글자 이상이어야 합니다.');
  }

  // 이메일 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  }

  // 카테고리 검증
  const validCategories = ['general', 'feature', 'bug', 'support', 'business', 'other'];
  if (!data.category || !validCategories.includes(data.category)) {
    errors.push('올바른 문의 유형을 선택해주세요.');
  }

  // 제목 검증
  if (!data.subject || typeof data.subject !== 'string' || data.subject.trim().length < 5) {
    errors.push('제목은 5글자 이상이어야 합니다.');
  }

  // 내용 검증
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('문의 내용은 10글자 이상이어야 합니다.');
  }

  // 허니팟 검증 (스팸 방지)
  if (data.honeypot) {
    errors.push('스팸으로 감지되었습니다.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function POST(request: NextRequest) {
  try {
    // IP 주소 가져오기 (rate limiting용)
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Rate limit 체크
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: '너무 많은 요청을 보내고 있습니다. 1시간 후에 다시 시도해주세요.'
        },
        { status: 429 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();

    // 유효성 검증
    const validation = validateFormData(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors
        },
        { status: 400 }
      );
    }

    // Resend API 키 확인
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY가 설정되지 않았습니다.');
      return NextResponse.json(
        {
          success: false,
          error: '이메일 서비스가 설정되지 않았습니다. 관리자에게 문의해주세요.'
        },
        { status: 500 }
      );
    }

    // 카테고리 한글 변환
    const categoryLabels: { [key: string]: string } = {
      general: '일반 문의',
      feature: '기능 제안',
      bug: '버그 신고',
      support: '사용법 문의',
      business: '비즈니스 문의',
      other: '기타',
    };

    // 이메일 전송
    const { data, error } = await resend.emails.send({
      from: 'PowerSeller <onboarding@resend.dev>', // Resend 기본 발신 주소
      to: process.env.CONTACT_EMAIL || 'your-email@example.com', // 수신할 이메일 주소
      replyTo: body.email, // 사용자 이메일로 답장 가능
      subject: `[파워셀러 문의] ${categoryLabels[body.category]} - ${body.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { margin-bottom: 15px; }
            .label { font-weight: bold; color: #4b5563; }
            .value { color: #1f2937; margin-top: 5px; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">⚡ 파워셀러 문의</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">새로운 문의가 접수되었습니다</p>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">📋 문의 유형</div>
                <div class="value">${categoryLabels[body.category]}</div>
              </div>
              <div class="info-row">
                <div class="label">👤 이름</div>
                <div class="value">${body.name}</div>
              </div>
              <div class="info-row">
                <div class="label">📧 이메일</div>
                <div class="value">${body.email}</div>
              </div>
              <div class="info-row">
                <div class="label">📝 제목</div>
                <div class="value">${body.subject}</div>
              </div>
              <div class="message-box">
                <div class="label">💬 문의 내용</div>
                <div class="value" style="white-space: pre-wrap; margin-top: 10px;">${body.message}</div>
              </div>
              <div class="footer">
                <p>📅 접수 시간: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
                <p>이 이메일에 답장하면 문의자에게 직접 회신됩니다.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend API 에러:', error);
      return NextResponse.json(
        {
          success: false,
          error: '이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.'
        },
        { status: 500 }
      );
    }

    // 성공 응답
    return NextResponse.json(
      {
        success: true,
        message: '문의가 성공적으로 전송되었습니다.',
        id: data?.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact API 에러:', error);
    return NextResponse.json(
      {
        success: false,
        error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      },
      { status: 500 }
    );
  }
}

// OPTIONS 요청 처리 (CORS)
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
