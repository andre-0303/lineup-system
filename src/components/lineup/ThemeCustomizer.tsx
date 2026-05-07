"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveTheme } from "@/app/(dashboard)/cadastro-lineup/[id]/visual/actions";
import { LineupPreview } from "./LineupPreview";
import type { ThemeConfig, EventWithRelations } from "@/types";

const LABEL_CLASS = "block text-xs tracking-[0.2em] uppercase mb-2 font-mono";

interface ThemeCustomizerProps {
  eventId: string;
  event: EventWithRelations;
  initialTheme: ThemeConfig;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: "#00ff00",
  backgroundColor: "#000000",
  textColor: "#ffffff",
  accentColor: "#ff00ff",
  fontFamily: "monospace",
  layout: "compact",
  scheduleSize: "medium",
};

function ColorPicker({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [hexInput, setHexInput] = useState(value);

  function handleHexChange(raw: string) {
    setHexInput(raw);
    const clean = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      onChange(clean.toLowerCase());
    }
  }

  function handleColorPickerChange(v: string) {
    onChange(v);
    setHexInput(v);
  }

  return (
    <div>
      <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => handleColorPickerChange(e.target.value)}
          className="w-8 h-8 cursor-pointer border-0 bg-transparent p-0 shrink-0"
          style={{ borderRadius: 0 }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          maxLength={7}
          spellCheck={false}
          className="w-24 bg-transparent border-b text-xs font-mono focus:outline-none transition-colors"
          style={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = "rgba(0,255,0,0.5)"}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            // Reset to current valid value if invalid
            if (!/^#[0-9a-fA-F]{6}$/.test(hexInput)) setHexInput(value);
          }}
        />
      </div>
    </div>
  );
}

export function ThemeCustomizer({ eventId, event, initialTheme }: ThemeCustomizerProps) {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeConfig>({ ...DEFAULT_THEME, ...initialTheme });
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveTheme(eventId, theme);
        toast.success("Tema salvo.");
        router.push(`/cadastro-lineup/${eventId}/publicar`);
      } catch {
        toast.error("Erro ao salvar tema.");
      }
    });
  }

  const scale = 0.38;

  return (
    <div
      className="flex flex-col xl:flex-row gap-8"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
      {/* Controls */}
      <div className="xl:w-72 shrink-0 space-y-6">

        {/* Colors */}
        <div>
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "rgba(0,255,0,0.6)" }}>
            // cores
          </p>
          <div className="space-y-3">
            <ColorPicker label="Fundo" value={theme.backgroundColor} onChange={(v) => update("backgroundColor", v)} />
            <ColorPicker label="Texto" value={theme.textColor} onChange={(v) => update("textColor", v)} />
            <ColorPicker label="Acento Principal" value={theme.primaryColor} onChange={(v) => update("primaryColor", v)} />
            <ColorPicker label="Acento Secundário" value={theme.accentColor ?? "#ff00ff"} onChange={(v) => update("accentColor", v)} />
          </div>
        </div>

        {/* Font */}
        <div>
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(0,255,0,0.6)" }}>
            // fonte
          </p>
          <div className="space-y-2">
            {(["monospace", "sans-serif", "serif"] as const).map((f) => (
              <label key={f} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="fontFamily"
                  value={f}
                  checked={theme.fontFamily === f}
                  onChange={() => update("fontFamily", f)}
                  className="accent-green-500"
                />
                <span className="text-xs" style={{
                  color: theme.fontFamily === f ? "#00ff00" : "rgba(255,255,255,0.5)",
                  fontFamily: f === "monospace" ? "monospace" : f === "sans-serif" ? "system-ui" : "Georgia",
                }}>
                  {f}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Layout */}
        <div>
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(0,255,0,0.6)" }}>
            // layout
          </p>
          <div className="space-y-2">
            {(["compact", "spacious"] as const).map((l) => (
              <label key={l} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="layout"
                  value={l}
                  checked={theme.layout === l}
                  onChange={() => update("layout", l)}
                  className="accent-green-500"
                />
                <span className="text-xs" style={{
                  color: theme.layout === l ? "#00ff00" : "rgba(255,255,255,0.5)",
                }}>
                  {l === "compact" ? "Compacto" : "Espaçoso"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Schedule font size */}
        <div>
          <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(0,255,0,0.6)" }}>
            // tamanho da grade
          </p>
          <div className="space-y-2">
            {([
              { value: "small", label: "Pequeno (11px)" },
              { value: "medium", label: "Médio (14px)" },
              { value: "large", label: "Grande (18px)" },
            ] as const).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleSize"
                  value={opt.value}
                  checked={(theme.scheduleSize ?? "medium") === opt.value}
                  onChange={() => update("scheduleSize", opt.value)}
                  className="accent-green-500"
                />
                <span className="text-xs" style={{
                  color: (theme.scheduleSize ?? "medium") === opt.value ? "#00ff00" : "rgba(255,255,255,0.5)",
                }}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Logo URL */}
        <div>
          <label className={LABEL_CLASS} style={{ color: "rgba(0,255,0,0.6)" }}>
            Logo URL <span className="text-white/20 normal-case">(opcional)</span>
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={theme.logoUrl ?? ""}
            onChange={(e) => update("logoUrl", e.target.value || undefined)}
            className="w-full bg-transparent border border-white/10 px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-green-500/60"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="neon-btn w-full"
        >
          {isPending ? "Salvando..." : "Salvar e Próximo →"}
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 min-w-0">
        <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(0,255,0,0.6)" }}>
          // preview
        </p>
        <div
          className="overflow-hidden border"
          style={{
            borderColor: "rgba(0,255,0,0.15)",
            width: `${1080 * scale}px`,
            height: `${1080 * scale}px`,
          }}
        >
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <LineupPreview event={event} theme={theme} />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Preview em escala. Output final: 1024×1024px PNG.
        </p>
      </div>
    </div>
  );
}
