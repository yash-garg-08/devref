import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Space-separated RGB vars → opacity modifiers like bg-accent/10 work automatically
        bg:       'rgb(var(--color-bg)       / <alpha-value>)',
        surface:  'rgb(var(--color-surface)  / <alpha-value>)',
        surface2: 'rgb(var(--color-surface2) / <alpha-value>)',
        border:   'rgb(var(--color-border)   / <alpha-value>)',
        accent:   'rgb(var(--color-accent)   / <alpha-value>)',
        danger:   'rgb(var(--color-danger)   / <alpha-value>)',
        success:  'rgb(var(--color-success)  / <alpha-value>)',
        warning:  'rgb(var(--color-warning)  / <alpha-value>)',
        purple:   'rgb(var(--color-purple)   / <alpha-value>)',
        muted:    'rgb(var(--color-muted)    / <alpha-value>)',
        codebg:   'rgb(var(--color-codebg)   / <alpha-value>)',
        text:     'rgb(var(--color-text)     / <alpha-value>)',
      },
      fontFamily: {
        sans:  ['Syne', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xxs': '0.65rem',
        'xs':  '0.72rem',
      },
    },
  },
  plugins: [],
}

export default config
