"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventBasicSchema } from "@/lib/validations/event";
import { generateSlug } from "@/lib/utils";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function assertEventOwner(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  });
  if (!event || event.createdBy !== userId) throw new Error("Não autorizado");
}

export async function updateEvent(
  eventId: string,
  data: z.infer<typeof eventBasicSchema>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  const parsed = eventBasicSchema.parse(data);

  await prisma.event.update({
    where: { id: eventId },
    data: {
      name: parsed.name,
      description: parsed.description,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      location: parsed.location,
    },
  });

  revalidatePath("/home");
  revalidatePath(`/evento/${eventId}/editar`);
}

export async function unpublishEvent(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  await prisma.event.update({
    where: { id: eventId },
    data: { isPublished: false },
  });

  revalidatePath("/home");
}
