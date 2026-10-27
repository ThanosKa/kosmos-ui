import { Banner, BannerAction, BannerText, type BannerVariant } from '@/registry/kosmos/ui/banner';

const banners: { variant: BannerVariant; text: string; action: string }[] = [
  { variant: 'neutral', text: 'Cirrus Weather is on a trial that ends on November 3.', action: 'Choose a plan' },
  { variant: 'info', text: 'Event ingestion for Cirrus Weather moves to the EU region on November 12.', action: 'See what changes' },
  { variant: 'success', text: 'Attack mode is on for Cirrus Weather.', action: 'Turn off' },
  { variant: 'warning', text: 'Cirrus Weather was rolled back by Kai Nakamura.', action: 'Undo rollback' },
  { variant: 'destructive', text: 'Payment failed. Update your card before Cirrus Weather is paused.', action: 'Update card' },
];

export default function BannerVariants() {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl border border-border">
      {banners.map(({ variant, text, action }) => (
        <Banner key={variant} variant={variant} className="last:border-b-0">
          <BannerText>{text}</BannerText>
          <BannerAction href="#">{action}</BannerAction>
        </Banner>
      ))}
    </div>
  );
}
