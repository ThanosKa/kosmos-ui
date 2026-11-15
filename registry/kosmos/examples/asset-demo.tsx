import { Asset, AssetImage } from '@/registry/kosmos/ui/asset';

export default function AssetDemo() {
  return (
    <div className="w-full max-w-md">
      <Asset ratio={16 / 9}>
        <AssetImage src="/media/landscape.webp" alt="Abstract violet and teal gradient" />
      </Asset>
    </div>
  );
}
