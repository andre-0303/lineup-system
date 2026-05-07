"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Clock, User } from "lucide-react";
import { SESSION_TYPES } from "@/lib/validations/session";
import { deleteSession } from "@/app/(dashboard)/cadastro-lineup/[id]/grade/actions";
import type { Stage, Session, SessionSpeaker, Speaker } from "@/types";

type SessionWithRelations = Session & {
  stage: Stage;
  speakers: (SessionSpeaker & { speaker: Speaker })[];
};

interface ScheduleGridProps {
  eventId: string;
  stages: Stage[];
  initialSessions: SessionWithRelations[];
  onConflictChange?: (hasConflict: boolean) => void;
}

export function ScheduleGrid({ eventId, stages, initialSessions, onConflictChange }: ScheduleGridProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionWithRelations[]>(initialSessions);
  const [isPending, startTransition] = useTransition();

  // Sync when server refreshes with new data
  useEffect(() => {
    setSessions(initialSessions);
  }, [initialSessions]);

  function getTypeColor(sessionType: string): string {
    return SESSION_TYPES.find((t) => t.value === sessionType)?.color ?? "#6b7280";
  }

  function getTypeLabel(sessionType: string): string {
    return SESSION_TYPES.find((t) => t.value === sessionType)?.label ?? sessionType;
  }

  function handleDeleteSession(sessionId: string) {
    startTransition(async () => {
      try {
        await deleteSession(sessionId, eventId);
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        toast.success("Sessão removida.");
      } catch {
        toast.error("Erro ao remover sessão.");
      }
    });
  }

  if (sessions.length === 0) {
    return (
      <div
        className="flex flex-col items-center py-8 border text-center"
        style={{ borderColor: "rgba(255,255,255,0.06)", fontFamily: "var(--font-jetbrains-mono), monospace" }}
      >
        <Clock className="h-6 w-6 mb-2" style={{ color: "rgba(0,255,0,0.2)" }} />
        <p className="text-xs text-muted-foreground">Nenhuma sessão adicionada.</p>
      </div>
    );
  }

  const sessionsByStage = stages.map((stage) => ({
    stage,
    sessions: sessions
      .filter((s) => s.stageId === stage.id)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
  }));

  return (
    <div className="space-y-4" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
      {sessionsByStage.map(({ stage, sessions: stageSessions }) => (
        <div key={stage.id}>
          <div
            className="flex items-center gap-2 mb-2 px-1"
          >
            <div className="h-px flex-1" style={{ background: "rgba(0,255,0,0.15)" }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(0,255,0,0.5)" }}>
              {stage.name}
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(0,255,0,0.15)" }} />
          </div>

          {stageSessions.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1 py-2">Sem sessões neste palco.</p>
          ) : (
            <div className="space-y-2">
              {stageSessions.map((session) => {
                const color = getTypeColor(session.sessionType);
                const label = getTypeLabel(session.sessionType);
                const start = new Date(session.startTime).toISOString().slice(11, 16);
                const end = new Date(session.endTime).toISOString().slice(11, 16);
                return (
                  <div
                    key={session.id}
                    className="flex items-start justify-between gap-3 px-4 py-3 border"
                    style={{ borderColor: "rgba(255,255,255,0.06)", borderLeft: `3px solid ${color}` }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold" style={{ color }}>
                          {start} - {end}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 tracking-wider uppercase"
                          style={{ background: `${color}20`, color }}
                        >
                          {label}
                        </span>
                      </div>
                      <p className="text-sm text-white truncate">{session.title}</p>
                      {session.speakers.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <User className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">
                            {session.speakers.map((ss) => ss.speaker.name).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={isPending}
                      className="shrink-0 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-40"
                      aria-label="Remover sessão"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
