import { ArrowUpRight, Check, Clock } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Badge } from '@/registry/kosmos/ui/badge';
import BadgeCodes from '@/registry/kosmos/examples/badge-codes';
import { DataSetPreview } from '@/components/preview/data-set-preview';

const variants = [
  'secondary',
  'primary',
  'success',
  'warning',
  'destructive',
  'gray',
  'blue',
  'green',
  'amber',
  'red',
  'violet',
] as const;
const codeStates = ['default', 'link', 'hover', 'focus'] as const;

const labels: Record<(typeof variants)[number], string> = {
  secondary: 'Draft',
  primary: 'New',
  success: 'Active',
  warning: 'Pending',
  destructive: 'Failed',
  gray: 'Free',
  blue: 'Pro',
  green: '200',
  amber: 'Trial',
  red: '500',
  violet: 'Scale',
};

const rows = [
  { name: 'Fernhill Books', status: 'success', label: 'Active' },
  { name: 'Marigold Recipes', status: 'warning', label: 'Trial ends soon' },
  { name: 'Hollow Oak Games', status: 'destructive', label: 'Payment failed' },
] as const;

function Normal() {
  return (
    <>
      <PreviewSection title="Variants × states">
        <StateMatrix
          rows={variants}
          states={codeStates}
          render={(variant, state) =>
            state === 'default' ? (
              <Badge variant={variant}>{labels[variant]}</Badge>
            ) : (
              <Badge
                variant={variant}
                render={<a href="https://base-ui.com/react/overview/releases" />}
                {...previewState(state === 'link' ? 'default' : state)}
              >
                {labels[variant]}
              </Badge>
            )
          }
        />
      </PreviewSection>

      <PreviewSection title="With icons and counts">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">
            <Check />
            Verified
          </Badge>
          <Badge variant="secondary">
            <Clock />
            2 days left
          </Badge>
          <Badge variant="secondary" render={<a href="https://base-ui.com/react/overview/releases" />}>
            Changelog
            <ArrowUpRight />
          </Badge>
          <Badge variant="primary">3</Badge>
          <Badge variant="secondary">12</Badge>
          <Badge variant="secondary">1,280</Badge>
        </div>
      </PreviewSection>

      <PreviewSection title="In a row">
        <ul className="flex w-full max-w-md flex-col divide-y divide-border">
          {rows.map((row) => (
            <li key={row.name} className="flex items-center justify-between gap-3 py-2.5 text-body">
              <span className="min-w-0 truncate">{row.name}</span>
              <Badge variant={row.status}>{row.label}</Badge>
            </li>
          ))}
        </ul>
      </PreviewSection>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <PreviewSection title="Codes in a request log">
          <BadgeCodes />
        </PreviewSection>
      </div>

      <PreviewSection title="Long label in a narrow slot">
        <div className="flex w-40 flex-col items-start gap-2">
          <Badge variant="warning">
            <span className="min-w-0 truncate">Waiting for approval from the finance team</span>
          </Badge>
          <Badge variant="secondary">
            <span className="min-w-0 truncate">Scale plan, billed yearly, with priority support</span>
          </Badge>
        </div>
      </PreviewSection>
    </>
  );
}

const worstRows = [
  { name: 'Copperline Bank server events for card payments, loans and the business portal', status: 'warning', label: 'Waiting for approval from the finance team' },
  { name: 'Ιστότοπος καφέ Saltmarsh 🌊', status: 'success', label: 'Ενεργό' },
  { name: 'K', status: 'destructive', label: 'Μη έγκυρο πιστοποιητικό SSL' },
] as const;

function Worst() {
  return (
    <>
      <PreviewSection title="Long labels in a narrow slot, as a text child">
        <div className="flex w-40 flex-col items-start gap-2">
          <Badge variant="warning">Waiting for approval from the finance team</Badge>
          <Badge variant="blue">Scale plan, billed yearly, with priority support</Badge>
          <Badge variant="secondary" render={<a href="https://base-ui.com/react/overview/releases" />}>
            Changelog for the October release of the EU data region
          </Badge>
        </div>
      </PreviewSection>

      <PreviewSection title="Counts, codes and translated labels">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="primary">1,284,903</Badge>
          <Badge variant="secondary">99+</Badge>
          <Badge variant="secondary">0</Badge>
          <Badge variant="green">200</Badge>
          <Badge variant="red">504</Badge>
          <Badge variant="blue">Ιστότοπος</Badge>
          <Badge variant="violet">株式会社</Badge>
          <Badge variant="amber">🌊 Trial</Badge>
          <Badge variant="gray">Pro-Abonnement mit jährlicher Abrechnung</Badge>
        </div>
      </PreviewSection>

      <PreviewSection title="In a row at phone width">
        <ul className="flex w-full max-w-xs flex-col divide-y divide-border">
          {worstRows.map((row) => (
            <li key={row.name} className="flex items-center justify-between gap-3 py-2.5 text-body">
              <span className="min-w-0 truncate">{row.name}</span>
              <Badge variant={row.status}>{row.label}</Badge>
            </li>
          ))}
        </ul>
      </PreviewSection>
    </>
  );
}

export default function BadgePreview() {
  return (
    <DataSetPreview
      demo={
        <PreviewStack>
          <Normal />
        </PreviewStack>
      }
      worst={
        <PreviewStack>
          <Worst />
        </PreviewStack>
      }
    />
  );
}
