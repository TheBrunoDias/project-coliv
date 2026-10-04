'use client';

import { Check, Copy, RefreshCw, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useT } from '@/i18n/useT';
import { regenerateInviteCode } from '@/services/houseService';
import type { House } from '@/types';
import { getInviteUrl } from '@/utils/inviteCode';

/** Admin only. */
export function InviteLinkCard({ house }: { house: House }) {
  const t = useT();
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
      setError(t.house.invite.copyError);
    }
  }

  async function handleShare() {
    setError(null);
    try {
      await navigator.share({
        title: t.house.invite.shareTitle(house.name),
        text: t.house.invite.shareText(house.name),
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
      title={t.house.invite.title}
      description={t.house.invite.description}
    >
      <p className="truncate rounded-xl bg-surface-muted px-3 py-2.5 font-mono text-sm select-all">
        {url}
      </p>

      {error && <Alert>{error}</Alert>}

      <div className="flex gap-2">
        {canShare && (
          <Button className="flex-1" size="sm" onClick={handleShare}>
            <Share2 className="size-4" />
            {t.house.invite.share}
          </Button>
        )}
        <Button
          className="flex-1"
          size="sm"
          variant={canShare ? 'secondary' : 'primary'}
          onClick={handleCopy}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? t.house.invite.copied : t.house.invite.copy}
        </Button>
      </div>

      <Button variant="ghost" size="sm" onClick={() => setConfirmingRegenerate(true)}>
        <RefreshCw className="size-4" />
        {t.house.invite.regenerate}
      </Button>

      <ConfirmDialog
        open={confirmingRegenerate}
        onClose={() => setConfirmingRegenerate(false)}
        title={t.house.invite.regenerateTitle}
        description={t.house.invite.regenerateDescription}
        confirmLabel={t.house.invite.regenerate}
        onConfirm={() => regenerateInviteCode(house)}
      />
    </Card>
  );
}
