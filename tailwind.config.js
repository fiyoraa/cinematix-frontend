export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F5F0',
        sand: '#E5E0D8',
        ink: '#14151A',
        muted: '#5D606B',
        velvet: {
          DEFAULT: '#8B1E2E',
          hover: '#6E1623',
          soft: '#F9ECEF',
        },
        brass: {
          DEFAULT: '#B8860B',
          soft: '#FBF5E6',
        },
        obsidian: '#111217',
        charcoal: '#1A1C24',
        slateLine: '#2A2D3A',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        editorial: '0 2px 12px rgba(20, 21, 26, 0.05)',
        ticket: '0 8px 28px rgba(20, 21, 26, 0.08)',
      },
    },
  },
  plugins: [],
};
