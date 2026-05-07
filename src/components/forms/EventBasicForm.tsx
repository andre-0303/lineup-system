"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { eventBasicSchema, type EventBasicFormData } from "@/lib/validations/event";
import { createEventDraft } from "@/app/(dashboard)/cadastro-lineup/actions";
import { generateSlug } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const FIELD_CLASS =
  "w-full bg-transparent border border-white/10 rounded-none px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-green-500/60 transition-colors font-mono";

const LABEL_CLASS =
  "block text-xs tracking-[0.2em] uppercase mb-1.5 font-mono";

interface EventBasicFormProps {
  defaultValues?: Partial<EventBasicFormData>;
  eventId?: string;
  onSaved?: (id: string) => void;
}

export function EventBasicForm({ defaultValues, eventId, onSaved }: EventBasicFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventBasicFormData>({
    resolver: zodResolver(eventBasicSchema),
    defaultValues,
  });

  const name = watch("name") ?? "";
  const slugPreview = name.length >= 3 ? generateSlug(name) : "";

  async function onSubmit(data: EventBasicFormData) {
    try {
      const id = await createEventDraft(data);
      toast.success("Rascunho salvo.");
      if (onSaved) {
        onSaved(id);
      } else {
        router.push(`/cadastro-lineup/${id}/palcos`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>

      {/* Nome */}
      <div>
        <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
          Nome do Evento
        </label>
        <input
          type="text"
          placeholder="DevConf 2025"
          className={FIELD_CLASS}
          {...register("name")}
        />
        {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
        {slugPreview && (
          <p className="mt-1 text-xs" style={{ color: "rgba(0,255,0,0.35)" }}>
            /lineup/<span style={{ color: "rgba(0,255,0,0.7)" }}>{slugPreview}</span>
          </p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
          Descrição <span className="text-white/20 normal-case tracking-normal">(opcional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Sobre o evento..."
          className={`${FIELD_CLASS} resize-none`}
          {...register("description")}
        />
      </div>

      {/* Datas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
            Data de Início
          </label>
          <input
            type="date"
            className={FIELD_CLASS}
            {...register("startDate")}
          />
          {errors.startDate && <p className="mt-1 text-xs text-red-400">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
            Data de Fim
          </label>
          <input
            type="date"
            className={FIELD_CLASS}
            {...register("endDate")}
          />
          {errors.endDate && <p className="mt-1 text-xs text-red-400">{errors.endDate.message}</p>}
        </div>
      </div>

      {/* Localização */}
      <div>
        <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
          Localização
        </label>
        <input
          type="text"
          placeholder="São Paulo, SP"
          className={FIELD_CLASS}
          {...register("location")}
        />
        {errors.location && <p className="mt-1 text-xs text-red-400">{errors.location.message}</p>}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="neon-btn"
        >
          {isSubmitting ? "Salvando..." : "Próximo →"}
        </button>
      </div>
    </form>
  );
}
