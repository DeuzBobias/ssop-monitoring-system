/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#38BDF8',
        accent: '#14B8A6',
        background: '#F8FAFC',
        ink: '#0F172A',
        muted: '#64748B',
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#22C55E',
      },
      boxShadow: {
        soft: '0 18px 50px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

