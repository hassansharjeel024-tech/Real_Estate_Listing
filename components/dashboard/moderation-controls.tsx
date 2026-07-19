"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ListingStatus } from "@prisma/client";
import { Check, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deletePropertyAsAdmin, moderateProperty, toggleFeatured } from "@/actions/admin";

/**
 * The admin's decision surface for one listing. Rejection requires a note,
 * because "rejected, no reason given" is a support ticket waiting to happen.
 */
export function ModerationControls({ propertyId, status, isFeatured }: {
  propertyId: string; status: ListingStatus; isFeatured: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function run(fn: () => Promise<{ ok: boolean; message: string } | null>) {
    startTransition(async () => {
      const result = await fn();
      if (result) toast(result.message, result.ok ? "success" : "error");
      router.refresh();
    });
  }

  function decide(next: "APPROVED" | "REJECTED", note?: string) {
    const formData = new FormData();
    formData.set("status", next);
    if (note) formData.set("rejectionNote", note);
    run(() => moderateProperty(propertyId, formData));
    setRejecting(false);
  }

  if (rejecting) {
    return (
      <form
        className="w-full space-y-2 sm:w-64"
        onSubmit={(e) => {
          e.preventDefault();
          const note = new FormData(e.currentTarget).get("rejectionNote") as string;
          decide("REJECTED", note);
        }}
      >
        <label className="label text-xs" htmlFor={`note-${propertyId}`}>Why is this rejected?</label>
        <textarea id={`note-${propertyId}`} name="rejectionNote" rows={3} required maxLength={300}
          className="input resize-none text-xs" placeholder="Photos don't match the address given." />
        <div className="flex gap-2">
          <Button type="submit" size="sm" variant="danger" loading={pending}>Reject listing</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setRejecting(false)}>Cancel</Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-row gap-2 sm:w-40 sm:flex-col">
      {status !== "APPROVED" && (
        <Button size="sm" loading={pending} onClick={() => decide("APPROVED")}>
          <Check className="h-4 w-4" /> Approve
        </Button>
      )}
      {status !== "REJECTED" && (
        <Button size="sm" variant="secondary" onClick={() => setRejecting(true)}>
          <X className="h-4 w-4" /> Reject
        </Button>
      )}
      <Button size="sm" variant="secondary" loading={pending} onClick={() => run(() => toggleFeatured(propertyId))}>
        <Star className={isFeatured ? "h-4 w-4 fill-accent text-accent" : "h-4 w-4"} />
        {isFeatured ? "Unfeature" : "Feature"}
      </Button>

      {confirmDelete ? (
        <div className="flex gap-1">
          <Button size="sm" variant="danger" loading={pending}
            onClick={() => run(() => deletePropertyAsAdmin(propertyId))}>Confirm</Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Keep</Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4 text-danger" /> Delete
        </Button>
      )}
    </div>
  );
}
