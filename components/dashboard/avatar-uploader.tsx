"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";

/**
 * Single-image uploader for the agent's profile photo.
 * Reuses the same /api/upload endpoint as the property gallery,
 * but keeps only one URL instead of an array.
 */
export function AvatarUploader({ value, onChange }: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", files[0]);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Upload failed.");

      const url: string = payload.data[0].url;
      onChange(url);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload failed.", "error");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      {value ? (
        <div className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-line">
          <Image src={value} alt="" fill sizes="80px" className="object-cover" />
          <button type="button" onClick={() => onChange("")} aria-label="Remove photo"
            className="absolute inset-0 hidden place-items-center bg-ink/60 text-paper group-hover:grid">
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-dashed border-line text-muted">
          <ImagePlus className="h-6 w-6" />
        </div>
      )}

      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
        className="input flex w-auto cursor-pointer items-center gap-2 text-sm">
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {value ? "Change photo" : "Upload photo"}
      </button>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}