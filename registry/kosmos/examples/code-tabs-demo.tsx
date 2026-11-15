import { CodeTabs } from '@/registry/kosmos/ui/code-tabs';

const commands = {
  pnpm: 'pnpm add @acme/analytics',
  npm: 'npm install @acme/analytics',
  yarn: 'yarn add @acme/analytics',
  bun: 'bun add @acme/analytics',
};

export default function CodeTabsDemo() {
  return <CodeTabs commands={commands} className="w-full max-w-md" />;
}
