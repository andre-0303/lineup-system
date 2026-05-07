"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginFormData) {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setError("Credenciais inválidas.");
      return;
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-black" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>

      {/* ── Left panel ── */}
      <div className="auth-grid-bg hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Triangle top-right */}
        <div
          className="absolute top-0 right-0 opacity-80"
          style={{
            width: 0, height: 0,
            borderLeft: "120px solid transparent",
            borderTop: "120px solid #00ff00",
          }}
        />

        {/* Logo */}
        <div className="auth-fade-in">
          <p className="text-xs tracking-[0.3em] text-green-400 uppercase mb-4">Sistema</p>
          <div className="leading-none">
            <div className="text-7xl font-bold text-white tracking-tighter">LINE</div>
            <div className="text-7xl font-bold text-white tracking-tighter">UP</div>
            <div
              className="text-2xl tracking-widest mt-2 cursor-blink"
              style={{ color: "#00ff00" }}
            >
              _
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="auth-fade-in-delay-2">
          <div className="border-l-2 border-green-500 pl-4 mb-8">
            <p className="text-white/40 text-xs leading-relaxed tracking-wide">
              Crie lineups visuais para<br />
              eventos de tecnologia.<br />
              Grade horária. PNG 1024×1024.
            </p>
          </div>

          {/* Schedule preview */}
          <div className="text-xs" style={{ color: "rgba(0,255,0,0.5)" }}>
            <div className="mb-1">{"{"}</div>
            <div className="ml-4 mb-1">09:00 - 10:00 <span className="text-white/30">(keynote)</span></div>
            <div className="ml-4 mb-1">10:30 - 12:00 <span className="text-white/30">(workshop)</span></div>
            <div className="ml-4 mb-1">14:00 - 15:00 <span className="text-white/30">(talk)</span></div>
            <div>{"}"}</div>
          </div>
        </div>

        {/* Triangle bottom-right */}
        <div
          className="absolute bottom-0 right-0 opacity-40"
          style={{
            width: 0, height: 0,
            borderLeft: "60px solid transparent",
            borderBottom: "60px solid #00ff00",
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
              // acesso
            </p>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Bem-vindo de volta
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="auth-fade-in mb-6 px-3 py-2 border border-red-500/30 bg-red-500/5 text-red-400 text-xs tracking-wide">
              ✗ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

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
                autoComplete="current-password"
                placeholder="••••••••"
                className="auth-input"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="auth-fade-in-delay-4 pt-2">
              <button type="submit" disabled={isSubmitting} className="neon-btn">
                {isSubmitting ? "Autenticando..." : "Entrar →"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="auth-fade-in-delay-5 mt-8 text-center">
            <p className="text-xs text-white/30">
              Sem conta?{" "}
              <Link
                href="/cadastro"
                className="underline underline-offset-4 transition-colors hover:text-white"
                style={{ color: "rgba(0,255,0,0.6)" }}
              >
                Criar acesso
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
