import { BreadcrumbTrail } from '@/registry/kosmos/ui/breadcrumb';

export default function BreadcrumbDemo() {
  return (
    <BreadcrumbTrail
      className="w-full max-w-md"
      items={[
        { label: 'Acme', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: 'Fernhill Books', href: '/projects/fernhill' },
        { label: 'Settings', href: '/projects/fernhill/settings' },
        { label: 'API keys' },
      ]}
    />
  );
}
