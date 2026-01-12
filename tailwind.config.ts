import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: '#e7ff01',
          teal: '#183539',
          cyan: '#52e3d4',
          purple: '#350097',
          red: '#c42221',
        },
        platform: {
          youtube: '#FF0000',
          instagram: '#E4405F',
          tiktok: '#000000',
          facebook: '#1877F2',
          x: '#000000',
          linkedin: '#0A66C2',
        }
      },
    },
  },
  plugins: [],
}
export default config
