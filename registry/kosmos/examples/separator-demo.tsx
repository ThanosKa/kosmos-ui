import { Separator } from '@/registry/kosmos/ui/separator';

export default function SeparatorDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-body font-medium">Kosmos UI</span>
        <span className="text-small text-muted-foreground">Components for dashboard apps.</span>
      </div>
      <Separator />
      <div className="flex h-5 items-center gap-3 text-body">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Components</span>
        <Separator orientation="vertical" />
        <span>Blocks</span>
      </div>
    </div>
  );
}
