import { Navbar } from '@/registry/kosmos/blocks/navbar/navbar';

export default function NavbarDemo() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
      <Navbar current="/pricing" />
      <div aria-hidden className="h-40" />
    </div>
  );
}
