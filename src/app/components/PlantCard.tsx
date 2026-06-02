import { motion } from "motion/react";
import { Droplets, Sun, Clock, ChevronRight } from "lucide-react";

export type Plant = {
  id: number;
  name: string;
  species: string;
  image: string;
  waterDays: number; // days until next watering
  lastWatered: string;
  sunlight: "低光" | "散射光" | "直射光";
  moisture: number; // 0-100
  health: "极好" | "良好" | "需关注";
};

const healthColors: Record<Plant["health"], string> = {
  极好: "#4caf50",
  良好: "#8bc34a",
  需关注: "#ff9800",
};

const moistureGradient = (pct: number) => {
  if (pct > 60) return "#4caf8a";
  if (pct > 30) return "#7ec874";
  return "#f0a050";
};

export function PlantCard({ plant, onClick }: { plant: Plant; onClick: () => void }) {
  const isUrgent = plant.waterDays <= 1;

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border cursor-pointer"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="relative h-40 bg-muted overflow-hidden">
        <img
          src={`${plant.image}&w=400&h=320&fit=crop&auto=format`}
          alt={plant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div
          className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-white text-xs font-medium"
          style={{ backgroundColor: healthColors[plant.health] }}
        >
          {plant.health}
        </div>
        {isUrgent && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-orange-500 text-white text-xs font-medium flex items-center gap-1">
            <Droplets size={10} />
            需浇水
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-card-foreground" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.05rem" }}>
              {plant.name}
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5 italic">{plant.species}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground mt-1" />
        </div>

        {/* Moisture bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Droplets size={11} />
              土壤湿度
            </span>
            <span className="text-xs text-muted-foreground">{plant.moisture}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${plant.moisture}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: moistureGradient(plant.moisture) }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            上次浇水：{plant.lastWatered}
          </span>
          <span className="flex items-center gap-1">
            <Sun size={11} />
            {plant.sunlight}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <p className={`text-xs font-medium ${isUrgent ? "text-orange-500" : "text-primary"}`}>
            {plant.waterDays === 0
              ? "今天需要浇水 💧"
              : plant.waterDays === 1
              ? "明天需要浇水"
              : `${plant.waterDays} 天后浇水`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
