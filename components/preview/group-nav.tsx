import { groups, type Group } from '@/lib/registry';
import { Button } from '@/registry/kosmos/ui/button';

/** Links to every approval page (`/approve/<group>`), the current one highlighted. */
export function GroupNav({ current }: { current?: Group }) {
  return (
    <nav aria-label="Groups" className="flex flex-wrap gap-1">
      {(Object.keys(groups) as Group[]).map((key) => (
        <Button
          key={key}
          variant="item"
          size="sm"
          href={`/approve/${key}`}
          aria-current={key === current ? 'page' : undefined}
          className="text-muted-foreground aria-[current=page]:bg-accent aria-[current=page]:text-active-foreground"
        >
          {groups[key]}
        </Button>
      ))}
    </nav>
  );
}
