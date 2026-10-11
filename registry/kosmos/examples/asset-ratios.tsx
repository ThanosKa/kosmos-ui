import { Asset, AssetImage } from '@/registry/kosmos/ui/asset';

export default function AssetRatios() {
  return (
    <div className="grid w-full max-w-lg grid-cols-3 items-start gap-3">
      <Asset ratio={1}>
        <AssetImage src="/media/square.webp" alt="" />
      </Asset>
      <Asset ratio={3 / 4}>
        <AssetImage src="/media/portrait.webp" alt="" />
      </Asset>
      <Asset ratio={4 / 3}>
        <AssetImage src="/media/landscape.webp" alt="" />
      </Asset>
    </div>
  );
}
