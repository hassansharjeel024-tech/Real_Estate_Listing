"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<RegisterInput>({
      resolver: zodResolver(registerSchema),
      defaultValues: { role: params.get("role") === "AGENT" ? "AGENT" : "BUYER" },
    });

  const role = watch("role");

  async function onSubmit(values: RegisterInput) {
    setError(null);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error ?? "Registration failed.");

    router.push(values.role === "AGENT" ? "/dashboard/agent" : "/properties");
    router.refresh();
  }

  return (
    <div className="card p-8">
      <h1 className="font-display text-2xl">Create an account</h1>
      <p className="mt-1 text-sm text-muted">It takes about a minute.</p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
        {(["BUYER", "AGENT"] as const).map((value) => (
          <button key={value} type="button" role="radio" aria-checked={role === value}
            onClick={() => setValue("role", value)}
            className={cn("rounded-lg border px-4 py-3 text-left text-sm transition-colors",
              role === value ? "border-brand bg-brand/5" : "border-line hover:border-brand/50")}>
            <span className="block font-medium">{value === "BUYER" ? "I'm looking to buy" : "I'm an agent"}</span>
            <span className="mt-0.5 block text-xs text-muted">
              {value === "BUYER" ? "Search, save and enquire" : "Publish and manage listings"}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" autoComplete="name" className="input" {...register("name")} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className="input" {...register("email")} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone (optional)</label>
          <input id="phone" autoComplete="tel" className="input" placeholder="+92 300 1234567" {...register("phone")} />
          {errors.phone && <p className="field-error">{errors.phone.message}</p>}
        </div>

        {role === "AGENT" && (
          <div>
            <label className="label" htmlFor="company">Agency / company (optional)</label>
            <input id="company" className="input" {...register("company")} />
          </div>
        )}

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" className="input" {...register("password")} />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type="password" autoComplete="new-password" className="input" {...register("confirmPassword")} />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already registered? <Link href="/login" className="font-medium text-brand hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
