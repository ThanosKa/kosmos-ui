import type { CSSProperties } from 'react';
import { typeRoles } from '@/lib/foundations';
import { readKosmosTokens } from '@/lib/tokens';
import { ModePair } from './mode-pair';

export function TypeRoles() {
  const tokens = readKosmosTokens();

  return (
    <ul className="not-prose my-6 flex flex-col gap-8">
      {typeRoles().map((role) => (
        <li key={role.role} data-token-type={role.role} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <code className="font-mono text-body font-medium">{role.className}</code>
              <span className="font-mono text-caption text-muted-foreground tabular-nums">
                {role.sizePx} / {role.lineHeightPx} · {role.weight} · {role.tracking}
              </span>
            </div>
            <p className="text-small text-muted-foreground">{role.use}</p>
          </div>
          <ModePair tokens={tokens}>
            <p
              style={
                {
                  '--role-size': `var(--text-${role.role})`,
                  '--role-leading': `var(--text-${role.role}--line-height)`,
                  '--role-weight': `var(--text-${role.role}--font-weight, 400)`,
                  '--role-tracking': `var(--text-${role.role}--letter-spacing, 0)`,
                } as CSSProperties
              }
              className="text-(length:--role-size) leading-(--role-leading) font-(weight:--role-weight) tracking-(--role-tracking) tabular-nums"
            >
              Revenue grew 12.4% to $48,210
            </p>
          </ModePair>
        </li>
      ))}
    </ul>
  );
}
