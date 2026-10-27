import { Banner, BannerAction, BannerText } from '@/registry/kosmos/ui/banner';

export default function BannerDemo() {
  return (
    <Banner variant="destructive">
      <BannerText>Payment failed. Update your card before Acme Analytics is paused.</BannerText>
      <BannerAction href="#billing">Update card</BannerAction>
    </Banner>
  );
}
