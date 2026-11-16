import type { DutyKind, DutyTab, DutyTask } from "@/data/dutyVerification";
import { DUTY_TABS } from "@/data/dutyVerification";

export function isAssigneeOnly(kind: DutyKind) {
  return kind === "advanced" || kind === "classified";
}

export function userCanAccessTask(task: DutyTask, userId?: number) {
  if (!isAssigneeOnly(task.kind)) return true;
  if (task.assigneeTelegramId == null) return false;
  return task.assigneeTelegramId === userId;
}

export function userCanSeeTask(task: DutyTask, userId?: number) {
  if (task.kind === "classified") return userCanAccessTask(task, userId);
  return true;
}

export function isTaskLocked(task: DutyTask, userId?: number) {
  if (!isAssigneeOnly(task.kind)) return false;
  return !userCanAccessTask(task, userId);
}

export function tabVisibleForUser(tab: DutyTab, tasks: DutyTask[], _userId?: number) {
  const inTab = tasks.filter((t) => t.kind === tab);
  if (inTab.length === 0) return false;
  return true;
}

export function visibleTabs(tasks: DutyTask[], userId?: number) {
  return DUTY_TABS.filter((t) => tabVisibleForUser(t.id, tasks, userId));
}

export function visibleTasksForTab(tab: DutyTab, tasks: DutyTask[], userId?: number) {
  return tasks.filter((t) => t.kind === tab && userCanSeeTask(t, userId));
}

export function openActionCount(tasks: DutyTask[], completed: string[], userId?: number) {
  return tasks.filter(
    (t) => userCanSeeTask(t, userId) && !completed.includes(t.id) && !isTaskLocked(t, userId)
  ).length;
}