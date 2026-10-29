'use client';

import { ArrowUpRight } from 'lucide-react';
import * as React from 'react';
import { ActivityCard, ReleaseCard } from '@/components/preset-cards/content-cards';
import { KpiCard, MembersCard, RevenueCard } from '@/components/preset-cards/data-cards';
import { NotificationsCard } from '@/components/preset-cards/form-cards';
import { PresetCard } from '@/components/preset-cards/preset-card';
import { AssistantMessage } from '@/registry/kosmos/ui/assistant-message';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { Calendar } from '@/registry/kosmos/ui/calendar';
import { Field, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { Meter, MeterBar, MeterLabel, MeterValue } from '@/registry/kosmos/ui/meter';
import { PromptComposer } from '@/registry/kosmos/ui/prompt-composer';
import { RadioCard, RadioCardDescription, RadioCardTitle, RadioGroup } from '@/registry/kosmos/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';

const regions = [
  { value: 'us', label: 'United States' },
  { value: 'eu', label: 'European Union' },
  { value: 'ap', label: 'Asia Pacific' },
];

/** Field, Input, Select, RadioCard, primary Button. */
function NewProjectCard() {
  return (
    <PresetCard title="New project" description="Events start counting as soon as it exists.">
      <Field name="name">
        <FieldLabel>Name</FieldLabel>
        <Input defaultValue="Lumenfield Health" />
      </Field>
      <Field name="region">
        <FieldLabel>Data region</FieldLabel>
        <Select items={regions} defaultValue="eu">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field name="plan">
        <FieldLabel nativeLabel={false} render={<div />}>
          Plan
        </FieldLabel>
        <RadioGroup defaultValue="pro" className="grid grid-cols-2 gap-2">
          <RadioCard value="pro">
            <RadioCardTitle>Pro</RadioCardTitle>
            <RadioCardDescription>$49 a month</RadioCardDescription>
          </RadioCard>
          <RadioCard value="scale">
            <RadioCardTitle>Scale</RadioCardTitle>
            <RadioCardDescription>$249 a month</RadioCardDescription>
          </RadioCard>
        </RadioGroup>
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Create project</Button>
      </div>
    </PresetCard>
  );
}

const quotas = [
  { label: 'Events', value: 72 },
  { label: 'Seats', value: 40 },
  { label: 'Exports', value: 91 },
];

/** Meter with automatic tone, Badge, secondary Button. */
function QuotaCard() {
  return (
    <PresetCard title="This month" description="Usage against the Pro allowance" action={<Badge variant="blue">Pro</Badge>}>
      {quotas.map((quota) => (
        <Meter key={quota.label} value={quota.value} tone="auto" optimum={0}>
          <MeterLabel>{quota.label}</MeterLabel>
          <MeterValue />
          <MeterBar />
        </Meter>
      ))}
      <Button variant="secondary" className="self-start">
        Raise the allowance
        <ArrowUpRight aria-hidden data-icon="inline-end" />
      </Button>
    </PresetCard>
  );
}

/** Calendar in range mode, ghost and primary Buttons. */
function ReportPeriodCard() {
  const [period, setPeriod] = React.useState<{ from: Date; to?: Date } | null>({ from: new Date(2026, 9, 6), to: new Date(2026, 9, 17) });
  return (
    <PresetCard title="Report period" description="Oct 6 to Oct 17" bodyClassName="items-center">
      <Calendar mode="range" defaultMonth={new Date(2026, 9, 1)} value={period} onValueChange={setPeriod} aria-label="Report period" />
      <div className="flex w-full justify-end gap-2">
        <Button variant="ghost" onClick={() => setPeriod(null)}>
          Clear
        </Button>
        <Button variant="primary">Apply</Button>
      </div>
    </PresetCard>
  );
}

/** AssistantMessage, PromptComposer. */
function AssistantCard() {
  const [draft, setDraft] = React.useState('');
  return (
    <PresetCard title="Ask Acme" description="Answers from your own events">
      <AssistantMessage role="user">Why did signups drop last Tuesday?</AssistantMessage>
      <AssistantMessage>
        Signups fell 18% on Tuesday. Almost all of it came from the Android build, which stopped sending the signup event.
      </AssistantMessage>
      <PromptComposer value={draft} onValueChange={setDraft} onSubmit={() => setDraft('')} placeholder="Ask a follow-up" />
    </PresetCard>
  );
}

/** The Components screen of the Presets preview: three composed columns, then Members across the full width. */
export function PresetComponents() {
  return (
    <div className="grid items-start gap-4 p-4 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-4">
        <RevenueCard />
        <NewProjectCard />
        <ReleaseCard />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <KpiCard />
        <ReportPeriodCard />
        <QuotaCard />
      </div>
      <div className="flex min-w-0 flex-col gap-4 md:max-xl:col-span-2">
        <AssistantCard />
        <NotificationsCard />
        <ActivityCard />
      </div>
      <div className="md:col-span-2 xl:col-span-3">
        <MembersCard />
      </div>
    </div>
  );
}
