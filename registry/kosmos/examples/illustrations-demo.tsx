import { ChecklistIllustration, LayerStackIllustration, SyncIllustration } from '@/registry/kosmos/ui/illustrations';

const tile = 'overflow-hidden rounded-2xl border border-transparent bg-muted shadow-inset';

export default function IllustrationsDemo() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
      <div className={tile}>
        <LayerStackIllustration />
      </div>
      <div className={tile}>
        <SyncIllustration />
      </div>
      <div className={tile}>
        <ChecklistIllustration />
      </div>
    </div>
  );
}
