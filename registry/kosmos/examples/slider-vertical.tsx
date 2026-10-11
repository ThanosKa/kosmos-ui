import { Slider } from '@/registry/kosmos/ui/slider';

export default function SliderVertical() {
  return (
    <div className="flex h-40 gap-8">
      <Slider orientation="vertical" aria-label="Bass" defaultValue={30} />
      <Slider orientation="vertical" aria-label="Middle" defaultValue={55} />
      <Slider orientation="vertical" aria-label="Treble" defaultValue={70} />
    </div>
  );
}
