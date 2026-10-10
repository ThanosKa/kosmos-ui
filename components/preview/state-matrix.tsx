import type { ReactNode } from 'react';

export const defaultStates = ['default', 'hover', 'focus', 'active', 'disabled'] as const;

/**
 * Props that pin an interaction state on a preview element. Hover, focus and active
 * go through `data-preview`, which the custom variants in app/global.css treat like
 * the real interaction; disabled is the real prop. Spread onto the component:
 * `<Button variant="primary" {...previewState(state)} />`.
 */
export function previewState(state: string): { disabled?: true; 'data-preview'?: string } {
  if (state === 'disabled') return { disabled: true };
  if (state === 'default') return {};
  return { 'data-preview': state };
}

/**
 * Every row (variant, size, ...) in every state, with a label on each cell, so a single
 * screenshot shows the whole matrix at 375px and at 1280px.
 */
export function StateMatrix<Row extends string, State extends string = (typeof defaultStates)[number]>({
  rows,
  states = defaultStates as unknown as readonly State[],
  render,
}: {
  rows: readonly Row[];
  states?: readonly State[];
  render: (row: Row, state: State) => ReactNode;
}) {
  return (
    <div data-state-matrix className="flex w-full flex-col divide-y divide-border">
      {rows.map((row) => (
        <div key={row} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
          <p className="font-mono text-caption text-muted-foreground">{row}</p>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-x-4 gap-y-4">
            {states.map((state) => (
              <li key={state} data-state={state} className="flex flex-col items-start gap-2">
                <span className="text-caption text-muted-foreground">{state}</span>
                {render(row, state)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
