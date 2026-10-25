'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import * as React from 'react';
import { addTags, splitTags, takeTags, type AddedTags } from '@/registry/kosmos/lib/tags';
import {
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  type ComboboxChipsInputProps,
} from '@/registry/kosmos/ui/combobox';

type TagsInputProps = Omit<
  ComboboxChipsInputProps,
  'value' | 'defaultValue' | 'onChange' | 'className' | 'name' | 'disabled' | 'readOnly' | 'required'
> & {
  /** The tags, when you control them. */
  value?: string[];
  /** The starting tags, when the input keeps them. */
  defaultValue?: string[];
  /** Called with the whole list each time a tag is added or removed. */
  onValueChange?: (tags: string[]) => void;
  /** Characters that turn the typed text into a tag, besides Enter. A pasted list splits on them and on line breaks. */
  delimiters?: string[];
  /** Marks each tag it returns `false` for, such as a mistyped email, in red. The tag stays, so it can be seen and removed. */
  validate?: (tag: string) => boolean;
  /** The most tags the input takes. No limit by default. */
  max?: number;
  /** Keeps a tag that is already in the list. Off by default, comparing without case. */
  allowDuplicates?: boolean;
  /** Values offered in a list while typing, such as known addresses or labels already in use. */
  suggestions?: string[];
  /** Turns the typed text into a tag when the input loses focus. On by default, so a form never drops the last one. */
  addOnBlur?: boolean;
  /** Names the tags when the form is submitted: one value per tag. */
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Classes for the field, where the width goes. */
  className?: string;
};

function useControllableState<Value>(controlled: Value | undefined, initial: Value, onChange?: (next: Value) => void) {
  const [inner, setInner] = React.useState(initial);
  const set = React.useCallback(
    (next: Value) => {
      setInner(next);
      onChange?.(next);
    },
    [onChange],
  );
  return [controlled ?? inner, set] as const;
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

/** What a screen reader hears after an add: how many went in, and why any were left out. */
function describeAdd({ added, duplicates, overLimit }: AddedTags) {
  return [
    added.length ? `${plural(added.length, 'tag', 'tags')} added.` : '',
    duplicates.length ? `${plural(duplicates.length, 'tag', 'tags')} already in the list.` : '',
    overLimit.length ? `${plural(overLimit.length, 'tag', 'tags')} left out: the list is full.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * Free text that turns into tags: Enter, a delimiter or leaving the field adds what was typed, and a pasted list adds
 * one tag per line or delimiter. Built on the `multiple` Combobox, so the chips work from the keyboard the same way:
 * from the start of the input, Left Arrow moves onto the chips and Backspace removes the last one. With `suggestions`,
 * a list of matches opens as people type. Inside a `Field` it takes its label and error from the field; on its own it
 * needs an `aria-label`.
 */
function TagsInput({
  value,
  defaultValue = [],
  onValueChange,
  delimiters = [','],
  validate,
  max,
  allowDuplicates = false,
  suggestions,
  addOnBlur = true,
  name,
  disabled,
  readOnly,
  required,
  className,
  placeholder,
  onKeyDown,
  onPaste,
  onBlur,
  ...inputProps
}: TagsInputProps) {
  const [tags, setTags] = useControllableState(value, defaultValue, onValueChange);
  const [draft, setDraft] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState('');
  const highlighted = React.useRef<string | undefined>(undefined);

  const options = React.useMemo(() => {
    if (!suggestions) return [];
    const taken = new Set(tags.map((tag) => tag.toLocaleLowerCase()));
    return suggestions.filter((suggestion) => !taken.has(suggestion.toLocaleLowerCase()));
  }, [suggestions, tags]);

  function add(incoming: string[]) {
    if (incoming.length === 0) return;
    const result = addTags(tags, incoming, { max, allowDuplicates });
    if (result.added.length > 0) setTags(result.tags);
    setAnnouncement(describeAdd(result));
  }

  function addDraft() {
    add(splitTags(draft, delimiters));
    setDraft('');
  }

  const full = max !== undefined && tags.length >= max;
  const listOpen = suggestions !== undefined && open && draft.trim() !== '';

  return (
    <ComboboxPrimitive.Root<string, true>
      multiple
      value={tags}
      onValueChange={(next) => setTags(next)}
      inputValue={draft}
      onInputValueChange={(next, details) => {
        // Closing the list clears the query; here the query is a tag being typed, so it stays.
        if (details.reason === 'input-clear' && !details.isItemPress) return;
        const { complete, rest } = takeTags(next, delimiters);
        add(complete);
        setDraft(rest);
      }}
      items={options}
      open={listOpen}
      onOpenChange={setOpen}
      onItemHighlighted={(item) => {
        highlighted.current = item;
      }}
      name={name}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
    >
      <ComboboxChips data-slot="tags-input" className={className}>
        {tags.map((tag, index) => (
          <ComboboxChip key={`${index}:${tag}`} invalid={validate ? !validate(tag) : false} showRemove={!readOnly}>
            {tag}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput
          placeholder={tags.length > 0 ? undefined : placeholder}
          aria-description={
            tags.length > 0
              ? `${plural(tags.length, 'tag', 'tags')}${full ? ', the most it takes' : ''}. From the start of the input, press Left Arrow to reach them.`
              : undefined
          }
          readOnly={readOnly || full}
          // A full list takes no more text, so the input gives up its room instead of wrapping onto a line of its own.
          className={full ? 'min-w-1' : undefined}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            if (event.key === 'Enter' && draft.trim() !== '' && !(listOpen && highlighted.current)) {
              event.preventDefault();
              event.preventBaseUIHandler();
              addDraft();
            } else if (event.key === 'Escape' && !listOpen) {
              // Escape on a closed combobox clears every chip. Here it only clears the text being typed.
              event.preventBaseUIHandler();
              if (draft !== '') setDraft('');
            }
          }}
          onPaste={(event) => {
            onPaste?.(event);
            if (event.defaultPrevented) return;
            const text = event.clipboardData.getData('text');
            if (splitTags(text, delimiters).length < 2) return;
            // Inputs drop the line breaks of a pasted list, so split it here, before they are lost.
            event.preventDefault();
            add(splitTags(`${draft}${text}`, delimiters));
            setDraft('');
          }}
          onBlur={(event) => {
            onBlur?.(event);
            if (addOnBlur && draft.trim() !== '') addDraft();
          }}
          {...inputProps}
        />
      </ComboboxChips>
      <span role="status" className="sr-only">
        {announcement}
      </span>
      {suggestions ? (
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>
            {(suggestion: string) => (
              <ComboboxItem key={suggestion} value={suggestion}>
                {suggestion}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      ) : null}
    </ComboboxPrimitive.Root>
  );
}

export { TagsInput, type TagsInputProps };
