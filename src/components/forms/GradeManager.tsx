"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionForm } from "./SessionForm";
import { ScheduleGrid } from "@/components/lineup/ScheduleGrid";
import type { Stage, Speaker, Session, SessionSpeaker } from "@/types";

type SessionWithRelations = Session & {
  stage: Stage;
  speakers: (SessionSpeaker & { speaker: Speaker })[];
};

interface GradeManagerProps {
  eventId: string;
  stages: Stage[];
  speakers: Speaker[];
  initialSessions: SessionWithRelations[];
  eventDate: string;
}

export function GradeManager({
  eventId,
  stages,
  speakers,
  initialSessions,
  eventDate,
}: GradeManagerProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionWithRelations[]>(initialSessions);

  // Sync when server refreshes with updated sessions
  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  return (
    <div className="space-y-6">
      {/* Form */}
      <SessionForm
        eventId={eventId}
        stages={stages}
        speakers={speakers}
        onSessionCreated={() => router.refresh()}
        eventDate={eventDate}
      />

      {/* Grid */}
      <div>
        <p
          className="text-xs tracking-[0.3em] uppercase mb-3"
          style={{ color: "rgba(0,255,0,0.6)", fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          // grade atual
        </p>
        <ScheduleGrid
          eventId={eventId}
          stages={stages}
          initialSessions={sessions}
        />
      </div>

      {/* Next */}
      <div
        className="pt-4 border-t"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          fontFamily: "var(--font-jetbrains-mono), monospace",
        }}
      >
        <p className="text-xs text-muted-foreground mb-4">
          {sessions.length === 0 && "Adicione ao menos 1 sessão para continuar."}
        </p>
        <button
          onClick={() => router.push(`/cadastro-lineup/${eventId}/visual`)}
          disabled={sessions.length === 0}
          className="neon-btn disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
