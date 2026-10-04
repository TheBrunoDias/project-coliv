'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';

// "Who's on duty now" arrives with task rotations in Phase 3
export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const memberCount = useHouseStore((state) => state.members.length);
  const firstName = profile?.displayName.split(' ')[0];

  return (
    <>
      <h1 className="text-2xl font-semibold">Olá, {firstName}!</h1>

      <Card title="Suas responsabilidades" description="Os rodízios de tarefas chegam em breve." />

      <Link href="/house" className="block">
        <Card className="transition-colors hover:bg-surface-muted">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Moradores</p>
              <p className="text-sm text-muted">
                {memberCount} {memberCount === 1 ? 'pessoa' : 'pessoas'} na casa
              </p>
            </div>
            <ChevronRight className="size-5 text-muted" />
          </div>
        </Card>
      </Link>
    </>
  );
}
