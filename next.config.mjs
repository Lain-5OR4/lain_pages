/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
    images: {
        unoptimized: true,
    },
    output: "export",
    trailingSlash: true,
    distDir: "out",
    ...(isGitHubPages ? {
        basePath: "/lain_pages",
        assetPrefix: "/lain_pages",
    } : {}),
};

export default nextConfig;
