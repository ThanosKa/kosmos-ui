import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

const releases = Array.from({ length: 24 }, (_, index) => `v2.${24 - index}.0`);

export default function ScrollAreaDemo() {
  return (
    <div className="w-56 rounded-2xl border border-transparent bg-card p-1 shadow-card">
      <ScrollArea className="h-64 rounded-xl">
        <p className="px-3 pt-2 pb-1 text-caption font-medium tracking-[0.05em] text-muted-foreground uppercase">
          Releases
        </p>
        <ul className="divide-y divide-border">
          {releases.map((release) => (
            <li key={release} className="px-3 py-2 text-body tabular-nums">
              {release}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
