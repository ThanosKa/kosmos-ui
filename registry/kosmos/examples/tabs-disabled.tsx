import { Tabs, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

export default function TabsDisabled() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
