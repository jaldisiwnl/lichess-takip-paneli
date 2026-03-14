import type { LichessUser, LichessGame, UserStatus } from '@/types/lichess';

const BASE_URL = 'https://lichess.org/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Lichess API hatası: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getUser(username: string): Promise<LichessUser> {
  return fetchJson<LichessUser>(`${BASE_URL}/user/${username}`);
}

export async function getUsersStatus(usernames: string[]): Promise<UserStatus[]> {
  if (usernames.length === 0) return [];
  const ids = usernames.join(',');
  return fetchJson<UserStatus[]>(
    `${BASE_URL}/users/status?ids=${encodeURIComponent(ids)}&withGameIds=true`
  );
}

export async function getUserGames(
  username: string,
  max = 20,
  withOpening = true
): Promise<LichessGame[]> {
  const params = new URLSearchParams({
    max: String(max),
    opening: String(withOpening),
    moves: 'false',
    clocks: 'false',
    evals: 'false',
    accuracy: 'false',
  });

  const res = await fetch(`${BASE_URL}/games/user/${username}?${params}`, {
    headers: {
      Accept: 'application/x-ndjson',
    },
  });

  if (!res.ok) {
    throw new Error(`Oyun geçmişi alınamadı: ${res.status}`);
  }

  const text = await res.text();
  const games: LichessGame[] = [];

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (trimmed) {
      try {
        games.push(JSON.parse(trimmed));
      } catch {
        // satırı atla
      }
    }
  }

  return games;
}

export async function getUserActivity(
  username: string
): Promise<Array<{ interval: { start: number; end: number }; games?: Record<string, { win: number; loss: number; draw: number; rp?: { before: number; after: number } }> }>> {
  return fetchJson(`${BASE_URL}/user/${username}/activity`);
}

export function getLichessGameUrl(gameId: string): string {
  return `https://lichess.org/${gameId}`;
}

export function getLichessProfileUrl(username: string): string {
  return `https://lichess.org/@/${username}`;
}

export function formatGameMode(speed: string): string {
  const map: Record<string, string> = {
    bullet: 'Bullet',
    blitz: 'Blitz',
    rapid: 'Rapid',
    classical: 'Klasik',
    correspondence: 'Yazışmalı',
    ultraBullet: 'UltraBullet',
  };
  return map[speed] ?? speed;
}
