/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#172026',
        mist: '#f5f7f8',
        line: '#dce3e6',
        leaf: '#2d6a4f',
        teal: '#0f766e',
        saffron: '#b45309',
        brick: '#b91c1c',
      },
      boxShadow: {
        soft: '0 16px 40px rgba(23, 32, 38, 0.08)',
      },
    },
  },
  plugins: [],
};
