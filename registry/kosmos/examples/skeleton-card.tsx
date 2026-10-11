import { Skeleton } from '@/registry/kosmos/ui/skeleton';

export default function SkeletonCard() {
  return (
    <div
      aria-busy="true"
      className="flex w-full max-w-xs flex-col gap-4 rounded-2xl border border-transparent bg-card p-4 shadow-card"
    >
      <span className="sr-only">Loading revenue</span>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}
