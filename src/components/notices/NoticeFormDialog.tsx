'use client';

import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useT } from '@/i18n/useT';
import { createNotice, updateNotice } from '@/services/noticeService';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';
import type { Notice } from '@/types';

interface NoticeFormDialogProps {
  open: boolean;
  onClose: () => void;
  // Edit mode when set
  notice?: Notice | null;
  // Type preselected when creating
  defaultIsRule?: boolean;
}

export function NoticeFormDialog({ open, onClose, notice, defaultIsRule = false }: NoticeFormDialogProps) {
  const t = useT();
  const isRule = notice?.isRule ?? defaultIsRule;
  const title = notice
    ? isRule
      ? t.notices.form.editRule
      : t.notices.form.editAnnouncement
    : t.notices.form.newTitle;

  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <NoticeForm notice={notice ?? null} defaultIsRule={defaultIsRule} onClose={onClose} />
    </Dialog>
  );
}

function NoticeForm({
  notice,
  defaultIsRule,
  onClose,
}: {
  notice: Notice | null;
  defaultIsRule: boolean;
  onClose: () => void;
}) {
  const houseId = useHouseStore((state) => state.house?.id);
  const uid = useAuthStore((state) => state.profile?.uid) ?? '';
  const t = useT();

  const [isRule, setIsRule] = useState(notice?.isRule ?? defaultIsRule);
  const [title, setTitle] = useState(notice?.title ?? '');
  const [content, setContent] = useState(notice?.content ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!houseId) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!houseId) return;
    setError(null);
    setLoading(true);

    const input = { title: title.trim(), content: content.trim(), isRule };
    try {
      if (notice) await updateNotice(houseId, notice.id, input);
      else await createNotice(houseId, uid, input);
      onClose();
    } catch (err) {
      console.error(err);
      setError(t.notices.form.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1">
          {[false, true].map((value) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => setIsRule(value)}
              aria-pressed={isRule === value}
              className={`h-9 rounded-lg text-sm font-medium ${isRule === value ? 'bg-surface shadow-sm' : 'text-muted'}`}
            >
              {value ? t.notices.form.rule : t.notices.form.announcement}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">
          {isRule ? t.notices.form.ruleHint : t.notices.form.announcementHint}
        </p>
      </div>

      <Input
        label={t.notices.form.title}
        placeholder={isRule ? t.notices.form.rulePlaceholder : t.notices.form.announcementPlaceholder}
        required
        maxLength={100}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Textarea
        label={t.notices.form.details}
        rows={4}
        maxLength={2000}
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />

      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={loading} disabled={!title.trim()}>
        {notice ? t.common.save : t.notices.form.publish}
      </Button>
    </form>
  );
}
