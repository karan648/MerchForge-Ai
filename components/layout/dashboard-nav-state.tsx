"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type DashboardNavContextValue = {
  isSidebarCollapsed: boolean;
  isMobileNavOpen: boolean;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (next: boolean) => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  toggleMobileNav: () => void;
};

const SIDEBAR_STORAGE_KEY = "merchforge-sidebar-collapsed";

const DashboardNavContext = createContext<DashboardNavContextValue | null>(null);

export function DashboardNavProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, isSidebarCollapsed ? "1" : "0");
    } catch {
      // Ignore local storage failures.
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileNavOpen]);

  const setSidebarCollapsed = useCallback((next: boolean) => {
    setIsSidebarCollapsed(next);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setIsSidebarCollapsed((current) => !current);
  }, []);

  const openMobileNav = useCallback(() => {
    setIsMobileNavOpen(true);
  }, []);

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  const toggleMobileNav = useCallback(() => {
    setIsMobileNavOpen((current) => !current);
  }, []);

  const value = useMemo(
    () => ({
      isSidebarCollapsed,
      isMobileNavOpen,
      toggleSidebarCollapsed,
      setSidebarCollapsed,
      openMobileNav,
      closeMobileNav,
      toggleMobileNav,
    }),
    [
      closeMobileNav,
      isMobileNavOpen,
      isSidebarCollapsed,
      openMobileNav,
      setSidebarCollapsed,
      toggleMobileNav,
      toggleSidebarCollapsed,
    ],
  );

  return <DashboardNavContext.Provider value={value}>{children}</DashboardNavContext.Provider>;
}

export function useDashboardNavState() {
  const context = useContext(DashboardNavContext);
  if (!context) {
    throw new Error("useDashboardNavState must be used inside DashboardNavProvider");
  }

  return context;
}
