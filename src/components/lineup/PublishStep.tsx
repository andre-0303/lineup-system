"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle,
  XCircle,
  Download,
  Link2,
  Globe,
  Loader2,
} from "lucide-react";
import { publishEvent } from "@/app/(dashboard)/cadastro-lineup/[id]/publicar/actions";
import { generateLineupPNG, downloadDataUrl } from "@/lib/lineup-generator";
import { LineupPreview } from "./LineupPreview";
import type { ThemeConfig, EventWithRelations } from "@/types";

interface ChecklistItem {
  label: string;
  ok: boolean;
  fix?: string;
}

interface PublishStepProps {
  eventId: string;
  event: EventWithRelations;
  theme: ThemeConfig;
  checklist: {
    hasStage: boolean;
    hasSession: boolean;
    hasConflicts: boolean;
    canPublish: boolean;
  };
  isPublished: boolean;
  slug: string;
}

const PREVIEW_ID = "publish-lineup-preview";

export function PublishStep({
  eventId,
  event,
  theme,
  checklist,
  isPublished: initialPublished,
  slug,
}: PublishStepProps) {
  const router = useRouter();
  const [published, setPublished] = useState(initialPublished);
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);

  const items: ChecklistItem[] = [
    {
      label: "Pelo menos 1 palco",
      ok: checklist.hasStage,
      fix: "Adicione palcos no Step 2",
    },
    {
      label: "Pelo menos 1 sessão",
      ok: checklist.hasSession,
      fix: "Adicione sessões no Step 4",
    },
    {
      label: "Sem conflitos de horário",
      ok: !checklist.hasConflicts,
      fix: "Resolva conflitos no Step 4",
    },
  ];

  function handlePublish() {
    startTransition(async () => {
      try {
        await publishEvent(eventId);
        setPublished(true);
        toast.success("Evento publicado!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao publicar.");
      }
    });
  }

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const dataUrl = await generateLineupPNG(PREVIEW_ID);
      downloadDataUrl(dataUrl, `${slug}-lineup.png`);
      toast.success("PNG gerado com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar PNG.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/lineup/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  const scale = 0.36;

  return (
    <div
      className="flex flex-col xl:flex-row gap-8"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      {/* Left: checklist + actions */}
      <div className="xl:w-72 shrink-0 space-y-6">
        {/* Checklist */}
        <div>
          <p
            className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ color: "rgba(0,255,0,0.6)" }}
          >
            // requisitos
          </p>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.label} className="flex items-start gap-2.5">
                {item.ok ? (
                  <CheckCircle
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: "#00ff00" }}
                  />
                ) : (
                  <XCircle
                    className="h-4 w-4 shrink-0 mt-0.5"
                    style={{ color: "#ef4444" }}
                  />
                )}
                <div>
                  <p
                    className="text-xs"
                    style={{
                      color: item.ok
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {item.label}
                  </p>
                  {!item.ok && item.fix && (
                    <p className="text-[10px] text-red-400 mt-0.5">
                      {item.fix}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publish button */}
        {!published ? (
          <button
            onClick={handlePublish}
            disabled={!checklist.canPublish || isPending}
            className="neon-btn disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Publicando..." : "Publicar Evento →"}
          </button>
        ) : (
          <div className="space-y-3">
            <div
              className="flex items-center gap-2 px-3 py-2 text-xs"
              style={{
                border: "1px solid rgba(0,255,0,0.3)",
                color: "#00ff00",
              }}
            >
              <Globe className="h-3.5 w-3.5" />
              Evento publicado
            </div>

            {/* Download PNG */}
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold tracking-widest uppercase border transition-colors disabled:opacity-50"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {isGenerating ? "Gerando..." : "Baixar PNG"}
            </button>

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="w-full flex cursor-pointer items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold tracking-widest uppercase border transition-colors"
              style={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              <Link2 className="h-3.5 w-3.5" />
              Copiar Link
            </button>

            {/* Go home */}
            <button
              onClick={() => router.push("/home")}
              className="w-full text-xs cursor-pointer text-muted-foreground hover:text-white transition-colors py-2"
            >
              Voltar ao Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Right: preview */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs tracking-[0.3em] uppercase mb-3"
          style={{ color: "rgba(0,255,0,0.6)" }}
        >
          // preview final
        </p>
        <div
          className="overflow-hidden border"
          style={{
            borderColor: "rgba(0,255,0,0.15)",
            width: `${1080 * scale}px`,
            height: `${1080 * scale}px`,
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <LineupPreview event={event} theme={theme} previewId={PREVIEW_ID} />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          {published
            ? `Acessível em /lineup/${slug}`
            : "Preview em escala. Output final: 1024×1024px PNG."}
        </p>
      </div>
    </div>
  );
}
