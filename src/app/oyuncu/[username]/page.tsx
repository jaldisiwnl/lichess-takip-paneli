'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Zap, Clock, BookOpen, Activity, Loader2 } from 'lucide-react';
import {
  getUser,
  getUserGames,
  getUserActivity,
  getLichessProfileUrl,
  formatGameMode,
} from '@/lib/lichessApi';
import type { LichessUser, LichessGame, ActivityDay } from '@/types/lichess';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import SonOyunlar from '@/components/SonOyunlar';
import AktiflikHeatmap from '@/components/AktiflikHeatmap';
import AktiflikDetay from '@/components/AktiflikDetay';
import AcilisAnalizi from '@/components/AcilisAnalizi';
import { analyzeActivity } from '@/lib/activityAnalysis';
import { getWinRate } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

type Tab = 'oyunlar' | 'heatmap' | 'acilis';

export default function OyuncuDetayPage() {
  const params = useParams();
  const username = typeof params?.username === 'string' ? params.username : Array.isArray(params?.username) ? params.username[0] : '';
  const { players } = useApp();

  const [profile, setProfile] = useState<LichessUser | null>(null);
  const [games, setGames] = useState<LichessGame[]>([]);
  const [activity, setActivity] = useState<ActivityDay[]>([]);

  const [profileLoading, setProfileLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  const [profileError, setProfileError] = useState('');
  const [tab, setTab] = useState<Tab>('oyunlar');

  const trackedPlayer = players.find(
    (p) => p.username.toLowerCase() === username.toLowerCase()
  );

  // 1) Profili hemen yükle
  useEffect(() => {
    if (!username) return;
    setProfileLoading(true);
    setProfileError('');

    getUser(username)
      .then((u) => setProfile(u))
      .catch(() => setProfileError('Oyuncu bulunamadı veya Lichess API yanıt vermedi.'))
      .finally(() => setProfileLoading(false));
  }, [username]);

  // 2) Oyunları yükle (profil yüklendikten sonra, tab'a göre)
  useEffect(() => {
    if (!username || games.length > 0) return;
    setGamesLoading(true);

    getUserGames(username, 50, true)
      .then((g) => setGames(g))
      .catch(() => setGames([]))
      .finally(() => setGamesLoading(false));
  }, [username, games.length]);

  // 3) Aktiflik verisini yükle (sadece heatmap sekmesine geçince)
  useEffect(() => {
    if (tab !== 'heatmap' || activity.length > 0 || !username) return;
    setActivityLoading(true);

    getUserActivity(username)
      .then((act) => {
        const days: ActivityDay[] = act.flatMap((entry) => {
          const date = new Date(entry.interval.start);
          const dateStr = date.toISOString().split('T')[0];
          if (!entry.games) return [];
          const count = Object.values(entry.games).reduce(
            (s, g) => s + (g.win ?? 0) + (g.loss ?? 0) + (g.draw ?? 0),
            0
          );
          return count > 0 ? [{ date: dateStr, count }] : [];
        });
        setActivity(days);
      })
      .catch(() => setActivity([]))
      .finally(() => setActivityLoading(false));
  }, [tab, username, activity.length]);

  const isActive = !!trackedPlayer?.currentGameId;
  const insights = games.length > 0 ? analyzeActivity(games) : null;

  // ── Loading (profil henüz yüklenmedi) ─────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft size={14} /> Dashboard</Button></Link>
        <div className="h-40 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
        <div className="h-10 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
        <div className="h-64 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
      </div>
    );
  }

  // ── Hata ──────────────────────────────────────────────────────────────────
  if (profileError || !profile) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-red-400">{profileError || 'Oyuncu bulunamadı.'}</p>
        <Link href="/"><Button variant="secondary"><ArrowLeft size={14} /> Dashboard&apos;a Dön</Button></Link>
      </div>
    );
  }

  const wins = profile.count?.win ?? 0;
  const draws = profile.count?.draw ?? 0;
  const losses = profile.count?.loss ?? 0;
  const total = wins + draws + losses;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'oyunlar', label: 'Son Oyunlar', icon: <Clock size={14} /> },
    { id: 'heatmap', label: 'Aktiflik', icon: <Activity size={14} /> },
    { id: 'acilis', label: 'Açılış', icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back */}
      <Link href="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft size={14} /> Dashboard
        </Button>
      </Link>

      {/* Profile header */}
      <Card className={`relative ${isActive ? 'card-active border-emerald-500/40' : ''}`}>
        {isActive && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-t-xl" />
        )}
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: 'var(--bg-hover)', color: 'var(--gold)' }}
          >
            {profile.username[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {profile.title && (
                <span className="font-bold text-sm" style={{ color: 'var(--gold)' }}>{profile.title}</span>
              )}
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {profile.username}
              </h1>
              {isActive && <Badge variant="green">Şu an oynuyor</Badge>}
              {profile.patron && <Badge variant="gold">Patron</Badge>}
              {profile.online && !isActive && <Badge variant="green">Çevrimiçi</Badge>}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {(['bullet', 'blitz', 'rapid', 'classical'] as const).map((mode) => {
                const perf = profile.perfs?.[mode];
                if (!perf) return null;
                const prog = perf.prog ?? 0;
                return (
                  <div key={mode} className="rounded-lg px-3 py-2" style={{ background: 'var(--bg-hover)' }}>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      {formatGameMode(mode)}
                    </p>
                    <p className="text-lg font-bold font-mono" style={{ color: 'var(--gold-light)' }}>
                      {perf.rating}
                      {prog !== 0 && (
                        <span className="text-xs ml-1" style={{ color: prog > 0 ? '#4ade80' : '#f87171' }}>
                          {prog > 0 ? '+' : ''}{prog}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{perf.games} oyun</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 space-y-1">
              <div className="flex gap-3 text-xs">
                <span className="text-emerald-400">{wins}G ({getWinRate(wins, 0, total - wins)})</span>
                <span className="text-yellow-400">{draws}B</span>
                <span className="text-red-400">{losses}K</span>
                <span style={{ color: 'var(--text-muted)' }}>Toplam: {total}</span>
              </div>
              {total > 0 && (
                <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
                  <div className="bg-emerald-500" style={{ width: `${(wins / total) * 100}%` }} />
                  <div className="bg-yellow-500" style={{ width: `${(draws / total) * 100}%` }} />
                  <div className="bg-red-500" style={{ width: `${(losses / total) * 100}%` }} />
                </div>
              )}
            </div>

            {insights?.peakWindow && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="gold">
                  <Zap size={10} className="mr-1" />
                  {insights.peakWindow.label} oynuyor
                </Badge>
                {insights.mostActiveDay && (
                  <Badge variant="gray">En aktif: {insights.mostActiveDay.dayName}</Badge>
                )}
              </div>
            )}
          </div>

          <a href={getLichessProfileUrl(profile.username)} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm"><ExternalLink size={14} /></Button>
          </a>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: tab === t.id ? 'var(--bg-hover)' : 'transparent',
              color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
              border: tab === t.id ? '1px solid var(--border)' : '1px solid transparent',
            }}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {/* Son Oyunlar */}
        {tab === 'oyunlar' && (
          gamesLoading ? (
            <div className="flex items-center justify-center gap-2 py-16" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Oyunlar yükleniyor...</span>
            </div>
          ) : (
            <SonOyunlar games={games} username={username} />
          )
        )}

        {/* Aktiflik */}
        {tab === 'heatmap' && (
          <div className="space-y-4">
            {activityLoading ? (
              <div className="flex items-center justify-center gap-2 py-16" style={{ color: 'var(--text-muted)' }}>
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">Aktiflik verisi yükleniyor...</span>
              </div>
            ) : (
              <>
                <AktiflikHeatmap data={activity} />
                {gamesLoading ? (
                  <div className="flex items-center justify-center gap-2 py-8" style={{ color: 'var(--text-muted)' }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm">Saat analizi yükleniyor...</span>
                  </div>
                ) : insights ? (
                  <AktiflikDetay insights={insights} />
                ) : null}
              </>
            )}
          </div>
        )}

        {/* Açılış */}
        {tab === 'acilis' && (
          gamesLoading ? (
            <div className="flex items-center justify-center gap-2 py-16" style={{ color: 'var(--text-muted)' }}>
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Oyunlar yükleniyor...</span>
            </div>
          ) : (
            <AcilisAnalizi games={games} />
          )
        )}
      </div>
    </div>
  );
}
