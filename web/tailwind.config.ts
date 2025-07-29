import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand': {
                    DEFAULT: '#2a9d8f', // Warna utama Anda
                    dark: '#1c695f',   // Versi lebih gelap untuk hover
                    light: '#4eada2',   // Versi lebih terang
                },
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                serif: ['var(--font-playfair)', 'serif'],
            },
        },
    },
    plugins: [
        require('tailwind-scrollbar'),
    ],
};
export default config;