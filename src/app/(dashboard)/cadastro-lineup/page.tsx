import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WizardStepper } from "@/components/layout/WizardStepper";
import { EventBasicForm } from "@/components/forms/EventBasicForm";

export const metadata: Metadata = {
  title: "Novo Evento | LineUp System",
  description: "Crie um novo lineup para seu evento de tecnologia.",
};

export default function CadastroLineupPage() {
  return (
    <div
      className="min-h-screen bg-[#0a0a0a]"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      {/* Header */}
      <header
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
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
        </div>
      </header>

      <main className="px-6 py-8 max-w-2xl mx-auto">

        {/* Stepper */}
        <div className="mb-8">
          <WizardStepper currentStep={1} />
        </div>

        {/* Title */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "rgba(0,255,0,0.6)" }}>
            // step 1 de 6
          </p>
          <h1 className="text-xl font-semibold text-white">Dados do Evento</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Informações básicas do seu evento.
          </p>
        </div>

        {/* Form */}
        <EventBasicForm />
      </main>
    </div>
  );
}
