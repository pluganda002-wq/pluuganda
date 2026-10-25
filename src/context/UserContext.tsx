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

export type PatriotProfile = {
  avatarDataUrl: string | null;
  interests: string[];
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
  patriotProfile: PatriotProfile;
  updatePatriotProfile: (patch: Partial<PatriotProfile>) => void;
  inviteCode: string;
};

const STORAGE_KEY = "plu-bot-member-v1";
const PATRIOT_PROFILE_KEY = "plu-bot-patriot-profile-v1";
const INVITE_CODE_KEY = "plu-bot-invite-code";

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

function loadPatriotProfile(): PatriotProfile {
  try {
    const raw = localStorage.getItem(PATRIOT_PROFILE_KEY);
    if (raw) return JSON.parse(raw) as PatriotProfile;
  } catch {
    /* ignore */
  }
  return { avatarDataUrl: null, interests: [] };
}

function savePatriotProfile(profile: PatriotProfile) {
  localStorage.setItem(PATRIOT_PROFILE_KEY, JSON.stringify(profile));
}

function loadOrCreateInviteCode(): string {
  try {
    const existing = localStorage.getItem(INVITE_CODE_KEY);
    if (existing) return existing;
  } catch {
    /* ignore */
  }
  const code = `PLU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  localStorage.setItem(INVITE_CODE_KEY, code);
  return code;
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
  const [patriotProfile, setPatriotProfile] = useState<PatriotProfile>(() => loadPatriotProfile());
  const [inviteCode] = useState(() => loadOrCreateInviteCode());

  const updatePatriotProfile = useCallback((patch: Partial<PatriotProfile>) => {
    setPatriotProfile((prev) => {
      const next = { ...prev, ...patch };
      savePatriotProfile(next);
      return next;
    });
  }, []);

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
      patriotProfile,
      updatePatriotProfile,
      inviteCode,
    }),
    [
      member,
      registerMember,
      verifyMember,
      endorsed,
      setEndorsed,
      completedTasks,
      completeTask,
      patriotProfile,
      updatePatriotProfile,
      inviteCode,
    ]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
