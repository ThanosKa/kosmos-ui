import { BarChart3, Bell, Filter, GitBranch, Repeat, Users } from 'lucide-react';
import { Navbar, type NavbarItem } from '@/registry/kosmos/blocks/navbar/navbar';

/** Two titled columns of links, each with an icon and one line. */
export const megaItems: NavbarItem[] = [
  {
    label: 'Product',
    sections: [
      {
        title: 'Analyze',
        links: [
          { label: 'Dashboards', href: '/features/dashboards', description: 'Charts of your events, shared with the team.', icon: <BarChart3 /> },
          { label: 'Funnels', href: '/features/funnels', description: 'See where users drop off between two steps.', icon: <Filter /> },
          { label: 'Retention', href: '/features/retention', description: 'Cohorts who come back, week after week.', icon: <Repeat /> },
        ],
      },
      {
        title: 'Act',
        links: [
          { label: 'Alerts', href: '/features/alerts', description: 'A message when a number leaves its range.', icon: <Bell /> },
          { label: 'Segments', href: '/features/segments', description: 'Save a group of users and reuse it anywhere.', icon: <Users /> },
          { label: 'Pipelines', href: '/features/pipelines', description: 'Send events on to your warehouse.', icon: <GitBranch /> },
        ],
      },
    ],
  },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Changelog', href: '/changelog' },
];

export default function NavbarMega() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
      <Navbar items={megaItems} current="/features/funnels" />
      <div aria-hidden className="h-48" />
    </div>
  );
}
