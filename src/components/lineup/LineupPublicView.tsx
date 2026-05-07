"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateLineupPNG, downloadDataUrl } from "@/lib/lineup-generator";
import { LineupPreview } from "./LineupPreview";
import type { ThemeConfig, EventWithRelations } from "@/types";

const PREVIEW_ID = "public-lineup-preview";

interface LineupPublicViewProps {
  event: EventWithRelations;
  theme: ThemeConfig;
}

export function LineupPublicView({ event, theme }: LineupPublicViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const dataUrl = await generateLineupPNG(PREVIEW_ID);
      downloadDataUrl(dataUrl, `${event.slug}-lineup.png`);
      toast.success("PNG gerado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar PNG.");
    } finally {
      setIsGenerating(false);
    }
  }

  const scale = typeof window !== "undefined" && window.innerWidth < 1100
    ? Math.min(0.9, (window.innerWidth - 48) / 1024)
    : 0.7;

  return (
    <div
      className="min-h-screen bg-[#000] flex flex-col items-center py-10 px-4"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      {/* Download button */}
      <div className="w-full max-w-3xl flex justify-end mb-4">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-all disabled:opacity-50"
          style={{
            borderColor: "rgba(0,255,0,0.4)",
            color: "#00ff00",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,255,0,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          {isGenerating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {isGenerating ? "Gerando..." : "Baixar PNG"}
        </button>
      </div>

      {/* Preview */}
      <div
        className="overflow-hidden border"
        style={{
          borderColor: "rgba(0,255,0,0.15)",
          width: `${1080 * scale}px`,
          height: `${1080 * scale}px`,
        }}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <LineupPreview event={event} theme={theme} previewId={PREVIEW_ID} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.15)" }}>
          Criado com{" "}
          <span style={{ color: "rgba(0,255,0,0.4)" }}>LineUp System</span>
        </p>
      </div>
    </div>
  );
}
