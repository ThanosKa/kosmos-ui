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
        Revenue is up 6.8% on last month, led by Scale plans.
      </TabsContent>
      <TabsContent value="activity" className="text-muted-foreground">
        Kai Nakamura added 3 roadmap items this week.
      </TabsContent>
      <TabsContent value="settings" className="text-muted-foreground">
        Workspace name, members and notifications.
      </TabsContent>
    </Tabs>
  );
}
