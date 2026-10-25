import { FlickeringGrid } from '@/registry/kosmos/ui/flickering-grid';

export default function FlickeringGridDemo() {
  return (
    <div className="relative isolate flex h-64 w-full items-center justify-center overflow-hidden rounded-xl bg-background shadow-card">
      <FlickeringGrid />
      <p className="text-title font-semibold text-foreground">A grid behind the title</p>
    </div>
  );
}
