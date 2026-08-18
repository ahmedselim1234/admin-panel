"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  /** Desktop rail collapse — persisted so the layout survives reloads. */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  /** Mobile drawer — intentionally not persisted. */
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  /** Products page view mode. */
  productView: "table" | "grid";
  setProductView: (view: "table" | "grid") => void;

  readNotifications: string[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

      mobileNavOpen: false,
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),

      productView: "table",
      setProductView: (productView) => set({ productView }),

      readNotifications: [],
      markNotificationRead: (id) =>
        set((state) => ({
          readNotifications: state.readNotifications.includes(id)
            ? state.readNotifications
            : [...state.readNotifications, id],
        })),
      markAllNotificationsRead: (ids) => set({ readNotifications: ids }),
    }),
    {
      name: "selim-admin-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        productView: state.productView,
        readNotifications: state.readNotifications,
      }),
    },
  ),
);
