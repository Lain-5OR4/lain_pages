/** @type {import('next').NextConfig} */

const nextConfig = {
    images: {
        unoptimized: true,
    },
    output: "export",
    trailingSlash: true,
    distDir: "out",
    env: {
        NEXT_PUBLIC_BASE_PATH: '',
        NEXT_PUBLIC_DIARY_API: process.env.NEXT_PUBLIC_DIARY_API ?? 'https://api.mizora.dev',
    },
};

export default nextConfig;
