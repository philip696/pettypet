import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors (beige and brown palette)
        primary: '#8B5A2B',      // Brown - Main actions
        secondary: '#D2B48C',    // Tan - Secondary elements
        accent: '#CD853F',       // Peru - Success, highlights
        neutral: '#FDF5E6',      // Old Lace (Beige) - Backgrounds
        'text-primary': '#3E2723', // Dark brown - Body text
        'text-secondary': '#5C4033', // Medium brown - Secondary text
        'border-color': '#DEB887', // Burlywood - Borders
        success: '#90EE90',      // Light Green - Success states
        warning: '#FFD700',      // Gold - Warning states
        error: '#FF6B6B',        // Soft Red - Error states
        info: '#87CEEB',         // Light Blue - Info
      },
      fontFamily: {
        // Rounded font for headings
        heading: ['Poppins', 'Nunito', 'Quicksand', 'sans-serif'],
        // Clean readable font for body
        body: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'spin-slow': 'spin 1s linear infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
