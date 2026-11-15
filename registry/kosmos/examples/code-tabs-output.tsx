import { CodeTabs } from '@/registry/kosmos/ui/code-tabs';

const commands = {
  pnpm: 'pnpm dlx @acme/cli init',
  npm: 'npx @acme/cli init',
  yarn: 'yarn dlx @acme/cli init',
  bun: 'bunx @acme/cli init',
};

export default function CodeTabsOutput() {
  return (
    <CodeTabs commands={commands} className="w-full max-w-md">
      Run it in the root of your project. It creates <code className="font-mono">acme.config.ts</code> and adds your key to{' '}
      <code className="font-mono">.env.local</code>.
    </CodeTabs>
  );
}
