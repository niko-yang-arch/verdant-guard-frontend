import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import { getCalendar, CalendarDay } from '../api';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

type CalendarSummary = {
  totalWaterings: number;
  totalPlants: number;
  activeDays: number;
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function getAdjacentMonth(year: number, month: number, direction: -1 | 1) {
  if (direction === -1 && month === 1) return { year: year - 1, month: 12 };
  if (direction === 1 && month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + direction };
}

function clampDayToMonth(day: number, year: number, month: number) {
  return Math.min(day, getDaysInMonth(year, month));
}

function buildSummary(data: Record<string, CalendarDay[]>): CalendarSummary {
  const days = Object.values(data);
  return {
    totalWaterings: days.reduce(
      (sum, plants) => sum + plants.reduce((plantSum, plant) => plantSum + plant.count, 0),
      0
    ),
    totalPlants: new Set(days.flatMap((plants) => plants.map((plant) => plant.id))).size,
    activeDays: days.length,
  };
}

function mergeSummary(apiSummary: CalendarSummary | undefined, data: Record<string, CalendarDay[]>): CalendarSummary {
  const dataSummary = buildSummary(data);
  return {
    totalWaterings: Math.max(apiSummary?.totalWaterings ?? 0, dataSummary.totalWaterings),
    totalPlants: Math.max(apiSummary?.totalPlants ?? 0, dataSummary.totalPlants),
    activeDays: Math.max(apiSummary?.activeDays ?? 0, dataSummary.activeDays),
  };
}

export function CalendarScreen() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selected, setSelected] = useState<number | null>(today.getDate());
  const [calData, setCalData] = useState<Record<string, CalendarDay[]>>({});
  const [summary, setSummary] = useState<CalendarSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstWeekday(year, month);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError(null);
    getCalendar(year, month)
      .then((data) => {
        if (ignore) return;

        const nextData = data.data ?? {};
        setCalData(nextData);
        setSummary(mergeSummary(data.summary, nextData));
      })
      .catch((e) => {
        if (ignore) return;

        setError(e.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [year, month]);

  const moveMonth = (direction: -1 | 1) => {
    const next = getAdjacentMonth(year, month, direction);
    const selectedDay = selected ?? today.getDate();
    setYear(next.year);
    setMonth(next.month);
    setSelected(clampDayToMonth(selectedDay, next.year, next.month));
  };

  const prevMonth = () => {
    moveMonth(-1);
  };

  const nextMonth = () => {
    moveMonth(1);
  };

  const selectedPlants = selected ? (calData[String(selected)] ?? []) : [];
  const displayedSummary = mergeSummary(summary ?? undefined, calData);
  const summaryLoading = loading && summary === null && Object.keys(calData).length === 0;

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4 shrink-0">
        <h1
          className="text-foreground mb-1"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.55rem' }}
        >
          浇水日历
        </h1>
        <p className="text-muted-foreground text-xs">查看每天的浇水记录</p>
      </div>

      {/* Scrollable content */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-4"
        style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
      >
        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3"
          >
            <p className="text-destructive text-sm">{error}</p>
          </motion.div>
        )}

        {/* Month navigator */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-secondary">
              <ChevronLeft size={18} className="text-muted-foreground" />
            </button>
            <p
              className="text-foreground"
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem' }}
            >
              {year} 年 {month} 月
            </p>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-secondary">
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-muted-foreground text-xs py-1">{d}</div>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: 42 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse bg-muted rounded" />
              ))}
            </div>
          )}

          {/* Day grid */}
          {!loading && (
            <div className="grid grid-cols-7 gap-y-1">
              {/* Empty cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() + 1 &&
                  year === today.getFullYear();
                const isSelected = day === selected;
                const hasRecord = !!calData[String(day)];
                const count = calData[String(day)]?.reduce((s, p) => s + p.count, 0) ?? 0;

                return (
                  <button
                    key={day}
                    onClick={() => setSelected(day)}
                    className="flex flex-col items-center py-1 rounded-xl transition-colors"
                    style={{
                      background: isSelected ? 'var(--primary)' : 'transparent',
                    }}
                  >
                    <span
                      className="text-xs w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                      style={{
                        color: isSelected
                          ? '#fff'
                          : isToday
                          ? 'var(--primary)'
                          : 'var(--foreground)',
                        fontWeight: isToday || isSelected ? 600 : 400,
                        border: isToday && !isSelected ? '1.5px solid var(--primary)' : 'none',
                      }}
                    >
                      {day}
                    </span>
                    {hasRecord && (
                      <span
                        className="text-xs mt-0.5 leading-none"
                        style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--accent)' }}
                      >
                        ●{count > 1 ? count : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected day detail */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <h3
            className="text-card-foreground mb-3"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.05rem' }}
          >
            {selected ? `${month} 月 ${selected} 日` : '选择一天查看记录'}
          </h3>

          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : selectedPlants.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-3xl mb-2">🌱</p>
              <p className="text-muted-foreground text-sm">当天无浇水记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedPlants.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary shrink-0">
                    {p.image ? (
                      <img src={`${p.image}?w=80&h=80&fit=crop`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">🌿</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-card-foreground text-sm font-medium">{p.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Droplets size={12} />
                    {p.count} 次
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly summary */}
        <div className="bg-secondary rounded-2xl p-4">
          <p className="text-foreground text-sm font-medium">本月统计</p>
          <div className="h-px bg-border/70 my-3" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-muted-foreground text-xs">浇水次数</p>
              <p
                className="text-primary mt-1"
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.35rem' }}
              >
                {summaryLoading ? '...' : `${displayedSummary.totalWaterings} 次`}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">涉及植物</p>
              <p
                className="text-primary mt-1"
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.35rem' }}
              >
                {summaryLoading ? '...' : `${displayedSummary.totalPlants} 株`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
