/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Liquid Glass Dark Theme
        'midnight': '#080D1C',
        'deep-indigo': '#101A33',
        'dark-blue': '#17294A',
        'electric-blue': '#638BFF',
        'cyan': '#73DDF5',
        'violet': '#9B8CFF',
        'success': '#6EDBA4',
        'warning': '#FFC477',
        'error': '#FF7E86',
        'text-primary': '#F5F7FF',
        'text-secondary': '#A8B2CA',
        'text-muted': '#78849F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        'glass': '20px',
        'glass-lg': '32px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'ambient-glow': 'radial-gradient(ellipse at 20% 0%, rgba(99, 139, 255, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 0%, rgba(155, 140, 255, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(115, 221, 245, 0.08) 0%, transparent 40%)',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 8px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -1px 0 rgba(0, 0, 0, 0.15)',
        'floating': '0 16px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'glass': '22px',
        'glass-sm': '16px',
        'glass-lg': '28px',
      },
      transitionDuration: {
        'glass': '300ms',
        'glass-slow': '500ms',
      },
      transitionTimingFunction: {
        'glass': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
}