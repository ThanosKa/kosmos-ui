import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // `next dev` would otherwise write its own rules block to AGENTS.md; the agent instructions live in CLAUDE.md.
  agentRules: false,
};

export default withMDX(config);
