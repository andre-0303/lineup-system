"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { eventBasicSchema } from "@/lib/validations/event";
import { z } from "zod";

export async function createEventDraft(data: z.infer<typeof eventBasicSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  const parsed = eventBasicSchema.parse(data);

  let slug = generateSlug(parsed.name);

  const existing = await prisma.event.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const event = await prisma.event.create({
    data: {
      slug,
      name: parsed.name,
      description: parsed.description,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      location: parsed.location,
      isPublished: false,
      createdBy: session.user.id,
    },
  });

  return event.id;
}
