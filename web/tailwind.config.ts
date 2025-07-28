import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            colors: {
                'brand-darkest': '#01140e',
                'brand-dark': '#003d2b',
                'brand': '#2a9d8f', // Warna utama Anda
                'brand-light': '#9ef01a',
                'brand-offwhite': '#E6F2EF',
            },
            animation: {
                'gradient-flow': 'gradient-flow 25s ease infinite',
            },
            keyframes: {
                'gradient-flow': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
        },
    },
    plugins: [
        require('tailwind-scrollbar'),
    ],
};
export default config;