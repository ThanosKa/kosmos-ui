import { Rocket } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import BannerPage from '@/registry/kosmos/examples/banner-page';
import BannerVariants from '@/registry/kosmos/examples/banner-variants';
import { Banner, BannerAction, BannerText, type BannerVariant } from '@/registry/kosmos/ui/banner';

const variants = ['neutral', 'info', 'success', 'warning', 'destructive'] as const satisfies readonly BannerVariant[];
const actionStates = ['default', 'hover', 'focus', 'active'] as const;

export default function BannerPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Variants">
        <BannerVariants />
      </PreviewSection>

      <PreviewSection title="Action × states">
        <StateMatrix
          rows={variants}
          states={actionStates}
          render={(variant, state) => (
            <Banner variant={variant} icon={null}>
              <BannerAction href="#" {...previewState(state)}>
                Update card
              </BannerAction>
            </Banner>
          )}
        />
      </PreviewSection>

      <PreviewSection title="On a page">
        <BannerPage />
      </PreviewSection>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Own icon, no icon, no action">
          <div className="flex flex-col gap-3">
            <Banner variant="info" icon={<Rocket />}>
              <BannerText>Mobile SDK 3.0 ships in Q4 2026.</BannerText>
            </Banner>
            <Banner variant="neutral" icon={null}>
              <BannerText>Dates on this page are in UTC.</BannerText>
            </Banner>
            <Banner variant="success">
              <BannerText>Attack mode is on.</BannerText>
              <BannerAction href="#">Turn off</BannerAction>
            </Banner>
            <Banner variant="warning">
              <BannerText>
                Rolled back by Kai. <a href="https://acme.example/deploys">See the deploy</a>
              </BannerText>
            </Banner>
          </div>
        </PreviewSection>

        <PreviewSection title="Long text in a narrow slot">
          <div className="flex w-full max-w-64 flex-col gap-3">
            <Banner variant="destructive">
              <BannerText>
                The payment for kai.nakamura.growth-team-weekly-digest@acme.example failed, and the project will be paused on November 3.
              </BannerText>
              <BannerAction href="#">Update credit card information</BannerAction>
            </Banner>
          </div>
        </PreviewSection>
      </div>
    </PreviewStack>
  );
}
