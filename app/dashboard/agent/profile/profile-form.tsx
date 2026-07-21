"use client";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { AvatarUploader } from "@/components/dashboard/avatar-uploader";
import { updateAgentProfile } from "@/actions/profile";
import type { AgentProfileInput } from "@/lib/validations";

/** Progressive-enhancement form: works with `useActionState`, no client fetch. */
export function ProfileForm({ initial }: { initial: AgentProfileInput }) {
  const [state, action, pending] = useActionState(updateAgentProfile, null);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl ?? "");

  return (
    <form action={action} className="card space-y-4 p-6">
      {state && (
        <p role="status" className={`rounded-lg px-3 py-2 text-sm ${
          state.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
        }`}>
          {state.message}
        </p>
      )}

      <div>
        <label className="label">Photo</label>
        <AvatarUploader value={photoUrl} onChange={setPhotoUrl} />
        <input type="hidden" name="photoUrl" value={photoUrl} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" className="input" defaultValue={initial.name} required />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" className="input" defaultValue={initial.phone ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="company">Agency / company</label>
          <input id="company" name="company" className="input" defaultValue={initial.company ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="licenseNo">Licence number</label>
          <input id="licenseNo" name="licenseNo" className="input" defaultValue={initial.licenseNo ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="whatsapp">WhatsApp</label>
          <input id="whatsapp" name="whatsapp" className="input" defaultValue={initial.whatsapp ?? ""} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="bio">About you</label>
        <textarea id="bio" name="bio" rows={4} className="input resize-y" defaultValue={initial.bio ?? ""}
          placeholder="Areas you cover, years in the market, what you specialise in." />
      </div>

      <Button type="submit" loading={pending}>Save profile</Button>
    </form>
  );
}