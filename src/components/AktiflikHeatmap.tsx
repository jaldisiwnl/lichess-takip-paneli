'use client';

import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import type { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import type { ActivityDay } from '@/types/lichess';
import { Card, CardHeader, CardTitle } from './ui/Card';

interface Props {
  data: ActivityDay[];
}

type HeatmapValue = ReactCalendarHeatmapValue<string> & { count?: number };

export default function AktiflikHeatmap({ data }: Props) {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 90);

  const values = data.map((d) => ({ date: d.date, count: d.count }));
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  function getClass(value: HeatmapValue | undefined): string {
    if (!value || !value.count || value.count === 0) return 'color-empty';
    const ratio = value.count / maxCount;
    if (ratio < 0.25) return 'color-scale-1';
    if (ratio < 0.5) return 'color-scale-2';
    if (ratio < 0.75) return 'color-scale-3';
    return 'color-scale-4';
  }

  function getTooltip(value: HeatmapValue | undefined): Record<string, string> {
    if (!value || !value.date) return { 'data-tip': 'Veri yok' };
    return { 'data-tip': `${value.date}: ${value.count ?? 0} oyun` };
  }

  const totalGames = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Aktiflik Takvimi (son 90 gün)</CardTitle>
          <div className="flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{totalGames} oyun</span>
            <span>{activeDays} aktif gün</span>
          </div>
        </div>
      </CardHeader>

      <style>{`
        .react-calendar-heatmap .color-empty { fill: var(--bg-hover); }
        .react-calendar-heatmap .color-scale-1 { fill: rgba(201,162,39,0.25); }
        .react-calendar-heatmap .color-scale-2 { fill: rgba(201,162,39,0.5); }
        .react-calendar-heatmap .color-scale-3 { fill: rgba(201,162,39,0.75); }
        .react-calendar-heatmap .color-scale-4 { fill: var(--gold); }
        .react-calendar-heatmap text { fill: var(--text-muted); font-size: 9px; }
      `}</style>

      <div className="overflow-x-auto">
        <CalendarHeatmap
          startDate={startDate}
          endDate={today}
          values={values}
          classForValue={getClass}
          tooltipDataAttrs={getTooltip}
          showWeekdayLabels
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Az</span>
        {[0.25, 0.5, 0.75, 1].map((op) => (
          <div
            key={op}
            className="w-3 h-3 rounded-sm"
            style={{ background: `rgba(201,162,39,${op})` }}
          />
        ))}
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Çok</span>
      </div>
    </Card>
  );
}
