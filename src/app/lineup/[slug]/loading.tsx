import { Skeleton } from "@/components/ui/skeleton";

export default function LineupLoading() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "#0a0a0a", fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      {/* Nav */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-7 py-2.5 border-b"
        style={{ borderColor: "rgba(0,255,0,0.08)", background: "rgba(10,10,10,0.9)" }}
      >
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-24" />
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-screen-xl mx-auto px-7 py-16 space-y-8">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-12 items-end">
          <div className="space-y-3">
            <Skeleton className="h-20 w-3/4" />
            <Skeleton className="h-20 w-1/2" />
          </div>
          <div className="text-right space-y-2 pr-5 border-r-2" style={{ borderColor: "rgba(0,255,0,0.5)" }}>
            <Skeleton className="h-3 w-10 ml-auto" />
            <Skeleton className="h-24 w-24 ml-auto" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>
        {/* Ticker */}
        <Skeleton className="h-8 w-full" />
        {/* Schedule */}
        <div className="space-y-4 pt-4">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
