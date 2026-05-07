"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, User } from "lucide-react";
import { speakerSchema, type SpeakerFormData } from "@/lib/validations/speaker";
import { createSpeaker, deleteSpeaker } from "@/app/(dashboard)/cadastro-lineup/[id]/palestrantes/actions";
import type { Speaker } from "@/types";

const INPUT_CLASS =
  "bg-transparent border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-green-500/60 transition-colors font-mono w-full";

const LABEL_CLASS = "block text-xs tracking-[0.2em] uppercase mb-1.5 font-mono";

interface SpeakerFormProps {
  eventId: string;
  initialSpeakers: Speaker[];
}

export function SpeakerForm({ eventId, initialSpeakers }: SpeakerFormProps) {
  const router = useRouter();
  const [speakers, setSpeakers] = useState<Speaker[]>(initialSpeakers);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpeakerFormData>({ resolver: zodResolver(speakerSchema) });

  async function onAdd(data: SpeakerFormData) {
    try {
      const speaker = await createSpeaker(eventId, data);
      setSpeakers((prev) => [speaker, ...prev]);
      reset();
      toast.success("Palestrante adicionado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar palestrante.");
    }
  }

  function handleDelete(speakerId: string) {
    startTransition(async () => {
      try {
        await deleteSpeaker(speakerId, eventId);
        setSpeakers((prev) => prev.filter((s) => s.id !== speakerId));
        toast.success("Palestrante removido.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao remover palestrante.");
      }
    });
  }

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      {/* Lista */}
      {speakers.length > 0 ? (
        <div className="space-y-2">
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="flex items-center justify-between px-4 py-3 border"
              style={{ borderColor: "rgba(0,255,0,0.15)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex items-center justify-center w-7 h-7 shrink-0 text-xs font-bold"
                  style={{ background: "rgba(0,255,0,0.1)", color: "#00ff00" }}
                >
                  {speaker.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">{speaker.name}</p>
                  {(speaker.role || speaker.company) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {[speaker.role, speaker.company].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(speaker.id)}
                disabled={isPending}
                className="ml-3 shrink-0 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-40"
                aria-label="Remover palestrante"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center py-8 border text-center"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <User className="h-6 w-6 mb-2" style={{ color: "rgba(0,255,0,0.2)" }} />
          <p className="text-xs text-muted-foreground">Nenhum palestrante adicionado.</p>
        </div>
      )}

      {/* Formulário inline */}
      <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
              Nome
            </label>
            <input
              type="text"
              placeholder="João Silva"
              className={INPUT_CLASS}
              {...register("name")}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
              Empresa
            </label>
            <input
              type="text"
              placeholder="Tech Corp"
              className={INPUT_CLASS}
              {...register("company")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
              Cargo
            </label>
            <input
              type="text"
              placeholder="Tech Lead"
              className={INPUT_CLASS}
              {...register("role")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
              Bio <span className="text-white/20 normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Breve descrição"
              className={INPUT_CLASS}
              {...register("bio")}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-colors"
          style={{ borderColor: "rgba(0,255,0,0.3)", color: "#00ff00" }}
        >
          <Plus className="h-3 w-3" />
          {isSubmitting ? "Adicionando..." : "Adicionar Palestrante"}
        </button>
      </form>

      {/* Next */}
      <div className="pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-xs text-muted-foreground mb-4">
          {speakers.length === 0 && "Adicione ao menos 1 palestrante para continuar."}
        </p>
        <button
          onClick={() => router.push(`/cadastro-lineup/${eventId}/grade`)}
          disabled={speakers.length === 0}
          className="neon-btn disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
