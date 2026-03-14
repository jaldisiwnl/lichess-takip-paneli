'use client';

import { ExternalLink } from 'lucide-react';
import type { LichessGame } from '@/types/lichess';
import { getLichessGameUrl, formatGameMode } from '@/lib/lichessApi';
import { formatRelativeTime, getGameResultLabel } from '@/lib/utils';
import { Badge } from './ui/Badge';
import { Card, CardHeader, CardTitle } from './ui/Card';

interface Props {
  games: LichessGame[];
  username: string;
}

const modeColors: Record<string, string> = {
  bullet: '#ef4444',
  blitz: '#f97316',
  rapid: '#22c55e',
  classical: '#3b82f6',
  correspondence: '#8b5cf6',
  ultraBullet: '#ec4899',
};

export default function SonOyunlar({ games, username }: Props) {
  if (games.length === 0) {
    return (
      <Card>
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
          Oyun bulunamadı.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Oyunlar</CardTitle>
      </CardHeader>
      <div className="space-y-1">
        {games.map((game) => {
          const isWhite =
            game.players.white.user?.name?.toLowerCase() === username.toLowerCase() ||
            game.players.white.user?.id?.toLowerCase() === username.toLowerCase();
          const side = isWhite ? 'white' : 'black';
          const opponent = isWhite ? game.players.black : game.players.white;
          const result = getGameResultLabel(game, side);
          const color = modeColors[game.speed] ?? '#888';

          return (
            <a
              key={game.id}
              href={getLichessGameUrl(game.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Mode color strip */}
              <div
                className="w-1 h-8 rounded-full flex-shrink-0"
                style={{ background: color }}
              />

              {/* Mode */}
              <span className="text-xs font-medium w-14 flex-shrink-0" style={{ color }}>
                {formatGameMode(game.speed)}
              </span>

              {/* Opponent */}
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  vs {opponent.user?.name ?? 'Bilinmiyor'}
                  {opponent.rating && (
                    <span className="ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      ({opponent.rating})
                    </span>
                  )}
                </p>
                {game.opening && (
                  <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {game.opening.name}
                  </p>
                )}
              </div>

              {/* Result */}
              <span className={`text-xs font-medium flex-shrink-0 ${result.color}`}>
                {result.label}
              </span>

              {/* Time */}
              <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                {formatRelativeTime(game.lastMoveAt)}
              </span>

              <ExternalLink
                size={12}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              />
            </a>
          );
        })}
      </div>
    </Card>
  );
}
