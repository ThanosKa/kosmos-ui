'use client';

import { ErrorPage } from '@/registry/kosmos/blocks/error-page/error-page';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';

const frame = 'flex min-h-[32rem] w-full flex-col overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

export default function ErrorPagePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="404 with a logo">
        <div className={frame}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <ErrorPage media={<img src="/logos/acme.svg" alt="" className="size-10 rounded-lg" />} />
        </div>
      </PreviewSection>

      <PreviewSection title="500 with Try again">
        <div className={frame}>
          <ErrorPage
            code="500"
            title="Something went wrong on our side"
            description="We couldn’t load this page. Try again in a moment, or check the status page."
            actions={
              <>
                <Button variant="primary" size="lg" onClick={() => {}}>
                  Try again
                </Button>
                <Button variant="secondary" size="lg" href="#">
                  Status page
                </Button>
              </>
            }
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text, no grid">
        <div className={frame}>
          <ErrorPage
            grid={false}
            title="The project Copperline Bank International Holdings and Partners was moved to another workspace"
            description="https://acme.example/projects/copperline-bank-international-holdings-and-partners/settings/billing/invoices/2026-10"
            actions={
              <Button variant="primary" size="lg" href="#">
                Go to the projects of the Acme workspace and find it there
              </Button>
            }
          />
        </div>
      </PreviewSection>

      <PreviewSection title="No actions, no description">
        <div className={frame}>
          <ErrorPage description={null} actions={null} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
