/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
    images: {
        unoptimized: true,
    },
    output: "export",
    trailingSlash: true,
    distDir: "out",
    ...(isProd && isGitHubPages ? {
        basePath: "/lain_pages",
        assetPrefix: "/lain_pages",
    } : {}),
};

export default nextConfig;
