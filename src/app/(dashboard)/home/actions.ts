"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserEvents() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  return prisma.event.findMany({
    where: { createdBy: session.user.id },
    include: {
      _count: {
        select: { sessions: true, stages: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteEvent(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  });

  if (event?.createdBy !== session.user.id) {
    throw new Error("Você não tem permissão para excluir este evento");
  }

  await prisma.event.delete({ where: { id: eventId } });
  revalidatePath("/home");
}