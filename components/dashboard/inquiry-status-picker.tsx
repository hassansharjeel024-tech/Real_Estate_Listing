"use client";
import { useTransition } from "react";
import type { InquiryStatus } from "@prisma/client";
import { setInquiryStatus } from "@/actions/inquiries";
import { useToast } from "@/components/ui/toast";

const OPTIONS: { value: InquiryStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "READ", label: "Read" },
  { value: "RESPONDED", label: "Responded" },
  { value: "CLOSED", label: "Closed" },
];

export function InquiryStatusPicker({ inquiryId, status }: { inquiryId: string; status: InquiryStatus }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <select
      className="input h-8 w-36 text-xs"
      defaultValue={status}
      disabled={pending}
      aria-label="Inquiry status"
      onChange={(e) => {
        const next = e.target.value as InquiryStatus;
        startTransition(async () => {
          const result = await setInquiryStatus(inquiryId, next);
          if (!result.ok) toast(result.message, "error");
        });
      }}
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
