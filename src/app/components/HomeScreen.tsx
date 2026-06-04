import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Droplets, Plus, Clock } from 'lucide-react';
import { Plant, User, daysUntilNextWater, formatLastWatered } from '../api';

function urgencyColor(days: number) {
  if (days === 0) return '#e85d3a';
  if (days === 1) return '#f0a050';
  return '#2d6a2d';
}

function PlantCard({ plant, onClick }: { plant: Plant; onClick: () => void }) {
  const days = daysUntilNextWater(plant);
  const color = urgencyColor(days);

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full bg-card border border-border rounded-2xl overflow-hidden text-left flex flex-col"
      style={{ aspectRatio: '3/4' }}
    >
      {/* Image area - 2/3 of card */}
      <div className="flex-[2] bg-muted overflow-hidden">
        {plant.image ? (
          <img
            src={`${plant.image}?w=400&h=400&fit=crop&auto=format`}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🌿</div>
        )}
      </div>
      {/* Info area - 1/3 of card */}
      <div className="flex-1 px-3 py-2.5 flex flex-col justify-between">
        <div>
          <p className="text-card-foreground text-sm font-medium leading-tight">{plant.name}</p>
          <p className="text-muted-foreground text-xs italic mt-0.5 leading-tight">{plant.species}</p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted-foreground">浇水 {plant.historyCount} 次</span>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {days === 0 ? '今天' : days === 1 ? '明天' : `${days}天`}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export function HomeScreen({
  plants,
  loading,
  error,
  user,
  onPlantClick,
  onAddClick,
  onRefresh,
}: {
  plants: Plant[];
  loading: boolean;
  error: string | null;
  user?: User | null;
  onPlantClick: (p: Plant) => void;
  onAddClick: () => void;
  onRefresh: () => void;
}) {
  const [query, setQuery] = useState('');

  const urgent = plants.filter((p) => daysUntilNextWater(p) === 0);
  const filtered = plants.filter(
    (p) =>
      p.name.includes(query) || p.species.toLowerCase().includes(query.toLowerCase())
  );

  const greetHour = new Date().getHours();
  const greet = greetHour < 12 ? '早安' : greetHour < 18 ? '下午好' : '晚上好';

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-muted-foreground text-xs">
              {greet}，{user?.nickname ?? '植物爱好者'} 👋
            </p>
            <h1
              className="text-foreground"
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.55rem' }}
            >
              我的植物
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAddClick}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm"
            >
              <Plus size={18} className="text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 mt-3">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索植物名称或种类…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-4">
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

        {/* Loading skeleton */}
        {loading && plants.length === 0 && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-card border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Urgent reminder */}
        <AnimatePresence>
          {urgent.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary rounded-2xl p-4 relative overflow-hidden"
            >
              <div className="absolute -right-5 -top-5 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute -right-2 bottom-[-28px] w-20 h-20 rounded-full bg-white/10" />
              <p className="text-primary-foreground/70 text-xs mb-1">今日提醒</p>
              <p
                className="text-primary-foreground"
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.05rem' }}
              >
                {urgent.length} 株植物今天需要浇水 💧
              </p>
              <div className="flex gap-2 mt-3 flex-wrap">
                {urgent.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onPlantClick(p)}
                    className="bg-white/20 backdrop-blur-sm text-primary-foreground text-xs px-3 py-1 rounded-full"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '植物总数', value: plants.length },
            { label: '今日待浇', value: urgent.length },
            { label: '累计浇水', value: plants.reduce((s, p) => s + p.historyCount, 0) },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-3 text-center">
              <p
                className="text-foreground"
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem' }}
              >
                {s.value}
              </p>
              <p className="text-muted-foreground text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Plant list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-foreground"
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem' }}
            >
              所有植物
            </h2>
            <span className="text-muted-foreground text-xs">{filtered.length} 株</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PlantCard plant={p} onClick={() => onPlantClick(p)} />
              </motion.div>
            ))}
            {filtered.length === 0 && !loading && (
              <p className="col-span-2 text-center text-muted-foreground text-sm py-10">
                {query ? '未找到相关植物' : '还没有添加植物，快去添加一株吧！'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}