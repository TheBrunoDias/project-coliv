'use client';

import { useParams } from 'next/navigation';
import { InviteLanding } from '@/components/house/InviteLanding';

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  return <InviteLanding code={code} />;
}
