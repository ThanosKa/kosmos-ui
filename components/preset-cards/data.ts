/*
 * Sample data for the Presets preview: the Acme workspace with its team, revenue and activity. Every name and
 * domain is invented; domains use the reserved `.example` suffix.
 */

export type Person = { id: string; name: string; email: string; initials: string; avatar?: string };

export const people = {
  lena: { id: 'lena', name: 'Lena Park', email: 'lena@acme.example', initials: 'LP', avatar: '/avatars/lena.jpg' },
  tomas: { id: 'tomas', name: 'Tomás Ortega', email: 'tomas@acme.example', initials: 'TO', avatar: '/avatars/tomas.jpg' },
  ama: { id: 'ama', name: 'Ama Mensah', email: 'ama@acme.example', initials: 'AM', avatar: '/avatars/ama.jpg' },
  kai: { id: 'kai', name: 'Kai Nakamura', email: 'kai@acme.example', initials: 'KN', avatar: '/avatars/kai.jpg' },
} satisfies Record<string, Person>;

export type MemberStatus = 'active' | 'invited' | 'suspended';

export const members: { person: Person; status: MemberStatus }[] = [
  { person: people.lena, status: 'active' },
  { person: people.tomas, status: 'active' },
  { person: people.ama, status: 'active' },
  { person: people.kai, status: 'invited' },
];

export const memberStatus: Record<MemberStatus, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  active: { label: 'Active', variant: 'success' },
  invited: { label: 'Invited', variant: 'warning' },
  suspended: { label: 'Suspended', variant: 'destructive' },
};

export type RevenueRange = '7d' | '30d' | '90d';

export const revenueSummary: Record<RevenueRange, { total: number; change: number }> = {
  '7d': { total: 14628, change: 1.2 },
  '30d': { total: 14628, change: 6.8 },
  '90d': { total: 14628, change: 18.9 },
};

/** Monthly revenue against the period before, rising to today's figure; deterministic so screenshots stay stable. */
function series(labels: string[], change: number): { label: string; revenue: number; previous: number }[] {
  const total = revenueSummary['30d'].total;
  const start = 1 / (1 + change / 100);
  return labels.map((label, index) => {
    const progress = index / (labels.length - 1);
    const noise = Math.sin(index * 1.9) * 0.006 + Math.sin(index * 4.7) * 0.004;
    const factor = start + (1 - start) * progress + noise * (0.4 + progress);
    const previous = start * (0.97 + 0.02 * progress) + Math.sin(index * 2.3 + 1) * 0.01;
    return { label, revenue: Math.round(total * factor), previous: Math.round(total * previous) };
  });
}

export const revenue: Record<RevenueRange, ReturnType<typeof series>> = {
  '7d': series(['Oct 5', 'Oct 6', 'Oct 7', 'Oct 8', 'Oct 9', 'Oct 10', 'Oct 11'], revenueSummary['7d'].change),
  '30d': series(
    ['Sep 12', 'Sep 15', 'Sep 18', 'Sep 21', 'Sep 24', 'Sep 27', 'Sep 30', 'Oct 3', 'Oct 6', 'Oct 9', 'Oct 11'],
    revenueSummary['30d'].change,
  ),
  '90d': series(
    ['Jul 20', 'Jul 27', 'Aug 3', 'Aug 10', 'Aug 17', 'Aug 24', 'Aug 31', 'Sep 7', 'Sep 14', 'Sep 21', 'Sep 28', 'Oct 5'],
    revenueSummary['90d'].change,
  ),
};

export const activity = [
  { id: 'a1', person: people.tomas, text: 'raised the rate limit for Cirrus Weather', time: '4m', kind: 'update' },
  { id: 'a2', person: people.ama, text: 'mentioned you on Funnel comparisons', time: '18m', kind: 'mention' },
  { id: 'a3', person: people.tomas, text: 'moved Server-side batching to In progress', time: '1h', kind: 'update' },
  { id: 'a4', person: people.ama, text: 'commented on Shareable dashboard links: “Can viewers pick their own date range?”', time: '2h', kind: 'comment' },
  { id: 'a5', person: people.tomas, text: 'resent the invite to kai@acme.example', time: '3h', kind: 'update' },
  { id: 'a6', person: people.ama, text: 'mentioned you in Mobile SDK 3.0', time: 'Yesterday', kind: 'mention' },
  { id: 'a7', person: people.tomas, text: 'exported 12 projects to CSV', time: 'Yesterday', kind: 'update' },
  { id: 'a8', person: people.ama, text: 'commented on Funnel comparisons: “Shipping behind a flag on Monday.”', time: 'Oct 8', kind: 'comment' },
] as const;

export const timezones = {
  'europe-athens': 'Athens (GMT+3)',
  'europe-berlin': 'Berlin (GMT+2)',
  'america-new-york': 'New York (GMT−4)',
  'asia-singapore': 'Singapore (GMT+8)',
};

export const plans = [
  { id: 'free', name: 'Free', description: 'One project and up to 100,000 events a month.', monthly: 0 },
  { id: 'pro', name: 'Pro', description: 'Unlimited projects, funnels and saved views.', monthly: 49, current: true },
  { id: 'scale', name: 'Scale', description: 'Single sign-on, EU data region and priority support.', monthly: 1200 },
];
