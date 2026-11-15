import { buttonVariants } from '@/registry/kosmos/ui/button';

/** The first stop for keyboard users: jumps past the header to the element with `id="content"`. */
export function SkipLink() {
  return (
    <a
      href="#content"
      data-skip-link=""
      className={`${buttonVariants({ variant: 'secondary' })} fixed start-4 top-3 z-50 -translate-y-16 focus-visible:translate-y-0`}
    >
      Skip to content
    </a>
  );
}
