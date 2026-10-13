import { CircleCheck, CircleDashed, CirclePause, CircleSlash, CircleX, LoaderCircle, type LucideIcon } from 'lucide-react';
import { Badge, type BadgeProps } from '@/registry/kosmos/ui/badge';
import { cn } from '@/registry/kosmos/lib/cn';

/**
 * The six states of a task, a step or a run. Each component maps its own words (queued, passed,
 * denied…) onto these.
 */
type Status = 'pending' | 'running' | 'waiting' | 'done' | 'error' | 'skipped';

const running = 'motion-safe:animate-spin motion-reduce:animate-pulse';

const statusMark: Record<Status, { icon: LucideIcon; className: string }> = {
  pending: { icon: CircleDashed, className: 'text-muted-foreground' },
  running: { icon: LoaderCircle, className: cn('text-foreground', running) },
  waiting: { icon: CirclePause, className: 'text-warning' },
  done: { icon: CircleCheck, className: 'text-success' },
  error: { icon: CircleX, className: 'text-destructive' },
  skipped: { icon: CircleSlash, className: 'text-muted-foreground' },
};

type StatusIconProps = {
  status: Status;
  /** Names the status for screen readers (“Done”). Leave it out when text beside the icon already says it. */
  label?: string;
  className?: string;
};

/** The 16px mark that leads a row: a plan step, an eval case, a reasoning step. Pass `size-3.5` for 13px rows. */
function StatusIcon({ status, label, className }: StatusIconProps) {
  const { icon: Icon, className: tone } = statusMark[status];
  return (
    <Icon
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      data-status={status}
      className={cn(
        'size-4 shrink-0 transition-[opacity,scale] duration-fast starting:opacity-0 motion-safe:starting:scale-80',
        tone,
        className,
      )}
    />
  );
}

const statusBadge: Record<Status, BadgeProps['variant']> = {
  pending: 'secondary',
  running: 'secondary',
  waiting: 'warning',
  done: 'success',
  error: 'destructive',
  skipped: 'secondary',
};

type StatusBadgeProps = Omit<BadgeProps, 'variant'> & { status: Status };

/**
 * The status pill: the neutral Badge plus the colored dot for waiting, done and error, and the same
 * icon a row would show for pending, running and skipped. The label carries the meaning.
 */
function StatusBadge({ status, children, className, ...props }: StatusBadgeProps) {
  const Icon = status === 'pending' || status === 'running' || status === 'skipped' ? statusMark[status].icon : null;
  return (
    <Badge variant={statusBadge[status]} data-status={status} className={cn('shrink-0', className)} {...props}>
      {Icon ? (
        <Icon aria-hidden className={cn('text-muted-foreground', status === 'running' && cn('text-foreground', running))} />
      ) : null}
      <span className="min-w-0 truncate">{children}</span>
    </Badge>
  );
}

export { StatusIcon, StatusBadge, type Status, type StatusIconProps, type StatusBadgeProps };
