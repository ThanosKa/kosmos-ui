import { BrowserFrame } from '@/registry/kosmos/ui/browser-frame';

export default function BrowserFrameTilt() {
  return (
    <div className="w-full max-w-2xl py-6">
      <BrowserFrame tilt url="acme.example/reports">
        <div className="flex h-56 items-center justify-center text-small text-muted-foreground">Hover to stand it straight</div>
      </BrowserFrame>
    </div>
  );
}
