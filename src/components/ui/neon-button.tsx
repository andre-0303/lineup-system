"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

interface NewEventButtonProps {
  href: string;
  label?: string;
  mobile?: boolean;
}

export function NewEventButton({ href, label = "Novo Evento", mobile = false }: NewEventButtonProps) {
  if (mobile) {
    return (
      <Link href={href}>
        <button
          className="fixed bottom-6 right-6 flex items-center justify-center w-12 h-12 shadow-lg lg:hidden"
          style={{ background: "#00ff00", color: "#000" }}
          aria-label={label}
        >
          <Plus className="h-5 w-5" />
        </button>
      </Link>
    );
  }

  return (
    <Link href={href}>
      <button
        className="neon-btn flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-widest uppercase"
        style={{ width: "auto" }}
      >
        <Plus className="h-3 w-3" />
        {label}
      </button>
    </Link>
  );
}
