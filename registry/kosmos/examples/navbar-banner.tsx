import { Navbar, NavbarBanner } from '@/registry/kosmos/blocks/navbar/navbar';

export default function NavbarBannerExample() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
      <Navbar
        current="/pricing"
        banner={
          <NavbarBanner href="/changelog" linkLabel="Read more">
            Annual billing is live, with two months free.
          </NavbarBanner>
        }
      />
      <div aria-hidden className="h-40" />
    </div>
  );
}
