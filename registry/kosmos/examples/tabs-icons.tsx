import { Activity, FileText, Settings } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/registry/kosmos/ui/tabs';

export default function TabsIcons() {
  return (
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
  );
}
