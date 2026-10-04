'use client';

import { Avatar } from '@/components/ui/Avatar';
import { useLocale, useT } from '@/i18n/useT';
import type { HouseMember, Notice } from '@/types';
import { formatRelativeDay } from '@/utils/date';
import { getMemberName } from '@/utils/members';
import { NoticeActions } from './NoticeActions';

interface AnnouncementCardProps {
  notice: Notice;
  members: HouseMember[];
  uid: string;
  now: Date;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AnnouncementCard({ notice, members, uid, now, onEdit, onDelete }: AnnouncementCardProps) {
  const t = useT();
  const locale = useLocale();
  const author = members.find((member) => member.userId === notice.createdBy);
  const authorName = getMemberName(members, notice.createdBy, uid, {
    you: author?.displayName ?? t.common.you,
    formerMember: t.common.formerMember,
  });

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <Avatar name={author?.displayName ?? authorName} photoURL={author?.photoURL} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{notice.title}</h3>
          <p className="text-sm text-muted">
            {authorName} · {formatRelativeDay(notice.createdAt.toDate(), now, locale)}
            {notice.updatedAt && ` · ${t.notices.edited}`}
          </p>
        </div>
        {onEdit && onDelete && <NoticeActions onEdit={onEdit} onDelete={onDelete} />}
      </div>
      {notice.content && <p className="whitespace-pre-line">{notice.content}</p>}
    </article>
  );
}
