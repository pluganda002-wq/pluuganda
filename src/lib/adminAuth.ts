export const ADMIN_SESSION_KEY = "plu-duty-admin-session";

export function clientAdminPasswordOk(password: string): boolean {
  const expected = import.meta.env.VITE_ADMIN_DUTY_PASSWORD ?? "";
  if (expected && password === expected) return true;
  if (import.meta.env.DEV && password === "manage-tasks") return true;
  return false;
}

export function readAdminSession(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeAdminSession(active: boolean) {
  try {
    if (active) sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    else sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    /* ignore */
  }
}