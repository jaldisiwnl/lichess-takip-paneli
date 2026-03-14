'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import type { LichessGame } from '@/types/lichess';
import { Card, CardHeader, CardTitle } from './ui/Card';

interface Props {
  games: LichessGame[];
}

interface OpeningStat {
  name: string;
  eco: string;
  count: number;
  wins: number;
  losses: number;
  draws: number;
}

const CustomTooltipBar = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <p className="font-semibold mb-1">{label}</p>
      <p style={{ color: 'var(--gold)' }}>{payload[0].value} oyun</p>
    </div>
  );
};

const CustomTooltipLine = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <p className="font-semibold mb-1">Oyun #{label}</p>
      <p style={{ color: 'var(--gold)' }}>Kitap dışı hamle: {payload[0].value}</p>
    </div>
  );
};

export default function AcilisAnalizi({ games }: Props) {
  const gamesWithOpening = games.filter((g) => g.opening);

  // Opening frequency
  const openingMap = new Map<string, OpeningStat>();
  for (const game of gamesWithOpening) {
    const key = game.opening!.eco;
    const existing = openingMap.get(key) ?? {
      name: game.opening!.name.split(':')[0],
      eco: key,
      count: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
    existing.count++;
    openingMap.set(key, existing);
  }

  const topOpenings = Array.from(openingMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((o) => ({ ...o, name: o.name.length > 18 ? o.name.slice(0, 16) + '…' : o.name }));

  // Book depth trend (ply = kitapta kalınan hamle sayısı)
  const depthData = gamesWithOpening
    .slice(0, 30)
    .map((g, i) => ({
      index: i + 1,
      ply: Math.floor((g.opening?.ply ?? 0) / 2),
    }))
    .reverse();

  if (gamesWithOpening.length === 0) {
    return (
      <Card>
        <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
          Açılış verisi bulunamadı.
        </p>
      </Card>
    );
  }

  const avgPly =
    gamesWithOpening.length > 0
      ? Math.round(
          gamesWithOpening.reduce((s, g) => s + Math.floor((g.opening?.ply ?? 0) / 2), 0) /
            gamesWithOpening.length
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ortalama kitap derinliği</p>
          <p className="text-3xl font-bold font-mono mt-1" style={{ color: 'var(--gold)' }}>
            {avgPly}
            <span className="text-base font-normal ml-1" style={{ color: 'var(--text-muted)' }}>hamle</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Farklı açılış</p>
          <p className="text-3xl font-bold font-mono mt-1" style={{ color: 'var(--gold)' }}>
            {openingMap.size}
          </p>
        </Card>
      </div>

      {/* Top openings bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>En Çok Oynanan Açılışlar</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topOpenings} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
            <Tooltip content={<CustomTooltipBar />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="count" fill="var(--gold)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Book depth trend line chart */}
      {depthData.length > 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Kitap Derinliği Trendi (son 30 oyun)</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={depthData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="index" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
              <Tooltip content={<CustomTooltipLine />} />
              <Line
                type="monotone"
                dataKey="ply"
                stroke="var(--gold)"
                strokeWidth={2}
                dot={{ fill: 'var(--gold)', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
