import { BlurFade } from '@/registry/kosmos/ui/blur-fade';

export default function BlurFadeDemo() {
  return (
    <div className="flex flex-col gap-3">
      {['Scroll the page', 'Each block comes in once', 'Staggered by its delay'].map((line, index) => (
        <BlurFade key={line} delay={index * 80} className="rounded-xl border border-transparent bg-card p-4 text-body shadow-card">
          {line}
        </BlurFade>
      ))}
    </div>
  );
}
