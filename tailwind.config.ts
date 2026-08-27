import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:   'var(--bold-navy)',
        slate:  'var(--bold-slate)',
        orange: 'var(--bold-orange)',
        muted:  'var(--bold-muted)',
      },
      fontFamily: { sans: ['var(--font-sans)'], mono: ['var(--font-mono)'] },
      maxWidth: { shell: '1320px' },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        power: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
