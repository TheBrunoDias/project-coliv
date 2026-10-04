'use client';

import { Megaphone, Plus, ScrollText } from 'lucide-react';
import { useState } from 'react';
import { AnnouncementCard } from '@/components/notices/AnnouncementCard';
import { NoticeActions } from '@/components/notices/NoticeActions';
import { NoticeFormDialog } from '@/components/notices/NoticeFormDialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useNow } from '@/hooks/useNow';
import { deleteNotice } from '@/services/noticeService';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';
import type { Notice } from '@/types';

export default function NoticesPage() {
  const houseId = useHouseStore((state) => state.house?.id);
  const notices = useHouseStore((state) => state.notices);
  const members = useHouseStore((state) => state.members);
  const uid = useAuthStore((state) => state.profile?.uid) ?? '';
  const isAdmin = useIsAdmin();
  const now = useNow();

  const [creating, setCreating] = useState<'rule' | 'announcement' | null>(null);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [deleting, setDeleting] = useState<Notice | null>(null);

  if (!houseId) return null;

  // Rules keep their creation order so numbering is stable; announcements are newest first
  const rules = notices.filter((notice) => notice.isRule).reverse();
  const announcements = notices.filter((notice) => !notice.isRule);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Mural</h1>
        {isAdmin && (
          <Button size="sm" onClick={() => setCreating('announcement')}>
            <Plus className="size-4" />
            Novo aviso
          </Button>
        )}
      </div>

      <Card
        title="Regras da casa"
        action={
          isAdmin && (
            <Button size="sm" variant="secondary" onClick={() => setCreating('rule')}>
              <Plus className="size-4" />
              Regra
            </Button>
          )
        }
      >
        {rules.length === 0 ? (
          <div className="flex items-center gap-3 text-sm text-muted">
            <ScrollText className="size-5 shrink-0 text-brand" />
            {isAdmin
              ? 'Nenhuma regra ainda. Ex.: "Silêncio após as 22h", "Louça lavada no mesmo dia".'
              : 'Nenhuma regra definida ainda.'}
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {rules.map((rule, index) => (
              <li key={rule.id} className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand-strong">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{rule.title}</p>
                  {rule.content && (
                    <p className="text-sm whitespace-pre-line text-muted">{rule.content}</p>
                  )}
                </div>
                {isAdmin && (
                  <NoticeActions onEdit={() => setEditing(rule)} onDelete={() => setDeleting(rule)} />
                )}
              </li>
            ))}
          </ol>
        )}
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="pt-2 font-semibold">Avisos</h2>
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-6 text-center text-muted">
            <Megaphone className="size-8 text-brand" />
            {isAdmin
              ? 'Publique recados para todos os moradores, como visitas técnicas ou mudanças na casa.'
              : 'Nenhum aviso por enquanto.'}
          </div>
        ) : (
          announcements.map((notice) => (
            <AnnouncementCard
              key={notice.id}
              notice={notice}
              members={members}
              uid={uid}
              now={now}
              onEdit={isAdmin ? () => setEditing(notice) : undefined}
              onDelete={isAdmin ? () => setDeleting(notice) : undefined}
            />
          ))
        )}
      </section>

      <NoticeFormDialog
        open={creating !== null}
        onClose={() => setCreating(null)}
        defaultIsRule={creating === 'rule'}
      />
      <NoticeFormDialog open={editing !== null} onClose={() => setEditing(null)} notice={editing} />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={deleting?.isRule ? 'Excluir regra?' : 'Excluir aviso?'}
        description={`"${deleting?.title}" será removido do mural para todos os moradores.`}
        confirmLabel="Excluir"
        danger
        onConfirm={async () => {
          if (deleting) await deleteNotice(houseId, deleting.id);
        }}
      />
    </>
  );
}
