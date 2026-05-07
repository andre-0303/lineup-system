import { z } from "zod";

export const speakerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  bio: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  avatarUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  socialLinks: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
});

export type SpeakerFormData = z.infer<typeof speakerSchema>;
