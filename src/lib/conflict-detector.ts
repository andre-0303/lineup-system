import { prisma } from "./prisma";

export interface ConflictInfo {
  speaker_name: string;
  title: string;
  start_time: Date;
  end_time: Date;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: ConflictInfo[];
}

export async function checkSpeakerConflicts(
  eventId: string,
  speakerIds: string[],
  startTime: Date,
  endTime: Date,
  excludeSessionId?: string
): Promise<ConflictResult> {
  if (speakerIds.length === 0) return { hasConflict: false, conflicts: [] };

  const overlappingSpeakers = await prisma.sessionSpeaker.findMany({
    where: {
      speakerId: { in: speakerIds },
      session: {
        eventId,
        ...(excludeSessionId ? { id: { not: excludeSessionId } } : {}),
        // OVERLAPS logic: sessions overlap when start1 < end2 AND end1 > start2
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    },
    include: {
      speaker: { select: { name: true } },
      session: { select: { title: true, startTime: true, endTime: true } },
    },
  });

  const conflicts: ConflictInfo[] = overlappingSpeakers.map((ss) => ({
    speaker_name: ss.speaker.name,
    title: ss.session.title,
    start_time: ss.session.startTime,
    end_time: ss.session.endTime,
  }));

  return { hasConflict: conflicts.length > 0, conflicts };
}
