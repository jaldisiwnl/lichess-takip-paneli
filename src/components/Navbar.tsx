'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Settings, Home, UserPlus, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/oyuncu-ekle', label: 'Oyuncu Ekle', icon: UserPlus },
  { href: '/bildirim-gecmisi', label: 'Bildirimler', icon: Bell },
  { href: '/ayarlar', label: 'Ayarlar', icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const { unreadCount } = useApp();

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl select-none">♟</span>
          <span className="font-bold text-base tracking-tight" style={{ color: 'var(--gold)' }}>
            Lichess Takip
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            const isBell = href === '/bildirim-gecmisi';
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'text-white'
                    : 'hover:text-white'
                )}
                style={{
                  color: active ? 'var(--gold)' : 'var(--text-secondary)',
                  background: active ? 'rgba(201,162,39,0.1)' : undefined,
                }}
                onClick={isBell ? () => {} : undefined}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
                {isBell && unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-black"
                    style={{ background: 'var(--gold)' }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
