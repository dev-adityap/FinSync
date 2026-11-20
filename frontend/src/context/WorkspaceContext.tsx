import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_SETTINGS,
  workspaceRepo,
} from "../db/dexieRepository";
import { GlassTheme, WorkspaceSettings } from "../types/workspace";
import {
  NotificationToast,
  ToastMessage,
  ToastType,
} from "../components/glass/NotificationToast";

interface WorkspaceContextValue {
  settings: WorkspaceSettings;
  loadingSettings: boolean;
  setTheme: (theme: GlassTheme) => Promise<void>;
  toggleTheme: () => Promise<void>;
  updateSettings: (patch: Partial<WorkspaceSettings>) => Promise<void>;
  notify: (type: ToastType, title: string, message?: string) => void;
  refreshCounter: number;
  bumpRefresh: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(
  undefined
);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<WorkspaceSettings>(DEFAULT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  const applyThemeToDom = useCallback((theme: GlassTheme) => {
    if (typeof document !== "undefined") {
      const isDark = theme === "dark-glass";
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(isDark ? "dark" : "light");
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute("content", isDark ? "#161618" : "#F4F5F7");
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    workspaceRepo
      .getSettings()
      .then((stored) => {
        if (!active) return;
        setSettings(stored);
        applyThemeToDom(stored.theme);
      })
      .catch(() => {
        applyThemeToDom(DEFAULT_SETTINGS.theme);
      })
      .finally(() => {
        if (active) setLoadingSettings(false);
      });

    return () => {
      active = false;
    };
  }, [applyThemeToDom]);

  const notify = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<WorkspaceSettings>) => {
      try {
        const next = await workspaceRepo.updateSettings(patch);
        setSettings(next);
        if (patch.theme) {
          applyThemeToDom(patch.theme);
        }
      } catch (err) {
        notify(
          "error",
          "Storage Error",
          err instanceof Error ? err.message : "Failed to save workspace settings."
        );
      }
    },
    [applyThemeToDom, notify]
  );

  const setTheme = useCallback(
    async (theme: GlassTheme) => {
      applyThemeToDom(theme);
      await updateSettings({ theme });
    },
    [applyThemeToDom, updateSettings]
  );

  const toggleTheme = useCallback(async () => {
    const next: GlassTheme =
      settings.theme === "dark-glass" ? "light-glass" : "dark-glass";
    await setTheme(next);
  }, [settings.theme, setTheme]);

  const bumpRefresh = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        settings,
        loadingSettings,
        setTheme,
        toggleTheme,
        updateSettings,
        notify,
        refreshCounter,
        bumpRefresh,
      }}
    >
      {children}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider.");
  }
  return ctx;
}