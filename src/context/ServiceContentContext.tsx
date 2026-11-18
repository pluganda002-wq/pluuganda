import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_SERVICE_CONTENT } from "@/data/serviceContentDefaults";
import {
  clientAdminPasswordOk,
  readAdminSession,
  writeAdminSession,
} from "@/lib/adminAuth";
import {
  fetchServiceContentFromApi,
  saveServiceContentToApi,
} from "@/lib/serviceContentApi";
import type { ServiceContentData, ServiceModuleId } from "@/types/serviceContent";

const STORAGE_KEY = "plu-service-content-v2";

type ServiceContentValue = {
  content: ServiceContentData;
  loading: boolean;
  source: "default" | "local" | "api";
  updateModule: <M extends ServiceModuleId>(
    module: M,
    patch: Partial<ServiceContentData[M]>
  ) => void;
  setContent: (content: ServiceContentData) => void;
  resetToDefaults: () => void;
  saveToServer: (adminPassword: string) => Promise<void>;
  isAdmin: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
};

const ServiceContentContext = createContext<ServiceContentValue | null>(null);

function loadLocal(): ServiceContentData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ServiceContentData;
    return parsed?.tourism?.regions ? parsed : null;
  } catch {
    return null;
  }
}

function saveLocal(content: ServiceContentData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

function mergeWithDefaults(stored: ServiceContentData): ServiceContentData {
  const base = DEFAULT_SERVICE_CONTENT;
  return {
    ...base,
    ...stored,
    tourism: { ...base.tourism, ...stored.tourism },
    youth: { ...base.youth, ...stored.youth },
    "buy-uganda": { ...base["buy-uganda"], ...stored["buy-uganda"] },
    charity: { ...base.charity, ...stored.charity },
    csr: { ...base.csr, ...stored.csr },
    education: { ...base.education, ...stored.education },
    tv: { ...base.tv, ...stored.tv },
    mobility: { ...base.mobility, ...stored.mobility },
    leadership: { ...base.leadership, ...stored.leadership },
    projects: { ...base.projects, ...stored.projects },
  };
}

export function ServiceContentProvider({ children }: { children: ReactNode }) {
  const [content, setContentState] = useState<ServiceContentData>(DEFAULT_SERVICE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<ServiceContentValue["source"]>("default");
  const [isAdmin, setIsAdmin] = useState(readAdminSession);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fromApi = await fetchServiceContentFromApi();
      if (cancelled) return;
      if (fromApi) {
        const merged = mergeWithDefaults(fromApi);
        setContentState(merged);
        setSource("api");
        saveLocal(merged);
        setLoading(false);
        return;
      }
      const local = loadLocal();
      if (local) {
        const merged = mergeWithDefaults(local);
        setContentState(merged);
        setSource("local");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistLocal = useCallback(
    (next: ServiceContentData) => {
      setContentState(next);
      saveLocal(next);
      if (source === "default") setSource("local");
    },
    [source]
  );

  const updateModule = useCallback(
    <M extends ServiceModuleId>(module: M, patch: Partial<ServiceContentData[M]>) => {
      persistLocal({
        ...content,
        [module]: { ...content[module], ...patch },
      });
    },
    [content, persistLocal]
  );

  const setContent = useCallback(
    (next: ServiceContentData) => {
      persistLocal(next);
    },
    [persistLocal]
  );

  const resetToDefaults = useCallback(() => {
    persistLocal(DEFAULT_SERVICE_CONTENT);
    setSource("default");
  }, [persistLocal]);

  const saveToServer = useCallback(
    async (adminPassword: string) => {
      await saveServiceContentToApi(content, adminPassword);
      setSource("api");
    },
    [content]
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
      content,
      loading,
      source,
      updateModule,
      setContent,
      resetToDefaults,
      saveToServer,
      isAdmin,
      adminLogin,
      adminLogout,
    }),
    [
      content,
      loading,
      source,
      updateModule,
      setContent,
      resetToDefaults,
      saveToServer,
      isAdmin,
      adminLogin,
      adminLogout,
    ]
  );

  return (
    <ServiceContentContext.Provider value={value}>{children}</ServiceContentContext.Provider>
  );
}

export function useServiceContent() {
  const ctx = useContext(ServiceContentContext);
  if (!ctx) throw new Error("useServiceContent must be used within ServiceContentProvider");
  return ctx;
}

export function useTourismContent() {
  return useServiceContent().content.tourism;
}

export function useYouthContent() {
  return useServiceContent().content.youth;
}

export function useBuyUgandaContent() {
  return useServiceContent().content["buy-uganda"];
}

export function useCharityContent() {
  return useServiceContent().content.charity;
}

export function useModuleListings(module: ServiceModuleId) {
  const { content } = useServiceContent();
  const slice = content[module];
  if (slice && "listings" in slice) return slice.listings;
  if (slice && "drives" in slice) return slice.drives;
  return [];
}