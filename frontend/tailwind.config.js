/**
 * Design tokens for SELVAM MALIGAI STORE.
 * Palette grounded in the everyday materials of a South Indian provisions
 * store — curry-leaf green, turmeric, kumkum red, rice white — rather than
 * a generic e-commerce theme.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        leaf: {
          50: '#EAF3EE',
          100: '#CFE3D6',
          400: '#2E6E52',
          500: '#1F4E3D',
          600: '#173A2D',
          900: '#0D2018',
        },
        turmeric: {
          100: '#FBE9C6',
          400: '#F0B84A',
          500: '#E7A32C',
          600: '#C4841D',
        },
        kumkum: {
          400: '#C1493C',
          500: '#B23A2E',
          600: '#8F2D23',
        },
        rice: {
          50: '#FDFBF6',
          100: '#FAF7EF',
          200: '#F1ECDD',
        },
        ink: {
          900: '#1B1B16',
          700: '#3A392F',
          500: '#6B6A5C',
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', 'ui-rounded', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '1.25rem',
      },
      screens: {
        xs: '374px',
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(31, 78, 61, 0.25)',
        card: '0 4px 16px -6px rgba(27, 27, 22, 0.12)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
      },
    },
  },
  plugins: [],
};
