import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Cta } from '@/registry/kosmos/blocks/cta/cta';
import { Button } from '@/registry/kosmos/ui/button';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

export default function CtaPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default">
        <div className={frame}>
          <Cta />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className="flex flex-wrap items-start gap-4">
          <div className={`${frame} max-w-80`}>
            <Cta />
          </div>
          <div className={`${frame} max-w-80`}>
            <Cta
              action={
                <Button variant="primary" size="lg" href="/signup">
                  Start your 14-day Pro trial, no card needed
                </Button>
              }
            />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="With a line">
        <div className={frame}>
          <Cta description="Free up to 50,000 events a month. Pro from $49 a month when you need more." />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text">
        <div className={frame}>
          <Cta
            title={
              <>
                Add every web, iOS, Android and server app your team ships,
                <br />
                and see what each of their users does next, as it happens
              </>
            }
            description="Acme collects events from your web, iOS, Android and server apps, keeps them for as long as your plan allows, and turns them into funnels, retention cohorts and answers your whole team can read without writing a query."
            action={
              <Button variant="primary" size="lg" href="/signup">
                Start your 14-day Pro trial, no card needed
              </Button>
            }
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Title only, and action only">
        <div className={frame}>
          <Cta action={null} />
        </div>
        <div className={frame}>
          <Cta title={null} />
        </div>
      </PreviewSection>

      <PreviewSection title="Right to left">
        <div dir="rtl" className={frame}>
          <Cta
            title={
              <>
                أضف مشروعك الأول،
                <br />
                وشاهد الأحداث خلال دقيقة
              </>
            }
            action={
              <Button variant="primary" size="lg" href="/signup">
                ابدأ مجانًا
              </Button>
            }
          />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
