import { Badge, type BadgeProps } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';

const endpoints: { method: string; tint: BadgeProps['variant']; label: string; href: string }[] = [
  { method: 'GET', tint: 'tint-green', label: 'List projects', href: '#list-projects' },
  { method: 'POST', tint: 'tint-blue', label: 'Send events', href: '#send-events' },
  { method: 'PATCH', tint: 'tint-orange', label: 'Change a plan', href: '#change-a-plan' },
  { method: 'DELETE', tint: 'tint-red', label: 'Delete events', href: '#delete-events' },
];

export default function BadgeCurrent() {
  return (
    <nav aria-label="API reference" className="w-full max-w-60">
      <ul className="flex flex-col gap-0.5">
        {endpoints.map((endpoint) => {
          const current = endpoint.label === 'Send events';
          return (
            <li key={endpoint.href}>
              <Button
                variant="item"
                href={endpoint.href}
                aria-current={current ? 'page' : undefined}
                className="w-full justify-start gap-2 text-muted-foreground aria-[current=page]:bg-accent aria-[current=page]:text-active-foreground"
              >
                <Badge variant={endpoint.tint} className="w-14 font-semibold">
                  {endpoint.method}
                </Badge>
                <span className="min-w-0 truncate">{endpoint.label}</span>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
