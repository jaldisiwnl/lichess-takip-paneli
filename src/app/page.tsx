'use client';

import Link from 'next/link';
import { UserPlus, RefreshCw, Bell } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import DraggableList from '@/components/DraggableList';
import { Button } from '@/components/ui/Button';
import { requestNotificationPermission, getNotificationPermission } from '@/lib/notifications';
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { players, refreshPlayers } = useApp();
  const [notifPerm, setNotifPerm] = useState<string>('default');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setNotifPerm(getNotificationPermission());
  }, []);

  async function handleRequestNotif() {
    const granted = await requestNotificationPermission();
    setNotifPerm(granted ? 'granted' : 'denied');
  }

  function handleRefresh() {
    setRefreshing(true);
    refreshPlayers();
    setTimeout(() => setRefreshing(false), 800);
  }

  const activePlayers = players.filter((p) => p.currentGameId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {players.length} oyuncu takip ediliyor
            {activePlayers.length > 0 && (
              <span className="ml-2 text-emerald-400 font-medium">
                • {activePlayers.length} aktif
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Yenile</span>
          </Button>
          <Link href="/oyuncu-ekle">
            <Button variant="primary" size="sm">
              <UserPlus size={14} />
              <span className="hidden sm:inline">Oyuncu Ekle</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Notification permission banner */}
      {notifPerm === 'default' && (
        <div
          className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 border"
          style={{ background: 'rgba(201,162,39,0.08)', borderColor: 'rgba(201,162,39,0.25)' }}
        >
          <div className="flex items-center gap-2">
            <Bell size={16} style={{ color: 'var(--gold)' }} />
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              Bildirim izni ver — oyuncular oynamaya başladığında haberdar ol
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleRequestNotif}>
            İzin Ver
          </Button>
        </div>
      )}

      {notifPerm === 'denied' && (
        <div
          className="rounded-xl px-4 py-3 border text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: 'var(--text-secondary)' }}
        >
          Bildirim izni reddedildi. Tarayıcı ayarlarından izin verebilirsin.
        </div>
      )}

      {/* Empty state */}
      {players.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="text-7xl select-none">♟</div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Henüz oyuncu eklemedin
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Lichess kullanıcı adı girerek takip listeni oluştur
          </p>
          <Link href="/oyuncu-ekle">
            <Button variant="primary" size="lg" className="mt-2">
              <UserPlus size={18} />
              İlk Oyuncuyu Ekle
            </Button>
          </Link>
        </div>
      )}

      {/* Player list */}
      {players.length > 0 && <DraggableList />}

      {/* Info footer */}
      {players.length > 0 && (
        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Her 10 saniyede bir durum güncellenir • En fazla 5 oyuncu takip edilebilir ({players.length}/5)
        </p>
      )}
    </div>
  );
}
