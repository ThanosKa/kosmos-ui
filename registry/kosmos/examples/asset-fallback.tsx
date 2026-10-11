import { Asset, AssetImage } from '@/registry/kosmos/ui/asset';

// A source that fails to decode, standing in for a broken link.
const brokenImage = 'data:image/webp;base64,AAAA';

export default function AssetFallback() {
  return (
    <div className="w-full max-w-md">
      <Asset ratio={16 / 9} fallback="This preview isn’t available yet.">
        <AssetImage src={brokenImage} alt="Dashboard preview" />
      </Asset>
    </div>
  );
}
