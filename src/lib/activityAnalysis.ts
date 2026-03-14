import type { LichessGame, ActivityDay } from '@/types/lichess';

export interface HourlyStats {
  hour: number; // 0–23
  count: number;
  probability: number; // 0–1, o saatte en az 1 oyun oynama olasılığı
}

export interface DayStats {
  day: number; // 0=Pazar, 1=Pazartesi … 6=Cumartesi
  dayName: string;
  count: number;
  avgPerDay: number;
}

export interface HourDayCell {
  day: number; // 0–6
  hour: number; // 0–23
  count: number;
  probability: number;
}

export interface PeakWindow {
  startHour: number;
  endHour: number;
  label: string;
  avgGames: number;
}

export interface ActivityInsights {
  hourly: HourlyStats[];
  daily: DayStats[];
  heatmapMatrix: HourDayCell[][];  // [day][hour]
  peakWindow: PeakWindow | null;
  mostActiveDay: DayStats | null;
  expectedOnlineHours: number[]; // saatler listesi: olasılık > 0.3
  totalAnalyzedGames: number;
  weeksOfData: number;
}

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function analyzeActivity(games: LichessGame[]): ActivityInsights {
  const hourCounts = new Array(24).fill(0) as number[];
  const dayCounts = new Array(7).fill(0) as number[];
  // matrix[day][hour] = count
  const matrix: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));

  // Günlük oynanan saatleri takip et (duplicate sayma için)
  // key: "day-hour-YYYY-MM-DD" → unique day instance
  const hourDayDates = new Map<string, Set<string>>();

  for (const game of games) {
    const ts = game.createdAt ?? game.lastMoveAt;
    if (!ts) continue;
    const d = new Date(ts);
    const hour = d.getHours();
    const day = d.getDay();
    const dateStr = d.toISOString().split('T')[0];

    hourCounts[hour]++;
    dayCounts[day]++;
    matrix[day][hour]++;

    // Expected value için: bu saat ve günde kaç farklı tarihte oynadı
    const key = `${day}-${hour}`;
    if (!hourDayDates.has(key)) hourDayDates.set(key, new Set());
    hourDayDates.get(key)!.add(dateStr);
  }

  // Kaç hafta var?
  const allDates = games
    .map((g) => g.createdAt ?? g.lastMoveAt)
    .filter(Boolean)
    .map((ts) => new Date(ts!).toISOString().split('T')[0]);
  const uniqueDates = new Set(allDates);
  const sortedDates = Array.from(uniqueDates).sort();
  let weeksOfData = 1;
  if (sortedDates.length >= 2) {
    const first = new Date(sortedDates[0]);
    const last = new Date(sortedDates[sortedDates.length - 1]);
    weeksOfData = Math.max(1, Math.ceil((last.getTime() - first.getTime()) / (7 * 86_400_000)));
  }

  // Her gün için kaç farklı "o gün" geçmiş → expected value hesabı
  const dayOccurrences = new Array(7).fill(0) as number[];
  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr);
    dayOccurrences[d.getDay()]++;
  }

  // Saatlik istatistikler
  const maxHourCount = Math.max(...hourCounts, 1);
  const hourly: HourlyStats[] = hourCounts.map((count, hour) => {
    // Probability: o saatte oyun oynama olasılığı (veri olan günlere göre)
    // Her gün için o saatte oynadığı tarih sayısı / toplam o günün sayısı
    let totalDayOccurrences = 0;
    let daysWithGameAtHour = 0;
    for (let day = 0; day < 7; day++) {
      const key = `${day}-${hour}`;
      const datesAtHour = hourDayDates.get(key)?.size ?? 0;
      totalDayOccurrences += dayOccurrences[day];
      daysWithGameAtHour += datesAtHour;
    }
    const probability = totalDayOccurrences > 0 ? daysWithGameAtHour / totalDayOccurrences : 0;
    return { hour, count, probability: Math.min(1, probability) };
  });

  // Günlük istatistikler
  const daily: DayStats[] = dayCounts.map((count, day) => ({
    day,
    dayName: DAY_NAMES[day],
    count,
    avgPerDay: dayOccurrences[day] > 0 ? count / dayOccurrences[day] : 0,
  }));

  // Heatmap matrisi (olasılık ile)
  const heatmapMatrix: HourDayCell[][] = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const count = matrix[day][hour];
      const key = `${day}-${hour}`;
      const datesAtHour = hourDayDates.get(key)?.size ?? 0;
      const denominator = dayOccurrences[day] > 0 ? dayOccurrences[day] : 1;
      return {
        day,
        hour,
        count,
        probability: Math.min(1, datesAtHour / denominator),
      };
    })
  );

  // Peak window: en yüksek 3 ardışık saati bul (kayan pencere)
  let peakWindow: PeakWindow | null = null;
  let bestScore = 0;
  for (let start = 0; start < 22; start++) {
    const windowScore = hourCounts[start] + hourCounts[start + 1] + hourCounts[start + 2];
    if (windowScore > bestScore) {
      bestScore = windowScore;
      peakWindow = {
        startHour: start,
        endHour: start + 3,
        label: `${String(start).padStart(2, '0')}:00–${String(start + 3).padStart(2, '0')}:00`,
        avgGames: Math.round(windowScore / Math.max(weeksOfData, 1)),
      };
    }
  }

  // En aktif gün
  const mostActiveDay = daily.reduce(
    (best, d) => (d.avgPerDay > best.avgPerDay ? d : best),
    daily[0]
  );

  // Expected online saatler: olasılık > 0.25
  const expectedOnlineHours = hourly
    .filter((h) => h.probability > 0.25)
    .map((h) => h.hour);

  return {
    hourly,
    daily,
    heatmapMatrix,
    peakWindow,
    mostActiveDay: mostActiveDay?.count > 0 ? mostActiveDay : null,
    expectedOnlineHours,
    totalAnalyzedGames: games.length,
    weeksOfData,
  };
}

export function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

export function getPeakDescription(insights: ActivityInsights): string {
  const parts: string[] = [];
  if (insights.peakWindow) {
    parts.push(`Genellikle **${insights.peakWindow.label}** arasında oynar`);
  }
  if (insights.mostActiveDay) {
    parts.push(`En aktif gün: **${insights.mostActiveDay.dayName}**`);
  }
  if (insights.expectedOnlineHours.length > 0) {
    const h = insights.expectedOnlineHours;
    const ranges: string[] = [];
    let rangeStart = h[0];
    let prev = h[0];
    for (let i = 1; i <= h.length; i++) {
      if (i === h.length || h[i] !== prev + 1) {
        ranges.push(
          rangeStart === prev
            ? formatHour(rangeStart)
            : `${formatHour(rangeStart)}–${formatHour(prev + 1)}`
        );
        if (i < h.length) { rangeStart = h[i]; prev = h[i]; }
      } else {
        prev = h[i];
      }
    }
    parts.push(`Yüksek olasılıklı saatler: ${ranges.join(', ')}`);
  }
  return parts.join(' • ');
}
