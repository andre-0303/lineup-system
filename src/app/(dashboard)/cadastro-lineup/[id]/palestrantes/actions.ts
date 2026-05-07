"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { speakerSchema } from "@/lib/validations/speaker";
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

export async function listSpeakers() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  return prisma.speaker.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createSpeaker(eventId: string, data: z.infer<typeof speakerSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  const parsed = speakerSchema.parse(data);

  const speaker = await prisma.speaker.create({
    data: {
      name: parsed.name,
      bio: parsed.bio || null,
      company: parsed.company || null,
      role: parsed.role || null,
      avatarUrl: parsed.avatarUrl || null,
      socialLinks: parsed.socialLinks ?? undefined,
    },
  });

  revalidatePath(`/cadastro-lineup/${eventId}/palestrantes`);
  return speaker;
}

export async function deleteSpeaker(speakerId: string, eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  const used = await prisma.sessionSpeaker.count({ where: { speakerId } });
  if (used > 0) {
    throw new Error("Palestrante está vinculado a sessões. Remova primeiro.");
  }

  await prisma.speaker.delete({ where: { id: speakerId } });
  revalidatePath(`/cadastro-lineup/${eventId}/palestrantes`);
}
