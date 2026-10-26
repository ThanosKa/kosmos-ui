import { BrowserFrame } from '@/registry/kosmos/ui/browser-frame';

export default function BrowserFrameDemo() {
  return (
    <div className="w-full max-w-2xl">
      <BrowserFrame url="acme.example/overview">
        <div className="flex h-56 flex-col justify-center gap-1 px-6">
          <p className="text-title font-medium text-foreground">Any content</p>
          <p className="text-small text-muted-foreground">A live screen, a component or an image goes here.</p>
        </div>
      </BrowserFrame>
    </div>
  );
}
