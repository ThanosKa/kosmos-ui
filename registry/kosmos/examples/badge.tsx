import { ArrowUpRight, Check, Clock } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Badge } from '@/registry/kosmos/ui/badge';
import BadgeCodes from '@/registry/kosmos/examples/badge-codes';
import BadgeCurrent from '@/registry/kosmos/examples/badge-current';

const variants = [
  'secondary',
  'primary',
  'success',
  'warning',
  'destructive',
  'orange',
  'blue',
  'amber',
  'magenta',
  'green',
  'red',
  'tint-gray',
  'tint-blue',
  'tint-green',
  'tint-teal',
  'tint-orange',
  'tint-red',
] as const;
const codeStates = ['default', 'link', 'hover', 'focus', 'current'] as const;

const labels: Record<(typeof variants)[number], string> = {
  secondary: 'Draft',
  primary: 'New',
  success: 'Active',
  warning: 'Pending',
  destructive: 'Failed',
  orange: 'Pro',
  blue: 'Free',
  amber: 'Insights',
  magenta: 'Scale',
  green: 'Ingestion',
  red: 'Billing',
  'tint-gray': '304',
  'tint-blue': 'POST',
  'tint-green': '200',
  'tint-teal': 'Beta',
  'tint-orange': '429',
  'tint-red': '500',
};

const rows = [
  { name: 'Fernhill Books', status: 'success', label: 'Active' },
  { name: 'Marigold Recipes', status: 'warning', label: 'Trial ends soon' },
  { name: 'Hollow Oak Games', status: 'destructive', label: 'Payment failed' },
] as const;

export default function BadgePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Variants × states">
        <StateMatrix
          rows={variants}
          states={codeStates}
          render={(variant, state) =>
            state === 'current' ? (
              variant.startsWith('tint-') ? (
                <span aria-current="page" className="flex">
                  <Badge variant={variant}>{labels[variant]}</Badge>
                </span>
              ) : null
            ) : state === 'default' ? (
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
        <PreviewSection title="Methods in a nav, current item filled">
          <BadgeCurrent />
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
    </PreviewStack>
  );
}
