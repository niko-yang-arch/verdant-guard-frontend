import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Droplets, Trash2, Check, Edit3 } from 'lucide-react';
import { Plant, WaterLog, daysUntilNextWater, formatLastWatered, getPlantInfo } from '../api';

function HistoryItem({ log }: { log: WaterLog }) {
  const d = new Date(log.date);
  const label = d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  const time = d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <Droplets size={14} className="text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-card-foreground text-sm">{label}</p>
        <p className="text-muted-foreground text-xs">{time}</p>
      </div>
    </div>
  );
}

export function DetailScreen({
  plant,
  onBack,
  onDelete,
  onWater,
  onEdit,
}: {
  plant: Plant;
  onBack: () => void;
  onDelete: (id: number) => void;
  onWater: (plantId: number) => void;
  onEdit: (plant: Plant) => void;
}) {
  const [watered, setWatered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [history, setHistory] = useState<WaterLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const days = daysUntilNextWater(plant);

  useEffect(() => {
    setLoadingHistory(true);
    getPlantInfo(plant.id)
      .then((data) => setHistory(data.history))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [plant.id]);

  const handleWater = () => {
    setWatered(true);
    onWater(plant.id);
    
    const newLog: WaterLog = {
      id: Date.now(),
      plantId: plant.id,
      date: new Date().toISOString(),
    };
    setHistory((prev) => [newLog, ...prev]);
    
    setTimeout(() => setWatered(false), 2500);
  };

  const freqLabel =
    plant.frequencyType === 'DAYS'
      ? `每 ${plant.frequency} 天浇一次`
      : `每天浇 ${plant.frequency} 次`;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 260 }}
      className="absolute inset-0 bg-background z-50 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", touchAction: 'pan-y', overscrollBehavior: 'contain' }}
    >
      {/* Hero image */}
      <div className="relative h-60 shrink-0">
        {plant.image ? (
          <img
            src={`${plant.image}?w=600&h=480&fit=crop&auto=format`}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center text-6xl">🌿</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
        <button
          onClick={onBack}
          className="absolute top-12 left-4 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => onEdit(plant)}
          className="absolute top-12 right-4 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm"
        >
          <Edit3 size={18} />
        </button>
        <div className="absolute bottom-4 left-4">
          <h1
            className="text-white"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.75rem' }}
          >
            {plant.name}
          </h1>
          <p className="text-white/70 text-sm italic mt-0.5">{plant.species}</p>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Next watering */}
        <div
          className="rounded-2xl p-4 flex items-center gap-4"
          style={{
            background: days === 0 ? '#fef3f0' : '#f0faf0',
            border: `1px solid ${days === 0 ? '#fad4c8' : '#c6e8c6'}`,
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: days === 0 ? '#fde0d8' : '#d9f2d9' }}
          >
            💧
          </div>
          <div>
            <p
              className="font-medium text-sm"
              style={{ color: days === 0 ? '#c0392b' : '#2d6a2d' }}
            >
              {days === 0 ? '今天需要浇水！' : days === 1 ? '明天需要浇水' : `还有 ${days} 天浇水`}
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">{freqLabel}</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '上次浇水', value: formatLastWatered(plant.lastWatered) },
            { label: '浇水次数', value: `${plant.historyCount} 次` },
            { label: '浇水频率', value: freqLabel },
            { label: '添加时间', value: new Date(plant.createdAt).toLocaleDateString('zh-CN') },
          ].map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-xl px-3 py-3">
              <p className="text-muted-foreground text-xs">{item.label}</p>
              <p className="text-card-foreground text-sm font-medium mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Watering history */}
        <div className="bg-card border border-border rounded-2xl px-4 py-4">
          <h3
            className="text-card-foreground mb-2"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.05rem' }}
          >
            浇水历史
          </h3>
          {loadingHistory ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">暂无记录</p>
          ) : (
            <div className="max-h-48 overflow-y-auto [scrollbar-width:none]">
              {history.map((log) => (
                <HistoryItem key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-12 h-12 rounded-2xl border border-border bg-card flex items-center justify-center text-destructive shrink-0"
          >
            <Trash2 size={18} />
          </button>

          <motion.button
            onClick={handleWater}
            whileTap={{ scale: 0.96 }}
            className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-sm flex items-center justify-center gap-2"
          >
            <AnimatePresence mode="wait">
              {watered ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2"
                >
                  <Check size={16} /> 已记录浇水！
                </motion.span>
              ) : (
                <motion.span
                  key="water"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2"
                >
                  <Droplets size={16} /> 记录浇水
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-end z-30"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-card rounded-t-3xl px-5 pt-5 pb-10"
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
              <h3
                className="text-card-foreground mb-1"
                style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.15rem' }}
              >
                删除 {plant.name}？
              </h3>
              <p className="text-muted-foreground text-sm mb-5">删除后将同步清除所有浇水记录，无法恢复。</p>
              <button
                onClick={() => { onDelete(plant.id); onBack(); }}
                className="w-full py-3.5 rounded-2xl bg-destructive text-destructive-foreground text-sm font-medium mb-2"
              >
                确认删除
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3.5 rounded-2xl bg-secondary text-secondary-foreground text-sm"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}