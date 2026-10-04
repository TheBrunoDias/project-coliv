import { Avatar } from '@/components/ui/Avatar';
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
  const author = members.find((member) => member.userId === notice.createdBy);
  const authorName = getMemberName(members, notice.createdBy, uid);

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <Avatar name={author?.displayName ?? authorName} photoURL={author?.photoURL} />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{notice.title}</h3>
          <p className="text-sm text-muted">
            {authorName === 'você' ? 'Você' : authorName} · {formatRelativeDay(notice.createdAt.toDate(), now)}
            {notice.updatedAt && ' · editado'}
          </p>
        </div>
        {onEdit && onDelete && <NoticeActions onEdit={onEdit} onDelete={onDelete} />}
      </div>
      {notice.content && <p className="whitespace-pre-line">{notice.content}</p>}
    </article>
  );
}
