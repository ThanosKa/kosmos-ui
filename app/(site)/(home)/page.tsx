import type { Metadata } from 'next';
import Link from 'next/link';
import { DashboardShowcase } from '@/components/site/dashboard-showcase';
import { itemsInGroup, readRegistryItems } from '@/lib/registry';
import { appDescription, appName } from '@/lib/shared';
import { buttonVariants } from '@/registry/kosmos/ui/button';

const title = `${appName}: Components and blocks for dashboard apps`;

export const metadata: Metadata = {
  title: { absolute: title },
  description: appDescription,
  openGraph: { siteName: appName, type: 'website', title, description: appDescription, url: '/' },
};

export default function HomePage() {
  const items = readRegistryItems();
  const componentCount = items.filter((item) => item.type === 'registry:ui').length;
  const blockCount = itemsInGroup('blocks', items).length;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6">
      <section className="flex flex-col items-center pt-14 pb-12 text-center sm:pt-24 sm:pb-16">
        <h1 className="max-w-[14em] text-hero text-balance">Dashboard UI with the details already done</h1>
        <p className="mt-5 max-w-[34em] text-lead text-pretty text-muted-foreground">
          {componentCount} components and {blockCount} blocks for dashboard apps, installed from the shadcn
          registry. Free and open source under MIT.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {/* Router links styled as buttons: `Button href` renders a plain <a>, which reloads the page. */}
          <Link href="/docs/installation" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Get started
          </Link>
          <Link href="/docs/components" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
            Browse components
          </Link>
        </div>
      </section>

      <section aria-labelledby="demo-heading" className="flex flex-col gap-4 pb-16 sm:pb-24">
        <h2 id="demo-heading" className="sr-only">
          Live dashboard
        </h2>
        <DashboardShowcase />
        <p className="text-center text-small text-pretty text-muted-foreground">
          A live dashboard built from the free blocks. Open an account, drag cards on the board or{' '}
          <Link
            href="/docs/blocks"
            className="rounded-sm font-medium text-foreground underline decoration-muted-foreground underline-offset-4 transition-[text-decoration-color] hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            browse the blocks
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
