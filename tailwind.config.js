/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'DM Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        'ice-black': '#050508',
        'ice-dark': '#0a0a12',
        'ice-card': 'rgba(255,255,255,0.04)',
        'cyan-glow': '#00d2ff',
        'violet-glow': '#c084fc',
        'diamond-blue': '#00d2ff',
        'diamond-purple': '#9b59ff',
        'diamond-pink': '#e879f9',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00d2ff 0%, #9b59ff 50%, #00d2ff 100%)',
        'gradient-dark': 'linear-gradient(135deg, #050508 0%, #0a0a12 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(0,210,255,0.06) 0%, rgba(155,89,255,0.04) 100%)',
        'gradient-diamond': 'linear-gradient(135deg, rgba(0,210,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(155,89,255,0.15) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)',
        'glow-cyan': '0 0 24px rgba(0,210,255,0.3), 0 0 48px rgba(0,210,255,0.1)',
        'glow-violet': '0 0 24px rgba(155,89,255,0.3), 0 0 48px rgba(155,89,255,0.1)',
        'glow-lg': '0 0 60px rgba(0,210,255,0.15)',
        'diamond': '0 0 20px rgba(0,210,255,0.2), 0 0 40px rgba(155,89,255,0.15), 0 0 80px rgba(0,210,255,0.05)',
        'card-hover': '0 8px 48px rgba(0,0,0,0.5), 0 0 32px rgba(0,210,255,0.08)',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      animation: {
        'fade-in': 'fade-in 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        'pulse-live': 'pulse-live 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s linear infinite',
        'diamond-sweep': 'diamond-sweep 4s ease-in-out infinite',
        'diamond-pulse': 'diamond-pulse 2.5s ease-in-out infinite',
        'crystal-glow': 'crystal-glow 6s ease-in-out infinite',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
        '5xl': '40px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};