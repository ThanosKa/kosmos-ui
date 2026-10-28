'use client';

import { ListFilter, Search } from 'lucide-react';
import { Badge } from '@/registry/kosmos/ui/badge';
import { Button } from '@/registry/kosmos/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/registry/kosmos/ui/input-group';
import { Pagination, PaginationNext, PaginationPrevious, PaginationStatus } from '@/registry/kosmos/ui/pagination';
import { Panel, PanelAction, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle } from '@/registry/kosmos/ui/panel';
import { StatusDot } from '@/registry/kosmos/ui/status';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

const projects = [
  { name: 'Fernhill Books', domain: 'fernhill.example', plan: 'Scale', users: 48210 },
  { name: 'Brightloop Fitness', domain: 'brightloop.example', plan: 'Scale', users: 31480 },
  { name: 'Copperline Bank', domain: 'copperline.example', plan: 'Scale', users: 12940 },
  { name: 'Saltmarsh Coffee', domain: 'saltmarsh.example', plan: 'Pro', users: 6120 },
  { name: 'Driftwood Travel', domain: 'driftwood.example', plan: 'Pro', users: 9870 },
] as const;

const planHue = { Scale: 'violet', Pro: 'blue' } as const;
const count = new Intl.NumberFormat('en-US');

export default function PanelDemo() {
  return (
    <Panel className="w-full max-w-2xl">
      <PanelHeader>
        <PanelTitle>Projects</PanelTitle>
        <PanelDescription>Every site and app sending events</PanelDescription>
        <PanelAction>
          <InputGroup className="h-7.5 w-48 @max-md/panel:flex-1">
            <InputGroupAddon align="inline-start">
              <Search aria-hidden />
            </InputGroupAddon>
            <InputGroupInput type="search" aria-label="Search projects" placeholder="Search projects" />
          </InputGroup>
          <Button variant="secondary">
            <ListFilter data-icon="inline-start" aria-hidden />
            Plan
          </Button>
        </PanelAction>
      </PanelHeader>
      <PanelContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="ps-4">Project</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pe-4 text-end">Users</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.domain}>
                <TableCell className="ps-4">
                  <div className="flex flex-col">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-small text-muted-foreground">{project.domain}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={planHue[project.plan]}>{project.plan}</Badge>
                </TableCell>
                <TableCell>
                  <StatusDot status="done">Live</StatusDot>
                </TableCell>
                <TableCell className="pe-4 text-end">{count.format(project.users)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </PanelContent>
      <PanelFooter>
        <Pagination aria-label="Pages of projects" total={12} defaultPageSize={5} className="w-full justify-end gap-3">
          <PaginationStatus />
          <div className="flex items-center gap-1">
            <PaginationPrevious />
            <PaginationNext />
          </div>
        </Pagination>
      </PanelFooter>
    </Panel>
  );
}
