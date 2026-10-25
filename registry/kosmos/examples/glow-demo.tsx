import { Glow } from '@/registry/kosmos/ui/glow';

export default function GlowDemo() {
  return (
    <div className="relative isolate flex h-64 w-full items-center justify-center overflow-hidden rounded-xl bg-background shadow-card">
      <Glow />
      <p className="text-title font-semibold text-foreground">A glow behind the title</p>
    </div>
  );
}
