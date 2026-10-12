'use client';

import { useState } from 'react';
import { GalleryCard } from '@/components/gallery/gallery-card';
import { plans, timezones } from '@/components/gallery/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/registry/kosmos/ui/accordion';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { Checkbox } from '@/registry/kosmos/ui/checkbox';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/registry/kosmos/ui/field';
import { Input } from '@/registry/kosmos/ui/input';
import { SegmentedControl, SegmentedControlItem } from '@/registry/kosmos/ui/segmented-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/registry/kosmos/ui/select';
import { Separator } from '@/registry/kosmos/ui/separator';
import { Slider, SliderLabel, SliderValue } from '@/registry/kosmos/ui/slider';
import { Switch } from '@/registry/kosmos/ui/switch';
import { Textarea } from '@/registry/kosmos/ui/textarea';

/** Field, Input (valid and invalid), Select, Textarea, Checkbox, Separator, Button. */
export function ProfileCard() {
  return (
    <GalleryCard title="Profile" description="How other members of Acme Inc. see you.">
      <form className="flex flex-col gap-4" onSubmit={(event) => event.preventDefault()}>
        <Field name="name">
          <FieldLabel>Full name</FieldLabel>
          <Input defaultValue="Maya Chen" autoComplete="name" />
        </Field>
        <Field name="email">
          <FieldLabel>Email</FieldLabel>
          <Input type="email" defaultValue="maya@acme.example" autoComplete="email" />
          <FieldDescription>Used for sign-in and notifications.</FieldDescription>
        </Field>
        <Field name="handle" invalid>
          <FieldLabel>Username</FieldLabel>
          <Input defaultValue="maya chen" autoComplete="username" />
          <FieldError>Use lowercase letters, numbers and hyphens only.</FieldError>
        </Field>
        <Field name="timezone">
          <FieldLabel nativeLabel={false} render={<div />}>
            Time zone
          </FieldLabel>
          <Select name="timezone" items={timezones} defaultValue="europe-athens">
            <SelectTrigger>
              <SelectValue placeholder="Pick a time zone" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(timezones).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field name="bio">
          <FieldLabel>Bio</FieldLabel>
          <Textarea
            maxLength={160}
            defaultValue="Product designer working on billing and onboarding."
            placeholder="A line or two about your work."
          />
        </Field>
        <Field name="show-email" orientation="horizontal">
          <Checkbox defaultChecked />
          <FieldContent>
            <FieldLabel>Show my email to other members</FieldLabel>
            <FieldDescription>Guests never see it.</FieldDescription>
          </FieldContent>
        </Field>
        <Separator />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="reset">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save changes
          </Button>
        </div>
      </form>
    </GalleryCard>
  );
}

const notificationRows = [
  { name: 'mentions', label: 'Mentions', description: 'When someone mentions you in a comment.', checked: true },
  { name: 'assigned', label: 'Assigned to me', description: 'When an account or task is assigned to you.', checked: true },
  { name: 'digest', label: 'Weekly digest', description: 'A summary of changes, every Monday at 9:00.', checked: false },
  { name: 'sms', label: 'Text messages', description: 'Available on the Business plan.', checked: false, disabled: true },
];

/** Switch rows, Slider, Separator. */
export function NotificationsCard() {
  return (
    <GalleryCard title="Notifications" description="Choose what reaches your inbox.">
      <div className="flex flex-col divide-y divide-border">
        {notificationRows.map((row) => (
          <Field
            key={row.name}
            name={row.name}
            orientation="horizontal"
            disabled={row.disabled}
            className="py-3 first:pt-0"
          >
            <FieldContent>
              <FieldLabel>{row.label}</FieldLabel>
              <FieldDescription>{row.description}</FieldDescription>
            </FieldContent>
            <Switch defaultChecked={row.checked} />
          </Field>
        ))}
      </div>
      <Separator />
      <Slider name="usage-alert" defaultValue={0.8} min={0.5} max={1} step={0.05} format={{ style: 'percent' }}>
        <div className="flex items-center justify-between gap-4">
          <SliderLabel>Usage alert</SliderLabel>
          <SliderValue />
        </div>
      </Slider>
      <p className="-mt-2 text-small text-muted-foreground">Email the admins when any quota passes this share.</p>
    </GalleryCard>
  );
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** SegmentedControl, Badge, Accordion. */
export function PlansCard() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  return (
    <GalleryCard
      title="Plan"
      description="Prices per member."
      action={
        <SegmentedControl
          size="sm"
          aria-label="Billing period"
          value={billing}
          onValueChange={(value) => setBilling(value as 'monthly' | 'yearly')}
        >
          <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
          <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
        </SegmentedControl>
      }
    >
      <ul className="flex flex-col divide-y divide-border">
        {plans.map((plan) => {
          const price = billing === 'yearly' ? Math.round(plan.monthly * 0.8) : plan.monthly;
          return (
            <li key={plan.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-body font-medium">{plan.name}</span>
                  {plan.current ? <Badge variant="primary">Current</Badge> : null}
                </div>
                <span className="text-small text-muted-foreground">{plan.description}</span>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className="text-body font-medium tabular-nums">{price === 0 ? 'Free' : usd.format(price)}</span>
                {price === 0 ? null : <span className="text-caption text-muted-foreground">per month</span>}
              </div>
            </li>
          );
        })}
      </ul>
      <Accordion defaultValue={['seats']} className="-mx-2 w-auto">
        <AccordionItem value="seats">
          <AccordionTrigger>How are seats counted?</AccordionTrigger>
          <AccordionContent>
            Every member who signed in during the billing period counts as one seat. Guests are free.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="change">
          <AccordionTrigger>Can I change plans later?</AccordionTrigger>
          <AccordionContent>Upgrades apply right away and are prorated. Downgrades apply at renewal.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </GalleryCard>
  );
}
