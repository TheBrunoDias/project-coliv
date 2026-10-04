'use client';

import { toRotation } from '@/services/taskService';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';
import { getTaskView, type TaskView } from '@/utils/taskView';
import { useNow } from './useNow';

/** Every task with its current/next assignee resolved, kept up to date as time passes. */
export function useTaskViews(): TaskView[] {
  const tasks = useHouseStore((state) => state.tasks);
  const members = useHouseStore((state) => state.members);
  const groups = useHouseStore((state) => state.groups);
  const uid = useAuthStore((state) => state.profile?.uid) ?? '';
  const now = useNow();

  return tasks.map((task) => getTaskView(task, toRotation(task), now, members, groups, uid));
}
