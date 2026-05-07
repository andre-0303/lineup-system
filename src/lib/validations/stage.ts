import { z } from "zod";

export const stageSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  capacity: z.number().int().positive().optional(),
});

export type StageFormData = z.infer<typeof stageSchema>;
