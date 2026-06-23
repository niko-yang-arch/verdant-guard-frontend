import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1614594975525-e45190c55d0b",
  "https://images.unsplash.com/photo-1636525653613-2a3a05c00759",
  "https://images.unsplash.com/photo-1600411833867-a85cd3c2349e",
  "https://images.unsplash.com/photo-1509423350716-97f9360b4e09",
  "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a",
  "https://images.unsplash.com/photo-1626929252164-27c26d107b00",
];

type PlantImagePickerProps = {
  image: string;
  uploading?: boolean;
  onImageChange: (image: string) => void;
  onFileChange: (file: File | null) => void;
};

const previewUrl = (url: string, query: string) => {
  if (!url || url.startsWith("blob:") || url.startsWith("data:")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
};

export function PlantImagePicker({
  image,
  uploading = false,
  onImageChange,
  onFileChange,
}: PlantImagePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState("");
  const displayImage = localPreview || image;

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const clearLocalPreview = () => {
    setLocalPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
  };

  const chooseFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("图片不能超过 5MB");
      return;
    }

    clearLocalPreview();
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    onImageChange(objectUrl);
    onFileChange(file);
  };

  const chooseSample = (url: string) => {
    clearLocalPreview();
    onFileChange(null);
    onImageChange(url);
  };

  const clearImage = () => {
    clearLocalPreview();
    onFileChange(null);
    onImageChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2.5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => chooseFile(event.target.files?.[0])}
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="relative w-full h-36 rounded-xl bg-secondary border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 overflow-hidden"
        style={
          displayImage
            ? {
                backgroundImage: `url(${previewUrl(displayImage, "w=600&h=280&fit=crop")})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {displayImage && <div className="absolute inset-0 bg-black/20" />}
        {uploading ? (
          <span className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs text-primary shadow-sm">
            <Loader2 size={14} className="animate-spin" />
            上传中
          </span>
        ) : (
          <span className="relative z-10 flex flex-col items-center justify-center gap-2">
            {displayImage ? (
              <ImagePlus size={24} className="text-white drop-shadow" />
            ) : (
              <Camera size={24} className="text-muted-foreground" />
            )}
            <span className={displayImage ? "text-white text-xs drop-shadow" : "text-muted-foreground text-xs"}>
              从相册选择图片
            </span>
          </span>
        )}
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-xl border border-border bg-input-background px-3 py-2.5 text-xs font-medium text-foreground inline-flex items-center justify-center gap-1.5"
        >
          <ImagePlus size={15} />
          本地相册
        </button>
        {displayImage && (
          <button
            type="button"
            onClick={clearImage}
            className="rounded-xl border border-border bg-input-background px-3 py-2.5 text-xs font-medium text-muted-foreground inline-flex items-center justify-center gap-1.5"
          >
            <X size={15} />
            清除
          </button>
        )}
      </div>

      <div className="grid grid-cols-6 gap-1.5">
        {SAMPLE_IMAGES.map((url) => (
          <button
            type="button"
            key={url}
            onClick={() => chooseSample(url)}
            className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
              image === url && !localPreview ? "border-primary" : "border-transparent"
            }`}
          >
            <img src={previewUrl(url, "w=80&h=80&fit=crop")} className="w-full h-full object-cover" alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
