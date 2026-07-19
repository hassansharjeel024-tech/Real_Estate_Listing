"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { toggleUserActive } from "@/actions/admin";

/** Deactivating hides the user's listings and blocks their next login. */
export function UserActiveToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={isActive ? "secondary" : "primary"}
      loading={pending}
      onClick={() => startTransition(async () => {
        const result = await toggleUserActive(userId);
        if (result) toast(result.message, result.ok ? "success" : "error");
        router.refresh();
      })}
    >
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
