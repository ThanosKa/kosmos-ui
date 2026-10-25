import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { StateMatrix, previewState } from '@/components/preview/state-matrix';
import { Announcement } from '@/registry/kosmos/ui/announcement';
import AnnouncementHero from '@/registry/kosmos/examples/announcement-hero';

const rows = ['with badge', 'without badge'] as const;
const states = ['default', 'hover', 'focus', 'active'] as const;

export default function AnnouncementPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Badge × states">
        <StateMatrix
          rows={rows}
          states={states}
          render={(row, state) => (
            <Announcement href="#changelog" badge={row === 'with badge' ? 'New' : undefined} {...previewState(state)}>
              EU region
            </Announcement>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Above a hero">
        <AnnouncementHero />
      </PreviewSection>

      <PreviewSection title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <Announcement href="#changelog" badge="New">
            EU data region
          </Announcement>
          <Announcement href="#changelog" badge="Beta">
            Funnel comparisons
          </Announcement>
          <Announcement href="#status">Scheduled maintenance on 14 October, 02:00 UTC</Announcement>
        </div>
      </PreviewSection>

      <PreviewSection title="Long text in a narrow slot">
        <div className="flex w-64 flex-col items-start gap-2 bg-background">
          <Announcement href="#changelog" badge="New">
            EU data region: keep the events of every project in Europe, on every plan, including Free
          </Announcement>
          <Announcement href="#changelog" badge="Beta, Insights area, Q4 2026">
            Funnel comparisons
          </Announcement>
          <Announcement href="#status">ScheduledMaintenanceForTheIngestionPipelineInEurope</Announcement>
        </div>
      </PreviewSection>

      <PreviewSection title="Other scripts and right to left">
        <div className="flex flex-col items-start gap-3">
          <Announcement href="#el" badge="Νέο">
            Περιοχή δεδομένων στην ΕΕ
          </Announcement>
          <Announcement href="#ja" badge="新機能">
            EU データリージョンを公開しました
          </Announcement>
          <div dir="rtl">
            <Announcement href="#ar" badge="جديد">
              منطقة بيانات الاتحاد الأوروبي متاحة الآن
            </Announcement>
          </div>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
