import { BreadcrumbTrail } from '@/registry/kosmos/ui/breadcrumb';

export default function BreadcrumbCollapse() {
  return (
    <div className="w-full max-w-lg min-w-36 resize-x overflow-hidden rounded-xl border border-transparent bg-card p-3 shadow-card">
      <BreadcrumbTrail
        items={[
          { label: 'Acme', href: '/' },
          { label: 'Projects', href: '/projects' },
          { label: 'Brightloop Fitness', href: '/projects/brightloop' },
          { label: 'Funnels', href: '/projects/brightloop/funnels' },
          { label: 'Onboarding', href: '/projects/brightloop/funnels/onboarding' },
          { label: 'Trial to first workout' },
        ]}
      />
    </div>
  );
}
