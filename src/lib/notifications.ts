import type { NotificationRecord } from '@/types/lichess';
import { addNotification } from './storage';
import { getLichessGameUrl, formatGameMode } from './lichessApi';

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function sendBrowserNotification(record: NotificationRecord): void {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return;

  const gameUrl = getLichessGameUrl(record.gameId);
  const modeName = formatGameMode(record.gameMode);

  const notification = new Notification(`🟢 ${record.playerUsername} oyuna başladı!`, {
    body: `${modeName} • ${record.opponentName}${record.opponentRating ? ` (${record.opponentRating})` : ''}\nOyunu izlemek için tıkla`,
    icon: '/chess-icon.png',
    badge: '/chess-icon.png',
    tag: record.gameId,
    requireInteraction: false,
  });

  notification.onclick = () => {
    window.open(gameUrl, '_blank');
    notification.close();
  };

  // Kaydı sakla
  addNotification(record);
}
