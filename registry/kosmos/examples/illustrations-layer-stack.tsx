import { LayerStackIllustration } from '@/registry/kosmos/ui/illustrations';

export default function IllustrationsLayerStack() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-transparent bg-muted shadow-inset">
      <LayerStackIllustration trigger="hover" />
    </div>
  );
}
