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
  onWater: (plantId: number) => Promise<WaterLog> | WaterLog;
  onEdit: (plant: Plant) => void;
}) {
  const [watered, setWatered] = useState(false);
  const [watering, setWatering] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [history, setHistory] = useState<WaterLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const days = daysUntilNextWater(plant);

  // 计算今天已浇水的次数（用于 TIMES_PER_DAY 类型）
  const historyTodayCount = (() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return history.filter((log) => {
      const logDate = new Date(log.date);
      return logDate >= todayStart && logDate <= todayEnd;
    }).length;
  })();
  const todayCount = Math.max(historyTodayCount, plant.todayCount ?? 0);

  // 浇水状态文案
  const waterStatusText = (() => {
    if (plant.frequencyType === 'TIMES_PER_DAY') {
      if (todayCount >= plant.frequency) {
        return '今天已浇完';
      }
      const remaining = plant.frequency - todayCount;
      return `今天还需浇 ${remaining} 次`;
    }
    return days === 0 ? '今天需要浇水！' : days === 1 ? '明天需要浇水' : `还有 ${days} 天浇水`;
  })();

  // 浇水状态颜色
  const isNeedWater = plant.frequencyType === 'TIMES_PER_DAY' ? todayCount < plant.frequency : days === 0;

  useEffect(() => {
    const plantWithHistory = plant as Plant & { history?: WaterLog[] };
    if (Array.isArray(plantWithHistory.history)) {
      setHistory(plantWithHistory.history);
    }

    setLoadingHistory(true);
    getPlantInfo(plant.id)
      .then((data) => setHistory(data.history))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [plant.id, plant.lastWatered, plant.historyCount, plant.todayCount]);

  const handleWater = async () => {
    if (watering) return;

    // 获取今天的开始和结束时间
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // 统计今天已浇水的次数
    const todayLogs = history.filter((log) => {
      const logDate = new Date(log.date);
      return logDate >= todayStart && logDate <= todayEnd;
    });

    // 根据频率类型判断是否超出限制
    if (plant.frequencyType === 'TIMES_PER_DAY') {
      // 每天浇水N次：检查今天浇水次数是否已达到上限
      if (todayLogs.length >= plant.frequency) {
        alert(`每天最多只能浇水 ${plant.frequency} 次，今天的浇水次数已用完~`);
        return;
      }
    } else {
      // 每N天浇水一次：检查今天是否已浇过水
      if (todayLogs.length > 0) {
        alert('今天已经浇过水了，请明天再来吧~');
        return;
      }
      // 检查是否到了浇水时间
      if (plant.lastWatered) {
        const lastWateredDate = new Date(plant.lastWatered);
        const lastWateredDay = new Date(lastWateredDate.getFullYear(), lastWateredDate.getMonth(), lastWateredDate.getDate());
        const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const daysSinceLastWater = Math.floor((todayDay.getTime() - lastWateredDay.getTime()) / 86400000);
        if (daysSinceLastWater < plant.frequency) {
          const remaining = plant.frequency - daysSinceLastWater;
          alert(`还没到浇水时间，还有 ${remaining} 天才能浇水~`);
          return;
        }
      }
    }

    try {
      setWatering(true);

      // 先调用后端接口，二次校验
      const waterLog = await onWater(plant.id);

      // 后端成功后再更新本地状态
      setWatered(true);
      setHistory((prev) => [waterLog, ...prev.filter((log) => log.id !== waterLog.id)]);

      setTimeout(() => setWatered(false), 2500);
    } catch (e: any) {
      alert(e.message || '浇水失败');
      setWatered(false);
    } finally {
      setWatering(false);
    }
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
            background: isNeedWater ? '#fef3f0' : '#f0faf0',
            border: `1px solid ${isNeedWater ? '#fad4c8' : '#c6e8c6'}`,
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: isNeedWater ? '#fde0d8' : '#d9f2d9' }}
          >
            💧
          </div>
          <div>
            <p
              className="font-medium text-sm"
              style={{ color: isNeedWater ? '#c0392b' : '#2d6a2d' }}
            >
              {waterStatusText}
            </p>
            <p className="text-muted-foreground text-xs mt-0.5">{freqLabel}</p>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: '上次浇水', value: formatLastWatered(plant.lastWatered) },
            {
              label: '今日浇水',
              value:
                plant.frequencyType === 'TIMES_PER_DAY'
                  ? `${todayCount}/${plant.frequency} 次`
                  : todayCount > 0
                    ? '已浇水'
                    : '未浇水',
            },
            { label: '累计浇水', value: `${plant.historyCount} 次` },
            { label: '浇水频率', value: freqLabel },
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
            disabled={watering}
            whileTap={watering ? {} : { scale: 0.96 }}
            className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AnimatePresence mode="wait">
              {watering ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  记录中...
                </motion.span>
              ) : watered ? (
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[90%] max-w-sm bg-card rounded-2xl px-5 py-5"
            >
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
