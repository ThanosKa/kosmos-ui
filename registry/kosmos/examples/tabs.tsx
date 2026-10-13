'use client';

import { Activity, FileText, Settings } from 'lucide-react';
import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { ScrollToMiddle } from '@/components/preview/scroll-to-middle';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

const rows = ['active tab', 'inactive tab'] as const;

export default function TabsPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Tab × states">
        <StateMatrix
          rows={rows}
          render={(row, state) => (
            <Tabs defaultValue="plan">
              <TabsList>
                <TabsTrigger value="plan" {...(row === 'active tab' ? previewState(state) : {})}>
                  Plan
                </TabsTrigger>
                <TabsTrigger value="usage" {...(row === 'inactive tab' ? previewState(state) : {})}>
                  Usage
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />
      </PreviewSection>

      <PreviewSection title="With panels">
        <Tabs defaultValue="overview" className="max-w-xl">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="billing" disabled>
              Billing
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-muted-foreground">
            Revenue is up 6.8% on last month, led by Scale plans.
          </TabsContent>
          <TabsContent value="activity" className="text-muted-foreground">
            Kai Nakamura added 3 roadmap items this week.
          </TabsContent>
          <TabsContent value="settings" className="text-muted-foreground">
            Workspace name, members and notifications.
          </TabsContent>
        </Tabs>
      </PreviewSection>

      <PreviewSection title="With icons and counts">
        <Tabs defaultValue="files">
          <TabsList>
            <TabsTrigger value="files">
              <FileText data-icon="inline-start" />
              Files
              <span className="text-caption text-muted-foreground tabular-nums">24</span>
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity data-icon="inline-start" />
              Activity
              <span className="text-caption text-muted-foreground tabular-nums">3</span>
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings data-icon="inline-start" />
              Settings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </PreviewSection>

      <PreviewSection title="Vertical">
        <Tabs defaultValue="general" orientation="vertical">
          <TabsList className="w-40">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="text-muted-foreground">
            Workspace name and URL.
          </TabsContent>
          <TabsContent value="members" className="text-muted-foreground">
            4 members, 1 pending invite.
          </TabsContent>
          <TabsContent value="billing" className="text-muted-foreground">
            Scale plan, next invoice Nov 1.
          </TabsContent>
          <TabsContent value="security" className="text-muted-foreground">
            Two-factor sign-in is on for every member.
          </TabsContent>
        </Tabs>
      </PreviewSection>

      <PreviewSection title="More tabs than fit (scrolls sideways): at the start, scrolled halfway">
        <div className="flex flex-col gap-6">
          {[false, true].map((scrolled) => (
            <Tabs key={String(scrolled)} defaultValue="q1" className="max-w-sm">
              <TabsList>
                {scrolled ? <ScrollToMiddle axis="x" /> : null}
                <TabsTrigger value="q1">First quarter</TabsTrigger>
                <TabsTrigger value="q2">Second quarter</TabsTrigger>
                <TabsTrigger value="q3">Third quarter</TabsTrigger>
                <TabsTrigger value="q4">Fourth quarter</TabsTrigger>
                <TabsTrigger value="fy">Full fiscal year</TabsTrigger>
              </TabsList>
            </Tabs>
          ))}
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
