import { Kbd, KbdGroup } from '@/registry/kosmos/ui/kbd';

export default function KbdDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>
      <p className="text-body text-muted-foreground">
        Press{' '}
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>{' '}
        to search.
      </p>
    </div>
  );
}
