"use server";
import { revalidatePath } from "next/cache";
import type { InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

/** Agents triage their own inbox; admins can triage any inquiry. */
export async function setInquiryStatus(inquiryId: string, status: InquiryStatus) {
  const user = await requireRole("AGENT", "ADMIN");

  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: { property: { select: { agentId: true } } },
  });
  if (!inquiry) return { ok: false, message: "Inquiry not found." };
  if (user.role !== "ADMIN" && inquiry.property.agentId !== user.id) {
    return { ok: false, message: "That inquiry is not yours." };
  }

  await prisma.inquiry.update({ where: { id: inquiryId }, data: { status } });
  revalidatePath("/dashboard/agent/inquiries");
  revalidatePath("/dashboard/admin/inquiries");
  return { ok: true, message: "Inquiry updated." };
}
