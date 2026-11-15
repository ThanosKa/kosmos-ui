import { Skeleton } from '@/registry/kosmos/ui/skeleton';

export default function SkeletonDemo() {
  return (
    <div aria-busy="true" className="flex items-center gap-2.5">
      <span className="sr-only">Loading profile</span>
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}
