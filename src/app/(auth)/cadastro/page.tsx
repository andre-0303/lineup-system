"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const cadastroSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

export default function CadastroPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormData>({ resolver: zodResolver(cadastroSchema) });

  async function onSubmit(data: CadastroFormData) {
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.message ?? "Erro ao criar conta.");
      return;
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    router.push("/home");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-black" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>

      {/* ── Left panel ── */}
      <div className="auth-grid-bg hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Bar top */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "#00ff00" }} />

        {/* Logo */}
        <div className="auth-fade-in">
          <p className="text-xs tracking-[0.3em] text-green-400 uppercase mb-4">Sistema</p>
          <div className="leading-none">
            <div className="text-7xl font-bold text-white tracking-tighter">LINE</div>
            <div className="text-7xl font-bold tracking-tighter" style={{ color: "#00ff00" }}>UP</div>
          </div>
        </div>

        {/* Feature list */}
        <div className="auth-fade-in-delay-2 space-y-4">
          {[
            ["01", "Crie eventos multi-dia"],
            ["02", "Monte grade horária"],
            ["03", "Detecte conflitos"],
            ["04", "Exporte PNG 1024×1024"],
          ].map(([num, text]) => (
            <div key={num} className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "#00ff00" }}>{num}</span>
              <div className="h-px flex-1" style={{ background: "rgba(0,255,0,0.15)" }} />
              <span className="text-xs text-white/50 tracking-wide">{text}</span>
            </div>
          ))}
        </div>

        {/* Triangle bottom-right */}
        <div
          className="absolute bottom-0 right-0"
          style={{
            width: 0, height: 0,
            borderLeft: "100px solid transparent",
            borderBottom: "100px solid #00ff00",
            opacity: 0.7,
          }}
        />
      </div>

      {/* ── Right panel / Form ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-[#0a0a0a]">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 auth-fade-in">
            <span className="text-3xl font-bold text-white tracking-tighter">LINE<span style={{ color: "#00ff00" }}>UP</span></span>
          </div>

          {/* Header */}
          <div className="auth-fade-in-delay-1 mb-10">
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#00ff00" }}>
              // novo acesso
            </p>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Criar conta
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-fade-in mb-6 px-3 py-2 border border-red-500/30 bg-red-500/5 text-red-400 text-xs tracking-wide">
              ✗ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

            <div className="auth-fade-in-delay-1">
              <label className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: "rgba(0,255,0,0.6)" }}>
                Nome
              </label>
              <input
                type="text"
                autoComplete="name"
                placeholder="Seu nome"
                className="auth-input"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="auth-fade-in-delay-2">
              <label className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: "rgba(0,255,0,0.6)" }}>
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                className="auth-input"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="auth-fade-in-delay-3">
              <label className="block text-xs tracking-[0.2em] uppercase mb-2" style={{ color: "rgba(0,255,0,0.6)" }}>
                Senha
              </label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className="auth-input"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="auth-fade-in-delay-4 pt-2">
              <button type="submit" disabled={isSubmitting} className="neon-btn">
                {isSubmitting ? "Criando..." : "Criar conta →"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="auth-fade-in-delay-5 mt-8 text-center">
            <p className="text-xs text-white/30">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 transition-colors hover:text-white"
                style={{ color: "rgba(0,255,0,0.6)" }}
              >
                Fazer login
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
