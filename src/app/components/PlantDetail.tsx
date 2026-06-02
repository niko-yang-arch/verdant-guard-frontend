import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Droplets, Sun, Thermometer, Wind, Check, Bell, Edit3 } from "lucide-react";
import { Plant } from "./PlantCard";
import { useState } from "react";

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-secondary rounded-xl p-3 flex flex-col items-center gap-1">
      <div className="text-primary">{icon}</div>
      <p className="text-muted-foreground" style={{ fontSize: "0.65rem" }}>{label}</p>
      <p className="text-card-foreground text-xs font-medium">{value}</p>
    </div>
  );
}

const wateringHistory = [
  { date: "5月26日", amount: "200ml" },
  { date: "5月22日", amount: "180ml" },
  { date: "5月18日", amount: "200ml" },
  { date: "5月14日", amount: "150ml" },
];

export function PlantDetail({ plant, onBack }: { plant: Plant; onBack: () => void }) {
  const [watered, setWatered] = useState(false);
  const [reminder, setReminder] = useState(false);

  const handleWater = () => {
    setWatered(true);
    setTimeout(() => setWatered(false), 2500);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="absolute inset-0 bg-background z-20 overflow-y-auto"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Hero */}
      <div className="relative h-64">
        <img
          src={`${plant.image}&w=600&h=512&fit=crop&auto=format`}
          alt={plant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        <button
          onClick={onBack}
          className="absolute top-5 left-4 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm"
        >
          <ArrowLeft size={18} />
        </button>
        <button className="absolute top-5 right-4 p-2 rounded-full bg-black/30 text-white backdrop-blur-sm">
          <Edit3 size={18} />
        </button>
        <div className="absolute bottom-4 left-4">
          <h1 className="text-white" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.7rem" }}>
            {plant.name}
          </h1>
          <p className="text-white/80 text-sm italic">{plant.species}</p>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          <StatCard icon={<Droplets size={16} />} label="湿度" value={`${plant.moisture}%`} />
          <StatCard icon={<Sun size={16} />} label="光照" value={plant.sunlight} />
          <StatCard icon={<Thermometer size={16} />} label="温度" value="22°C" />
          <StatCard icon={<Wind size={16} />} label="湿气" value="中等" />
        </div>

        {/* Moisture bar */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <p className="text-card-foreground text-sm font-medium">土壤湿度</p>
            <p className="text-primary text-sm font-medium">{plant.moisture}%</p>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${plant.moisture}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-accent"
            />
          </div>
          <p className="text-muted-foreground text-xs mt-2">
            {plant.moisture > 60 ? "水分充足，植物状态良好" : plant.moisture > 30 ? "水分适中，可适当补充" : "土壤干燥，建议及时浇水"}
          </p>
        </div>

        {/* Watering history */}
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h3 className="text-card-foreground text-sm font-medium mb-3">浇水记录</h3>
          <div className="space-y-2">
            {wateringHistory.map((h, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                    <Droplets size={12} className="text-primary" />
                  </div>
                  <span className="text-card-foreground text-sm">{h.date}</span>
                </div>
                <span className="text-muted-foreground text-xs">{h.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Care tips */}
        <div className="bg-secondary rounded-2xl p-4">
          <h3 className="text-card-foreground text-sm font-medium mb-2">养护小贴士</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            保持土壤微湿润，避免积水。每月施一次薄肥，夏季适当遮阴，冬季减少浇水频率。叶片发黄可能是光照不足或根部积水的信号。
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <button
            onClick={() => setReminder(!reminder)}
            className={`flex-1 py-3 rounded-2xl border text-sm flex items-center justify-center gap-2 transition-colors ${
              reminder
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground border-border"
            }`}
          >
            <Bell size={16} />
            {reminder ? "已设置提醒" : "设置提醒"}
          </button>

          <motion.button
            onClick={handleWater}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <AnimatePresence mode="wait">
              {watered ? (
                <motion.span
                  key="done"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2"
                >
                  <Check size={16} /> 已浇水！
                </motion.span>
              ) : (
                <motion.span
                  key="water"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2"
                >
                  <Droplets size={16} /> 立即浇水
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
