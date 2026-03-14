import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  if (hours < 24) return `${hours} sa önce`;
  return `${days} gün önce`;
}

export function getWinRate(wins: number, draws: number, losses: number): string {
  const total = wins + draws + losses;
  if (total === 0) return '0%';
  return `${Math.round((wins / total) * 100)}%`;
}

export function getRatingDisplay(rating?: number): string {
  if (!rating) return '?';
  return String(rating);
}

export function getGameResultLabel(
  game: { winner?: 'white' | 'black'; status: string },
  side: 'white' | 'black'
): { label: string; color: string } {
  if (game.status === 'draw' || game.status === 'stalemate') {
    return { label: 'Berabere', color: 'text-yellow-400' };
  }
  if (!game.winner) {
    if (game.status === 'aborted') return { label: 'İptal', color: 'text-zinc-400' };
    return { label: 'Bilinmiyor', color: 'text-zinc-400' };
  }
  if (game.winner === side) return { label: 'Kazandı', color: 'text-emerald-400' };
  return { label: 'Kaybetti', color: 'text-red-400' };
}
