import { PreviewSection, PreviewStack } from '@/components/preview/preview-section';
import { Faq } from '@/registry/kosmos/blocks/faq/faq';

const frame = 'w-full overflow-hidden rounded-xl border border-transparent bg-background shadow-card';

const shortItems = [
  { id: 'free', question: 'Is there a free plan?', answer: 'Yes. Free includes 50,000 events a month, for as long as you like.' },
  { id: 'cancel', question: 'Can I cancel at any time?', answer: 'Yes. The plan runs to the end of the month you paid for, then moves to Free.' },
];

export default function FaqPreview() {
  return (
    <PreviewStack>
      <PreviewSection title="Default, first question open">
        <div className={frame}>
          <Faq />
        </div>
      </PreviewSection>

      <PreviewSection title="Narrow container, 320px">
        <div className={`${frame} max-w-80`}>
          <Faq />
        </div>
      </PreviewSection>

      <PreviewSection title="All closed, no contact line">
        <div className={frame}>
          <Faq items={shortItems} defaultValue={[]} contact={null} />
        </div>
      </PreviewSection>

      <PreviewSection title="No title, a nested section">
        <div className={frame}>
          <Faq title={null} items={shortItems} headingLevel={3} />
        </div>
      </PreviewSection>

      <PreviewSection title="No questions: renders nothing">
        <div className={frame}>
          <Faq items={[]} />
        </div>
      </PreviewSection>

      <PreviewSection title="Long text">
        <div className={frame}>
          <Faq
            title="Questions the product, engineering and growth teams ask before they add their first project to Acme"
            defaultValue={['retention']}
            items={[
              {
                id: 'retention',
                question:
                  'How long does Acme keep the events of a project on the Scale plan, and can we choose a shorter period for the events of our users in the European Union?',
                answer:
                  'Scale keeps every event for 25 months by default. Each project can set a shorter period in its settings, from 30 days up, and the period can differ between the events of users in the European Union and everyone else. Events older than the period are deleted every night.',
              },
              {
                id: 'domain',
                question: 'Does fernhill-books-and-stationery-international.example work as a project domain?',
                answer: 'Yes. Any domain you own works, however long, including subdomains such as shop.fernhill-books-and-stationery-international.example.',
              },
              { id: 'jp', question: '霧島ウェザーのイベントも送れますか？', answer: 'はい。どの言語のアプリからでも、同じSDKでイベントを送れます。' },
            ]}
            contact={
              <>
                Still have a question about plans, limits, retention or exports for your team? <a href="/contact">Talk to the team behind Acme</a>
              </>
            }
          />
        </div>
      </PreviewSection>

      <PreviewSection title="Right to left">
        <div dir="rtl" className={frame}>
          <Faq
            title="أسئلة قبل أن تبدأ"
            items={[
              { id: 'first', question: 'متى أرى أول حدث؟', answer: 'بعد دقيقة تقريبًا من إضافة الكود إلى موقعك.' },
              { id: 'trial', question: 'هل أستطيع تجربة Pro قبل الدفع؟', answer: 'نعم، يبدأ كل مشروع جديد بتجربة لمدة 14 يومًا.' },
            ]}
            contact={
              <>
                لديك سؤال آخر؟ <a href="/contact">تحدث إلى الفريق</a>
              </>
            }
          />
        </div>
      </PreviewSection>
    </PreviewStack>
  );
}
