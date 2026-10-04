'use client';

import { Check, Copy, RefreshCw, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { regenerateInviteCode } from '@/services/houseService';
import type { House } from '@/types';
import { getInviteUrl } from '@/utils/inviteCode';

/** Admin only. */
export function InviteLinkCard({ house }: { house: House }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingRegenerate, setConfirmingRegenerate] = useState(false);

  // This component only renders on the client (behind RequireAuth)
  const url = getInviteUrl(house.inviteCode);
  const canShare = typeof navigator.share === 'function';

  async function handleCopy() {
    setError(null);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar. Selecione o link e copie manualmente.');
    }
  }

  async function handleShare() {
    setError(null);
    try {
      await navigator.share({
        title: `Convite para ${house.name}`,
        text: `Entre na casa "${house.name}" no Coliv:`,
        url,
      });
    } catch (err) {
      // The user closed the share sheet
      if (err instanceof DOMException && err.name === 'AbortError') return;
      await handleCopy();
    }
  }

  return (
    <Card
      title="Convidar moradores"
      description="Qualquer pessoa com este link pode entrar na casa."
    >
      <p className="truncate rounded-xl bg-surface-muted px-3 py-2.5 font-mono text-sm select-all">
        {url}
      </p>

      {error && <Alert>{error}</Alert>}

      <div className="flex gap-2">
        {canShare && (
          <Button className="flex-1" size="sm" onClick={handleShare}>
            <Share2 className="size-4" />
            Compartilhar
          </Button>
        )}
        <Button
          className="flex-1"
          size="sm"
          variant={canShare ? 'secondary' : 'primary'}
          onClick={handleCopy}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copiado!' : 'Copiar link'}
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={() => setConfirmingRegenerate(true)}>
        <RefreshCw className="size-4" />
        Gerar novo link
      </Button>

      <ConfirmDialog
        open={confirmingRegenerate}
        onClose={() => setConfirmingRegenerate(false)}
        title="Gerar novo link?"
        description="O link atual deixará de funcionar. Quem já mora na casa não é afetado."
        confirmLabel="Gerar novo link"
        onConfirm={() => regenerateInviteCode(house)}
      />
    </Card>
  );
}
