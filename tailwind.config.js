/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── 하루케어 Green Brand Palette ─────────────────────
        'hc-primary':       '#2ECC71',   // 프레시 그린 — CTA, 강조
        'hc-primary-light': '#A8E6CF',   // 연한 그린 — 배경 강조
        'hc-primary-dark':  '#27AE60',   // 딥 그린 — hover/active
        'hc-bg':            '#F4FAF6',   // 그린빛 화이트 — 페이지 배경
        'hc-surface':       '#FFFFFF',   // 순수 화이트 — 카드 표면
        'hc-badge':         '#E8F8F0',   // 카드 배경 그린 뱃지
        'hc-text':          '#1A1A1A',   // 텍스트 기본
        'hc-text2':         '#374151',   // 텍스트 중간
        'hc-muted':         '#6B7280',   // 텍스트 보조
        'hc-warning':       '#FF6B35',   // 포인트 오렌지
        // ── Derived ──────────────────────────────────────────
        'hc-border':        '#C8EDD8',   // 카드 테두리
        'hc-faint':         '#E8F8F0',   // 극히 연한 배경
      },
      fontFamily: {
        sans:  ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
