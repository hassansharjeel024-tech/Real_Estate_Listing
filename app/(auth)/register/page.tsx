import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/states";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[32rem] w-full" />}>
      <RegisterForm />
    </Suspense>
  );
}
