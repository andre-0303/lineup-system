import { z } from "zod";

export const eventBasicSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Data de início obrigatória"),
  endDate: z.string().min(1, "Data de fim obrigatória"),
  location: z.string().min(3, "Localização deve ter no mínimo 3 caracteres"),
}).refine(
  (data) => new Date(data.endDate) >= new Date(data.startDate),
  {
    message: "Data final deve ser maior ou igual à data inicial",
    path: ["endDate"],
  }
);

export type EventBasicFormData = z.infer<typeof eventBasicSchema>;
