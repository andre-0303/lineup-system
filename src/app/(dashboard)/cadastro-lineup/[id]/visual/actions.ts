"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ThemeConfig } from "@/types";

async function assertEventOwner(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  });
  if (!event || event.createdBy !== userId) throw new Error("Não autorizado");
}

export async function saveTheme(eventId: string, theme: ThemeConfig) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  await prisma.event.update({
    where: { id: eventId },
    data: { themeConfig: theme as object },
  });
}
