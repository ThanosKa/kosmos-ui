import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { CodeTabs } from '@/registry/kosmos/ui/code-tabs';
import CodeTabsControlled from '@/registry/kosmos/examples/code-tabs-controlled';
import CodeTabsOutput from '@/registry/kosmos/examples/code-tabs-output';

const install = {
  pnpm: 'pnpm add @acme/analytics',
  npm: 'npm install @acme/analytics',
  yarn: 'yarn add @acme/analytics',
  bun: 'bun add @acme/analytics',
};

const long = {
  pnpm: 'pnpm dlx shadcn@latest registry add @acme=https://ui.acme.example/r/{name}.json',
  npm: 'npx shadcn@latest registry add @acme=https://ui.acme.example/r/{name}.json',
  yarn: 'yarn dlx shadcn@latest registry add @acme=https://ui.acme.example/r/{name}.json',
  bun: 'bunx --bun shadcn@latest registry add @acme=https://ui.acme.example/r/{name}.json',
};

const platforms = {
  macOS: 'brew install acme',
  Linux: 'curl -fsSL https://acme.example/install.sh | sh',
  Windows: 'winget install Acme.CLI',
  Docker: 'docker run --rm acme/cli',
  'Homebrew on Linux': 'brew install acme',
  Nix: 'nix profile install nixpkgs#acme',
  Scoop: 'scoop install acme',
};

export default function CodeTabsPreview() {
  return (
    <PreviewStack>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Default, first tab open">
          <CodeTabs commands={install} />
        </PreviewSection>
        <PreviewSection title="defaultValue bun">
          <CodeTabs commands={install} defaultValue="bun" />
        </PreviewSection>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="With a note">
          <CodeTabsOutput />
        </PreviewSection>
        <PreviewSection title="Controlled, two tabs in step">
          <CodeTabsControlled />
        </PreviewSection>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Long command wraps">
          <CodeTabs commands={long} />
        </PreviewSection>
        <PreviewSection title="More tabs than fit, in a narrow slot">
          <CodeTabs commands={platforms} label="Platform" className="max-w-72" />
        </PreviewSection>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="One tab">
          <CodeTabs commands={{ npm: 'npm install @acme/analytics' }} />
        </PreviewSection>
        <PreviewSection title="Right to left">
          <div dir="rtl">
            <CodeTabs commands={install} />
          </div>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
