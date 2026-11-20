'use client';

import { Copy, Eye, UserRound } from 'lucide-react';
import { DataSetPreview } from '@/components/preview/data-set-preview';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import {
  DashboardAnalytics,
  DashboardAnalyticsPage,
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
  { id: 'emoji', name: '🚀 山田 太郎', email: 'taro@kiln.example', presence: 'away', plan: 'pro', source: 'Social', referrer: 'x.example/a-very-long-referrer-path/that-keeps-going', step: 'Invited 1,284 teammates', activation: 100, mrr: 4_812_000_000, joined: '1,284 days ago' },
  { id: 'rtl', name: 'ليلى بنت عبد الرحمن', email: 'layla@acme.example', plan: 'trial', source: 'Direct', referrer: '—', step: 'Signed up', activation: 3, mrr: 0, joined: 'Oct 1' },
  { id: 'short', name: 'Al', email: 'al@kiln.example', plan: 'free', source: 'Direct', referrer: '—', step: 'Signed up', activation: 0, mrr: 0, joined: 'Oct 1' },
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

const worstProps = {
  kpis: everyRange([
    { id: 'k1', icon: Eye, eyebrow: 'Visit to signup across every region and plan', label: 'Conversion rate for the Growth and Platform teams', value: '100%', change: 99999.9, context: '(+4,812,000)', trend: [0, 1, 0, 1_000_000] },
    { id: 'k2', icon: Eye, label: 'Median session', value: '1,284h 59m', change: -100, trend: [1] },
  ]),
  traffic: everyRange({
    totals: [
      { label: 'Visitors', value: '48,210,000', change: 99999.9 },
      { label: 'Page views', value: '1,284,502,920', change: -100 },
      { label: 'Bounce rate', value: '100%', change: 0, unit: 'points' as const, goodWhen: 'down' as const },
    ],
    points: [
      { label: 'Oct 9', current: 0, previous: 48_210_000 },
      { label: 'Oct 10', current: 1_284_502_920, previous: 1 },
    ],
  }),
  sources: everyRange([
    { id: 's1', label: 'Referral from the Fernhill Books Marketplace partner network', visitors: 48_210_000 },
    { id: 's2', label: '🚀 Product Hunt', visitors: 1 },
    { id: 's3', label: '日本のコミュニティ', visitors: 0 },
  ]),
};

export default function DashboardAnalyticsPreview() {
  return <DataSetPreview demo={<Demo />} worst={<Worst />} />;
}

function Demo() {
  return (
    <PreviewStack>
      <PreviewSection title="As a page, beside the App sidebar">
        <DashboardAnalyticsPage
          frame={{ storageKey: false, className: 'h-[48rem] w-full overflow-hidden rounded-xl border border-transparent shadow-card' }}
          sidebar={{ onNavigate: (_id, event) => event.preventDefault() }}
          signupActions={actions}
        />
      </PreviewSection>
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
            sources={everyRange([])}
            topPages={everyRange([])}
            countries={everyRange([])}
            goal={{ description: 'October target: 1,300 signups', count: 0, target: 1300, pace: -35.5, team: { label: 'Growth', people: [] } }}
            signups={[]}
          />
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

function Worst() {
  return (
    <PreviewStack>
      <PreviewSection title="Long text and extreme values">
        <div className={frame}>
          <DashboardAnalytics
            {...worstProps}
            topPages={everyRange([
              { id: 'long', label: '/docs/dashboards/share-a-dashboard-with-a-link-that-never-expires', value: 1_920_000 },
              { id: 'one', label: '/', value: 1 },
            ])}
            countries={everyRange([{ id: 'cd', label: 'Democratic Republic of the Congo', meta: 'CD', value: 38_910 }])}
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

      <PreviewSection title="Worst case in a narrow container">
        <div className={`${frame} max-w-sm`}>
          <DashboardAnalytics {...worstProps} signups={longSignups} signupActions={actions} />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
