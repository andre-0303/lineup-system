"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GlobeOff } from "lucide-react";
import { unpublishEvent } from "./actions";

export function UnpublishButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleUnpublish() {
    startTransition(async () => {
      try {
        await unpublishEvent(eventId);
        toast.success("Evento despublicado.");
        router.refresh();
      } catch {
        toast.error("Erro ao despublicar.");
      }
    });
  }

  return (
    <button
      onClick={handleUnpublish}
      disabled={isPending}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs border transition-colors disabled:opacity-40"
      style={{ borderColor: "rgba(239,68,68,0.3)", color: "rgba(239,68,68,0.7)" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)")}
    >
      <GlobeOff className="h-3 w-3" />
      {isPending ? "Despublicando..." : "Despublicar"}
    </button>
  );
}
