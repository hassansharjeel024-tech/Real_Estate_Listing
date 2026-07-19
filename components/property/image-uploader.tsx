"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/**
 * Uploads straight to Vercel Blob via /api/upload and hands the resulting URLs
 * back to the parent form. The first image is the featured one; the star lets
 * the agent promote any other image to that slot.
 */
export function ImageUploader({ value, onChange, featured, onFeaturedChange }: {
  value: string[];
  onChange: (urls: string[]) => void;
  featured?: string;
  onFeaturedChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (value.length + files.length > 20) {
      toast("A listing can hold up to 20 photos.", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Upload failed.");

      const urls: string[] = payload.data.map((b: { url: string }) => b.url);
      const next = [...value, ...urls];
      onChange(next);
      if (!featured && next[0]) onFeaturedChange(next[0]);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url: string) {
    const next = value.filter((u) => u !== url);
    onChange(next);
    if (featured === url) onFeaturedChange(next[0] ?? "");
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((url) => (
          <div key={url} className={cn(
            "group relative aspect-square overflow-hidden rounded-lg border-2",
            featured === url ? "border-accent" : "border-line",
          )}>
            <Image src={url} alt="" fill sizes="150px" className="object-cover" />
            <button type="button" onClick={() => remove(url)} aria-label="Remove photo"
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-paper">
              <X className="h-3 w-3" />
            </button>
            <button type="button" onClick={() => onFeaturedChange(url)} aria-label="Use as main photo"
              className="absolute left-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-paper">
              <Star className={cn("h-3 w-3", featured === url && "fill-accent text-accent")} />
            </button>
          </div>
        ))}

        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="grid aspect-square place-items-center rounded-lg border-2 border-dashed border-line text-muted hover:border-brand hover:text-brand">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <span className="flex flex-col items-center gap-1 text-xs">
              <ImagePlus className="h-5 w-5" /> Add photos
            </span>
          )}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple
        className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
      <p className="mt-2 text-xs text-muted">
        JPEG, PNG, WebP or AVIF up to 5 MB each. The starred photo appears on search cards.
      </p>
    </div>
  );
}
