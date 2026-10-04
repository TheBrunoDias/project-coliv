'use client';

import { ChevronRight, PartyPopper, Receipt } from 'lucide-react';
import Link from 'next/link';
import { AnnouncementCard } from '@/components/notices/AnnouncementCard';
import { AssigneeAvatar } from '@/components/tasks/AssigneeAvatar';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Card } from '@/components/ui/Card';
import { useNow } from '@/hooks/useNow';
import { useTaskViews } from '@/hooks/useTaskViews';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';
import { formatMoney, getHouseCurrency } from '@/utils/money';
import { getMonthSummary } from '@/utils/purchases';

const RECENT_ANNOUNCEMENT_MS = 7 * 86_400_000;

export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const views = useTaskViews();
  const house = useHouseStore((state) => state.house);
  const purchases = useHouseStore((state) => state.purchases);
  const notices = useHouseStore((state) => state.notices);
  const members = useHouseStore((state) => state.members);
  const now = useNow();
  const month = getMonthSummary(purchases, now);
  const currency = getHouseCurrency(house);
  const firstName = profile?.displayName.split(' ')[0];

  // Notices are sorted newest first; only surface recent announcements
  const latestAnnouncement = notices.find((notice) => !notice.isRule);
  const showAnnouncement =
    latestAnnouncement &&
    now.getTime() - latestAnnouncement.createdAt.toMillis() < RECENT_ANNOUNCEMENT_MS;

  const mine = views.filter((view) => view.isMine);
  const onDuty = views.filter((view) => view.status === 'active' && view.current);

  return (
    <>
      <h1 className="text-2xl font-semibold">Olá, {firstName}!</h1>

      {showAnnouncement && latestAnnouncement && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Último aviso</h2>
            <Link href="/notices" className="flex items-center text-sm font-medium text-brand">
              Ver mural
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <AnnouncementCard
            notice={latestAnnouncement}
            members={members}
            uid={profile?.uid ?? ''}
            now={now}
          />
        </section>
      )}

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

      <Link href="/shopping" className="block">
        <Card className="transition-colors hover:bg-surface-muted">
          <div className="flex items-center gap-3">
            <Receipt className="size-5 shrink-0 text-brand" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Compras do mês</p>
              <p className="text-sm text-muted">
                {month
                  ? `${formatMoney(month.totalCents, currency)} no total · ${formatMoney(month.perPersonCents, currency)} por pessoa`
                  : 'Nenhuma compra registrada este mês'}
              </p>
            </div>
            <ChevronRight className="size-5 text-muted" />
          </div>
        </Card>
      </Link>

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
