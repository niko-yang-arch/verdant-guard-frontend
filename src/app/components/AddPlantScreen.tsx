import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Camera, Check } from "lucide-react";
import { Plant, FrequencyType } from "../api";

type FormData = {
  name: string;
  species: string;
  frequency: string;
  frequencyType: FrequencyType;
  image: string;
};

const FREQ_PRESETS = [
  { label: "每天", frequency: 1, type: "DAYS" as FrequencyType },
  { label: "3天", frequency: 3, type: "DAYS" as FrequencyType },
  { label: "5天", frequency: 5, type: "DAYS" as FrequencyType },
  { label: "7天", frequency: 7, type: "DAYS" as FrequencyType },
  { label: "两周", frequency: 14, type: "DAYS" as FrequencyType },
  { label: "一月", frequency: 30, type: "DAYS" as FrequencyType },
];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1614594975525-e45190c55d0b",
  "https://images.unsplash.com/photo-1636525653613-2a3a05c00759",
  "https://images.unsplash.com/photo-1600411833867-a85cd3c2349e",
  "https://images.unsplash.com/photo-1509423350716-97f9360b4e09",
  "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a",
  "https://images.unsplash.com/photo-1626929252164-27c26d107b00",
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-card-foreground text-sm font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function AddPlantScreen({
  onBack,
  onSave,
}: {
  onBack: () => void;
  onSave: (plant: Omit<Plant, "id" | "createdAt" | "historyCount" | "lastWatered">) => void;
}) {
  const [form, setForm] = useState<FormData>({
    name: "",
    species: "",
    frequency: "1",
    frequencyType: "DAYS",
    image: "",
  });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = (key: keyof FormData, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "请输入植物名称";
    if (!form.species.trim()) e.species = "请输入植物种类";
    const freq = parseInt(form.frequency);
    if (isNaN(freq) || freq < 1 || freq > 365) e.frequency = "请输入 1-365 之间的数字";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaved(true);
    setTimeout(() => {
      onSave({
        name: form.name.trim(),
        species: form.species.trim(),
        frequency: parseInt(form.frequency),
        frequencyType: form.frequencyType,
        image: form.image || null,
      });
      onBack();
    }, 800);
  };

  const inputClass = (err?: string) =>
    `w-full bg-input-background border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-colors ${
      err ? "border-destructive" : "border-border"
    }`;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
      className="absolute inset-0 bg-background z-50 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ fontFamily: "'DM Sans', sans-serif", touchAction: 'pan-y', overscrollBehavior: 'contain' }}
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3 border-b border-border sticky top-0 bg-background z-10">
        <button onClick={onBack} className="p-1.5">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1
          className="flex-1 text-foreground"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.3rem" }}
        >
          添加新植物
        </h1>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Photo picker */}
        <Field label="植物图片（可选）">
          <div className="space-y-2">
            <div
              className="w-full h-36 rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 overflow-hidden cursor-pointer"
              style={form.image ? { backgroundImage: `url(${form.image}?w=600&h=280&fit=crop)`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
            >
              {!form.image && (
                <>
                  <Camera size={24} className="text-muted-foreground" />
                  <p className="text-muted-foreground text-xs">选择一张示例图片</p>
                </>
              )}
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {SAMPLE_IMAGES.map((url) => (
                <button
                  key={url}
                  onClick={() => set("image", url)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    form.image === url ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img src={`${url}?w=80&h=80&fit=crop`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </Field>

        <Field label="植物名称 *">
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="如：发财树"
            className={inputClass(errors.name)}
            maxLength={50}
          />
          {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
        </Field>

        <Field label="植物种类 *">
          <input
            value={form.species}
            onChange={(e) => set("species", e.target.value)}
            placeholder="如：马拉巴栗"
            className={inputClass(errors.species)}
            maxLength={50}
          />
          {errors.species && <p className="text-destructive text-xs mt-1">{errors.species}</p>}
        </Field>

        <Field label="浇水频率 *">
          {/* Tab selector */}
          <div className="flex gap-2 mb-4 p-1 bg-secondary rounded-xl">
            <button
              type="button"
              onClick={() => {
                set("frequencyType", "DAYS");
                set("frequency", "7");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                form.frequencyType === "DAYS" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              单次/多天一次
            </button>
            <button
              type="button"
              onClick={() => {
                set("frequencyType", "TIMES_PER_DAY");
                set("frequency", "2");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                form.frequencyType === "TIMES_PER_DAY" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              一天多次
            </button>
          </div>

          {/* Slider */}
          <div
            className="mb-4 cursor-pointer select-none"
            style={{ touchAction: 'none' }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
              const percent = x / rect.width;
              const maxVal = form.frequencyType === "TIMES_PER_DAY" ? 12 : 30;
              const minVal = form.frequencyType === "TIMES_PER_DAY" ? 2 : 1;
              const newValue = Math.round(minVal + percent * (maxVal - minVal));
              set("frequency", String(Math.max(minVal, newValue)));

              const onMove = (e: MouseEvent) => {
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const percent = x / rect.width;
                const newValue = Math.round(minVal + percent * (maxVal - minVal));
                set("frequency", String(Math.max(minVal, newValue)));
              };
              const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
              };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
              const percent = x / rect.width;
              const maxVal = form.frequencyType === "TIMES_PER_DAY" ? 12 : 30;
              const minVal = form.frequencyType === "TIMES_PER_DAY" ? 2 : 1;
              const newValue = Math.round(minVal + percent * (maxVal - minVal));
              set("frequency", String(Math.max(minVal, newValue)));

              const onMove = (e: TouchEvent) => {
                e.preventDefault();
                const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
                const percent = x / rect.width;
                const newValue = Math.round(minVal + percent * (maxVal - minVal));
                set("frequency", String(Math.max(minVal, newValue)));
              };
              const onEnd = () => {
                document.removeEventListener('touchmove', onMove);
                document.removeEventListener('touchend', onEnd);
              };
              document.addEventListener('touchmove', onMove, { passive: false });
              document.addEventListener('touchend', onEnd);
            }}
          >
            <div className="relative h-2 bg-white rounded-full">
              <div
                className="absolute h-full bg-primary rounded-full"
                style={{
                  width: form.frequencyType === "TIMES_PER_DAY"
                    ? `${((parseInt(form.frequency) - 1.6) / 10.4) * 100}%`
                    : `${(parseInt(form.frequency) / 30) * 100}%`
                }}
              />
              <div
                className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full shadow-md -top-1.5 transition-transform active:scale-110"
                style={{
                  left: form.frequencyType === "TIMES_PER_DAY"
                    ? `calc(${((parseInt(form.frequency) - 1.6) / 10.4) * 100}% - 10px)`
                    : `calc(${(parseInt(form.frequency) / 30) * 100}% - 10px)`
                }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{form.frequencyType === "TIMES_PER_DAY" ? "2次" : "1天"}</span>
            <span className="text-primary font-medium">
              {form.frequencyType === "TIMES_PER_DAY"
                ? `每天 ${form.frequency} 次`
                : `每 ${form.frequency} 天`}
            </span>
            <span>{form.frequencyType === "TIMES_PER_DAY" ? "12次" : "30天"}</span>
          </div>

          {/* Type selector */}
          <div className="flex gap-2 items-center mt-4">
            <div className="flex-1">
              <input
                type="number"
                value={form.frequency}
                onChange={(e) => set("frequency", e.target.value)}
                min={1}
                max={form.frequencyType === "TIMES_PER_DAY" ? 12 : 365}
                className={inputClass(errors.frequency)}
              />
            </div>
            <div className="px-4 py-2.5 text-sm text-muted-foreground">
              {form.frequencyType === "TIMES_PER_DAY" ? "次/天" : "天/次"}
            </div>
          </div>
          {errors.frequency && <p className="text-destructive text-xs mt-1">{errors.frequency}</p>}
          <p className="text-muted-foreground text-xs mt-1.5">
            {form.frequencyType === "TIMES_PER_DAY"
              ? `每天浇 ${form.frequency || "?"} 次水`
              : `每 ${form.frequency || "?"} 天浇一次水`}
          </p>
        </Field>

        {/* Save button */}
        <div className="px-5 pb-8 pt-3">
          <motion.button
            onClick={handleSave}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check size={18} /> 已添加！
              </>
            ) : (
              "添加植物"
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
