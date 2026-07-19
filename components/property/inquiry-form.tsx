"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { inquirySchema, type InquiryInput } from "@/lib/validations";

/**
 * The only channel between buyer and agent. The buyer's phone number is never
 * attached automatically — if they want a call back they say so in the message.
 */
export function InquiryForm({ propertyId, canInquire, reason }: {
  propertyId: string;
  canInquire: boolean;
  reason?: string;
}) {
  const toast = useToast();
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { propertyId, message: "", contactPreference: "" },
  });

  if (!canInquire) {
    return (
      <div className="card p-5">
        <h3 className="font-display text-lg">Contact the agent</h3>
        <p className="mt-2 text-sm text-muted">{reason ?? "Sign in as a buyer to send an inquiry."}</p>
        <Link href={`/login?next=/properties/${propertyId}`} className="mt-3 inline-block">
          <Button size="sm">Sign in to inquire</Button>
        </Link>
      </div>
    );
  }

  if (isSubmitSuccessful) {
    return (
      <div className="card p-5">
        <h3 className="font-display text-lg">Inquiry sent</h3>
        <p className="mt-2 text-sm text-muted">
          The agent can see your message in their dashboard and will reply to your
          registered email.
        </p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => reset()}>
          Send another message
        </Button>
      </div>
    );
  }

  async function onSubmit(values: InquiryInput) {
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    if (!response.ok) {
      toast(payload.error ?? "The inquiry did not send.", "error");
      throw new Error(payload.error); // keeps isSubmitSuccessful false
    }
    toast("Inquiry sent to the agent.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-5">
      <div>
        <h3 className="font-display text-lg">Contact the agent</h3>
        <p className="mt-1 text-xs text-muted">Your phone number stays private.</p>
      </div>

      <div>
        <label className="label" htmlFor="message">Your message</label>
        <textarea id="message" rows={4} className="input resize-y"
          placeholder="I'd like to view this property this weekend. Is it still available?"
          aria-invalid={!!errors.message}
          {...register("message")} />
        {errors.message && <p className="field-error">{errors.message.message}</p>}
      </div>

      <div>
        <label className="label" htmlFor="contactPreference">How should they reach you? (optional)</label>
        <input id="contactPreference" className="input" placeholder="Email is fine, or call after 6pm"
          {...register("contactPreference")} />
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full">
        <Send className="h-4 w-4" /> Send inquiry
      </Button>
    </form>
  );
}
