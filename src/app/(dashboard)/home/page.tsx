import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Meus Eventos | LineUp System",
  description: "Gerencie seus lineups de eventos de tecnologia.",
};
import { getUserEvents } from "./actions";
import { EventCard } from "@/components/lineup/EventCard";
import { EventCardSkeleton } from "@/components/lineup/EventCardSkeleton";
import { NewEventButton } from "@/components/ui/neon-button";

async function EventsList() {
  const events = await getUserEvents();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="mb-6 text-5xl font-bold tracking-tighter leading-none"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: "rgba(0,255,0,0.15)" }}
        >
          {"{ }"}
        </div>
        <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
          Nenhum evento criado ainda.
        </p>
        <p className="text-xs text-muted-foreground/50 mb-6">
          Crie seu primeiro lineup.
        </p>
        <Link href="/cadastro-lineup">
          <button
            className="flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase transition-all border"
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              borderColor: "rgba(0,255,0,0.3)",
              color: "#00ff00",
            }}
          >
            <Plus className="h-3 w-3" />
            Novo Evento
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

function EventsListFallback() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-[#0a0a0a]"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white tracking-tighter">
            LINE<span style={{ color: "#00ff00" }}>UP</span>
          </span>
          <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <span className="text-xs text-muted-foreground tracking-widest uppercase">Dashboard</span>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-8 max-w-6xl mx-auto">

        {/* Page title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(0,255,0,0.6)" }}>
              // eventos
            </p>
            <h1 className="text-xl font-semibold text-white">Meus Lineups</h1>
          </div>

          <NewEventButton href="/cadastro-lineup" />
        </div>

        {/* Events grid */}
        <Suspense fallback={<EventsListFallback />}>
          <EventsList />
        </Suspense>
      </main>

      {/* Floating action button (mobile) */}
      <NewEventButton href="/cadastro-lineup" mobile />
    </div>
  );
}
