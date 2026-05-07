"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sessionSchema } from "@/lib/validations/session";
import { checkSpeakerConflicts } from "@/lib/conflict-detector";
import { z } from "zod";
import { revalidatePath } from "next/cache";

async function assertEventOwner(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  });
  if (!event || event.createdBy !== userId) throw new Error("Não autorizado");
  return event;
}

export async function getGradeData(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  const [stages, sessions, speakers] = await Promise.all([
    prisma.stage.findMany({
      where: { eventId },
      orderBy: { displayOrder: "asc" },
    }),
    prisma.session.findMany({
      where: { eventId },
      include: {
        stage: true,
        speakers: { include: { speaker: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.speaker.findMany({ orderBy: { name: "asc" } }),
  ]);

  return { stages, sessions, speakers };
}

export async function createSession(
  eventId: string,
  data: z.infer<typeof sessionSchema>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  const parsed = sessionSchema.parse(data);
  const startTime = new Date(parsed.startTime);
  const endTime = new Date(parsed.endTime);

  const { hasConflict, conflicts } = await checkSpeakerConflicts(
    eventId,
    parsed.speakerIds,
    startTime,
    endTime
  );

  if (hasConflict) {
    const c = conflicts[0];
    throw new Error(
      `Conflito: ${c.speaker_name} já está em "${c.title}" no mesmo horário`
    );
  }

  const newSession = await prisma.session.create({
    data: {
      eventId,
      stageId: parsed.stageId,
      title: parsed.title,
      description: parsed.description,
      sessionType: parsed.sessionType,
      startTime,
      endTime,
    },
  });

  await Promise.all(
    parsed.speakerIds.map((speakerId, index) =>
      prisma.sessionSpeaker.create({
        data: { sessionId: newSession.id, speakerId, displayOrder: index },
      })
    )
  );

  revalidatePath(`/cadastro-lineup/${eventId}/grade`);
  return newSession;
}

export async function deleteSession(sessionId: string, eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  await prisma.session.delete({ where: { id: sessionId } });
  revalidatePath(`/cadastro-lineup/${eventId}/grade`);
}
