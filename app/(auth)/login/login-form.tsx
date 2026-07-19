"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginInput } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    if (!response.ok) return setError(payload.error ?? "Sign in failed.");

    // Honour ?next= set by middleware, otherwise land on the right dashboard.
    const next = params.get("next")
      ?? (payload.data.role === "ADMIN" ? "/dashboard/admin"
        : payload.data.role === "AGENT" ? "/dashboard/agent" : "/properties");
    router.push(next);
    router.refresh(); // re-render the server layout so the navbar sees the session
  }

  return (
    <div className="card p-8">
      <h1 className="font-display text-2xl">Sign in</h1>
     <p className="mt-1 text-sm text-muted">Welcome back to ApnaGhar.</p>

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" className="input"
            aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" className="input"
            aria-invalid={!!errors.password} {...register("password")} />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <Button type="submit" loading={isSubmitting} className="w-full">Sign in</Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New here? <Link href="/register" className="font-medium text-brand hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
