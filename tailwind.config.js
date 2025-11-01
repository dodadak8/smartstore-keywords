/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 색상 팔레트 확장
      colors: {
        primary: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          200: '#e1e5e9',
          300: '#d2d7dc',
          400: '#9aa0a6',
          500: '#5f6368',
          600: '#3c4043',
          700: '#202124',
          800: '#1a1a1a',
          900: '#000000',
          DEFAULT: '#000000',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      
      // 폰트 패밀리
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      
      // 폰트 크기 확장
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
      },
      
      // 간격 확장
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
      },
      
      // 화면 크기 (반응형 중단점)
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      
      // 그림자 확장
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'focus': '0 0 0 3px rgba(0, 0, 0, 0.1)',
      },
      
      // 애니메이션 확장
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      
      // 키프레임 정의
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      
      // 트랜지션 확장
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      // 경계선 반지름 확장
      borderRadius: {
        'xs': '0.125rem',
        'sm': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      // Z-index 값 정의
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      }
    }
  },
  plugins: [
    // 폼 스타일링 플러그인
    require('@tailwindcss/forms')({
      strategy: 'class', // 클래스 기반 적용
    }),
    
    // 타이포그래피 플러그인 (옵션)
    // require('@tailwindcss/typography'),
    
    // 커스텀 플러그인
    function({ addUtilities, addComponents, theme }) {
      // 접근성 유틸리티 클래스
      addUtilities({
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          'white-space': 'nowrap',
          border: '0',
        },
        '.focus-visible': {
          '&:focus-visible': {
            outline: `2px solid ${theme('colors.primary.DEFAULT')}`,
            'outline-offset': '2px',
          }
        },
        '.focus-ring': {
          '&:focus': {
            outline: 'none',
            'box-shadow': `0 0 0 3px ${theme('colors.primary.DEFAULT')}40`,
          }
        }
      });
      
      // 컴포넌트 스타일
      addComponents({
        '.btn': {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'border-radius': theme('borderRadius.md'),
          'font-weight': theme('fontWeight.medium'),
          'text-decoration': 'none',
          transition: `all ${theme('transitionDuration.150')} ease-in-out`,
          border: '1px solid transparent',
          cursor: 'pointer',
          'font-size': theme('fontSize.base[0]'),
          'line-height': theme('fontSize.base[1].lineHeight'),
          
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          }
        },
        '.btn-primary': {
          'background-color': theme('colors.primary.DEFAULT'),
          color: theme('colors.white'),
          
          '&:hover:not(:disabled)': {
            'background-color': theme('colors.primary.700'),
          },
          
          '&:focus': {
            'box-shadow': `0 0 0 3px ${theme('colors.primary.DEFAULT')}40`,
          }
        },
        '.btn-secondary': {
          'background-color': 'transparent',
          color: theme('colors.primary.DEFAULT'),
          'border-color': theme('colors.primary.DEFAULT'),
          
          '&:hover:not(:disabled)': {
            'background-color': theme('colors.primary.DEFAULT'),
            color: theme('colors.white'),
          }
        },
        '.card': {
          'background-color': theme('colors.white'),
          'border-radius': theme('borderRadius.lg'),
          border: `1px solid ${theme('colors.gray.200')}`,
          'box-shadow': theme('boxShadow.sm'),
          padding: theme('spacing.6'),
          transition: `box-shadow ${theme('transitionDuration.150')} ease-in-out`,
          
          '&:hover': {
            'box-shadow': theme('boxShadow.md'),
          }
        }
      });
    }
  ],
  
  // 다크 모드 설정 (향후 확장용)
  darkMode: 'class',
  
  // 사용하지 않는 스타일 제거 (프로덕션 최적화)
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    options: {
      safelist: [
        // 동적으로 생성되는 클래스명 보호
        'bg-green-50', 'text-green-800', 'border-green-200',
        'bg-yellow-50', 'text-yellow-800', 'border-yellow-200',
        'bg-red-50', 'text-red-800', 'border-red-200',
        'bg-blue-50', 'text-blue-800', 'border-blue-200',
      ]
    }
  }
}