import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import { getCalendar, CalendarDay } from '../api';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export function CalendarScreen() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selected, setSelected] = useState<number | null>(today.getDate());
  const [calData, setCalData] = useState<Record<string, CalendarDay[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstWeekday(year, month);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCalendar(year, month)
      .then((data) => setCalData(data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [year, month]);

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
    setSelected(null);
  };

  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
    setSelected(null);
  };

  const selectedPlants = selected ? (calData[String(selected)] ?? []) : [];

  const totalWaterings = Object.values(calData).reduce(
    (s, plants) => s + plants.reduce((ss, p) => ss + p.count, 0),
    0
  );
  const totalPlants = new Set(Object.values(calData).flatMap((ps) => ps.map((p) => p.id))).size;

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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

      <div className="flex-1 overflow-y-auto px-5 pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-4" style={{ overscrollBehavior: 'none' }}>
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
          <p className="text-muted-foreground text-xs mb-1">本月统计</p>
          <p
            className="text-foreground"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.05rem' }}
          >
            已浇水{' '}
            <span className="text-primary">{totalWaterings}</span> 次，涉及{' '}
            <span className="text-primary">{totalPlants}</span> 株植物
          </p>
        </div>
      </div>
    </div>
  );
}