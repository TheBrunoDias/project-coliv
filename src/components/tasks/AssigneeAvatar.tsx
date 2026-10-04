import { Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import type { Assignee } from '@/utils/taskView';

export function AssigneeAvatar({ assignee }: { assignee: Assignee }) {
  if (assignee.isGroup) {
    return (
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-strong"
      >
        <Users className="size-5" />
      </span>
    );
  }
  return <Avatar name={assignee.name} photoURL={assignee.photoURL} />;
}
