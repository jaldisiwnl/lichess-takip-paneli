'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import type { ActivityInsights } from '@/lib/activityAnalysis';
import { formatHour } from '@/lib/activityAnalysis';
import { Card, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';

interface Props {
  insights: ActivityInsights;
}

// ─── Custom tooltips ──────────────────────────────────────────────────────────

function HourTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <p className="font-semibold" style={{ color: 'var(--gold)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i}>{p.name}: <span className="font-bold">{p.value}</span></p>
      ))}
    </div>
  );
}

function DayTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
      <p className="font-semibold" style={{ color: 'var(--gold)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i}>{p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</span></p>
      ))}
    </div>
  );
}

// ─── Hour × Day Heatmap ───────────────────────────────────────────────────────

function HourDayHeatmap({ matrix }: { matrix: ActivityInsights['heatmapMatrix'] }) {
  const DAY_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const maxProb = Math.max(...matrix.flatMap((row) => row.map((c) => c.probability)), 0.01);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saat × Gün Isı Haritası</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Hour labels */}
          <div className="flex mb-1 pl-9">
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="flex-1 text-center text-[9px]"
                style={{ color: 'var(--text-muted)' }}
              >
                {h % 3 === 0 ? `${String(h).padStart(2, '0')}` : ''}
              </div>
            ))}
          </div>
          {/* Rows */}
          {matrix.map((row, dayIdx) => (
            <div key={dayIdx} className="flex items-center gap-0 mb-0.5">
              <span
                className="w-9 text-[10px] pr-1.5 text-right flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {DAY_SHORT[dayIdx]}
              </span>
              {row.map((cell) => {
                const intensity = cell.probability / maxProb;
                const alpha = Math.max(0.05, intensity);
                return (
                  <div
                    key={cell.hour}
                    className="flex-1 h-5 rounded-sm mx-px transition-opacity cursor-default"
                    style={{ background: `rgba(201,162,39,${alpha})` }}
                    title={`${DAY_SHORT[dayIdx]} ${formatHour(cell.hour)}: %${Math.round(cell.probability * 100)} olasılık (${cell.count} oyun)`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Düşük olasılık</span>
        {[0.1, 0.3, 0.55, 0.8, 1].map((op) => (
          <div key={op} className="w-3.5 h-3.5 rounded-sm" style={{ background: `rgba(201,162,39,${op})` }} />
        ))}
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Yüksek</span>
      </div>
    </Card>
  );
}

// ─── Expected Value Bar ───────────────────────────────────────────────────────

function ExpectedValueBar({ hourly }: { hourly: ActivityInsights['hourly'] }) {
  const data = hourly.map((h) => ({
    saat: `${String(h.hour).padStart(2, '0')}`,
    'Olasılık (%)': Math.round(h.probability * 100),
    'Oyun sayısı': h.count,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Saatlik Online Olma Olasılığı (%)</CardTitle>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Geçmiş veriye dayalı beklenen değer
          </span>
        </div>
      </CardHeader>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 4 }}>
          <XAxis
            dataKey="saat"
            tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<HourTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar
            dataKey="Olasılık (%)"
            radius={[2, 2, 0, 0]}
            fill="var(--gold)"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Day of Week Radar ────────────────────────────────────────────────────────

function DayRadar({ daily }: { daily: ActivityInsights['daily'] }) {
  const data = daily.map((d) => ({
    gün: d.dayName.slice(0, 3),
    'Ort. Oyun': parseFloat(d.avgPerDay.toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Haftalık Dağılım (gün başına ortalama oyun)</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} outerRadius={75}>
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis dataKey="gün" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
          <Radar
            name="Ort. Oyun"
            dataKey="Ort. Oyun"
            stroke="var(--gold)"
            fill="var(--gold)"
            fillOpacity={0.2}
          />
          <Tooltip content={<DayTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AktiflikDetay({ insights }: Props) {
  const {
    peakWindow,
    mostActiveDay,
    expectedOnlineHours,
    totalAnalyzedGames,
    weeksOfData,
    hourly,
  } = insights;

  const topHours = [...insights.hourly]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Analiz edilen</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ color: 'var(--gold)' }}>
            {totalAnalyzedGames}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>oyun</p>
        </Card>
        <Card>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Veri süresi</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ color: 'var(--gold)' }}>
            {weeksOfData}
          </p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>hafta</p>
        </Card>
        <Card>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Zirve pencere</p>
          <p className="text-base font-bold mt-1" style={{ color: 'var(--gold)' }}>
            {peakWindow?.label ?? '–'}
          </p>
        </Card>
        <Card>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>En aktif gün</p>
          <p className="text-base font-bold mt-1" style={{ color: 'var(--gold)' }}>
            {mostActiveDay?.dayName ?? '–'}
          </p>
          {mostActiveDay && (
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              ort. {mostActiveDay.avgPerDay.toFixed(1)} oyun/gün
            </p>
          )}
        </Card>
      </div>

      {/* Insight banner */}
      {(peakWindow || expectedOnlineHours.length > 0) && (
        <div
          className="rounded-xl px-4 py-3 border"
          style={{ background: 'rgba(201,162,39,0.07)', borderColor: 'rgba(201,162,39,0.25)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--gold)' }}>
            AI Aktiflik Tahmini
          </p>
          <div className="flex flex-wrap gap-2">
            {peakWindow && (
              <Badge variant="gold">
                🕐 Genellikle {peakWindow.label} oynuyor
              </Badge>
            )}
            {mostActiveDay && (
              <Badge variant="gold">
                📅 En aktif: {mostActiveDay.dayName}
              </Badge>
            )}
            {topHours.map((h) => (
              <Badge key={h.hour} variant="gray">
                {formatHour(h.hour)} → %{Math.round(h.probability * 100)} ihtimal
              </Badge>
            ))}
          </div>
          {peakWindow && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Bu saatlerde online olma ihtimali en yüksek. Haftalık ortalama{' '}
              <span style={{ color: 'var(--gold)' }}>~{peakWindow.avgGames} oyun</span> oynuyor.
            </p>
          )}
        </div>
      )}

      {/* Expected value bar */}
      <ExpectedValueBar hourly={hourly} />

      {/* Hour × Day heatmap */}
      <HourDayHeatmap matrix={insights.heatmapMatrix} />

      {/* Day of week radar */}
      <DayRadar daily={insights.daily} />
    </div>
  );
}
