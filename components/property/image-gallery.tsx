"use client";
import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Gallery with keyboard-reachable thumbnails and arrow navigation. */
export function ImageGallery({ images, title }: { images: { id: string; url: string; alt: string | null }[]; title: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return <div className="grid aspect-[16/9] place-items-center rounded-xl bg-line/40 text-sm text-muted">
      No photos have been added to this listing yet.
    </div>;
  }

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-line/40">
        <Image src={images[index].url} alt={images[index].alt ?? title} fill priority
          sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous photo"
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface/90 shadow">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={() => go(1)} aria-label="Next photo"
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface/90 shadow">
              <ChevronRight className="h-5 w-5" />
            </button>
            <p className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs text-paper">
              {index + 1} / {images.length}
            </p>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <button key={image.id} onClick={() => setIndex(i)} aria-label={`View photo ${i + 1}`}
              aria-current={i === index}
              className={cn("relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2",
                i === index ? "border-brand" : "border-transparent opacity-70 hover:opacity-100")}>
              <Image src={image.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
