import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vku: {
          blue: '#1e40af', // VKU primary blue
          navy: '#1e293b',
          orange: '#ea580c', // VKU accent orange
          light: '#f0f4f8',
        },
      },
    },
  },
  plugins: [],
};
export default config;

