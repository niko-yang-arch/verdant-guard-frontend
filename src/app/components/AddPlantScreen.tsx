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
    frequency: "7",
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
      className="absolute inset-0 bg-background z-20 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center gap-3 border-b border-border">
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

      <div className="px-5 py-5 space-y-5 pb-24">
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
          {/* Presets */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {FREQ_PRESETS.map((p) => {
              const active =
                form.frequency === String(p.frequency) && form.frequencyType === p.type;
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    set("frequency", String(p.frequency));
                    setForm((f) => ({ ...f, frequencyType: p.type }));
                  }}
                  className={`py-2 rounded-xl text-sm border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-card-foreground border-border"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Custom */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <input
                type="number"
                value={form.frequency}
                onChange={(e) => set("frequency", e.target.value)}
                min={1}
                max={365}
                className={inputClass(errors.frequency)}
              />
            </div>
            <select
              value={form.frequencyType}
              onChange={(e) => setForm((f) => ({ ...f, frequencyType: e.target.value as FrequencyType }))}
              className="bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none"
            >
              <option value="DAYS">天/次</option>
              <option value="TIMES_PER_DAY">次/天</option>
            </select>
          </div>
          {errors.frequency && <p className="text-destructive text-xs mt-1">{errors.frequency}</p>}
          <p className="text-muted-foreground text-xs mt-1.5">
            {form.frequencyType === "DAYS"
              ? `每 ${form.frequency || "?"} 天浇一次水`
              : `每天浇 ${form.frequency || "?"} 次水`}
          </p>
        </Field>
      </div>

      {/* Save button */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-3 bg-background border-t border-border">
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
    </motion.div>
  );
}
