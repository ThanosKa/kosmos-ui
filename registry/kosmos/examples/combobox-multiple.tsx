'use client';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '@/registry/kosmos/ui/combobox';

const events = ['page_viewed', 'button_clicked', 'screen_viewed', 'signed_up', 'checkout_completed', 'invite_sent'];

export default function ComboboxMultiple() {
  return (
    <Combobox items={events} multiple defaultValue={['signed_up', 'checkout_completed']}>
      <ComboboxChips className="w-full max-w-sm">
        <ComboboxValue>
          {(selected: string[]) => (
            <>
              {selected.map((event) => (
                <ComboboxChip key={event} className="font-mono">
                  {event}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput aria-label="Events" placeholder={selected.length > 0 ? undefined : 'Add events'} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No events match.</ComboboxEmpty>
        <ComboboxList>
          {(event: string) => (
            <ComboboxItem key={event} value={event} className="font-mono">
              {event}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
