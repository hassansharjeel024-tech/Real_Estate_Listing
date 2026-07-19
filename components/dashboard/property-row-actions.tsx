"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteProperty } from "@/actions/properties";

/** Edit / delete for one row. Deletion asks for confirmation inline. */
export function PropertyRowActions({ propertyId, title }: { propertyId: string; title: string }) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await deleteProperty(propertyId);
      toast(result.message, result.ok ? "success" : "error");
      setConfirming(false);
      if (result.ok) router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-muted">Delete “{title.slice(0, 20)}…”?</span>
        <Button size="sm" variant="danger" loading={pending} onClick={remove}>Delete</Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Keep</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/dashboard/agent/properties/${propertyId}/edit`}>
        <Button size="sm" variant="ghost" aria-label={`Edit ${title}`}><Pencil className="h-4 w-4" /></Button>
      </Link>
      <Button size="sm" variant="ghost" aria-label={`Delete ${title}`} onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4 text-danger" />
      </Button>
    </div>
  );
}
