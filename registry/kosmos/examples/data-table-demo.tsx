'use client';

import { Trash2 } from 'lucide-react';
import { Badge, type BadgeProps } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import {
  createDataTableColumnHelper,
  DataTable,
  DataTableBulkBar,
  DataTableColumnHeader,
  DataTableColumnToggle,
  DataTableContent,
  DataTableFacetFilter,
  DataTableFooter,
  DataTableReset,
  DataTableSearch,
  DataTableSelectAll,
  DataTableSelectRow,
  DataTableToolbar,
  useDataTable,
} from '@/registry/kosmos/ui/data-table';
import { EmptyState } from '@/registry/kosmos/ui/empty';
import { StatusDot, type Status } from '@/registry/kosmos/ui/status';

type Project = {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'scale';
  status: 'live' | 'trial' | 'paused';
  users: number;
  mrr: number;
};

const projects: Project[] = [
  { id: 'fernhill', name: 'Fernhill Books', plan: 'scale', status: 'live', users: 48210, mrr: 2400 },
  { id: 'brightloop', name: 'Brightloop Fitness', plan: 'scale', status: 'live', users: 31480, mrr: 3600 },
  { id: 'copperline', name: 'Copperline Bank', plan: 'scale', status: 'live', users: 12940, mrr: 4800 },
  { id: 'saltmarsh', name: 'Saltmarsh Coffee', plan: 'pro', status: 'live', users: 6120, mrr: 149 },
  { id: 'driftwood', name: 'Driftwood Travel', plan: 'pro', status: 'live', users: 9870, mrr: 290 },
  { id: 'hollowoak', name: 'Hollow Oak Games', plan: 'pro', status: 'paused', users: 2310, mrr: 99 },
  { id: 'cirrus', name: 'Cirrus Weather', plan: 'pro', status: 'live', users: 22560, mrr: 390 },
  { id: 'pebblepine', name: 'Pebble & Pine', plan: 'free', status: 'live', users: 840, mrr: 0 },
  { id: 'marigold', name: 'Marigold Recipes', plan: 'pro', status: 'trial', users: 1920, mrr: 0 },
  { id: 'kiln', name: 'Kiln Studio', plan: 'free', status: 'paused', users: 120, mrr: 0 },
  { id: 'tidepool', name: 'Tidepool Notes', plan: 'pro', status: 'trial', users: 3450, mrr: 0 },
  { id: 'ironbark', name: 'Ironbark Logistics', plan: 'scale', status: 'live', users: 4780, mrr: 2900 },
];

const plans: Record<Project['plan'], { label: string; variant: BadgeProps['variant'] }> = {
  free: { label: 'Free', variant: 'gray' },
  pro: { label: 'Pro', variant: 'blue' },
  scale: { label: 'Scale', variant: 'violet' },
};
const statuses: Record<Project['status'], { label: string; dot: Status }> = {
  live: { label: 'Live', dot: 'done' },
  trial: { label: 'Trial', dot: 'pending' },
  paused: { label: 'Paused', dot: 'waiting' },
};
const planOrder = Object.keys(plans) as Project['plan'][];
const statusOrder = Object.keys(statuses) as Project['status'][];

const count = new Intl.NumberFormat('en-US');
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const column = createDataTableColumnHelper<Project>();
const columns = column.columns([
  column.display({
    id: 'select',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => <DataTableSelectAll table={table} label="Select all projects on this page" />,
    cell: ({ row }) => <DataTableSelectRow row={row} label={`Select ${row.original.name}`} />,
    meta: { className: 'w-10 ps-4 pe-0' },
  }),
  column.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    sortFn: 'text',
    enableHiding: false,
    meta: { label: 'Project', sortLabels: ['A to Z', 'Z to A'] },
  }),
  column.accessor('plan', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <Badge variant={plans[row.original.plan].variant}>{plans[row.original.plan].label}</Badge>,
    sortFn: (a, b, id) => planOrder.indexOf(a.getValue(id)) - planOrder.indexOf(b.getValue(id)),
    filterFn: 'arrHas',
    meta: { label: 'Plan', sortLabels: ['Free to Scale', 'Scale to Free'] },
  }),
  column.accessor('users', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => count.format(row.original.users),
    sortFn: 'basic',
    meta: { label: 'Users', align: 'end', sortLabels: ['Low to high', 'High to low'], className: 'hidden @md:table-cell' },
  }),
  column.accessor('mrr', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => usd.format(row.original.mrr),
    sortFn: 'basic',
    meta: { label: 'MRR', align: 'end', sortLabels: ['Low to high', 'High to low'] },
  }),
  column.accessor('status', {
    header: ({ column }) => <DataTableColumnHeader column={column} />,
    cell: ({ row }) => <StatusDot status={statuses[row.original.status].dot}>{statuses[row.original.status].label}</StatusDot>,
    sortFn: (a, b, id) => statusOrder.indexOf(a.getValue(id)) - statusOrder.indexOf(b.getValue(id)),
    filterFn: 'arrHas',
    meta: { label: 'Status', sortLabels: ['Live to Paused', 'Paused to Live'] },
  }),
  column.display({
    id: 'columns',
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => <DataTableColumnToggle table={table} />,
    meta: { className: 'w-12 pe-4 text-end', skeleton: null },
  }),
]);

const planOptions = planOrder.map((plan) => ({
  value: plan,
  label: plans[plan].label,
  render: <Badge variant={plans[plan].variant}>{plans[plan].label}</Badge>,
}));
const statusOptions = statusOrder.map((status) => ({
  value: status,
  label: statuses[status].label,
  render: <StatusDot status={statuses[status].dot}>{statuses[status].label}</StatusDot>,
}));

export default function DataTableDemo({ rows = projects, loading = false }: { rows?: Project[]; loading?: boolean }) {
  const table = useDataTable({
    data: rows,
    columns,
    getRowId: (row) => row.id,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  });

  return (
    <DataTable className="w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card">
      <DataTableToolbar aria-label="Search and filter projects">
        <DataTableSearch table={table} label="Search projects" />
        <DataTableFacetFilter column={table.getColumn('plan')!} options={planOptions} noun="plans" rowNoun="project" />
        <DataTableFacetFilter column={table.getColumn('status')!} options={statusOptions} noun="statuses" rowNoun="project" />
        <DataTableReset table={table} />
      </DataTableToolbar>
      <DataTableContent
        table={table}
        aria-label="Projects"
        loading={loading}
        empty={<EmptyState className="py-10" headingLevel={2} noun="projects" variant="filtered" onClear={() => table.resetColumnFilters(true)} />}
      />
      <DataTableFooter table={table} loading={loading} noun="project">
        <DataTableBulkBar table={table} noun="project">
          {(selected) => (
            <Button variant="destructive" size="sm" onClick={() => table.resetRowSelection(true)}>
              <Trash2 aria-hidden data-icon="inline-start" />
              Delete {selected.length}
            </Button>
          )}
        </DataTableBulkBar>
      </DataTableFooter>
    </DataTable>
  );
}
