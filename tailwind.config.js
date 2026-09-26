/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Support both hyphenated and underscored Tailwind color classes
        amazon_blue: '#131921',
        amazon_light: '#232f3e',
        amazon_bg: '#eaeded',
        amazon_yellow: '#ffd814',
        amazon_yellow_hover: '#f7ca00',
        amazon_orange: '#ffa41c',
        amazon_orange_btn: '#ff9900',
        amazon_teal: '#007185',
        amazon: {
          dark: '#131921',
          blue: '#131921',
          light: '#232f3e',
          'sub-nav': '#232f3e',
          bg: '#eaeded',
          yellow: '#ffd814',
          'yellow-hover': '#f7ca00',
          orange: '#ffa41c',
          'orange-btn': '#ff9900',
          teal: '#007185',
          green: '#007600',
          red: '#b12704',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-skeleton': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
