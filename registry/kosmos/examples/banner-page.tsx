import { Banner, BannerAction, BannerText } from '@/registry/kosmos/ui/banner';

export default function BannerPage() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl bg-card shadow-card">
      <Banner variant="warning">
        <BannerText>Ironbark Logistics is at 79% of its event quota.</BannerText>
        <BannerAction href="#quota">Raise the allowance</BannerAction>
      </Banner>
      <div className="flex flex-col gap-1 p-5">
        <p className="text-title font-medium">Ironbark Logistics</p>
        <p className="text-small text-muted-foreground">6,320,000 of 8,000,000 events this month</p>
      </div>
    </div>
  );
}
