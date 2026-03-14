'use client';

import { useEffect } from 'react';
import { Bell, Trash2, ExternalLink } from 'lucide-react';
import { getLichessGameUrl, formatGameMode } from '@/lib/lichessApi';
import { formatDate } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function BildirimGecmisiPage() {
  const { notifications, readNotifications, clearAllNotifications } = useApp();

  useEffect(() => {
    readNotifications();
  }, [readNotifications]);

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Bildirim Geçmişi
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {notifications.length} bildirim
          </p>
        </div>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Tüm bildirimler silinsin mi?')) clearAllNotifications();
            }}
            className="hover:text-red-400"
          >
            <Trash2 size={14} />
            Temizle
          </Button>
        )}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-20 space-y-3">
          <Bell size={48} className="mx-auto" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Henüz bildirim yok</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <Card
            key={n.id}
            className={`transition-all ${!n.read ? 'border-[var(--gold-dim)]' : ''}`}
          >
            <div className="flex items-start gap-3">
              {/* Dot */}
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ background: n.read ? 'var(--text-muted)' : 'var(--gold)' }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    🟢 {n.playerUsername} oyuna başladı
                  </p>
                  <Badge variant={n.read ? 'gray' : 'gold'}>
                    {formatGameMode(n.gameMode)}
                  </Badge>
                </div>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {n.opponentName !== '?' && `vs ${n.opponentName}`}
                  {n.opponentRating && ` (${n.opponentRating})`}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(n.timestamp)}
                </p>
              </div>

              <a
                href={getLichessGameUrl(n.gameId)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" title="Oyuna git">
                  <ExternalLink size={14} />
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
