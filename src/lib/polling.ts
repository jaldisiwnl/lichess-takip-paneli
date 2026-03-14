import { getUsersStatus } from './lichessApi';
import {
  getTrackedPlayers,
  updateTrackedPlayer,
  getSettings,
} from './storage';
import { sendBrowserNotification } from './notifications';
import type { NotificationRecord } from '@/types/lichess';

let pollingTimer: ReturnType<typeof setInterval> | null = null;
let onStatusChange: (() => void) | null = null;

export function setStatusChangeCallback(cb: () => void) {
  onStatusChange = cb;
}

async function pollOnce(): Promise<void> {
  const players = getTrackedPlayers().filter((p) => p.trackingEnabled);
  if (players.length === 0) return;

  try {
    const usernames = players.map((p) => p.username);
    const statuses = await getUsersStatus(usernames);

    let changed = false;

    for (const status of statuses) {
      const player = players.find(
        (p) => p.username.toLowerCase() === status.id.toLowerCase()
      );
      if (!player) continue;

      const wasPlaying = !!player.currentGameId;
      const isPlaying = status.playing;
      const newGameId = status.playingId;

      if (isPlaying && newGameId && newGameId !== player.notifiedGameId) {
        // Yeni oyun başladı — bildirim gönder
        const record: NotificationRecord = {
          id: `${player.username}-${newGameId}`,
          playerUsername: player.username,
          gameId: newGameId,
          gameMode: 'blitz', // status endpoint'te mod bilgisi yok; gerekirse oyun detayından alınabilir
          opponentName: '?',
          timestamp: Date.now(),
          read: false,
        };
        sendBrowserNotification(record);
        updateTrackedPlayer(player.username, {
          currentGameId: newGameId,
          notifiedGameId: newGameId,
          lastChecked: Date.now(),
        });
        changed = true;
      } else if (!isPlaying && wasPlaying) {
        updateTrackedPlayer(player.username, {
          currentGameId: undefined,
          lastChecked: Date.now(),
        });
        changed = true;
      } else {
        updateTrackedPlayer(player.username, { lastChecked: Date.now() });
      }
    }

    if (changed && onStatusChange) onStatusChange();
  } catch {
    // Ağ hatalarını sessizce geç
  }
}

export function startPolling(): void {
  if (pollingTimer) return;
  const settings = getSettings();
  const intervalMs = (settings.pollingInterval ?? 10) * 1000;
  pollingTimer = setInterval(pollOnce, intervalMs);
  // İlk sorguyu hemen yap
  pollOnce();
}

export function stopPolling(): void {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

export function restartPolling(): void {
  stopPolling();
  startPolling();
}
