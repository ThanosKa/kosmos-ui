import { EasingDemo } from '@/components/docs/easing-demo';
import { easings, motionTokens } from '@/lib/foundations';

export function MotionTokens() {
  return (
    <div className="relative my-6 overflow-auto prose-no-margin">
      <table>
        <thead>
          <tr>
            <th>Token</th>
            <th>Used for</th>
          </tr>
        </thead>
        <tbody>
          {motionTokens().map((token) => (
            <tr key={token.name} data-token-motion={token.name}>
              <td>
                <div className="flex flex-col items-start gap-1">
                  <code>{token.className}</code>
                  <span className="font-mono text-small text-muted-foreground">{token.value}</span>
                </div>
              </td>
              <td>{token.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EasingCurves() {
  return (
    <div className="not-prose my-6">
      <EasingDemo items={easings()} />
    </div>
  );
}
