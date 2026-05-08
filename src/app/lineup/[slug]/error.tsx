"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LineupError({
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
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "#0a0a0a", fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      <div className="text-center space-y-6 max-w-sm">
        <AlertTriangle className="w-10 h-10 mx-auto" style={{ color: "rgba(255,0,0,0.6)" }} />
        <div>
          <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(0,255,0,0.5)" }}>
            ERRO
          </p>
          <h2 className="text-lg font-bold text-white mb-2">
            Não foi possível carregar o lineup
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            {error.message || "Erro inesperado ao carregar o evento."}
          </p>
        </div>
        <Button
          onClick={reset}
          variant="outline"
          size="sm"
          className="gap-2 tracking-widest uppercase text-xs border-white/10 text-white/50 hover:text-white"
        >
          <RefreshCw className="w-3 h-3" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
