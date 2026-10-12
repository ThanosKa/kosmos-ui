/*
 * Sample data for the gallery: one made-up workspace ("Acme Inc.") with its people, invoices and
 * activity. Every name and domain is invented; domains use the reserved `.example` suffix.
 */

export type Person = { id: string; name: string; email: string; initials: string; avatar?: string };

export const people = {
  maya: { id: 'maya', name: 'Maya Chen', email: 'maya@acme.example', initials: 'MC', avatar: '/avatars/avatar-1.png' },
  jonas: { id: 'jonas', name: 'Jonas Weber', email: 'jonas@acme.example', initials: 'JW', avatar: '/avatars/avatar-2.png' },
  priya: { id: 'priya', name: 'Priya Raman', email: 'priya@acme.example', initials: 'PR', avatar: '/avatars/avatar-3.png' },
  dara: { id: 'dara', name: 'Dara Okafor', email: 'dara@acme.example', initials: 'DO' },
  elif: { id: 'elif', name: 'Elif Demir', email: 'elif@acme.example', initials: 'ED', avatar: '/avatars/avatar-4.png' },
  ben: { id: 'ben', name: 'Ben Carter', email: 'ben@quarry.example', initials: 'BC' },
} satisfies Record<string, Person>;

export type MemberStatus = 'active' | 'invited' | 'suspended';

export const members: { person: Person; status: MemberStatus }[] = [
  { person: people.maya, status: 'active' },
  { person: people.jonas, status: 'active' },
  { person: people.priya, status: 'active' },
  { person: people.dara, status: 'invited' },
  { person: people.ben, status: 'suspended' },
];

export const memberStatus: Record<MemberStatus, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  active: { label: 'Active', variant: 'success' },
  invited: { label: 'Invited', variant: 'warning' },
  suspended: { label: 'Suspended', variant: 'destructive' },
};

export type RevenueRange = '7d' | '30d' | '90d';

/** Revenue per point, in two series; deterministic so screenshots stay stable. */
function series(labels: string[], base: number, step: number): { label: string; newBusiness: number; expansion: number }[] {
  return labels.map((label, index) => {
    const wave = Math.round(Math.sin(index * 1.3) * step * 0.6);
    return {
      label,
      newBusiness: base + index * step + wave,
      expansion: Math.round(base * 0.45 + index * step * 0.6 - wave * 0.5),
    };
  });
}

export const revenue: Record<RevenueRange, ReturnType<typeof series>> = {
  '7d': series(['Oct 5', 'Oct 6', 'Oct 7', 'Oct 8', 'Oct 9', 'Oct 10', 'Oct 11'], 1400, 90),
  '30d': series(['Sep 12', 'Sep 15', 'Sep 18', 'Sep 21', 'Sep 24', 'Sep 27', 'Sep 30', 'Oct 3', 'Oct 6', 'Oct 9', 'Oct 11'], 4200, 260),
  '90d': series(['Jul 20', 'Jul 27', 'Aug 3', 'Aug 10', 'Aug 17', 'Aug 24', 'Aug 31', 'Sep 7', 'Sep 14', 'Sep 21', 'Sep 28', 'Oct 5'], 9800, 520),
};

export const revenueSummary: Record<RevenueRange, { total: number; change: number }> = {
  '7d': { total: 14280, change: 6.1 },
  '30d': { total: 58410, change: 12.4 },
  '90d': { total: 162900, change: -2.3 },
};

export const activity = [
  { id: 'a1', person: people.jonas, text: 'moved Bluebird Labs to At risk', time: '4m', kind: 'update' },
  { id: 'a2', person: people.priya, text: 'mentioned you on the renewal plan for Tidewater Outfitters', time: '18m', kind: 'mention' },
  { id: 'a3', person: people.maya, text: 'closed the expansion with Kestrel Analytics for 40 seats', time: '1h', kind: 'update' },
  { id: 'a4', person: people.elif, text: 'commented on Q4 pricing review: “Can we test annual-only for the Team plan?”', time: '2h', kind: 'comment' },
  { id: 'a5', person: people.dara, text: 'accepted the invite and joined Acme Inc.', time: '3h', kind: 'update' },
  { id: 'a6', person: people.jonas, text: 'mentioned you in Onboarding checklist v2', time: 'Yesterday', kind: 'mention' },
  { id: 'a7', person: people.priya, text: 'exported 1,240 accounts to CSV', time: 'Yesterday', kind: 'update' },
  { id: 'a8', person: people.maya, text: 'commented on Billing revamp: “Shipping behind a flag on Monday.”', time: 'Oct 8', kind: 'comment' },
] as const;

export const timezones = {
  'europe-athens': 'Athens (GMT+3)',
  'europe-berlin': 'Berlin (GMT+2)',
  'america-new-york': 'New York (GMT−4)',
  'asia-singapore': 'Singapore (GMT+8)',
};

export const plans = [
  { id: 'starter', name: 'Starter', description: 'Up to 5 members and 3 projects.', monthly: 0 },
  { id: 'team', name: 'Team', description: 'Unlimited projects, saved views and guests.', monthly: 24, current: true },
  { id: 'business', name: 'Business', description: 'Single sign-on, audit log and priority support.', monthly: 49 },
];
