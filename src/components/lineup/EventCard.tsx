"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  MapPin,
  Layers,
  Clock,
  Edit2,
  Download,
  Link2,
  Trash2,
  Globe,
  FileText,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { deleteEvent } from "@/app/(dashboard)/home/actions";
import type { Event } from "@/types";

interface EventCardProps {
  event: Event & { _count: { sessions: number; stages: number } };
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  const startDate = format(new Date(event.startDate), "dd MMM", { locale: ptBR });
  const endDate = format(new Date(event.endDate), "dd MMM yyyy", { locale: ptBR });
  const sameDay = event.startDate.toString() === event.endDate.toString();

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteEvent(event.id);
      toast.success("Evento excluído.");
    } catch {
      toast.error("Erro ao excluir evento.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleCopyLink() {
    if (!event.isPublished) {
      toast.error("Publique o evento antes de copiar o link.");
      return;
    }
    const url = `${window.location.origin}/lineup/${event.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  function handleDownload() {
    if (!event.isPublished) {
      toast.error("Publique o evento antes de baixar o lineup.");
      return;
    }
    router.push(`/lineup/${event.slug}?download=1`);
  }

  return (
    <div
      className="group relative flex flex-col border bg-card text-card-foreground transition-all hover:border-green-500/40"
      style={{
        fontFamily: "var(--font-jetbrains-mono), monospace",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {/* Top bar */}
      <div
        className="h-px w-full transition-all group-hover:opacity-100"
        style={{ background: "linear-gradient(90deg, #00ff00, transparent)", opacity: 0.4 }}
      />

      <div className="flex flex-col gap-4 p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate leading-tight">
              {event.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3 shrink-0" style={{ color: "rgba(0,255,0,0.5)" }} />
              <span className="text-xs text-muted-foreground">
                {sameDay ? startDate : `${startDate} – ${endDate}`}
              </span>
            </div>
          </div>
          <Badge
            variant={event.isPublished ? "default" : "secondary"}
            className="shrink-0 text-[10px] tracking-widest uppercase px-2"
            style={
              event.isPublished
                ? { background: "rgba(0,255,0,0.15)", color: "#00ff00", border: "1px solid rgba(0,255,0,0.3)" }
                : {}
            }
          >
            {event.isPublished ? "publicado" : "rascunho"}
          </Badge>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-1.5">
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{event._count.stages} palco{event._count.stages !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{event._count.sessions} sessõe{event._count.sessions !== 1 ? "s" : "ão"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px mx-5" style={{ background: "rgba(255,255,255,0.06)" }} />

      {/* Actions */}
      <div className="flex items-center gap-1 p-3">
        <Link
          href={`/evento/${event.id}/editar`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-white transition-colors rounded no-underline"
        >
          <Edit2 className="h-3 w-3" />
          Editar
        </Link>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-white transition-colors rounded"
        >
          {event.isPublished ? <Globe className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
          Link
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-white transition-colors rounded"
        >
          <Download className="h-3 w-3" />
          PNG
        </button>

        <div className="flex-1" />

        <AlertDialog>
          <AlertDialogTrigger
            disabled={deleting || isPending}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors rounded disabled:opacity-50 bg-transparent border-0"
          >
            <Trash2 className="h-3 w-3" />
            {deleting ? "..." : "Excluir"}
          </AlertDialogTrigger>
          <AlertDialogContent style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-white">{event.name}</span> será excluído permanentemente junto com todos os palcos e sessões.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => startTransition(handleDelete)}
                disabled={deleting || isPending}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                {deleting || isPending ? "Excluindo..." : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
