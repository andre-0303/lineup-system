import { z } from "zod";

export const sessionSchema = z.object({
  title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  sessionType: z.enum(["talk", "workshop", "panel", "break", "keynote"]),
  stageId: z.string().uuid("Palco obrigatório"),
  startTime: z.string().min(1, "Horário de início obrigatório"),
  endTime: z.string().min(1, "Horário de fim obrigatório"),
  speakerIds: z.array(z.string().uuid()).min(1, "Adicione pelo menos um palestrante"),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: "Horário final deve ser maior que horário inicial",
    path: ["endTime"],
  }
);

export type SessionFormData = z.infer<typeof sessionSchema>;

export const SESSION_TYPES = [
  { value: "keynote", label: "Keynote", color: "#00ff00" },
  { value: "talk", label: "Talk", color: "#3b82f6" },
  { value: "workshop", label: "Workshop", color: "#a855f7" },
  { value: "panel", label: "Panel", color: "#f97316" },
  { value: "break", label: "Break", color: "#6b7280" },
] as const;
