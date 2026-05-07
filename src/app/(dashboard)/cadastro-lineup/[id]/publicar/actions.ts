"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkSpeakerConflicts } from "@/lib/conflict-detector";
import { revalidatePath } from "next/cache";

async function assertEventOwner(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { createdBy: true },
  });
  if (!event || event.createdBy !== userId) throw new Error("Não autorizado");
}

export async function getPublishChecklist(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  const [stageCount, sessions] = await Promise.all([
    prisma.stage.count({ where: { eventId } }),
    prisma.session.findMany({
      where: { eventId },
      include: { speakers: true },
    }),
  ]);

  // Check all sessions for conflicts
  let hasConflicts = false;
  for (const s of sessions) {
    const speakerIds = s.speakers.map((ss) => ss.speakerId);
    const { hasConflict } = await checkSpeakerConflicts(
      eventId,
      speakerIds,
      new Date(s.startTime),
      new Date(s.endTime),
      s.id
    );
    if (hasConflict) { hasConflicts = true; break; }
  }

  return {
    hasStage: stageCount > 0,
    hasSession: sessions.length > 0,
    hasConflicts,
    canPublish: stageCount > 0 && sessions.length > 0 && !hasConflicts,
  };
}

export async function publishEvent(eventId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Não autorizado");

  await assertEventOwner(eventId, session.user.id);

  const { canPublish } = await getPublishChecklist(eventId);
  if (!canPublish) throw new Error("Evento não atende aos requisitos para publicação.");

  const event = await prisma.event.update({
    where: { id: eventId },
    data: { isPublished: true },
    select: { slug: true },
  });

  revalidatePath("/home");
  return event.slug;
}
