import Link from "next/link";

export default function LineupNotFound() {
  return (
    <div
      className="min-h-screen bg-[#000] flex flex-col items-center justify-center px-4 text-center"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      <div
        className="text-8xl font-black mb-4 leading-none"
        style={{
          color: "transparent",
          WebkitTextStroke: "1px rgba(0,255,0,0.3)",
        }}
      >
        404
      </div>
      <p className="text-sm text-white/40 mb-2">Lineup não encontrado.</p>
      <p className="text-xs text-white/20 mb-8">
        Este evento pode não existir ou não ter sido publicado.
      </p>
      <Link
        href="/"
        className="text-xs tracking-widest uppercase no-underline transition-colors"
        style={{ color: "rgba(0,255,0,0.5)" }}
      >
        Criar meu lineup →
      </Link>
    </div>
  );
}
