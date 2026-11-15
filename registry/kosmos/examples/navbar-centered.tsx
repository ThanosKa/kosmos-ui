import { Navbar } from '@/registry/kosmos/blocks/navbar/navbar';

export default function NavbarCentered() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
      <Navbar layout="center" current="/pricing" />
      <div aria-hidden className="h-40" />
    </div>
  );
}
