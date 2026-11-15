import { Navbar } from '@/registry/kosmos/blocks/navbar/navbar';

export default function NavbarDemo() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-transparent bg-background shadow-card">
      <Navbar current="/pricing" data-scrolled="" />
      {/* Stands in for the page under the bar, tall enough to hold an open dropdown. */}
      <div aria-hidden className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="h-56 rounded-xl bg-muted" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-28 rounded-xl bg-muted" />
          <div className="h-28 rounded-xl bg-muted" />
          <div className="h-28 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
