'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useNow } from '@/hooks/useNow';
import { useLocale, useT } from '@/i18n/useT';
import { createTask, toRotation, updateTask, type TaskInput } from '@/services/taskService';
import { useAuthStore } from '@/store/useAuthStore';
import { useHouseStore } from '@/store/useHouseStore';
import type { Task } from '@/types';
import { formatRelativeDay, parseDateInput, toDateInputValue } from '@/utils/date';
import { getRotationState, startOfDay, toEditableRotation } from '@/utils/rotation';
import { resolveAssignee, SCHEDULE_UNITS, type ScheduleUnit } from '@/utils/taskView';
import { RotationEditor } from './RotationEditor';

const SCHEDULE_PRESETS: { frequency: ScheduleUnit; interval: number }[] = [
  { frequency: 'daily', interval: 1 },
  { frequency: 'weekly', interval: 1 },
  { frequency: 'weekly', interval: 2 },
  { frequency: 'monthly', interval: 1 },
];
const CUSTOM = 'custom';
const MAX_INTERVAL = 30;

const presetKey = (frequency: ScheduleUnit, interval: number) => `${frequency}:${interval}`;

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  // Edit mode when set
  task?: Task | null;
}

export function TaskFormDialog({ open, onClose, task }: TaskFormDialogProps) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} title={task ? t.tasks.form.editTitle : t.tasks.form.newTitle}>
      <TaskForm task={task ?? null} onClose={onClose} />
    </Dialog>
  );
}

