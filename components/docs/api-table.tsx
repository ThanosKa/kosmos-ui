import { Fragment } from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';
import { inlineProseClass, tableCardClass } from './classes';
import { InlineMarkdown } from './inline-markdown';

export type ApiProp = { description?: string; type: string; default?: string; required?: boolean };

const codeClass = 'font-mono text-small break-words';

function PropName({ name, prop }: { name: string; prop: ApiProp }) {
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <code className={cn(codeClass, 'font-medium text-foreground')}>{name}</code>
      {prop.required && <span className="text-caption text-muted-foreground">Required</span>}
    </span>
  );
}

function PropType({ prop }: { prop: ApiProp }) {
  return (
    <code className={cn(codeClass, 'text-foreground')}>
      {prop.type.split(' | ').map((member, index) => (
        <Fragment key={index}>
          {index > 0 && ' | '}
          <span className={cn(member.length <= 24 && 'whitespace-nowrap')}>{member}</span>
        </Fragment>
      ))}
    </code>
  );
}

function PropDefault({ prop }: { prop: ApiProp }) {
  return prop.default ? (
    <code className={cn(codeClass, 'text-muted-foreground')}>{prop.default}</code>
  ) : (
    <span className="text-muted-foreground">
      <span aria-hidden>–</span>
      <span className="sr-only">None</span>
    </span>
  );
}

/**
 * The props of one component part, written in MDX as `<TypeTable type={{ name: { description, type, default } }} />`.
 * From `sm` up a Kosmos Table with the description under each prop name; on a phone one stacked entry per prop.
 */
export function ApiTable({ type }: { type: Record<string, ApiProp> }) {
  const props = Object.entries(type);
  return (
    <div data-slot="api-table" className={cn(tableCardClass, 'overflow-hidden')}>
      <Table containerClassName="hidden rounded-none sm:flex" className="table-fixed">
        <colgroup>
          <col className="w-[46%]" />
          <col className="w-[34%]" />
          <col className="w-[20%]" />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead className="ps-4">Prop</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="pe-4">Default</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.map(([name, prop]) => (
            <TableRow key={name} className="hover:bg-transparent">
              <TableCell className="h-auto py-3 ps-4 align-top whitespace-normal">
                <PropName name={name} prop={prop} />
                {prop.description && (
                  <p className={cn('mt-1 text-small text-pretty text-muted-foreground', inlineProseClass)}>
                    <InlineMarkdown text={prop.description} />
                  </p>
                )}
              </TableCell>
              <TableCell className="h-auto py-3 align-top whitespace-normal">
                <PropType prop={prop} />
              </TableCell>
              <TableCell className="h-auto py-3 pe-4 align-top whitespace-normal">
                <PropDefault prop={prop} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ul className="divide-y divide-border sm:hidden">
        {props.map(([name, prop]) => (
          <li key={name} className="flex flex-col gap-2 p-4">
            <PropName name={name} prop={prop} />
            {prop.description && (
              <p className={cn('text-small text-pretty text-muted-foreground', inlineProseClass)}>
                <InlineMarkdown text={prop.description} />
              </p>
            )}
            <dl className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-small">
              <dt className="text-caption text-muted-foreground">Type</dt>
              <dd>
                <PropType prop={prop} />
              </dd>
              <dt className="text-caption text-muted-foreground">Default</dt>
              <dd>
                <PropDefault prop={prop} />
              </dd>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
