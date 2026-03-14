'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { TrackedPlayer, NotificationRecord, AppSettings } from '@/types/lichess';
import {
  getTrackedPlayers,
  saveTrackedPlayers,
  addTrackedPlayer,
  removeTrackedPlayer,
  updateTrackedPlayer,
  getNotifications,
  getUnreadCount,
  markNotificationsRead,
  clearNotifications,
  getSettings,
  saveSettings,
} from '@/lib/storage';

interface AppContextValue {
  players: TrackedPlayer[];
  notifications: NotificationRecord[];
  unreadCount: number;
  settings: AppSettings;
  addPlayer: (username: string) => void;
  removePlayer: (username: string) => void;
  toggleTracking: (username: string) => void;
  reorderPlayers: (players: TrackedPlayer[]) => void;
  refreshPlayers: () => void;
  readNotifications: () => void;
  clearAllNotifications: () => void;
  updateSettings: (s: AppSettings) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<TrackedPlayer[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<AppSettings>(() => getSettings());

  const refreshPlayers = useCallback(() => {
    setPlayers(getTrackedPlayers());
  }, []);

  const refreshNotifications = useCallback(() => {
    setNotifications(getNotifications());
    setUnreadCount(getUnreadCount());
  }, []);

  useEffect(() => {
    refreshPlayers();
    refreshNotifications();
  }, [refreshPlayers, refreshNotifications]);

  const addPlayer = useCallback((username: string) => {
    const updated = addTrackedPlayer(username);
    setPlayers(updated);
  }, []);

  const removePlayer = useCallback((username: string) => {
    const updated = removeTrackedPlayer(username);
    setPlayers(updated);
  }, []);

  const toggleTracking = useCallback((username: string) => {
    const current = getTrackedPlayers().find(
      (p) => p.username.toLowerCase() === username.toLowerCase()
    );
    if (!current) return;
    const updated = updateTrackedPlayer(username, {
      trackingEnabled: !current.trackingEnabled,
    });
    setPlayers(updated);
  }, []);

  const reorderPlayers = useCallback((ordered: TrackedPlayer[]) => {
    saveTrackedPlayers(ordered);
    setPlayers(ordered);
  }, []);

  const readNotifications = useCallback(() => {
    markNotificationsRead();
    refreshNotifications();
  }, [refreshNotifications]);

  const clearAllNotifications = useCallback(() => {
    clearNotifications();
    refreshNotifications();
  }, [refreshNotifications]);

  const updateSettings = useCallback((s: AppSettings) => {
    saveSettings(s);
    setSettings(s);
  }, []);

  return (
    <AppContext.Provider
      value={{
        players,
        notifications,
        unreadCount,
        settings,
        addPlayer,
        removePlayer,
        toggleTracking,
        reorderPlayers,
        refreshPlayers,
        readNotifications,
        clearAllNotifications,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
