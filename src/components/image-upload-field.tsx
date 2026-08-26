import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadPostImage, validateImageFile } from "@/lib/post-image-upload";

export function ImageUploadField({
  value,
  onChange,
  label = "Cover image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (file: File) => {
    const invalid = validateImageFile(file);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setUploading(true);
    try {
      const url = await uploadPostImage(file);
      onChange(url);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void pick(f);
        }}
      />
      {value ? (
        <div className="mt-1.5 space-y-3">
          <img src={value} alt={label} className="max-h-56 w-full rounded-lg object-cover" />
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
              Replace image
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              <X className="mr-1 h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="mt-1.5 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {uploading ? "Uploading…" : "Click to upload an image (max 10MB)"}
        </button>
      )}
    </div>
  );
}
