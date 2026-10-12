import { EasingDemo } from '@/components/docs/easing-demo';
import { easings, motionTokens } from '@/lib/foundations';
import { MdxTable, MdxTableBody, MdxTableCell, MdxTableHead, MdxTableHeader, MdxTableRow } from '@/components/docs/mdx-table';

export function MotionTokens() {
  return (
    <MdxTable>
      <MdxTableHeader>
        <MdxTableRow>
          <MdxTableHead>Token</MdxTableHead>
          <MdxTableHead>Used for</MdxTableHead>
        </MdxTableRow>
      </MdxTableHeader>
      <MdxTableBody>
        {motionTokens().map((token) => (
          <MdxTableRow key={token.name} data-token-motion={token.name}>
            <MdxTableCell>
              <div className="flex flex-col items-start gap-1">
                <code>{token.className}</code>
                <span className="font-mono text-small text-muted-foreground">{token.value}</span>
              </div>
            </MdxTableCell>
            <MdxTableCell>{token.use}</MdxTableCell>
          </MdxTableRow>
        ))}
      </MdxTableBody>
    </MdxTable>
  );
}

export function EasingCurves() {
  return (
    <div className="not-prose my-6">
      <EasingDemo items={easings()} />
    </div>
  );
}
