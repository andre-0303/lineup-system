import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WizardStepper } from "@/components/layout/WizardStepper";
import { StageForm } from "@/components/forms/StageForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PalcosPage({ params }: Props) {
  const { id: eventId } = await params;
  const session = await getServerSession(authOptions);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { stages: { orderBy: { displayOrder: "asc" } } },
  });

  if (!event || event.createdBy !== session?.user?.id) notFound();

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
          <WizardStepper currentStep={2} />
        </div>

        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(0,255,0,0.6)" }}>
            // step 2 de 6
          </p>
          <h1 className="text-xl font-semibold text-white">{event.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Palcos e salas</p>
        </div>

        <StageForm eventId={eventId} initialStages={event.stages} />
      </main>
    </div>
  );
}
