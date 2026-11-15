'use client';

import { TagsInput } from '@/registry/kosmos/ui/tags-input';

export default function TagsInputMax() {
  return (
    <TagsInput
      aria-label="Labels"
      defaultValue={['mobile', 'storm traffic']}
      max={3}
      placeholder="Add up to 3 labels"
      className="w-full max-w-sm"
    />
  );
}
