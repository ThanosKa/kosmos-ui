import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, CornerDownLeft, Search } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';
import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';

const surfaces = [
  { label: 'background', className: 'bg-background' },
  { label: 'card', className: 'bg-card shadow-card' },
  { label: 'popover', className: 'bg-popover shadow-popover' },
  { label: 'muted', className: 'bg-muted shadow-inset' },
] as const;

export default function KbdPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Keys">
        <div className="flex flex-wrap items-center gap-3">
          <Kbd>K</Kbd>
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>⌥</Kbd>
          <Kbd>Ctrl</Kbd>
          <Kbd>Esc</Kbd>
          <Kbd>Tab</Kbd>
          <Kbd>
            <CornerDownLeft role="img" aria-label="Enter" />
          </Kbd>
          <Kbd>
            <ArrowUp role="img" aria-label="Up arrow" />
          </Kbd>
          <Kbd>
            <ArrowDown role="img" aria-label="Down arrow" />
          </Kbd>
          <Kbd>
            <ArrowLeft role="img" aria-label="Left arrow" />
          </Kbd>
          <Kbd>
            <ArrowRight role="img" aria-label="Right arrow" />
          </Kbd>
          <Kbd>Space</Kbd>
          <Kbd>F6</Kbd>
          <Kbd>?</Kbd>
        </div>
      </PreviewSection>

      <PreviewSection title="Groups">
        <div className="flex flex-wrap items-center gap-6">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>G</Kbd>
            <span className="text-caption text-muted-foreground">then</span>
            <Kbd>I</Kbd>
          </KbdGroup>
        </div>
      </PreviewSection>

      <PreviewSection title="In text and controls">
        <div className="flex flex-col items-start gap-4">
          <p className="max-w-[40em] text-body text-pretty">
            Press{' '}
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>{' '}
            to search, or <Kbd>Esc</Kbd> to close any open panel.
          </p>
          <p className="max-w-[40em] text-small text-pretty text-muted-foreground">
            In a hint: <Kbd>F6</Kbd> moves focus to the notifications.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" className="w-56 justify-between ps-2.5 pe-1.5 font-normal text-muted-foreground">
              <span className="flex items-center gap-2">
                <Search aria-hidden />
                Search
              </span>
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </Button>
            <Button variant="ghost">
              Save
              <Kbd>⌘S</Kbd>
            </Button>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="On surfaces">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {surfaces.map((surface) => (
            <div
              key={surface.label}
              className={`flex flex-col gap-3 rounded-xl border border-transparent p-4 ${surface.className}`}
            >
              <span className="font-mono text-caption text-muted-foreground">{surface.label}</span>
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>
                  <CornerDownLeft role="img" aria-label="Enter" />
                </Kbd>
              </KbdGroup>
            </div>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
