"use client";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/actions/favorites";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/** Optimistic save toggle: flips immediately, reverts if the server disagrees. */
export function FavoriteButton({ propertyId, initialSaved = false }: {
  propertyId: string; initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function onClick() {
    const previous = saved;
    setSaved(!previous);
    startTransition(async () => {
      const result = await toggleFavorite(propertyId);
      if (!result.ok) {
        setSaved(previous);
        toast(result.message, "error");
      }
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved listings" : "Save this listing"}
      className="grid h-8 w-8 place-items-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur transition-transform hover:scale-105"
    >
      <Heart className={cn("h-4 w-4", saved && "fill-danger text-danger")} />
    </button>
  );
}
