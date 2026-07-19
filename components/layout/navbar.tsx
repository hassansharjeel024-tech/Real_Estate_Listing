"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Home, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { initials } from "@/lib/utils";

type SessionUser = { id: string; name: string; role: "ADMIN" | "AGENT" | "BUYER" } | null;

export function Navbar({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const dashboardHref =
    user?.role === "ADMIN" ? "/dashboard/admin"
    : user?.role === "AGENT" ? "/dashboard/agent"
    : "/favorites";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-brand text-white">
            <Home className="h-4 w-4" />
          </span>
          <span className="font-display text-lg tracking-tight">ApnaGhar</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link href="/properties" className="text-sm text-muted hover:text-ink">Buy</Link>
          <Link href="/properties?featured=true" className="text-sm text-muted hover:text-ink">Featured</Link>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <Link href={dashboardHref} className="flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                {user.role === "BUYER" ? <Heart className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                {user.role === "BUYER" ? "Saved" : "Dashboard"}
              </Link>
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                {initials(user.name)}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="secondary" size="sm">Sign in</Button></Link>
              <Link href="/register"><Button size="sm">List a property</Button></Link>
            </div>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-surface px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link href="/properties" onClick={() => setOpen(false)} className="text-sm">Buy</Link>
            <Link href="/properties?featured=true" onClick={() => setOpen(false)} className="text-sm">Featured</Link>
            {user ? (
              <>
                <Link href={dashboardHref} onClick={() => setOpen(false)} className="text-sm">
                  {user.role === "BUYER" ? "Saved listings" : "Dashboard"}
                </Link>
                <button onClick={signOut} className="text-left text-sm text-danger">Sign out</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="text-sm">Sign in</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="text-sm">Create account</Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
