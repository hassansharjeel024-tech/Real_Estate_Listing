"use client";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center text-center">
      <div>
        <h1 className="font-display text-2xl">That didn&apos;t load</h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          The page hit an error on the way in. Trying again usually fixes it.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-line/40 p-3 text-left text-xs">{error.message}</pre>
        )}
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
