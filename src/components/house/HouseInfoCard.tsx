'use client';

import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextPromptDialog } from '@/components/ui/TextPromptDialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { renameHouse } from '@/services/houseService';
import type { House } from '@/types';

export function HouseInfoCard({ house }: { house: House }) {
  const isAdmin = useIsAdmin();
  const [renaming, setRenaming] = useState(false);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted">Casa</p>
          <h1 className="truncate text-xl font-semibold">{house.name}</h1>
        </div>
        {isAdmin && (
          <Button variant="secondary" size="sm" onClick={() => setRenaming(true)}>
            <Pencil className="size-4" />
            Renomear
          </Button>
        )}
      </div>

      <TextPromptDialog
        open={renaming}
        onClose={() => setRenaming(false)}
        title="Renomear casa"
        label="Nome da casa"
        submitLabel="Salvar"
        initialValue={house.name}
        onSubmit={(name) => renameHouse(house, name)}
      />
    </Card>
  );
}
