'use client';

import { Plus, X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useT } from '@/i18n/useT';

export const MAX_ITEMS = 30;

interface ItemsInputProps {
  items: string[];
  onItemsChange: (items: string[]) => void;
  // Text being typed; the form also includes it when submitting
  draft: string;
  onDraftChange: (draft: string) => void;
}

/** Chips input: type an item and press Enter (or comma) to add it. */
export function ItemsInput({ items, onItemsChange, draft, onDraftChange }: ItemsInputProps) {
  const t = useT();

  function addDraft() {
    const values = draft
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (values.length === 0) return;
    onItemsChange([...items, ...values].slice(0, MAX_ITEMS));
    onDraftChange('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addDraft();
    } else if (event.key === 'Backspace' && !draft && items.length > 0) {
      onItemsChange(items.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="purchase-items" className="text-sm font-medium">
        {t.purchases.form.items}
      </label>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center gap-1 rounded-full bg-brand/10 py-1 pr-1 pl-3 text-sm text-brand-strong"
            >
              {item}
              <button
                type="button"
                onClick={() => onItemsChange(items.filter((_, i) => i !== index))}
                aria-label={t.purchases.form.removeItem(item)}
                className="rounded-full p-0.5 hover:bg-brand/20"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id="purchase-items"
          placeholder={items.length ? t.purchases.form.moreItems : t.purchases.form.itemsPlaceholder}
          maxLength={80}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          enterKeyHint="enter"
          disabled={items.length >= MAX_ITEMS}
          className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 text-base outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="button"
          onClick={addDraft}
          aria-label={t.purchases.form.addItem}
          disabled={!draft.trim()}
          className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-foreground hover:bg-surface-muted disabled:opacity-40"
        >
          <Plus className="size-5" />
        </button>
      </div>
    </div>
  );
}
