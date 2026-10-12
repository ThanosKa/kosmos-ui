'use client';

import { FolderPlus, Inbox, Plus, SearchX, TriangleAlert } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Button } from '@/registry/kosmos/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/registry/kosmos/ui/empty';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/registry/kosmos/ui/table';

export default function EmptyPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="First use: icon, title, description, actions">
        <div className="flex rounded-2xl border border-transparent bg-card shadow-card">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderPlus />
              </EmptyMedia>
              <EmptyTitle render={<h3 />}>No projects yet</EmptyTitle>
              <EmptyDescription>Create a project to group your tasks, files and people in one place.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="secondary">Import</Button>
              <Button variant="primary">
                <Plus data-icon="inline-start" />
                New project
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </PreviewSection>

      <PreviewSection title="Focus on the action, and no results">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex rounded-2xl border border-transparent bg-card shadow-card">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox />
                </EmptyMedia>
                <EmptyTitle render={<h3 />}>Inbox zero</EmptyTitle>
                <EmptyDescription>New messages from your team show up here.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="secondary" data-preview="focus">
                  Open settings
                </Button>
              </EmptyContent>
            </Empty>
          </div>
          <div className="flex rounded-2xl border border-transparent bg-card shadow-card">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchX />
                </EmptyMedia>
                <EmptyTitle render={<h3 />}>No companies match “northwnd”</EmptyTitle>
                <EmptyDescription>Check the spelling or clear the filters to see every company.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="ghost">Clear filters</Button>
              </EmptyContent>
            </Empty>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Error, without media">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex rounded-2xl border border-transparent bg-card shadow-card">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon" className="text-destructive">
                  <TriangleAlert />
                </EmptyMedia>
                <EmptyTitle render={<h3 />}>Couldn’t load invoices</EmptyTitle>
                <EmptyDescription>The server didn’t answer in time. Your data is safe.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="secondary">Try again</Button>
              </EmptyContent>
            </Empty>
          </div>
          <div className="flex rounded-2xl border border-transparent bg-card shadow-card">
            <Empty>
              <EmptyHeader>
                <EmptyTitle render={<h3 />}>Nothing scheduled</EmptyTitle>
                <EmptyDescription>
                  Meetings you accept appear here. <a href="/settings/calendar" onClick={(event) => event.preventDefault()}>
                    Connect a calendar
                  </a>
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Inside a table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-end">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={3} className="h-auto whitespace-normal">
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle render={<h3 />}>No invoices this month</EmptyTitle>
                    <EmptyDescription>Invoices you send in October will be listed here.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </PreviewSection>

      <PreviewSection title="Long text in a narrow panel">
        <div className="w-full max-w-64 flex rounded-2xl border border-transparent bg-card shadow-card">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderPlus />
              </EmptyMedia>
              <EmptyTitle render={<h3 />}>No shared workspaces with the procurement department yet</EmptyTitle>
              <EmptyDescription>
                Ask an administrator of the procurement department to invite you, or create a workspace and invite them
                instead.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="secondary">Request access</Button>
            </EmptyContent>
          </Empty>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
