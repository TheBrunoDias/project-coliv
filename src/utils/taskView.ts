import type { Frequency, Group, HouseMember, Task } from '@/types';
import { getRotationState, type Rotation } from './rotation';

export type ScheduleUnit = Exclude<Frequency, 'biweekly'>;

const UNIT_NAMES: Record<ScheduleUnit, { every: string; plural: string }> = {
  daily: { every: 'Todo dia', plural: 'dias' },
  weekly: { every: 'Toda semana', plural: 'semanas' },
  monthly: { every: 'Todo mês', plural: 'meses' },
};

export const SCHEDULE_UNITS: { value: ScheduleUnit; label: string }[] = [
  { value: 'daily', label: 'dias' },
  { value: 'weekly', label: 'semanas' },
  { value: 'monthly', label: 'meses' },
];

/** "Toda semana", "A cada 2 semanas", "A cada 3 dias"... */
export function formatSchedule(frequency: Frequency, interval: number): string {
  if (frequency === 'biweekly') return formatSchedule('weekly', interval * 2);
  const names = UNIT_NAMES[frequency];
  return interval === 1 ? names.every : `A cada ${interval} ${names.plural}`;
}

export interface Assignee {
  id: string;
  name: string;
  photoURL?: string;
  isGroup: boolean;
  // Group members' names (empty for users)
  memberNames: string[];
  // The current user is this person or belongs to this group
  includesMe: boolean;
}

export function resolveAssignee(
  type: Task['assigneeType'],
  id: string,
  members: HouseMember[],
  groups: Group[],
  uid: string,
): Assignee {
  if (type === 'group') {
    const groupMembers = members.filter((member) => member.groupIds.includes(id));
    return {
      id,
      name: groups.find((group) => group.id === id)?.name ?? 'Grupo removido',
      isGroup: true,
      memberNames: groupMembers.map((member) => member.displayName),
      includesMe: groupMembers.some((member) => member.userId === uid),
    };
  }

  const member = members.find((m) => m.userId === id);
  return {
    id,
    // Users who left or deleted their account
    name: member?.displayName ?? 'Ex-morador',
    photoURL: member?.photoURL,
    isGroup: false,
    memberNames: [],
    includesMe: id === uid,
  };
}

export interface TaskView {
  task: Task;
  status: 'empty' | 'upcoming' | 'active';
  // Active: who has the turn now. Upcoming: who starts.
  current: Assignee | null;
  // null for fixed responsibilities
  next: Assignee | null;
  // Active: when the turn changes. Upcoming: when it starts.
  changeAt: Date | null;
  isFixed: boolean;
  isMine: boolean;
  // e.g. "Toda semana"
  schedule: string;
}

export function getTaskView(
  task: Task,
  rotation: Rotation,
  now: Date,
  members: HouseMember[],
  groups: Group[],
  uid: string,
): TaskView {
  const state = getRotationState(rotation, now);
  const resolve = (index: number) =>
    resolveAssignee(task.assigneeType, task.rotation[index], members, groups, uid);
  const isFixed = task.rotation.length === 1;
  const schedule = formatSchedule(rotation.frequency, rotation.interval);

  if (state.status === 'empty') {
    return {
      task,
      status: 'empty',
      current: null,
      next: null,
      changeAt: null,
      isFixed,
      isMine: false,
      schedule,
    };
  }

  if (state.status === 'upcoming') {
    return {
      task,
      status: 'upcoming',
      current: resolve(state.firstIndex),
      next: null,
      changeAt: state.startsAt,
      isFixed,
      isMine: false,
      schedule,
    };
  }

  const current = resolve(state.currentIndex);
  return {
    task,
    status: 'active',
    current,
    next: state.nextIndex === null ? null : resolve(state.nextIndex),
    changeAt: state.nextChange,
    isFixed,
    isMine: current.includesMe,
    schedule,
  };
}
