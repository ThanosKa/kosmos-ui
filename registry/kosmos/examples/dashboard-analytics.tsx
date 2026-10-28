'use client';

import { Copy, UserRound } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import {
  DashboardAnalytics,
  type AnalyticsRange,
  type Signup,
  type Traffic,
} from '@/registry/kosmos/blocks/dashboard-analytics/dashboard-analytics';
import { DropdownMenuItem } from '@/registry/kosmos/ui/dropdown-menu';

const frame = 'w-full rounded-xl border border-transparent bg-background p-4 shadow-card';

const emptyTraffic: Traffic = {
  totals: [
    { label: 'Visitors', value: '0', change: 0 },
    { label: 'Page views', value: '0', change: 0 },
    { label: 'Bounce rate', value: '0%', change: 0, unit: 'points', goodWhen: 'down' },
  ],
  points: [],
};
const everyRange = <T,>(value: T): Record<AnalyticsRange, T> => ({ '7d': value, '30d': value, '90d': value });

const longSignups: Signup[] = [
  {
    id: 'long',
    name: 'Guadalupe Fernández-Villaverde de la Concepción',
    email: 'guadalupe.fernandez-villaverde@ironbark-logistics-international.example',
    presence: 'online',
    plan: 'scale',
    source: 'Referral',
    referrer: 'acme.example/docs/dashboards/share-a-dashboard-with-a-link',
    step: 'Connected the warehouse export to their own storage',
    activation: 100,
    mrr: 1_284_000,
    joined: 'Just now',
  },
  { id: 'short', name: 'Al', email: 'al@kiln.example', plan: 'free', source: 'Direct', referrer: '—', step: 'Signed up', activation: 0, mrr: 0, joined: 'Oct 1' },
  { id: 'rtl', name: 'ليلى حداد', email: 'leila@ironbark.example', presence: 'away', plan: 'trial', source: 'Search', referrer: 'Google', step: 'Installed the SDK', activation: 41, mrr: 0, joined: '1 hour ago' },
];

function actions(signup: Signup) {
  return (
    <>
      <DropdownMenuItem>
        <UserRound />
        View profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(signup.email)}>
        <Copy />
        Copy email
      </DropdownMenuItem>
    </>
  );
}

export default function DashboardAnalyticsPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Full, 30 days">
        <div className={frame}>
          <DashboardAnalytics signupActions={actions} />
        </div>
      </PreviewSection>

      <PreviewSection title="7 days, no row actions">
        <div className={frame}>
          <DashboardAnalytics defaultRange="7d" />
        </div>
      </PreviewSection>

      <PreviewSection title="No data yet">
        <div className={frame}>
          <DashboardAnalytics
            traffic={everyRange(emptyTraffic)}
            sources={[]}
            topPages={[]}
            countries={[]}
            goal={{ description: 'October target: 1,300 signups', count: 0, target: 1300, pace: -35.5, team: { label: 'Growth', people: [] } }}
            signups={[]}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text and extreme values">
        <div className={frame}>
          <DashboardAnalytics
            topPages={[
              { id: 'long', label: '/docs/dashboards/share-a-dashboard-with-a-link-that-never-expires', value: 1_920_000 },
              { id: 'one', label: '/', value: 1 },
            ]}
            countries={[{ id: 'cd', label: 'Democratic Republic of the Congo', meta: 'CD', value: 38_910 }]}
            goal={{
              description: 'October target for the Growth and Platform teams across Europe and the Middle East',
              count: 2_480,
              target: 1300,
              pace: 154.2,
              team: { label: 'Growth and Platform, Europe', people: [{ name: 'Kai Nakamura' }, { name: 'Lena Park' }, { name: 'Ama Mensah' }, { name: 'Tomás Ortega' }] },
            }}
            signups={longSignups}
            signupActions={actions}
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Right to left">
        <div dir="rtl" className={frame}>
          <DashboardAnalytics signupActions={actions} />
        </div>
      </PreviewSection>

      <PreviewSection title="In a narrow container">
        <div className={`${frame} max-w-sm`}>
          <DashboardAnalytics />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
