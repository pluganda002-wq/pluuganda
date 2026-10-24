import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MemberProfile = {
  fullName: string;
  phone: string;
  district: string;
  memberId: string;
  verified: boolean;
  registeredAt: string;
};

type UserContextValue = {
  member: MemberProfile | null;
  registerMember: (
    data: Omit<MemberProfile, "memberId" | "verified" | "registeredAt">,
    server?: { memberId: string; registeredAt: string }
  ) => MemberProfile;
  verifyMember: () => void;
  endorsed: boolean;
  setEndorsed: (value: boolean) => void;
  completedTasks: string[];
  completeTask: (id: string) => void;
};

const STORAGE_KEY = "plu-bot-member-v1";

const UserContext = createContext<UserContextValue | null>(null);

function loadMember(): MemberProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MemberProfile) : null;
  } catch {
    return null;
  }
}

function saveMember(member: MemberProfile | null) {
  if (member) localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
  else localStorage.removeItem(STORAGE_KEY);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<MemberProfile | null>(() => loadMember());
  const [endorsed, setEndorsedState] = useState(
    () => localStorage.getItem("plu-bot-endorsed") === "1"
  );
  const [completedTasks, setCompletedTasks] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("plu-bot-tasks") ?? "[]") as string[];
    } catch {
      return [];
    }
  });

  const registerMember = useCallback(
    (
      data: Omit<MemberProfile, "memberId" | "verified" | "registeredAt">,
      server?: { memberId: string; registeredAt: string }
    ) => {
      const next: MemberProfile = {
        ...data,
        memberId: server?.memberId ?? `PLU-${Math.floor(100000 + Math.random() * 900000)}`,
        verified: false,
        registeredAt: server?.registeredAt ?? new Date().toISOString(),
      };
      setMember(next);
      saveMember(next);
      return next;
    },
    []
  );

  const verifyMember = useCallback(() => {
    setMember((prev) => {
      if (!prev) return prev;
      const next = { ...prev, verified: true };
      saveMember(next);
      return next;
    });
  }, []);

  const setEndorsed = useCallback((value: boolean) => {
    setEndorsedState(value);
    localStorage.setItem("plu-bot-endorsed", value ? "1" : "0");
  }, []);

  const completeTask = useCallback((id: string) => {
    setCompletedTasks((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem("plu-bot-tasks", JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      member,
      registerMember,
      verifyMember,
      endorsed,
      setEndorsed,
      completedTasks,
      completeTask,
    }),
    [member, registerMember, verifyMember, endorsed, setEndorsed, completedTasks, completeTask]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
