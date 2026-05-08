"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center space-y-5 max-w-md">
        <AlertTriangle className="w-10 h-10 mx-auto" style={{ color: "rgba(255,0,0,0.7)" }} />
        <div>
          <h2
            className="text-lg font-bold tracking-tight mb-1"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Algo deu errado
          </h2>
          <p className="text-sm text-muted-foreground">
            {error.message || "Erro inesperado. Tente novamente."}
          </p>
        </div>
        <Button
          onClick={reset}
          variant="outline"
          size="sm"
          className="gap-2 tracking-widest uppercase text-xs"
        >
          <RefreshCw className="w-3 h-3" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
