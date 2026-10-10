import type { ReactNode } from 'react';

/** The page body of a component's review preview (`registry/kosmos/examples/<name>.tsx`). */
export function PreviewStack({ children }: { children: ReactNode }) {
  return <div className="flex w-full max-w-5xl flex-col gap-10">{children}</div>;
}

/** One labelled group on a review preview: the state matrix, sizes, with icons, ... */
export function PreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-caption font-medium tracking-[0.05em] text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}
