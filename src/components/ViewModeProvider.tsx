"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type SiteViewMode = "human" | "api";

type ViewModeContextValue = {
  mode: SiteViewMode;
  isApiView: boolean;
  setMode: (mode: SiteViewMode) => void;
};

const ViewModeContext = createContext<ViewModeContextValue | null>(null);

function parseViewMode(value: string | null): SiteViewMode {
  return value === "api" ? "api" : "human";
}

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mode = parseViewMode(searchParams.get("view"));

  const setMode = useCallback(
    (next: SiteViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "api") {
        params.set("view", "api");
      } else {
        params.delete("view");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const value = useMemo(
    () => ({
      mode,
      isApiView: mode === "api",
      setMode,
    }),
    [mode, setMode],
  );

  return (
    <ViewModeContext.Provider value={value}>{children}</ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within ViewModeProvider");
  }
  return context;
}

const terminalListeners = new Set<() => void>();
let terminalOpen = false;

export function subscribeTerminalOpen(listener: () => void) {
  terminalListeners.add(listener);
  return () => {
    terminalListeners.delete(listener);
  };
}

export function getTerminalOpenSnapshot() {
  return terminalOpen;
}

export function setTerminalOpen(next: boolean) {
  if (terminalOpen === next) return;
  terminalOpen = next;
  terminalListeners.forEach((listener) => listener());
}

export function useTerminalOpen() {
  return useSyncExternalStore(
    subscribeTerminalOpen,
    getTerminalOpenSnapshot,
    () => false,
  );
}
