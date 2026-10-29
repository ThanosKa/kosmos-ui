import { ErrorPage } from '@/registry/kosmos/blocks/error-page/error-page';

export default function ErrorPageDemo() {
  return (
    <div className="flex min-h-[36rem] w-full flex-col">
      <ErrorPage
        // eslint-disable-next-line @next/next/no-img-element
        media={<img src="/logos/acme.svg" alt="" className="size-10 rounded-lg" />}
      />
    </div>
  );
}
