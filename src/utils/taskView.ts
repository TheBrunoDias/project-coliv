import type { Frequency, Group, HouseMember, Task } from '@/types';
import { getRotationState, type Rotation } from './rotation';

export type ScheduleUnit = Exclude<Frequency, 'biweekly'>;

// Labels live in the i18n messages (`t.tasks.units`, `t.tasks.schedule`)
export const SCHEDULE_UNITS: ScheduleUnit[] = ['daily', 'weekly', 'monthly'];

/** Names used for ids that no longer resolve. */
export interface AssigneeLabels {
  formerMember: string;
  deletedGroup: string;
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
  labels: AssigneeLabels,
): Assignee {
  if (type === 'group') {
    const groupMembers = members.filter((member) => member.groupIds.includes(id));
    return {
      id,
      name: groups.find((group) => group.id === id)?.name ?? labels.deletedGroup,
      isGroup: true,
      memberNames: groupMembers.map((member) => member.displayName),
      includesMe: groupMembers.some((member) => member.userId === uid),
    };
  }

  const member = members.find((m) => m.userId === id);
  return {
    id,
    // Users who left or deleted their account
    name: member?.displayName ?? labels.formerMember,
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
  // Normalized schedule (legacy 'biweekly' is weekly × 2), formatted with t.tasks.schedule
  schedule: { frequency: ScheduleUnit; interval: number };
}

export function getTaskView(
  task: Task,
  rotation: Rotation,
  now: Date,
  members: HouseMember[],
  groups: Group[],
  uid: string,
  labels: AssigneeLabels,
): TaskView {
  const state = getRotationState(rotation, now);
  const resolve = (index: number) =>
    resolveAssignee(task.assigneeType, task.rotation[index], members, groups, uid, labels);
  const isFixed = task.rotation.length === 1;
  const schedule =
    rotation.frequency === 'biweekly'
      ? { frequency: 'weekly' as const, interval: rotation.interval * 2 }
      : { frequency: rotation.frequency, interval: rotation.interval };

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
