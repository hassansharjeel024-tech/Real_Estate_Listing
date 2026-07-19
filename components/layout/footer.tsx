import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg">ApnaGhar</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            One place to list, search and enquire about property. Every listing is
            reviewed before it goes live.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Buyers</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/properties" className="hover:text-ink">Search listings</Link></li>
            <li><Link href="/properties?featured=true" className="hover:text-ink">Featured homes</Link></li>
            <li><Link href="/favorites" className="hover:text-ink">Saved listings</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Agents</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/register?role=AGENT" className="hover:text-ink">Join as an agent</Link></li>
            <li><Link href="/dashboard/agent" className="hover:text-ink">Agent dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} ApnaGhar. Built with Next.js and Prisma.
      </div>
    </footer>
  );
}