function TaskForm({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const houseId = useHouseStore((state) => state.house?.id);
  const members = useHouseStore((state) => state.members);
  const groups = useHouseStore((state) => state.groups);
  const uid = useAuthStore((state) => state.profile?.uid) ?? '';
  const now = useNow();
  const t = useT();
  const locale = useLocale();

  const [initial] = useState(() => {
    if (!task) {
      return { rotation: [], startDate: startOfDay(new Date()), frequency: 'weekly' as const, interval: 1 };
    }
    // Normalizes legacy 'biweekly' into weekly + interval 2
    const current = toRotation(task);
    return {
      ...toEditableRotation(current, new Date()),
      frequency: current.frequency as ScheduleUnit,
      interval: current.interval,
    };
  });
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [assigneeType, setAssigneeType] = useState<Task['assigneeType']>(task?.assigneeType ?? 'user');
  const [rotation, setRotation] = useState<string[]>(initial.rotation);
  const [frequency, setFrequency] = useState<ScheduleUnit>(initial.frequency);
  const [interval, setIntervalCount] = useState(initial.interval);
  const [isCustomSchedule, setIsCustomSchedule] = useState(
    () => !SCHEDULE_PRESETS.some((p) => p.frequency === initial.frequency && p.interval === initial.interval),
  );
  const [startDate, setStartDate] = useState(toDateInputValue(initial.startDate));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!houseId) return null;

  const labels = { formerMember: t.common.formerMember, deletedGroup: t.common.deletedGroup };
  const resolve = (id: string) => resolveAssignee(assigneeType, id, members, groups, uid, labels);
  const options =
    assigneeType === 'user' ? members.map((m) => resolve(m.userId)) : groups.map((g) => resolve(g.id));
  const parsedStart = parseDateInput(startDate);
  const isValidInterval = Number.isInteger(interval) && interval >= 1 && interval <= MAX_INTERVAL;
  // A single assignee has no rotation, so the schedule does not matter
  const hasRotation = rotation.length > 1;
  const canSubmit =
    title.trim() && rotation.length > 0 && parsedStart && (isValidInterval || !hasRotation);

  function changeSchedule(value: string) {
    if (value === CUSTOM) {
      setIsCustomSchedule(true);
      return;
    }
    const [unit, count] = value.split(':');
    setIsCustomSchedule(false);
    setFrequency(unit as ScheduleUnit);
    setIntervalCount(Number(count));
  }

  function changeType(type: Task['assigneeType']) {
    if (type === assigneeType) return;
    setAssigneeType(type);
    setRotation([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!houseId || !parsedStart) return;
    setError(null);
    setLoading(true);

    const input: TaskInput = {
      title: title.trim(),
      description: description.trim(),
      assigneeType,
      rotation,
      frequency,
      interval: isValidInterval ? interval : 1,
      startDate: parsedStart,
    };
    try {
      if (task) await updateTask(houseId, task.id, input);
      else await createTask(houseId, uid, input);
      onClose();
    } catch (err) {
      console.error(err);
      setError(t.tasks.form.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label={t.tasks.form.title}
        placeholder={t.tasks.form.titlePlaceholder}
        required
        maxLength={80}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Textarea
        label={t.tasks.form.details}
        placeholder={t.tasks.form.detailsPlaceholder}
        maxLength={500}
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium">{t.tasks.form.assignees}</legend>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-muted p-1">
          {(['user', 'group'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => changeType(type)}
              aria-pressed={assigneeType === type}
              className={`h-9 rounded-lg text-sm font-medium ${assigneeType === type ? 'bg-surface shadow-sm' : 'text-muted'}`}
            >
              {type === 'user' ? t.tasks.form.residents : t.tasks.form.groups}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">
          {assigneeType === 'user' ? t.tasks.form.residentsHint : t.tasks.form.groupsHint}
        </p>
        {assigneeType === 'group' && groups.length === 0 ? (
          <p className="rounded-xl bg-surface-muted p-3 text-sm text-muted">
            {t.tasks.form.noGroups}{' '}
            <Link href="/house" className="font-medium text-brand hover:underline">
              {t.tasks.form.noGroupsLink}
            </Link>
            .
          </p>
        ) : (
          <RotationEditor value={rotation} onChange={setRotation} options={options} resolve={resolve} />
        )}
      </fieldset>

      {hasRotation && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-schedule" className="text-sm font-medium">
            {t.tasks.form.schedule}
          </label>
          <select
            id="task-schedule"
            value={isCustomSchedule ? CUSTOM : presetKey(frequency, interval)}
            onChange={(event) => changeSchedule(event.target.value)}
            className={selectClassName}
          >
            {SCHEDULE_PRESETS.map((preset) => (
              <option key={presetKey(preset.frequency, preset.interval)} value={presetKey(preset.frequency, preset.interval)}>
                {t.tasks.schedule(preset.frequency, preset.interval)}
              </option>
            ))}
            <option value={CUSTOM}>{t.tasks.form.custom}</option>
          </select>

          {isCustomSchedule && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">{t.tasks.form.every}</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={MAX_INTERVAL}
                aria-label={t.tasks.form.quantity}
                value={Number.isNaN(interval) ? '' : interval}
                onChange={(event) => setIntervalCount(event.target.valueAsNumber)}
                className="h-12 w-20 rounded-xl border border-border bg-surface px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <select
                aria-label={t.tasks.form.unit}
                value={frequency}
                onChange={(event) => setFrequency(event.target.value as ScheduleUnit)}
                className={`${selectClassName} flex-1`}
              >
                {SCHEDULE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {t.tasks.units[unit]}
                  </option>
                ))}
              </select>
            </div>
          )}
          {isCustomSchedule && !isValidInterval && (
            <p className="text-sm text-danger">{t.tasks.form.invalidInterval(MAX_INTERVAL)}</p>
          )}
        </div>
      )}

      <Input
        label={hasRotation ? t.tasks.form.firstTurnStarts : t.tasks.form.startsFrom}
        type="date"
        required
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
      />

      {canSubmit && parsedStart && (
        <RotationPreview
          rotation={rotation}
          frequency={frequency}
          interval={isValidInterval ? interval : 1}
          startDate={parsedStart}
          now={now}
          resolveName={(id) => resolve(id).name}
          format={(date) => formatRelativeDay(date, now, locale)}
        />
      )}

      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={loading} disabled={!canSubmit}>
        {task ? t.common.save : t.tasks.form.create}
      </Button>
    </form>
  );
}

const selectClassName =
  'h-12 rounded-xl border border-border bg-surface px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

function RotationPreview({
  rotation,
  frequency,
  interval,
  startDate,
  now,
  resolveName,
  format,
}: {
  rotation: string[];
  frequency: ScheduleUnit;
  interval: number;
  startDate: Date;
  now: Date;
  resolveName: (id: string) => string;
  format: (date: Date) => string;
}) {
  const t = useT();
  const state = getRotationState(
    { rotation, frequency, interval, anchorDate: startDate, anchorIndex: 0 },
    now,
  );

  let text = '';
  if (state.status === 'upcoming') {
    text = t.tasks.form.previewStarts(resolveName(rotation[state.firstIndex]), format(state.startsAt));
  } else if (state.status === 'active') {
    text = t.tasks.form.previewNow(resolveName(rotation[state.currentIndex]));
    if (state.nextIndex !== null && state.nextChange) {
      text += t.tasks.form.previewNext(
        resolveName(rotation[state.nextIndex]),
        format(state.nextChange),
      );
    }
  }

  return <p className="rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand-strong">{text}</p>;
}
