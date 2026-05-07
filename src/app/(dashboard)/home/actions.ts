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

  const { count } = await prisma.event.deleteMany({
    where: { id: eventId, createdBy: session.user.id },
  });

  if (count === 0) {
    throw new Error("Evento não encontrado ou sem permissão.");
  }

  revalidatePath("/home");
}