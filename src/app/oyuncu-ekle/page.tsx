'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserPlus, Check, AlertCircle } from 'lucide-react';
import { getUser } from '@/lib/lichessApi';
import { useApp } from '@/context/AppContext';
import type { LichessUser } from '@/types/lichess';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatGameMode } from '@/lib/lichessApi';

export default function OyuncuEklePage() {
  const router = useRouter();
  const { players, addPlayer } = useApp();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<LichessUser | null>(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    setPreview(null);
    setAdded(false);

    try {
      const user = await getUser(trimmed);
      setPreview(user);
    } catch {
      setError('Oyuncu bulunamadı. Kullanıcı adını kontrol et.');
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    if (!preview) return;
    try {
      addPlayer(preview.username);
      setAdded(true);
      setTimeout(() => router.push('/'), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  }

  const alreadyAdded = preview
    ? players.some((p) => p.username.toLowerCase() === preview.username.toLowerCase())
    : false;

  const isFull = players.length >= 5;

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Oyuncu Ekle
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Takip etmek istediğin Lichess kullanıcı adını gir ({players.length}/5)
        </p>
      </div>

      {isFull && (
        <div
          className="rounded-xl px-4 py-3 border text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' }}
        >
          Maksimum 5 oyuncu ekleyebilirsiniz. Önce bir oyuncuyu kaldırın.
        </div>
      )}

      {/* Search form */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Lichess kullanıcı adı..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            disabled={loading || isFull}
          />
        </div>
        <Button variant="primary" type="submit" disabled={loading || !username.trim() || isFull}>
          {loading ? (
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <Search size={16} />
          )}
          {loading ? 'Aranıyor...' : 'Ara'}
        </Button>
      </form>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 border text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Preview card */}
      {preview && (
        <Card className="animate-fade-in">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: 'var(--bg-hover)', color: 'var(--gold)' }}
            >
              {preview.username[0].toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {preview.title && (
                  <span className="font-bold text-sm" style={{ color: 'var(--gold)' }}>
                    {preview.title}
                  </span>
                )}
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {preview.username}
                </h2>
                {preview.patron && <Badge variant="gold">Patron</Badge>}
                {preview.online && <Badge variant="green">Çevrimiçi</Badge>}
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                {(['bullet', 'blitz', 'rapid', 'classical'] as const).map((mode) => {
                  const perf = preview.perfs?.[mode];
                  if (!perf) return null;
                  return (
                    <div
                      key={mode}
                      className="rounded-lg px-3 py-2 text-center"
                      style={{ background: 'var(--bg-hover)' }}
                    >
                      <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                        {formatGameMode(mode)}
                      </p>
                      <p className="text-base font-bold font-mono" style={{ color: 'var(--gold-light)' }}>
                        {perf.rating}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {perf.games} oyun
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              {preview.count && (
                <div className="flex gap-4 mt-3 text-sm">
                  <span className="text-emerald-400">{preview.count.win} Kazandı</span>
                  <span className="text-yellow-400">{preview.count.draw} Berabere</span>
                  <span className="text-red-400">{preview.count.loss} Kaybetti</span>
                </div>
              )}
            </div>
          </div>

          {/* Action */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            {added ? (
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Check size={18} />
                Eklendi! Dashboard&apos;a yönlendiriliyor...
              </div>
            ) : alreadyAdded ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Bu oyuncu zaten takip listesinde.
              </p>
            ) : (
              <Button variant="primary" onClick={handleAdd}>
                <UserPlus size={16} />
                Takip Listesine Ekle
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
