import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-display text-6xl text-brand">403</p>
        <h1 className="mt-4 font-display text-2xl">This area belongs to a different role</h1>
        <p className="mt-2 text-sm text-muted">
          Your account does not have access here. Sign in with the right account or head back to search.
        </p>
        <Link href="/properties" className="mt-6 inline-block"><Button>Browse listings</Button></Link>
      </div>
    </div>
  );
}
