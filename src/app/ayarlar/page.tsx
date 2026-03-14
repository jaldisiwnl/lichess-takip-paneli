'use client';

import { useState } from 'react';
import { Check, Bell, Clock, Volume2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { requestNotificationPermission, getNotificationPermission } from '@/lib/notifications';
import { restartPolling } from '@/lib/polling';
import type { AppSettings } from '@/types/lichess';

export default function AyarlarPage() {
  const { settings, updateSettings } = useApp();
  const [local, setLocal] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [notifPerm, setNotifPerm] = useState(getNotificationPermission());

  function handleChange<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setLocal((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    updateSettings(local);
    restartPolling();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleNotifPermission() {
    const granted = await requestNotificationPermission();
    setNotifPerm(granted ? 'granted' : 'denied');
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Ayarlar
        </h1>
      </div>

      {/* Polling interval */}
      <Card>
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg-hover)' }}
          >
            <Clock size={18} style={{ color: 'var(--gold)' }} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              Kontrol Aralığı
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Oyuncu durumu kaç saniyede bir kontrol edilsin
            </p>
            <div className="flex gap-2 mt-3">
              {[5, 10, 15, 30, 60].map((v) => (
                <button
                  key={v}
                  onClick={() => handleChange('pollingInterval', v)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  style={{
                    background: local.pollingInterval === v ? 'var(--gold)' : 'var(--bg-hover)',
                    color: local.pollingInterval === v ? '#000' : 'var(--text-secondary)',
                    border: `1px solid ${local.pollingInterval === v ? 'var(--gold)' : 'var(--border)'}`,
                  }}
                >
                  {v}s
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg-hover)' }}
          >
            <Bell size={18} style={{ color: 'var(--gold)' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                  Bildirimler
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Oyuncu oyuna girdiğinde bildirim gönder
                </p>
              </div>
              <button
                onClick={() => handleChange('notificationsEnabled', !local.notificationsEnabled)}
                className="relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
                style={{
                  background: local.notificationsEnabled ? 'var(--gold)' : 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
                  style={{
                    background: '#fff',
                    transform: local.notificationsEnabled ? 'translateX(22px)' : 'translateX(2px)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                />
              </button>
            </div>

            {/* Permission status */}
            <div className="mt-3 p-3 rounded-lg" style={{ background: 'var(--bg-hover)' }}>
              {notifPerm === 'granted' && (
                <p className="text-xs text-emerald-400">✓ Bildirim izni verildi</p>
              )}
              {notifPerm === 'denied' && (
                <p className="text-xs text-red-400">✗ Bildirim izni reddedildi. Tarayıcı ayarlarından değiştir.</p>
              )}
              {notifPerm === 'default' && (
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Bildirim izni henüz verilmedi</p>
                  <Button variant="primary" size="sm" onClick={handleNotifPermission}>
                    İzin Ver
                  </Button>
                </div>
              )}
              {notifPerm === 'unsupported' && (
                <p className="text-xs text-yellow-400">Bu tarayıcı bildirimleri desteklemiyor.</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Sound */}
      <Card>
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--bg-hover)' }}
          >
            <Volume2 size={18} style={{ color: 'var(--gold)' }} />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                Ses
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Bildirimle birlikte ses çal
              </p>
            </div>
            <button
              onClick={() => handleChange('soundEnabled', !local.soundEnabled)}
              className="relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0"
              style={{
                background: local.soundEnabled ? 'var(--gold)' : 'var(--bg-hover)',
                border: '1px solid var(--border)',
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
                style={{
                  background: '#fff',
                  transform: local.soundEnabled ? 'translateX(22px)' : 'translateX(2px)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Save */}
      <Button variant="primary" size="lg" onClick={handleSave} className="w-full">
        {saved ? (
          <>
            <Check size={18} />
            Kaydedildi!
          </>
        ) : (
          'Ayarları Kaydet'
        )}
      </Button>

      {/* Info */}
      <div className="text-xs text-center space-y-1" style={{ color: 'var(--text-muted)' }}>
        <p>Tüm veriler tarayıcının LocalStorage alanında saklanır.</p>
        <p>Lichess API — ücretsiz, giriş gerekmez.</p>
      </div>
    </div>
  );
}
