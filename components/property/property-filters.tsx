"use client";
/**
 * URL is the state. Every control writes to the query string, which means
 * filters survive refresh, back/forward and sharing — and the server component
 * re-renders results without any client fetching.
 */
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Option = { id: string; name: string; slug: string };

export function PropertyFilters({ cities, types }: { cities: Option[]; types: Option[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(params.get("q") ?? "");

  const setParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    next.delete("page"); // any filter change returns to page 1
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }, [params, pathname, router]);

  // Debounce the text box so typing does not fire a query per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) setParam("q", q);
    }, 350);
    return () => clearTimeout(id);
  }, [q, params, setParam]);

  const activeCount = ["city", "type", "minPrice", "maxPrice", "bedrooms", "bathrooms", "minSize", "featured"]
    .filter((k) => params.get(k)).length;

  return (
    <div className="card p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by city, area or keyword"
            aria-label="Search listings"
            className="input pl-9"
          />
        </div>

        <select value={params.get("sort") ?? "latest"} onChange={(e) => setParam("sort", e.target.value)}
          aria-label="Sort listings" className="input sm:w-44">
          <option value="latest">Latest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="size_desc">Largest first</option>
        </select>

        <Button variant="secondary" onClick={() => setOpen(!open)} aria-expanded={open}>
          <SlidersHorizontal className="h-4 w-4" />
          Filters{activeCount > 0 && ` (${activeCount})`}
        </Button>
      </div>

      {open && (
        <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="f-city">City</label>
            <select id="f-city" className="input" value={params.get("city") ?? ""} onChange={(e) => setParam("city", e.target.value)}>
              <option value="">Any city</option>
              {cities.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="f-type">Property type</label>
            <select id="f-type" className="input" value={params.get("type") ?? ""} onChange={(e) => setParam("type", e.target.value)}>
              <option value="">Any type</option>
              {types.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="f-min">Min price (PKR)</label>
            <input id="f-min" type="number" min={0} step={100000} className="input"
              defaultValue={params.get("minPrice") ?? ""}
              onBlur={(e) => setParam("minPrice", e.target.value)} placeholder="0" />
          </div>

          <div>
            <label className="label" htmlFor="f-max">Max price (PKR)</label>
            <input id="f-max" type="number" min={0} step={100000} className="input"
              defaultValue={params.get("maxPrice") ?? ""}
              onBlur={(e) => setParam("maxPrice", e.target.value)} placeholder="Any" />
          </div>

          <div>
            <label className="label" htmlFor="f-beds">Bedrooms</label>
            <select id="f-beds" className="input" value={params.get("bedrooms") ?? ""} onChange={(e) => setParam("bedrooms", e.target.value)}>
              <option value="">Any</option>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="f-baths">Bathrooms</label>
            <select id="f-baths" className="input" value={params.get("bathrooms") ?? ""} onChange={(e) => setParam("bathrooms", e.target.value)}>
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="f-size">Min size (sq ft)</label>
            <input id="f-size" type="number" min={0} step={100} className="input"
              defaultValue={params.get("minSize") ?? ""}
              onBlur={(e) => setParam("minSize", e.target.value)} placeholder="Any" />
          </div>

          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={params.get("featured") === "true"}
                onChange={(e) => setParam("featured", e.target.checked ? "true" : "")}
                className="h-4 w-4 rounded border-line accent-brand" />
              Featured only
            </label>
            {activeCount > 0 && (
              <button onClick={() => startTransition(() => router.replace(pathname))}
                className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-danger">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {pending && <p className="mt-3 text-xs text-muted">Updating results…</p>}
    </div>
  );
}
