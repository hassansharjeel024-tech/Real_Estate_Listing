"use client";
import { useActionState } from "react";
import { changePassword } from "@/actions/profile";
import { Button } from "@/components/ui/button";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, null);

  return (
    <form action={formAction} className="card max-w-md space-y-4 p-6">
      <div>
        <label className="label" htmlFor="currentPassword">Current password</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          className="input"
        />
        {state?.fieldErrors?.currentPassword && (
          <p className="field-error">{state.fieldErrors.currentPassword[0]}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="newPassword">New password</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          className="input"
        />
        {state?.fieldErrors?.newPassword && (
          <p className="field-error">{state.fieldErrors.newPassword[0]}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="confirmNewPassword">Confirm new password</label>
        <input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          autoComplete="new-password"
          className="input"
        />
        {state?.fieldErrors?.confirmNewPassword && (
          <p className="field-error">{state.fieldErrors.confirmNewPassword[0]}</p>
        )}
      </div>

      {state && (
        <p
          role="status"
          className={state.ok ? "text-sm text-success" : "text-sm text-danger"}
        >
          {state.message}
        </p>
      )}

      <Button type="submit" loading={pending}>Update password</Button>
    </form>
  );
}