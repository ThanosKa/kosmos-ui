import { Slider, SliderLabel, SliderValue } from '@/registry/kosmos/ui/slider';

export default function SliderDemo() {
  return (
    <Slider name="volume" defaultValue={60} className="max-w-xs">
      <div className="flex items-center justify-between gap-4">
        <SliderLabel>Volume</SliderLabel>
        <SliderValue />
      </div>
    </Slider>
  );
}
