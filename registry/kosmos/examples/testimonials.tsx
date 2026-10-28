import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Testimonials } from '@/registry/kosmos/blocks/testimonials/testimonials';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background px-4 py-10 shadow-card sm:px-6';

const few = [
  { quote: 'The iOS SDK took an afternoon.', name: 'Marcus Bell', role: 'iOS lead, Brightloop Fitness' },
  { quote: 'Acme told us we had passed our quota before finance did.', name: 'Ruth Adeyemi', role: 'Data engineer, Copperline Bank' },
];

export default function TestimonialsPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Wall">
        <div className={frame}>
          <Testimonials />
        </div>
      </PreviewSection>

      <PreviewSection title="Static">
        <div className={frame}>
          <Testimonials variant="static" featured={null} />
        </div>
      </PreviewSection>

      <PreviewSection title="Featured quote only">
        <div className={frame}>
          <Testimonials title={null} description={null} testimonials={[]} />
        </div>
      </PreviewSection>

      <PreviewSection title="Two quotes, no featured quote">
        <div className={frame}>
          <Testimonials description={null} featured={null} testimonials={few} />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className="flex flex-wrap items-start gap-4">
          <div className={`${frame} max-w-80`}>
            <Testimonials />
          </div>
          <div className={`${frame} max-w-80`}>
            <Testimonials variant="static" featured={null} testimonials={few} />
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Long text, a photo and no role">
        <div className={frame}>
          <Testimonials
            title="What the product, engineering and growth teams behind these web, iOS, Android and server apps say"
            featured={{
              quote:
                'We moved every event from three tools into Acme over one weekend, and on Monday the dashboards already matched what finance had, down to the last checkout_completed_with_discount_code_applied event.',
              name: 'Alexandria Montgomery-Whitfield',
              role: 'Vice president of product and platform engineering, Cirrus Weather',
            }}
            testimonials={[
              {
                quote: 'Supercalifragilisticexpialidocious_event_name_without_spaces_that_never_breaks shows up in full.',
                name: 'Bartholomew Featherstonehaugh-Cholmondeley',
                role: 'Senior staff engineer for data infrastructure, Copperline Bank',
              },
              { quote: 'Short.', name: 'Noor' },
              { quote: '霧島ウェザーのチーム全員が、同じ数字を見ています。', name: '霧島 さくら', role: 'プロダクト, Cirrus Weather' },
              { quote: 'Our funnels finally match our invoices.', name: 'Tessa Morgan', avatar: '/avatars/avatar-1.png' },
              { quote: 'Сводка за неделю приходит в понедельник утром.', name: 'Ольга Смирнова', role: 'Аналитик, Driftwood Travel' },
            ]}
          />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
