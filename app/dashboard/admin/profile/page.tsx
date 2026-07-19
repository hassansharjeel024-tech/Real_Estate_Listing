import type { Metadata } from "next";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";
import { requireRole } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin profile" };

export default async function AdminProfilePage() {
  await requireRole("ADMIN");

  return (
    <>
      <h1 className="font-display text-3xl">Profile</h1>
      <p className="mt-1 text-sm text-muted">Manage your account security.</p>

      <div className="mt-6">
        <h2 className="mb-3 font-display text-lg">Change password</h2>
        <ChangePasswordForm />
      </div>
    </>
  );
}