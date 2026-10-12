import { ArrowUpRight, Check, Clock } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Badge } from '@/registry/kosmos/ui/badge';

const variants = ['secondary', 'primary', 'success', 'warning', 'destructive', 'orange', 'blue', 'amber', 'magenta', 'green', 'red'] as const;
const states = ['default', 'link', 'hover', 'focus'] as const;

const labels: Record<(typeof variants)[number], string> = {
  secondary: 'Draft',
  primary: 'New',
  success: 'Active',
  warning: 'Pending',
  destructive: 'Failed',
  orange: 'Pilot',
  blue: 'Enterprise',
  amber: 'Small business',
  magenta: 'Upsell',
  green: 'Expansion',
  red: 'Blocked',
};

const rows = [
  { name: 'Acme Inc.', status: 'success', label: 'Active' },
  { name: 'Globex Corporation', status: 'warning', label: 'Trial ends soon' },
  { name: 'Initech', status: 'destructive', label: 'Payment failed' },
] as const;

export default function BadgePreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Variants × states">
        <StateMatrix
          rows={variants}
          states={states}
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

      <PreviewSection title="Long label in a narrow slot">
        <div className="flex w-40 flex-col items-start gap-2">
          <Badge variant="warning">
            <span className="min-w-0 truncate">Waiting for approval from the finance team</span>
          </Badge>
          <Badge variant="secondary">
            <span className="min-w-0 truncate">Enterprise annual plan with priority support</span>
          </Badge>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
