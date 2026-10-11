import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // `next dev` would otherwise append its own rules block to AGENTS.md (a symlink to CLAUDE.md).
  agentRules: false,
};

export default withMDX(config);
