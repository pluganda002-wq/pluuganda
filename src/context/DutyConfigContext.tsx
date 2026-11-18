import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_DUTY_TASKS, type DutyTask } from "@/data/dutyVerification";
import {
  clientAdminPasswordOk,
  readAdminSession,
  writeAdminSession,
} from "@/lib/adminAuth";
import { fetchDutyTasksFromApi, saveDutyTasksToApi } from "@/lib/dutyApi";

const STORAGE_KEY = "plu-duty-config-v3";

type DutyConfigValue = {
  tasks: DutyTask[];
  loading: boolean;
  source: "default" | "local" | "api";
  updateTask: (id: string, patch: Partial<DutyTask>) => void;
  setTasks: (tasks: DutyTask[]) => void;
  resetToDefaults: () => void;
  saveToServer: (adminPassword: string) => Promise<void>;
  addTask: (task: DutyTask) => void;
  removeTask: (id: string) => void;
  isAdmin: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
};

const DutyConfigContext = createContext<DutyConfigValue | null>(null);

function loadLocalTasks(): DutyTask[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DutyTask[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function saveLocalTasks(tasks: DutyTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function DutyConfigProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasksState] = useState<DutyTask[]>(DEFAULT_DUTY_TASKS);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<DutyConfigValue["source"]>("default");
  const [isAdmin, setIsAdmin] = useState(readAdminSession);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fromApi = await fetchDutyTasksFromApi();
      if (cancelled) return;
      if (fromApi) {
        setTasksState(fromApi);
        setSource("api");
        saveLocalTasks(fromApi);
        setLoading(false);
        return;
      }
      const local = loadLocalTasks();
      if (local) {
        setTasksState(local);
        setSource("local");
      } else {
        setTasksState(DEFAULT_DUTY_TASKS);
        setSource("default");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistLocal = useCallback((next: DutyTask[]) => {
    setTasksState(next);
    saveLocalTasks(next);
    if (source === "default") setSource("local");
  }, [source]);

  const updateTask = useCallback(
    (id: string, patch: Partial<DutyTask>) => {
      persistLocal(
        tasks.map((t) => (t.id === id ? { ...t, ...patch, id: t.id, kind: t.kind } : t))
      );
    },
    [tasks, persistLocal]
  );

  const setTasks = useCallback(
    (next: DutyTask[]) => {
      persistLocal(next);
    },
    [persistLocal]
  );

  const resetToDefaults = useCallback(() => {
    persistLocal([...DEFAULT_DUTY_TASKS]);
    setSource("local");
  }, [persistLocal]);

  const saveToServer = useCallback(
    async (adminPassword: string) => {
      await saveDutyTasksToApi(tasks, adminPassword);
      setSource("api");
    },
    [tasks]
  );

  const addTask = useCallback(
    (task: DutyTask) => {
      persistLocal([...tasks.filter((t) => t.id !== task.id), task]);
    },
    [tasks, persistLocal]
  );

  const removeTask = useCallback(
    (id: string) => {
      persistLocal(tasks.filter((t) => t.id !== id));
    },
    [tasks, persistLocal]
  );

  const adminLogin = useCallback((password: string) => {
    const ok = clientAdminPasswordOk(password);
    if (ok) {
      setIsAdmin(true);
      writeAdminSession(true);
    }
    return ok;
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
    writeAdminSession(false);
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      loading,
      source,
      updateTask,
      setTasks,
      resetToDefaults,
      saveToServer,
      addTask,
      removeTask,
      isAdmin,
      adminLogin,
      adminLogout,
    }),
    [
      tasks,
      loading,
      source,
      updateTask,
      setTasks,
      resetToDefaults,
      saveToServer,
      addTask,
      removeTask,
      isAdmin,
      adminLogin,
      adminLogout,
    ]
  );

  return <DutyConfigContext.Provider value={value}>{children}</DutyConfigContext.Provider>;
}

export function useDutyConfig() {
  const ctx = useContext(DutyConfigContext);
  if (!ctx) throw new Error("useDutyConfig must be used within DutyConfigProvider");
  return ctx;
}

export function useDutyTasks() {
  return useDutyConfig().tasks;
}