import { Skeleton } from "@/components/ui/skeleton";

export default function CadastroLineupLoading() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      {/* Stepper */}
      <div className="flex items-center gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-2 flex-1" />
        ))}
      </div>
      {/* Form area */}
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-4 pt-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end pt-2">
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </div>
  );
}
