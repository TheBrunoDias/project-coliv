import type { HouseMember } from '@/types';

/** "você", the member's name, or "Ex-morador" for people who left. */
export function getMemberName(members: HouseMember[], userId: string, uid: string): string {
  if (userId === uid) return 'você';
  return members.find((member) => member.userId === userId)?.displayName ?? 'Ex-morador';
}
