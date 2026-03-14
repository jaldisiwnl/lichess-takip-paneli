'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, Eye, EyeOff, Gamepad2, ExternalLink } from 'lucide-react';
import { cn, formatRelativeTime, getWinRate } from '@/lib/utils';
import { getLichessGameUrl, getLichessProfileUrl, formatGameMode } from '@/lib/lichessApi';
import type { TrackedPlayer, LichessUser } from '@/types/lichess';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useApp } from '@/context/AppContext';

interface Props {
  player: TrackedPlayer;
  dragHandle?: React.ReactNode;
}

export default function OyuncuKarti({ player, dragHandle }: Props) {
  const { removePlayer, toggleTracking } = useApp();
  const [profile, setProfile] = useState<LichessUser | null>(player.cachedProfile ?? null);
  const [loading, setLoading] = useState(!player.cachedProfile);

  useEffect(() => {
    if (player.cachedProfile) {
      setProfile(player.cachedProfile);
      setLoading(false);
      return;
    }
    let cancelled = false;
    import('@/lib/lichessApi').then(({ getUser }) => {
      getUser(player.username)
        .then((u) => { if (!cancelled) { setProfile(u); setLoading(false); } })
        .catch(() => { if (!cancelled) setLoading(false); });
    });
    return () => { cancelled = true; };
  }, [player.username, player.cachedProfile]);

  const isActive = !!player.currentGameId;
  const wins = profile?.count?.win ?? 0;
  const draws = profile?.count?.draw ?? 0;
  const losses = profile?.count?.loss ?? 0;
  const winRate = getWinRate(wins, draws, losses);

  return (
    <Card
      className={cn(
        'transition-all duration-300 relative overflow-hidden',
        isActive && 'card-active border-emerald-500/40'
      )}
    >
      {/* Active glow top strip */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
      )}

      <div className="flex items-start gap-3">
        {/* Drag handle */}
        {dragHandle && (
          <div className="mt-1 cursor-grab active:cursor-grabbing" style={{ color: 'var(--text-muted)' }}>
            {dragHandle}
          </div>
        )}

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold select-none"
            style={{ background: 'var(--bg-hover)', color: 'var(--gold)' }}
          >
            {player.username[0].toUpperCase()}
          </div>
          {/* Online indicator */}
          <span
            className={cn(
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2',
              isActive
                ? 'bg-emerald-400 border-[var(--bg-card)]'
                : (profile?.online ? 'bg-green-500' : 'bg-zinc-600'),
              'border-[var(--bg-card)]'
            )}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/oyuncu/${player.username}`}
              className="font-bold text-base hover:underline truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {profile?.title && (
                <span className="text-xs font-bold mr-1" style={{ color: 'var(--gold)' }}>
                  {profile.title}
                </span>
              )}
              {player.username}
            </Link>
            {isActive && (
              <Badge variant="green" className="animate-pulse">
                <Gamepad2 size={10} className="mr-1" />
                Oynuyor
              </Badge>
            )}
            {!player.trackingEnabled && (
              <Badge variant="gray">Takip kapalı</Badge>
            )}
          </div>

          {/* Ratings */}
          {profile && !loading && (
            <div className="flex flex-wrap gap-2 mt-1">
              {(['bullet', 'blitz', 'rapid', 'classical'] as const).map((mode) => {
                const perf = profile.perfs?.[mode];
                if (!perf) return null;
                return (
                  <span key={mode} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="capitalize" style={{ color: 'var(--text-muted)' }}>
                      {formatGameMode(mode)[0]}
                    </span>{' '}
                    <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                      {perf.rating}
                    </span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Stats */}
          {profile && !loading && (
            <div className="flex gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>
                <span className="text-emerald-400 font-medium">{wins}G</span>
                {' / '}
                <span className="text-yellow-400 font-medium">{draws}B</span>
                {' / '}
                <span className="text-red-400 font-medium">{losses}K</span>
              </span>
              <span>Win: <span style={{ color: 'var(--gold)' }}>{winRate}</span></span>
            </div>
          )}

          {loading && (
            <div className="mt-1 h-4 w-48 rounded animate-pulse" style={{ background: 'var(--bg-hover)' }} />
          )}

          {/* Active game link */}
          {isActive && player.currentGameId && (
            <a
              href={getLichessGameUrl(player.currentGameId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <ExternalLink size={11} />
              Oyunu izle
            </a>
          )}

          {/* Last checked */}
          {player.lastChecked && (
            <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
              Son kontrol: {formatRelativeTime(player.lastChecked)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleTracking(player.username)}
            title={player.trackingEnabled ? 'Takibi durdur' : 'Takibi başlat'}
          >
            {player.trackingEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm(`${player.username} takip listesinden kaldırılsın mı?`)) {
                removePlayer(player.username);
              }
            }}
            className="hover:text-red-400"
          >
            <Trash2 size={14} />
          </Button>
          <a
            href={getLichessProfileUrl(player.username)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm" title="Lichess profilini aç">
              <ExternalLink size={14} />
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
}
