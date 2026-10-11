import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

export default function TabsDemo() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-muted-foreground">
        Revenue is up 12% on last month, led by annual plans.
      </TabsContent>
      <TabsContent value="activity" className="text-muted-foreground">
        Ana Lopez closed 4 deals this week.
      </TabsContent>
      <TabsContent value="settings" className="text-muted-foreground">
        Workspace name, members and notifications.
      </TabsContent>
    </Tabs>
  );
}
