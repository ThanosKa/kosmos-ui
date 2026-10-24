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
            <Announcement href="#funnels" badge={row === 'with badge' ? 'New' : undefined} {...previewState(state)}>
              Funnels
            </Announcement>
          )}
        />
      </PreviewSection>

      <PreviewSection title="Above a hero">
        <AnnouncementHero />
      </PreviewSection>

      <PreviewSection title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          <Announcement href="#funnels" badge="New">
            Funnels are here
          </Announcement>
          <Announcement href="#changelog" badge="v2.4.0">
            Retention charts
          </Announcement>
          <Announcement href="#beta" badge="Beta">
            Session replay for iOS
          </Announcement>
          <Announcement href="#status">Scheduled maintenance on 14 October</Announcement>
        </div>
      </PreviewSection>

      <PreviewSection title="Long text in a narrow slot">
        <div className="flex w-64 flex-col items-start gap-2 bg-background">
          <Announcement href="#funnels" badge="New">
            Funnels, retention cohorts and session replay now on every plan, including Free
          </Announcement>
          <Announcement href="#changelog" badge="Version 2.4.0-beta.12">
            Retention charts
          </Announcement>
          <Announcement href="#status">ScheduledMaintenanceForTheIngestionPipelineInEurope</Announcement>
        </div>
      </PreviewSection>

      <PreviewSection title="Other scripts and right to left">
        <div className="flex flex-col items-start gap-3">
          <Announcement href="#el" badge="Νέο">
            Τα funnels είναι εδώ
          </Announcement>
          <Announcement href="#ja" badge="新機能">
            ファネル分析を公開しました
          </Announcement>
          <div dir="rtl">
            <Announcement href="#ar" badge="جديد">
              مسارات التحويل متاحة الآن
            </Announcement>
          </div>
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
