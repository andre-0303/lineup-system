"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Layers } from "lucide-react";
import { stageSchema, type StageFormData } from "@/lib/validations/stage";
import { addStage, deleteStage } from "@/app/(dashboard)/cadastro-lineup/[id]/palcos/actions";
import type { Stage } from "@/types";

const INPUT_CLASS =
  "bg-transparent border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-green-500/60 transition-colors font-mono w-full";

const LABEL_CLASS = "block text-xs tracking-[0.2em] uppercase mb-1.5 font-mono";

interface StageFormProps {
  eventId: string;
  initialStages: Stage[];
}

export function StageForm({ eventId, initialStages }: StageFormProps) {
  const router = useRouter();
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StageFormData>({ resolver: zodResolver(stageSchema) });

  async function onAdd(data: StageFormData) {
    try {
      const stage = await addStage(eventId, data);
      setStages((prev) => [...prev, stage]);
      reset();
      toast.success("Palco adicionado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar palco.");
    }
  }

  function handleDelete(stageId: string) {
    startTransition(async () => {
      try {
        await deleteStage(stageId, eventId);
        setStages((prev) => prev.filter((s) => s.id !== stageId));
        toast.success("Palco removido.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao remover palco.");
      }
    });
  }

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      {/* Lista de palcos */}
      {stages.length > 0 ? (
        <div className="space-y-2">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="flex items-center justify-between px-4 py-3 border"
              style={{ borderColor: "rgba(0,255,0,0.15)" }}
            >
              <div className="flex items-center gap-3">
                <Layers className="h-3.5 w-3.5 shrink-0" style={{ color: "rgba(0,255,0,0.5)" }} />
                <span className="text-sm text-white">{stage.name}</span>
                {stage.capacity && (
                  <span className="text-xs text-muted-foreground">
                    {stage.capacity} pessoas
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(stage.id)}
                disabled={isPending}
                className="text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-40"
                aria-label="Remover palco"
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
          <Layers className="h-6 w-6 mb-2" style={{ color: "rgba(0,255,0,0.2)" }} />
          <p className="text-xs text-muted-foreground">Nenhum palco adicionado.</p>
        </div>
      )}

      {/* Formulário inline */}
      <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
              Nome do Palco
            </label>
            <input
              type="text"
              placeholder="Main Stage"
              className={INPUT_CLASS}
              {...register("name")}
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div>
            <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
              Capacidade
            </label>
            <input
              type="number"
              placeholder="500"
              className={INPUT_CLASS}
              {...register("capacity", { valueAsNumber: true })}
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
          {isSubmitting ? "Adicionando..." : "Adicionar Palco"}
        </button>
      </form>

      {/* Next */}
      <div className="pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-xs text-muted-foreground mb-4">
          {stages.length === 0 && "Adicione ao menos 1 palco para continuar."}
        </p>
        <button
          onClick={() => router.push(`/cadastro-lineup/${eventId}/palestrantes`)}
          disabled={stages.length === 0}
          className="neon-btn disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
