import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

export default function TabsVertical() {
  return (
    <Tabs defaultValue="general" orientation="vertical" className="w-full max-w-md">
      <TabsList className="w-32">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="text-muted-foreground">
        Workspace name and URL.
      </TabsContent>
      <TabsContent value="members" className="text-muted-foreground">
        12 members, 3 pending invites.
      </TabsContent>
      <TabsContent value="billing" className="text-muted-foreground">
        Pro plan, renews Nov 1.
      </TabsContent>
    </Tabs>
  );
}
