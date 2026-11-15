import { Asset, AssetVideo } from '@/registry/kosmos/ui/asset';

export default function AssetVideoExample() {
  return (
    <div className="w-full max-w-md">
      <Asset ratio={16 / 9}>
        <AssetVideo poster="/media/loop-poster.webp" autoPlay loop>
          <source src="/media/loop.webm" type="video/webm" />
          <source src="/media/loop.mp4" type="video/mp4" />
        </AssetVideo>
      </Asset>
    </div>
  );
}
