"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { sessionSchema, type SessionFormData, SESSION_TYPES } from "@/lib/validations/session";
import { TerminalSelect } from "@/components/ui/terminal-select";
import type { Stage, Speaker } from "@/types";

const INPUT_CLASS =
  "bg-[#0d0d0d] border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-green-500/60 transition-colors font-mono w-full";

const LABEL_CLASS = "block text-xs tracking-[0.2em] uppercase mb-1.5 font-mono";

interface SessionFormProps {
  eventId: string;
  stages: Stage[];
  speakers: Speaker[];
  onSessionCreated: (session: SessionFormData & { id: string }) => void;
  eventDate: string;
}

export function SessionForm({ eventId, stages, speakers, onSessionCreated, eventDate }: SessionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { speakerIds: [] },
  });

  const stageOptions = stages.map((s) => ({ value: s.id, label: s.name }));
  const typeOptions = SESSION_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
    color: t.color,
  }));

  async function onSubmit(data: SessionFormData) {
    try {
      const { createSession } = await import(
        "@/app/(dashboard)/cadastro-lineup/[id]/grade/actions"
      );
      const session = await createSession(eventId, data);
      toast.success("Sessão adicionada.");
      onSessionCreated({ ...data, id: session.id });
      reset({ speakerIds: [] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar sessão.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 border p-4"
      style={{
        borderColor: "rgba(0,255,0,0.15)",
        fontFamily: "var(--font-jetbrains-mono), monospace",
      }}
    >
      <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "rgba(0,255,0,0.6)" }}>
        + Nova Sessão
      </p>

      {/* Título */}
      <div>
        <label className={LABEL_CLASS} style={{ color: "rgba(255,255,255,0.4)" }}>Título</label>
        <input
          type="text"
          placeholder="Keynote: O Futuro do JS"
          className={INPUT_CLASS}
          {...register("title")}
        />
        {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
      </div>

      {/* Tipo + Palco — TerminalSelect */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} style={{ color: "rgba(255,255,255,0.4)" }}>Tipo</label>
          <Controller
            name="sessionType"
            control={control}
            render={({ field }) => (
              <TerminalSelect
                options={typeOptions}
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Tipo..."
              />
            )}
          />
          {errors.sessionType && <p className="mt-1 text-xs text-red-400">{errors.sessionType.message}</p>}
        </div>
        <div>
          <label className={LABEL_CLASS} style={{ color: "rgba(255,255,255,0.4)" }}>Palco</label>
          <Controller
            name="stageId"
            control={control}
            render={({ field }) => (
              <TerminalSelect
                options={stageOptions}
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Palco..."
              />
            )}
          />
          {errors.stageId && <p className="mt-1 text-xs text-red-400">{errors.stageId.message}</p>}
        </div>
      </div>

      {/* Horários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS} style={{ color: "rgba(255,255,255,0.4)" }}>Início</label>
          <input
            type="datetime-local"
            className={INPUT_CLASS}
            defaultValue={`${eventDate}T09:00`}
            {...register("startTime")}
          />
          {errors.startTime && <p className="mt-1 text-xs text-red-400">{errors.startTime.message}</p>}
        </div>
        <div>
          <label className={LABEL_CLASS} style={{ color: "rgba(255,255,255,0.4)" }}>Fim</label>
          <input
            type="datetime-local"
            className={INPUT_CLASS}
            defaultValue={`${eventDate}T10:00`}
            {...register("endTime")}
          />
          {errors.endTime && <p className="mt-1 text-xs text-red-400">{errors.endTime.message}</p>}
        </div>
      </div>

      {/* Palestrantes */}
      <div>
        <label className={LABEL_CLASS} style={{ color: "rgba(255,255,255,0.4)" }}>
          Palestrantes
        </label>
        <Controller
          name="speakerIds"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {speakers.map((speaker) => {
                const selected = field.value.includes(speaker.id);
                return (
                  <button
                    key={speaker.id}
                    type="button"
                    onClick={() => {
                      const next = selected
                        ? field.value.filter((id) => id !== speaker.id)
                        : [...field.value, speaker.id];
                      field.onChange(next);
                    }}
                    className="px-2.5 py-1 text-xs transition-all border"
                    style={{
                      borderColor: selected ? "#00ff00" : "rgba(255,255,255,0.1)",
                      color: selected ? "#00ff00" : "rgba(255,255,255,0.5)",
                      background: selected ? "rgba(0,255,0,0.08)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    {speaker.name}
                  </button>
                );
              })}
              {speakers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Adicione palestrantes no step anterior.
                </p>
              )}
            </div>
          )}
        />
        {errors.speakerIds && <p className="mt-1 text-xs text-red-400">{errors.speakerIds.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-colors"
        style={{ borderColor: "rgba(0,255,0,0.3)", color: "#00ff00" }}
      >
        <Plus className="h-3 w-3" />
        {isSubmitting ? "Verificando conflitos..." : "Adicionar Sessão"}
      </button>
    </form>
  );
}
