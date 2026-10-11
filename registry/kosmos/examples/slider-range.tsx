'use client';

import { Slider, SliderLabel, SliderValue } from '@/registry/kosmos/ui/slider';

export default function SliderRange() {
  return (
    <Slider
      name="threshold"
      defaultValue={[0.2, 0.8]}
      min={0}
      max={1}
      step={0.01}
      format={{ style: 'percent' }}
      getAriaLabel={(index) => (index === 0 ? 'Minimum threshold' : 'Maximum threshold')}
      className="max-w-xs"
    >
      <div className="flex items-center justify-between gap-4">
        <SliderLabel>Scaling threshold</SliderLabel>
        <SliderValue />
      </div>
    </Slider>
  );
}
