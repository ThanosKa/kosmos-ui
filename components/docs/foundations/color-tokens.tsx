import { colorTokens, modes, type ColorGroup } from '@/lib/foundations';
import { CopySwatch } from './copy-swatch';

const modeLabels = { light: 'Light', dark: 'Dark' } as const;

export function ColorTokens({ group }: { group: ColorGroup }) {
  const colors = colorTokens().filter((color) => color.group === group);
  if (colors.length === 0) throw new Error(`No color tokens in the "${group}" group`);

  return (
    <ul className="not-prose my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {colors.map((color) => (
        <li
          key={color.name}
          data-token-color={color.name}
          className="flex min-w-0 flex-col gap-2 rounded-2xl border border-transparent bg-card p-1.5 pb-3 shadow-card"
        >
          <CopySwatch tokenClass={color.className} swatches={color.resolved} />
          <div className="flex flex-col gap-2 px-2.5">
            <p className="text-small text-muted-foreground">{color.use}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-caption">
              {modes.map((mode) => (
                <div key={mode} className="contents">
                  <dt className="text-muted-foreground">{modeLabels[mode]}</dt>
                  <dd className="min-w-0 font-mono wrap-break-word">{color.value[mode]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}
