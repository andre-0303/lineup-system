"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stageSchema } from "@/lib/validations/stage";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function assertEventOwner(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  });
  if (!event || event.createdBy !== userId) {
    throw new Error("Não autorizado");
  }
}

export async function getStages(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  return prisma.stage.findMany({
    where: { eventId },
    orderBy: { displayOrder: "asc" },
  });
}

export async function addStage(eventId: string, data: z.infer<typeof stageSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  const parsed = stageSchema.parse(data);

  const count = await prisma.stage.count({ where: { eventId } });

  const stage = await prisma.stage.create({
    data: {
      eventId,
      name: parsed.name,
      capacity: parsed.capacity,
      displayOrder: count,
    },
  });

  revalidatePath(`/cadastro-lineup/${eventId}/palcos`);
  return stage;
}

export async function deleteStage(stageId: string, eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  const sessions = await prisma.session.count({ where: { stageId } });
  if (sessions > 0) {
    throw new Error("Palco tem sessões vinculadas. Remova as sessões primeiro.");
  }

  await prisma.stage.delete({ where: { id: stageId } });
  revalidatePath(`/cadastro-lineup/${eventId}/palcos`);
}
