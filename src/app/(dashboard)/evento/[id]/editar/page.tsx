import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers, Users, Clock, Palette, Globe, GlobeOff } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { EventBasicForm } from "@/components/forms/EventBasicForm";
import { UnpublishButton } from "./UnpublishButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarEventoPage({ params }: Props) {
  const { id: eventId } = await params;
  const session = await getServerSession(authOptions);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: { select: { stages: true, sessions: true } },
    },
  });

  if (!event || event.createdBy !== session?.user?.id) notFound();

  const defaultValues = {
    name: event.name,
    description: event.description ?? undefined,
    startDate: format(new Date(event.startDate), "yyyy-MM-dd"),
    endDate: format(new Date(event.endDate), "yyyy-MM-dd"),
    location: event.location ?? undefined,
  };

  const wizardLinks = [
    { href: `/cadastro-lineup/${eventId}/palcos`, icon: Layers, label: "Palcos", count: event._count.stages },
    { href: `/cadastro-lineup/${eventId}/palestrantes`, icon: Users, label: "Palestrantes" },
    { href: `/cadastro-lineup/${eventId}/grade`, icon: Clock, label: "Grade", count: event._count.sessions },
    { href: `/cadastro-lineup/${eventId}/visual`, icon: Palette, label: "Visual" },
    { href: `/cadastro-lineup/${eventId}/publicar`, icon: Globe, label: "Publicar" },
  ];

  return (
    <div
      className="min-h-screen bg-[#0a0a0a]"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      <header
        className="border-b px-6 py-4 flex items-center gap-3"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <Link
          href="/home"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors no-underline"
        >
          <ArrowLeft className="h-3 w-3" />
          Home
        </Link>
        <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
        <span className="text-lg font-bold text-white tracking-tighter">
          LINE<span style={{ color: "#00ff00" }}>UP</span>
        </span>
      </header>

      <main className="px-6 py-8 max-w-2xl mx-auto">

        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(0,255,0,0.6)" }}>
            // editar evento
          </p>
          <h1 className="text-xl font-semibold text-white">{event.name}</h1>
          {event.isPublished && (
            <span
              className="inline-flex items-center gap-1.5 mt-1 text-[10px] tracking-widest uppercase px-2 py-0.5"
              style={{ background: "rgba(0,255,0,0.1)", color: "#00ff00", border: "1px solid rgba(0,255,0,0.2)" }}
            >
              <Globe className="h-2.5 w-2.5" />
              Publicado
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Main form */}
          <div className="lg:col-span-2">
            <EventBasicForm
              defaultValues={defaultValues}
              eventId={eventId}
              mode="edit"
            />
          </div>

          {/* Sidebar: quick nav + actions */}
          <div className="space-y-4">

            {/* Quick navigation */}
            <div>
              <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "rgba(0,255,0,0.4)" }}>
                Seções
              </p>
              <div className="space-y-1">
                {wizardLinks.map(({ href, icon: Icon, label, count }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between px-3 py-2 text-xs transition-colors no-underline text-white/50 hover:text-white border-l border-white/[0.06]"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-3 w-3" />
                      {label}
                    </span>
                    {count !== undefined && (
                      <span style={{ color: "rgba(0,255,0,0.4)" }}>{count}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Unpublish */}
            {event.isPublished && (
              <UnpublishButton eventId={eventId} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
