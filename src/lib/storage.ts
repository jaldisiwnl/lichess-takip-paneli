import type { TrackedPlayer, NotificationRecord, AppSettings } from '@/types/lichess';

const KEYS = {
  PLAYERS: 'lichess_tracked_players',
  NOTIFICATIONS: 'lichess_notifications',
  SETTINGS: 'lichess_settings',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  pollingInterval: 10,
  notificationsEnabled: true,
  soundEnabled: false,
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage dolu olabilir
  }
}

// ── Oyuncular ────────────────────────────────────────────────────────────────

export function getTrackedPlayers(): TrackedPlayer[] {
  return safeGet<TrackedPlayer[]>(KEYS.PLAYERS, []);
}

export function saveTrackedPlayers(players: TrackedPlayer[]): void {
  safeSet(KEYS.PLAYERS, players);
}

export function addTrackedPlayer(username: string): TrackedPlayer[] {
  const players = getTrackedPlayers();
  if (players.length >= 5) throw new Error('En fazla 5 oyuncu ekleyebilirsiniz.');
  if (players.some((p) => p.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Bu oyuncu zaten takip listesinde.');
  }
  const newPlayer: TrackedPlayer = {
    username,
    addedAt: Date.now(),
    trackingEnabled: true,
  };
  const updated = [...players, newPlayer];
  saveTrackedPlayers(updated);
  return updated;
}

export function removeTrackedPlayer(username: string): TrackedPlayer[] {
  const updated = getTrackedPlayers().filter(
    (p) => p.username.toLowerCase() !== username.toLowerCase()
  );
  saveTrackedPlayers(updated);
  return updated;
}

export function updateTrackedPlayer(username: string, patch: Partial<TrackedPlayer>): TrackedPlayer[] {
  const updated = getTrackedPlayers().map((p) =>
    p.username.toLowerCase() === username.toLowerCase() ? { ...p, ...patch } : p
  );
  saveTrackedPlayers(updated);
  return updated;
}

export function reorderTrackedPlayers(players: TrackedPlayer[]): void {
  saveTrackedPlayers(players);
}

// ── Bildirimler ───────────────────────────────────────────────────────────────

export function getNotifications(): NotificationRecord[] {
  return safeGet<NotificationRecord[]>(KEYS.NOTIFICATIONS, []);
}

export function addNotification(record: NotificationRecord): void {
  const all = getNotifications();
  // Aynı oyun için tekrar ekleme
  if (all.some((n) => n.gameId === record.gameId)) return;
  const updated = [record, ...all].slice(0, 100); // son 100 bildirim
  safeSet(KEYS.NOTIFICATIONS, updated);
}

export function markNotificationsRead(): void {
  const updated = getNotifications().map((n) => ({ ...n, read: true }));
  safeSet(KEYS.NOTIFICATIONS, updated);
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

export function clearNotifications(): void {
  safeSet(KEYS.NOTIFICATIONS, []);
}

// ── Ayarlar ───────────────────────────────────────────────────────────────────

export function getSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...safeGet<Partial<AppSettings>>(KEYS.SETTINGS, {}) };
}

export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.SETTINGS, settings);
}
