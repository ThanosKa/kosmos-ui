import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Field, FieldContent, FieldDescription, FieldItem, FieldLabel } from '@/registry/kosmos/ui/field';
import { RadioCard, RadioCardDescription, RadioCardTitle, RadioGroup, RadioGroupItem } from '@/registry/kosmos/ui/radio-group';
import RadioGroupCards from './radio-group-cards';
import RadioGroupDemo from './radio-group-demo';
import RadioGroupDescription from './radio-group-description';
import RadioGroupInvalid from './radio-group-invalid';

const rows = ['unselected', 'selected'] as const;
const states = ['default', 'hover', 'focus', 'invalid', 'disabled'] as const;

function stateProps(state: (typeof states)[number]) {
  if (state === 'invalid') return { 'aria-invalid': true } as const;
  return previewState(state);
}

export default function RadioGroupPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Radio × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <RadioGroup aria-label={`Radio, ${row}, ${state}`} defaultValue={row === 'selected' ? 'on' : undefined}>
              <RadioGroupItem value="on" aria-label={`Option, ${row}, ${state}`} {...stateProps(state)} />
            </RadioGroup>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Radio card × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <RadioGroup aria-label={`Plan, ${row}, ${state}`} defaultValue={row === 'selected' ? 'pro' : undefined} className="w-full">
              <RadioCard value="pro" {...stateProps(state)}>
                <RadioCardTitle>Pro</RadioCardTitle>
                <RadioCardDescription>From $49</RadioCardDescription>
              </RadioCard>
            </RadioGroup>
          )}
        />
      </PreviewSection>

      <PreviewSection title="In a field">
        <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
          <RadioGroupDemo />
          <RadioGroupDescription />
          <RadioGroupInvalid />
          <Field name="region-locked" disabled>
            <FieldLabel nativeLabel={false} render={<div />}>
              Data region
            </FieldLabel>
            <RadioGroup defaultValue="eu">
              <FieldItem>
                <RadioGroupItem value="us" />
                <FieldLabel>United States</FieldLabel>
              </FieldItem>
              <FieldItem>
                <RadioGroupItem value="eu" />
                <FieldLabel>European Union</FieldLabel>
              </FieldItem>
            </RadioGroup>
            <FieldDescription>The region is fixed once a project receives its first event.</FieldDescription>
          </Field>
        </div>
      </PreviewSection>

      <PreviewSection title="In a row">
        <Field name="range">
          <FieldLabel nativeLabel={false} render={<div />}>
            Compare with
          </FieldLabel>
          <RadioGroup defaultValue="previous" className="flex flex-wrap gap-x-6 gap-y-3">
            <FieldItem>
              <RadioGroupItem value="previous" />
              <FieldLabel>Previous period</FieldLabel>
            </FieldItem>
            <FieldItem>
              <RadioGroupItem value="year" />
              <FieldLabel>Same period last year</FieldLabel>
            </FieldItem>
            <FieldItem>
              <RadioGroupItem value="none" />
              <FieldLabel>Nothing</FieldLabel>
            </FieldItem>
          </RadioGroup>
        </Field>
      </PreviewSection>

      <PreviewSection title="Radio cards">
        <RadioGroupCards />
      </PreviewSection>

      <PreviewSection title="Radio cards with a disabled option">
        <RadioGroup aria-label="Data region" defaultValue="us" className="max-w-md">
          <RadioCard value="us">
            <RadioCardTitle>United States</RadioCardTitle>
            <RadioCardDescription>Events are stored in Virginia and Oregon.</RadioCardDescription>
          </RadioCard>
          <RadioCard value="eu" disabled>
            <RadioCardTitle>European Union</RadioCardTitle>
            <RadioCardDescription>Available on the Scale plan.</RadioCardDescription>
          </RadioCard>
        </RadioGroup>
      </PreviewSection>

      <PreviewSection title="Long text in a narrow slot">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="w-56">
            <Field name="long">
              <FieldLabel nativeLabel={false} render={<div />}>
                When a project passes its monthly event allowance
              </FieldLabel>
              <RadioGroup defaultValue="email">
                <FieldItem>
                  <RadioGroupItem value="email" />
                  <FieldContent>
                    <FieldLabel>Email every member of the workspace before the next bill</FieldLabel>
                    <FieldDescription>Collection never stops, so nothing is lost.</FieldDescription>
                  </FieldContent>
                </FieldItem>
                <FieldItem>
                  <RadioGroupItem value="quiet" />
                  <FieldLabel>Say nothing</FieldLabel>
                </FieldItem>
              </RadioGroup>
            </Field>
          </div>
          <RadioGroup aria-label="Workspace" defaultValue="staging" className="w-56">
            <RadioCard value="acme">
              <RadioCardTitle>Acme</RadioCardTitle>
              <RadioCardDescription>Scale plan</RadioCardDescription>
            </RadioCard>
            <RadioCard value="staging">
              <RadioCardTitle>Acme Staging, the workspace for testing new tracking plans</RadioCardTitle>
              <RadioCardDescription>Free plan, up to 50,000 events a month across every project in it</RadioCardDescription>
            </RadioCard>
            <RadioCard value="unbroken">
              <RadioCardTitle >acme-staging-tracking-plan-review-2026.example</RadioCardTitle>
            </RadioCard>
          </RadioGroup>
        </div>
      </PreviewSection>
      <PreviewSection title="Right to left">
        <div dir="rtl" lang="ar" className="grid gap-8 sm:grid-cols-2">
          <Field name="rtl-summary">
            <FieldLabel nativeLabel={false} render={<div />}>
              إرسال الملخص
            </FieldLabel>
            <RadioGroup defaultValue="weekly">
              <FieldItem>
                <RadioGroupItem value="daily" />
                <FieldLabel>كل يوم</FieldLabel>
              </FieldItem>
              <FieldItem>
                <RadioGroupItem value="weekly" />
                <FieldLabel>كل يوم اثنين</FieldLabel>
              </FieldItem>
            </RadioGroup>
          </Field>
          <RadioGroup aria-label="الخطة" defaultValue="pro">
            <RadioCard value="free">
              <RadioCardTitle>مجاني</RadioCardTitle>
              <RadioCardDescription>حتى 50,000 حدث شهريًا.</RadioCardDescription>
            </RadioCard>
            <RadioCard value="pro">
              <RadioCardTitle>احترافي</RadioCardTitle>
              <RadioCardDescription>حتى 3 ملايين حدث شهريًا.</RadioCardDescription>
            </RadioCard>
          </RadioGroup>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
