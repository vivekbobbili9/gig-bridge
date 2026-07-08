/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Spotify-green accent (GigHaul). `brand` + `grape` both map to green so
        // existing gradient usages become green-on-green.
        brand: {
          50: '#e7f9ee',
          100: '#c9f0d8',
          200: '#93e3b1',
          300: '#5fd68c',
          400: '#38c873',
          500: '#1DB954',
          600: '#18a349',
          700: '#146e31',
          800: '#0f5626',
          900: '#0a3d1b',
        },
        grape: {
          400: '#38c873',
          500: '#18a349',
          600: '#146e31',
        },
        hivis: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Dark surfaces (GigHaul --bg / --s1..--s5)
        surface: {
          0: '#060606',
          DEFAULT: '#0a0a0a',
          1: '#111111',
          2: '#161616',
          3: '#1c1c1c',
          4: '#242424',
          5: '#2e2e2e',
        },
        ink: {
          700: '#1f2937',
          800: '#111827',
          900: '#0b1220',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans',
          'Noto Sans Devanagari',
          'Noto Sans Telugu',
          'Noto Sans Tamil',
          'Noto Sans Kannada',
          'Noto Sans Bengali',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        device: '0 0 0 1px rgba(0,0,0,0.8), 0 80px 160px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.05)',
        card: '0 1px 2px rgba(0,0,0,.4), 0 10px 30px -8px rgba(0,0,0,.55)',
        glow: '0 12px 40px rgba(29,185,84,.30)',
        'glow-amber': '0 12px 34px -10px rgba(245,158,11,0.45)',
        'glow-emerald': '0 12px 40px rgba(29,185,84,.30)',
      },
      backgroundImage: {
        hero: 'linear-gradient(165deg,#12190f 0%,#0b0b0b 55%,#0a0a0a 100%)',
      },
      keyframes: {
        ping2: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        slideup: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadein: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        popin: {
          '0%': { transform: 'scale(.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wfloat: {
          '0%,100%': { transform: 'translateY(0) rotate(-.8deg)' },
          '50%': { transform: 'translateY(-16px) rotate(.8deg)' },
        },
        checkpop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '65%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pfpulse: {
          '0%,100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        cfetti: {
          '0%': { transform: 'translateY(-20px) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateY(900px) rotate(720deg)', opacity: '0' },
        },
        risein: {
          '0%': { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slidein: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        ping2: 'ping2 1.8s cubic-bezier(0,0,0.2,1) infinite',
        slideup: 'slideup .28s cubic-bezier(.2,.8,.2,1)',
        fadein: 'fadein .2s ease-out',
        popin: 'popin .3s cubic-bezier(.2,.8,.2,1)',
        wfloat: 'wfloat 3.5s ease-in-out infinite',
        checkpop: 'checkpop .6s cubic-bezier(.4,0,.2,1) both',
        pfpulse: 'pfpulse 3s ease-out infinite',
        risein: 'risein .45s cubic-bezier(.2,.8,.2,1) both',
        slidein: 'slidein .4s cubic-bezier(.2,.8,.2,1) both',
      },
    },
  },
  plugins: [],
};
