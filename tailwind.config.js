/** @type {import('tailwindcss').Config} */
const withOpacity = (variable) => ({ opacityValue }) =>
  opacityValue === undefined ? `rgb(var(${variable}))` : `rgb(var(${variable}) / ${opacityValue})`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}', './api/**/*.{ts,js}'],
  theme: {
    extend: {
      colors: {
        bone: withOpacity('--color-bone'),
        cream: withOpacity('--color-cream'),
        charcoal: withOpacity('--color-charcoal'),
        'warm-gray': withOpacity('--color-warm-gray'),
        accent: withOpacity('--color-accent'),
        hairline: withOpacity('--color-hairline'),
      },
      fontFamily: {
        display: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(3.25rem, 9vw, 7.5rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.75rem, 6.5vw, 5.25rem)', { lineHeight: '0.98', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(2.25rem, 4.5vw, 3.75rem)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.75rem, 3vw, 2.5rem)', { lineHeight: '1.12', letterSpacing: '-0.015em' }],
        statement: ['clamp(2.5rem, 8.2vw, 8rem)', { lineHeight: '0.9', letterSpacing: '-0.035em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.18em' }],
        micro: ['0.625rem', { lineHeight: '1.2', letterSpacing: '0.22em' }],
      },
      maxWidth: {
        shell: '88rem',
        prose: '42rem',
      },
      transitionTimingFunction: {
        couture: 'cubic-bezier(0.16, 1, 0.3, 1)',
        drape: 'cubic-bezier(0.65, 0, 0.35, 1)',
        hem: 'cubic-bezier(0.33, 0, 0.15, 1)',
      },
      boxShadow: {
        lift: '0 20px 40px -12px rgba(28, 26, 23, 0.12)',
        'lift-lg': '0 40px 80px -24px rgba(28, 26, 23, 0.18)',
        inset: 'inset 0 0 0 1px #E4DED3',
      },
      keyframes: {
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'spin-slow': 'spin-slow 24s linear infinite',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
}
