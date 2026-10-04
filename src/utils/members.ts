import type { HouseMember } from '@/types';

export interface MemberNameLabels {
  you: string;
  formerMember: string;
}

/** "you", the member's name, or "former resident" for people who left. */
export function getMemberName(
  members: HouseMember[],
  userId: string,
  uid: string,
  labels: MemberNameLabels,
): string {
  if (userId === uid) return labels.you;
  return members.find((member) => member.userId === userId)?.displayName ?? labels.formerMember;
}
