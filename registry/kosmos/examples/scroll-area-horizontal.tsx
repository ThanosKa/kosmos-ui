import { ScrollArea } from '@/registry/kosmos/ui/scroll-area';

const projects = ['Billing', 'Analytics', 'Onboarding', 'Platform', 'Support', 'Mobile app', 'Docs', 'Growth'];

export default function ScrollAreaHorizontal() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-transparent bg-card p-1 shadow-card">
      <ScrollArea className="rounded-xl">
        <div className="flex w-max gap-2 p-2">
          {projects.map((project, index) => (
            <div
              key={project}
              className="flex w-36 shrink-0 flex-col gap-1 rounded-lg bg-muted p-3"
            >
              <span className="truncate text-body font-medium">{project}</span>
              <span className="text-caption text-muted-foreground tabular-nums">{(index + 3) * 4} open issues</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
