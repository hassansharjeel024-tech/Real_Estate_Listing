"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: React.ReactNode };

/** Dashboard sidebar. Rendered as a horizontal scroller below `md`. */
export function Sidebar({ items, heading }: { items: NavItem[]; heading: string }) {
  const pathname = usePathname();

  return (
    <aside className="md:w-60 md:shrink-0">
      <p className="mb-3 hidden px-3 text-xs font-semibold uppercase tracking-wider text-muted md:block">
        {heading}
      </p>
      <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-brand/10 font-medium text-brand" : "text-muted hover:bg-line/40 hover:text-ink",
              )}
            >
            {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
