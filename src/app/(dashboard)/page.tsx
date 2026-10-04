'use client';

import { ChevronRight, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { AssigneeAvatar } from '@/components/tasks/AssigneeAvatar';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Card } from '@/components/ui/Card';
import { useNow } from '@/hooks/useNow';
import { useTaskViews } from '@/hooks/useTaskViews';
import { useAuthStore } from '@/store/useAuthStore';

export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const views = useTaskViews();
  const now = useNow();
  const firstName = profile?.displayName.split(' ')[0];

  const mine = views.filter((view) => view.isMine);
  const onDuty = views.filter((view) => view.status === 'active' && view.current);

  return (
    <>
      <h1 className="text-2xl font-semibold">Olá, {firstName}!</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Suas responsabilidades agora</h2>
        {mine.length > 0 ? (
          mine.map((view) => <TaskCard key={view.task.id} view={view} now={now} />)
        ) : (
          <Card>
            <div className="flex items-center gap-3 text-muted">
              <PartyPopper className="size-5 shrink-0 text-brand" />
              {views.length > 0
                ? 'Nenhuma tarefa com você neste momento.'
                : 'A casa ainda não tem tarefas.'}
            </div>
          </Card>
        )}
      </section>

      {onDuty.length > 0 && (
        <Card
          title="Quem está de plantão"
          action={
            <Link href="/tasks" className="flex items-center text-sm font-medium text-brand">
              Ver tudo
              <ChevronRight className="size-4" />
            </Link>
          }
        >
          <ul className="-my-1 flex flex-col">
            {onDuty.map(({ task, current }) =>
              current ? (
                <li key={task.id} className="flex items-center gap-3 py-1.5">
                  <AssigneeAvatar assignee={current} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{task.title}</p>
                    <p className="truncate text-sm text-muted">
                      {current.includesMe && !current.isGroup ? 'Você' : current.name}
                    </p>
                  </div>
                </li>
              ) : null,
            )}
          </ul>
        </Card>
      )}
    </>
  );
}
