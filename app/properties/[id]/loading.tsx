import { Skeleton } from "@/components/ui/states";

export default function Loading() {
  return (
    <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
      <div>
        <Skeleton className="aspect-[16/9] w-full" />
        <Skeleton className="mt-6 h-8 w-2/3" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <Skeleton className="mt-6 h-10 w-40" />
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
