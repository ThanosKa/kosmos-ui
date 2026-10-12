import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // `next dev` would otherwise write its own rules block into AGENTS.md.
  agentRules: false,
  experimental: {
    // app/global-not-found.tsx: the site has two root layouts, so no single layout can hold the 404 page.
    globalNotFound: true,
  },
  async redirects() {
    return [
      { source: '/docs/foundations', destination: '/docs/foundations/color', permanent: false },
      { source: '/docs/motion', destination: '/docs/foundations/motion', permanent: true },
      { source: '/docs/motion.md', destination: '/docs/foundations/motion.md', permanent: true },
    ];
  },
};

export default withMDX(config);
