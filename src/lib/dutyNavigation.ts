import type { NavigateFunction } from "react-router-dom";
import type { DutyTab, DutyTask } from "@/data/dutyVerification";

export type DutyNavState = {
  returnTo: string;
};

export function dutyDetailPath(taskId: string) {
  return `/programmes/tasks/duty/${taskId}`;
}

export function fieldDetailPath(taskId: string) {
  return `/programmes/tasks/field/${taskId}`;
}

export function dutyReturnPath(compact: boolean, tab: DutyTab): string {
  if (compact) return "/programmes";
  return `/programmes/tasks?tab=${tab}`;
}

export function parseDutyTab(raw: string | null): DutyTab {
  if (raw === "field" || raw === "digital" || raw === "advanced" || raw === "classified") return raw;
  return "digital";
}

export function openDigitalDuty(
  navigate: NavigateFunction,
  task: DutyTask,
  returnTo: string
) {
  const state: DutyNavState = { returnTo };
  if (task.actionTo) {
    navigate(task.actionTo, { state });
    return;
  }
  navigate(dutyDetailPath(task.id), { state });
}

export function openFieldDuty(navigate: NavigateFunction, task: DutyTask, returnTo: string) {
  const state: DutyNavState = { returnTo };
  if (task.actionTo) {
    navigate(task.actionTo, { state });
    return;
  }
  navigate(fieldDetailPath(task.id), { state });
}

export function readReturnTo(state: unknown): string | undefined {
  if (state && typeof state === "object" && "returnTo" in state) {
    const v = (state as DutyNavState).returnTo;
    return typeof v === "string" ? v : undefined;
  }
  return undefined;
}