/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
    images: {
        unoptimized: true,
    },
    output: "export",
    trailingSlash: true,
    distDir: "out",
    env: {
        NEXT_PUBLIC_BASE_PATH: isGitHubPages ? '/lain_pages' : '',
        NEXT_PUBLIC_DIARY_API: process.env.NEXT_PUBLIC_DIARY_API ?? 'https://api.mizora.dev',
    },
    ...(isGitHubPages ? {
        basePath: "/lain_pages",
        assetPrefix: "/lain_pages",
    } : {}),
};

export default nextConfig;
