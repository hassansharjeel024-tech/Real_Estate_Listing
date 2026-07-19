import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-display text-6xl text-brand">404</p>
        <h1 className="mt-4 font-display text-2xl">That page has moved on</h1>
        <p className="mt-2 text-sm text-muted">The listing may have been removed or the link mistyped.</p>
        <Link href="/properties" className="mt-6 inline-block"><Button>Browse listings</Button></Link>
      </div>
    </div>
  );
}
