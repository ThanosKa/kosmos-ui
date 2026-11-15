import type { ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle, type AlertVariant } from '@/registry/kosmos/ui/alert';

/**
 * A note in a docs page, drawn by the Kosmos Alert: `<Callout variant="warning" title="…">text</Callout>`.
 * Its Markdown keeps the alert's colors, so code and bold take the text color of the variant.
 */
export function Callout({ variant = 'neutral', title, children }: { variant?: AlertVariant; title?: string; children?: ReactNode }) {
  return (
    <Alert
      variant={variant}
      appearance="filled"
      role="note"
      className="not-prose my-6 [&_code]:font-mono [&_strong]:font-medium"
    >
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children ? <AlertDescription>{children}</AlertDescription> : null}
    </Alert>
  );
}
