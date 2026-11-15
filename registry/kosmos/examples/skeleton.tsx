import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Skeleton } from '@/registry/kosmos/ui/skeleton';

export default function SkeletonPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Shapes">
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7.5 w-24" />
          <Skeleton className="size-16 rounded-2xl" />
        </div>
      </PreviewSection>

      <PreviewSection title="A person, loading">
        <div aria-busy="true" className="flex items-center gap-2.5">
          <span className="sr-only">Loading profile</span>
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="A card, loading">
        <div
          aria-busy="true"
          className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-transparent bg-card p-4 shadow-card"
        >
          <span className="sr-only">Loading revenue</span>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-32" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Table rows, loading">
        <ul aria-busy="true" aria-label="Loading customers" className="flex w-full max-w-md flex-col divide-y divide-border">
          {[0, 1, 2].map((row) => (
            <li key={row} className="flex items-center gap-3 py-3">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-3.5 flex-1" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </li>
          ))}
        </ul>
      </PreviewSection>
    </PreviewStack>
  );
}
