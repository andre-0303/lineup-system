"use client";

import { useState, useEffect, type CSSProperties } from "react";
import {
  Download,
  Loader2,
  MapPin,
  Calendar,
  Users,
  Layers,
  Share2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateLineupPNG, downloadDataUrl } from "@/lib/lineup-generator";
import { LineupPreview } from "./LineupPreview";
import { SESSION_TYPES } from "@/lib/validations/session";
import type { ThemeConfig, EventWithRelations, Speaker } from "@/types";

const PREVIEW_ID = "public-lineup-preview";

interface LineupPublicViewProps {
  event: EventWithRelations;
  theme: ThemeConfig;
}

export function LineupPublicView({ event, theme }: LineupPublicViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [scale, setScale] = useState(0.7);

  const primary = theme.primaryColor;
  const accent = theme.accentColor ?? "#ff00ff";
  const bg = theme.backgroundColor;
  const text = theme.textColor;

  useEffect(() => {
    function updateScale() {
      const vw = window.innerWidth;
      if (vw < 640) setScale(Math.min(0.85, (vw - 32) / 1080));
      else if (vw < 1200) setScale(Math.min(0.88, (vw - 64) / 1080));
      else setScale(0.72);
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const dataUrl = await generateLineupPNG(PREVIEW_ID);
      downloadDataUrl(dataUrl, `${event.slug}-lineup.png`);
      toast.success("PNG gerado com sucesso!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao gerar PNG.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event.name, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  }

  const sessionsByStage = event.stages
    .map((stage) => ({
      stage,
      sessions: event.sessions
        .filter((s) => s.stageId === stage.id)
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        ),
    }))
    .filter(({ sessions }) => sessions.length > 0);

  const speakersMap = new Map<string, Speaker>();
  event.sessions.forEach((session) => {
    session.speakers.forEach(({ speaker }) => {
      speakersMap.set(speaker.id, speaker);
    });
  });
  const speakers = Array.from(speakersMap.values());

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const sameDay =
    startDate.getUTCFullYear() === endDate.getUTCFullYear() &&
    startDate.getUTCMonth() === endDate.getUTCMonth() &&
    startDate.getUTCDate() === endDate.getUTCDate();

  const startDay = String(startDate.getUTCDate()).padStart(2, "0");
  const endDay = String(endDate.getUTCDate()).padStart(2, "0");
  const dayDisplay = sameDay ? startDay : `${startDay}·${endDay}`;

  const startMonth = format(
    new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()),
    "MMM",
    { locale: ptBR }
  ).toUpperCase();

  const startYear = startDate.getUTCFullYear();

  const monthYear = format(
    new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()),
    "MMMM 'de' yyyy",
    { locale: ptBR }
  );

  const cornerStyle = (pos: CSSProperties): CSSProperties => ({
    position: "absolute",
    width: "14px",
    height: "14px",
    ...pos,
  });

  const marqueeSegment = [
    event.name.toUpperCase(),
    `${event.sessions.length} SESSÕES`,
    `${speakers.length} PALESTRANTES`,
    event.location ? event.location.toUpperCase() : null,
    monthYear.toUpperCase(),
  ]
    .filter(Boolean)
    .join("  ◆  ");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

        @keyframes _scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200vh); }
        }
        @keyframes _glitch-a {
          0%,88%,100% { clip-path: inset(0 0 100% 0); transform: translate(0); opacity: 0; }
          89% { clip-path: inset(15% 0 55% 0); transform: translate(-5px); opacity: 0.7; }
          91% { clip-path: inset(65% 0 5% 0); transform: translate(4px); opacity: 0.7; }
          93% { clip-path: inset(35% 0 30% 0); transform: translate(-3px); opacity: 0.5; }
          95% { clip-path: inset(0 0 100% 0); opacity: 0; }
        }
        @keyframes _glitch-b {
          0%,85%,100% { clip-path: inset(0 0 100% 0); transform: translate(0); opacity: 0; }
          86% { clip-path: inset(8% 0 72% 0); transform: translate(6px); opacity: 0.6; }
          90% { clip-path: inset(55% 0 18% 0); transform: translate(-4px); opacity: 0.6; }
          92% { clip-path: inset(0 0 100% 0); opacity: 0; }
        }
        @keyframes _fadein {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes _blink {
          0%,100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes _pulseGlow {
          0%,100% { box-shadow: 0 0 16px ${primary}35, 0 0 40px ${primary}08; }
          50% { box-shadow: 0 0 28px ${primary}55, 0 0 60px ${primary}18; }
        }
        @keyframes _marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .lpu-hero   { animation: _fadein 0.7s ease both; }
        .lpu-ticker { animation: _fadein 0.7s 0.1s ease both; }
        .lpu-schedule { animation: _fadein 0.7s 0.2s ease both; }
        .lpu-speakers { animation: _fadein 0.7s 0.32s ease both; }
        .lpu-card   { animation: _fadein 0.7s 0.44s ease both; }

        .lpu-title { position: relative; display: block;
          font-family: 'Bebas Neue', 'Arial Black', sans-serif; }
        .lpu-title::before {
          content: attr(data-text); position: absolute; inset: 0;
          color: ${primary}; animation: _glitch-a 7s infinite; pointer-events: none;
        }
        .lpu-title::after {
          content: attr(data-text); position: absolute; inset: 0;
          color: ${accent}; animation: _glitch-b 7s infinite; pointer-events: none;
        }

        .lpu-session-card {
          border: 1px solid ${text}08;
          transition: border-color 0.18s, background 0.18s, transform 0.18s;
          cursor: default;
        }
        .lpu-session-card:hover {
          border-color: ${primary}35 !important;
          background: ${primary}07 !important;
          transform: translateY(-2px);
        }

        .lpu-speaker {
          border: 1px solid ${text}08;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          cursor: default;
        }
        .lpu-speaker:hover {
          transform: translateY(-4px);
          border-color: ${primary}28 !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.45) !important;
        }

        .lpu-dl-btn { animation: _pulseGlow 3s ease-in-out infinite; }

        .lpu-cursor::after {
          content: "_"; animation: _blink 1s step-end infinite;
          color: ${primary}; margin-left: 2px;
        }

        .lpu-marquee-track {
          display: flex; white-space: nowrap;
          animation: _marquee 28s linear infinite;
        }

        .lpu-year {
          font-family: 'Bebas Neue', 'Arial Black', sans-serif;
          font-size: clamp(160px, 26vw, 320px);
          line-height: 1; letter-spacing: -0.04em;
          color: ${primary}05;
          position: absolute; right: -8px; bottom: -24px;
          pointer-events: none; user-select: none;
        }

        .lpu-session-bg-num {
          font-family: 'Bebas Neue', 'Arial Black', sans-serif;
          font-size: 64px; line-height: 1;
          color: ${primary}08;
          position: absolute; right: 12px; bottom: 8px;
          pointer-events: none; user-select: none;
        }

        .lpu-speaker-idx {
          font-family: 'Bebas Neue', 'Arial Black', sans-serif;
          font-size: 36px; line-height: 1;
          color: ${primary}07;
          position: absolute; top: 10px; right: 12px;
          pointer-events: none; user-select: none;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: bg,
          color: text,
          fontFamily: '"JetBrains Mono", "Courier New", monospace',
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "fixed", inset: 0,
            backgroundImage: `
              linear-gradient(${primary}04 1px, transparent 1px),
              linear-gradient(90deg, ${primary}04 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
            pointerEvents: "none", zIndex: 0,
          }}
        />

        {/* Top-left radial glow */}
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, height: "70vh",
            background: `radial-gradient(ellipse 60% 70% at 15% 0%, ${primary}0d 0%, transparent 65%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />

        {/* Bottom-right accent glow */}
        <div
          style={{
            position: "fixed", bottom: 0, right: 0, width: "55vw", height: "55vh",
            background: `radial-gradient(ellipse 80% 80% at 100% 100%, ${accent}09 0%, transparent 65%)`,
            pointerEvents: "none", zIndex: 0,
          }}
        />

        {/* Scanline */}
        <div
          style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}
        >
          <div
            style={{
              position: "absolute", left: 0, right: 0, height: "3px",
              background: `linear-gradient(transparent, ${primary}12, transparent)`,
              animation: "_scanline 10s linear infinite",
            }}
          />
        </div>

        {/* ── NAV BAR ── */}
        <nav
          style={{
            position: "sticky", top: 0, zIndex: 50,
            borderBottom: `1px solid ${primary}12`,
            background: `${bg}cc`, backdropFilter: "blur(14px)",
            padding: "10px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "9px", letterSpacing: "0.35em", color: primary, textTransform: "uppercase" }}>
              LINEUP
            </span>
            <span style={{ color: `${text}25`, fontSize: "11px" }}>/</span>
            <span
              className="lpu-cursor"
              style={{ fontSize: "9px", letterSpacing: "0.1em", color: `${text}45` }}
            >
              {event.slug}
            </span>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={handleShare}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 12px",
                border: `1px solid ${primary}28`, background: "transparent",
                color: `${text}55`, fontSize: "9px", letterSpacing: "0.25em",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${primary}60`; e.currentTarget.style.color = text; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${primary}28`; e.currentTarget.style.color = `${text}55`; }}
            >
              <Share2 size={10} />
              COMPARTILHAR
            </button>

            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="lpu-dl-btn"
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "6px 14px",
                border: `1px solid ${primary}`, background: `${primary}18`,
                color: primary, fontSize: "9px", letterSpacing: "0.25em",
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.6 : 1,
                fontFamily: "inherit", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!isGenerating) e.currentTarget.style.background = `${primary}30`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `${primary}18`; }}
            >
              {isGenerating ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />}
              {isGenerating ? "GERANDO..." : "BAIXAR PNG"}
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section
          className="lpu-hero"
          style={{
            position: "relative",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "64px 28px 56px",
            overflow: "hidden",
          }}
        >
          {/* Year watermark */}
          <div className="lpu-year">{startYear}</div>

          {/* Tags row */}
          <div
            style={{
              display: "flex", gap: "8px", marginBottom: "32px",
              flexWrap: "wrap", position: "relative", zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: "8px", letterSpacing: "0.45em",
                padding: "4px 12px", border: `1px solid ${primary}40`,
                color: primary, textTransform: "uppercase",
              }}
            >
              EVENTO TECH
            </span>
            {event.sessions.length > 0 && (
              <span
                style={{
                  fontSize: "8px", letterSpacing: "0.45em",
                  padding: "4px 12px", border: `1px solid ${accent}30`,
                  color: accent, textTransform: "uppercase",
                }}
              >
                {event.sessions.length} SESSÕES
              </span>
            )}
            {speakers.length > 0 && (
              <span
                style={{
                  fontSize: "8px", letterSpacing: "0.45em",
                  padding: "4px 12px", border: `1px solid ${text}14`,
                  color: `${text}45`, textTransform: "uppercase",
                }}
              >
                {speakers.length} PALESTRANTES
              </span>
            )}
          </div>

          {/* Title + date grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "clamp(24px, 4vw, 64px)",
              alignItems: "flex-end",
              marginBottom: "48px",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Left: event name */}
            <h1
              className="lpu-title"
              data-text={event.name.toUpperCase()}
              style={{
                fontSize: "clamp(48px, 9vw, 110px)",
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: text,
                userSelect: "none",
                margin: 0,
              }}
            >
              {event.name.toUpperCase()}
            </h1>

            {/* Right: date block */}
            <div
              style={{
                textAlign: "right",
                borderRight: `3px solid ${primary}`,
                paddingRight: "20px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: "8px", letterSpacing: "0.45em",
                  color: `${text}30`, textTransform: "uppercase",
                  marginBottom: "2px",
                }}
              >
                DATA
              </div>
              <div
                style={{
                  fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                  fontSize: "clamp(56px, 10vw, 116px)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: primary,
                  textShadow: `0 0 40px ${primary}55, 0 0 80px ${primary}22`,
                }}
              >
                {dayDisplay}
              </div>
              <div
                style={{
                  fontSize: "11px", letterSpacing: "0.22em",
                  color: `${text}55`, textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                {startMonth} {startYear}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p
              style={{
                fontSize: "14px", lineHeight: 1.65,
                color: `${text}55`, maxWidth: "560px",
                letterSpacing: "0.015em", marginBottom: "40px",
                fontFamily: '"Inter", system-ui, sans-serif',
                position: "relative", zIndex: 1,
              }}
            >
              {event.description}
            </p>
          )}

          {/* Bottom info bar */}
          <div
            style={{
              display: "flex", alignItems: "center",
              gap: "28px", flexWrap: "wrap",
              paddingTop: "24px",
              borderTop: `1px solid ${primary}14`,
              position: "relative", zIndex: 1,
            }}
          >
            {event.location && (
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <MapPin size={11} style={{ color: accent }} />
                <span
                  style={{
                    fontSize: "11px", letterSpacing: "0.14em",
                    color: `${text}60`, textTransform: "uppercase",
                  }}
                >
                  {event.location}
                </span>
              </div>
            )}

            {event.location && (
              <div style={{ width: "1px", height: "18px", background: `${text}12` }} />
            )}

            {[
              { Icon: Layers, value: event.stages.length, label: event.stages.length === 1 ? "palco" : "palcos" },
              { Icon: Calendar, value: event.sessions.length, label: event.sessions.length === 1 ? "sessão" : "sessões" },
              { Icon: Users, value: speakers.length, label: speakers.length === 1 ? "palestrante" : "palestrantes" },
            ].map(({ Icon, value, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon size={11} style={{ color: `${text}28` }} />
                <span style={{ fontSize: "20px", fontWeight: 700, color: text, lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: "8px", letterSpacing: "0.2em", color: `${text}30`, textTransform: "uppercase" }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── MARQUEE TICKER ── */}
        <div
          className="lpu-ticker"
          style={{
            borderTop: `1px solid ${primary}14`,
            borderBottom: `1px solid ${primary}14`,
            padding: "9px 0",
            overflow: "hidden",
            background: `${primary}04`,
            position: "relative", zIndex: 1,
          }}
        >
          <div className="lpu-marquee-track">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                style={{
                  fontSize: "9px", letterSpacing: "0.3em",
                  color: `${text}28`, padding: "0 36px",
                  textTransform: "uppercase", whiteSpace: "nowrap",
                }}
              >
                {marqueeSegment}
              </span>
            ))}
          </div>
        </div>

        {/* ── SCHEDULE ── */}
        <section
          className="lpu-schedule"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "72px 28px 64px",
          }}
        >
          <div
            style={{
              display: "flex", alignItems: "center", gap: "16px",
              marginBottom: "48px",
            }}
          >
            <span
              style={{
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                fontSize: "13px", letterSpacing: "0.5em",
                color: primary, textTransform: "uppercase", whiteSpace: "nowrap",
              }}
            >
              PROGRAMAÇÃO
            </span>
            <div
              style={{
                flex: 1, height: "1px",
                background: `linear-gradient(90deg, ${primary}30, transparent)`,
              }}
            />
            <span style={{ fontSize: "8px", color: `${text}20`, letterSpacing: "0.15em" }}>
              {event.sessions.length} SESSÕES
            </span>
          </div>

          {sessionsByStage.length === 0 ? (
            <p style={{ color: `${text}25`, fontSize: "11px", letterSpacing: "0.1em" }}>
              Nenhuma sessão cadastrada.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "52px" }}>
              {sessionsByStage.map(({ stage, sessions: stageSessions }, stageIdx) => (
                <div key={stage.id}>
                  {/* Stage header */}
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      marginBottom: "20px", paddingBottom: "14px",
                      borderBottom: `1px solid ${accent}18`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                        fontSize: "30px", color: `${text}08`,
                        lineHeight: 1, letterSpacing: "0.05em",
                      }}
                    >
                      {String(stageIdx + 1).padStart(2, "0")}
                    </span>
                    <div
                      style={{
                        width: "8px", height: "8px",
                        background: accent,
                        boxShadow: `0 0 12px ${accent}80`,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "11px", fontWeight: 700,
                        letterSpacing: "0.35em",
                        color: `${text}80`, textTransform: "uppercase",
                      }}
                    >
                      {stage.name}
                    </span>
                    {stage.capacity && (
                      <span
                        style={{
                          fontSize: "8px", letterSpacing: "0.15em",
                          color: `${text}20`, marginLeft: "auto",
                        }}
                      >
                        CAP. {stage.capacity}
                      </span>
                    )}
                  </div>

                  {/* Sessions cards grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    {stageSessions.map((session, idx) => {
                      const typeInfo = SESSION_TYPES.find(
                        (t) => t.value === session.sessionType
                      );
                      const typeColor = typeInfo?.color ?? primary;
                      const start = new Date(session.startTime).toISOString().slice(11, 16);
                      const end = new Date(session.endTime).toISOString().slice(11, 16);
                      const speakerNames = session.speakers
                        .map((ss) => ss.speaker.name)
                        .join(", ");
                      const durationMin = Math.round(
                        (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000
                      );

                      return (
                        <div
                          key={session.id}
                          className="lpu-session-card"
                          style={{
                            padding: "22px 20px",
                            background: `${text}02`,
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Background session number */}
                          <div className="lpu-session-bg-num">
                            {String(idx + 1).padStart(2, "0")}
                          </div>

                          {/* Type badge + duration row */}
                          <div
                            style={{
                              display: "flex", alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "16px",
                            }}
                          >
                            {typeInfo ? (
                              <span
                                style={{
                                  fontSize: "7px", letterSpacing: "0.3em",
                                  textTransform: "uppercase",
                                  color: typeColor,
                                  background: `${typeColor}10`,
                                  border: `1px solid ${typeColor}22`,
                                  padding: "3px 8px",
                                }}
                              >
                                {typeInfo.label}
                              </span>
                            ) : (
                              <span />
                            )}

                            <div
                              style={{
                                display: "flex", alignItems: "center", gap: "5px",
                                color: `${text}28`, fontSize: "9px", letterSpacing: "0.08em",
                              }}
                            >
                              <Clock size={8} />
                              {durationMin}min
                            </div>
                          </div>

                          {/* Time display */}
                          <div
                            style={{
                              fontSize: "24px", fontWeight: 800,
                              color: text, letterSpacing: "0.02em",
                              lineHeight: 1, marginBottom: "12px",
                              fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                            }}
                          >
                            {start}
                            <span
                              style={{
                                fontSize: "13px", color: `${text}25`,
                                marginLeft: "8px", fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 400,
                              }}
                            >
                              → {end}
                            </span>
                          </div>

                          {/* Title */}
                          <div
                            style={{
                              fontSize: "15px", fontWeight: 700,
                              color: text, lineHeight: 1.35,
                              marginBottom: speakerNames ? "10px" : "0",
                              paddingRight: "48px",
                            }}
                          >
                            {session.title}
                          </div>

                          {/* Speakers */}
                          {speakerNames && (
                            <div
                              style={{
                                fontSize: "10px", color: accent,
                                letterSpacing: "0.05em", opacity: 0.85,
                              }}
                            >
                              {speakerNames}
                            </div>
                          )}

                          {/* Bottom accent line */}
                          <div
                            style={{
                              position: "absolute", bottom: 0, left: 0, right: 0,
                              height: "2px",
                              background: `linear-gradient(90deg, ${typeColor}40, transparent)`,
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── SPEAKERS ── */}
        {speakers.length > 0 && (
          <section
            className="lpu-speakers"
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 28px 72px",
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                marginBottom: "36px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                  fontSize: "13px", letterSpacing: "0.5em",
                  color: primary, textTransform: "uppercase", whiteSpace: "nowrap",
                }}
              >
                PALESTRANTES
              </span>
              <div
                style={{
                  flex: 1, height: "1px",
                  background: `linear-gradient(90deg, ${primary}30, transparent)`,
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                gap: "14px",
              }}
            >
              {speakers.map((speaker, idx) => (
                <div
                  key={speaker.id}
                  className="lpu-speaker"
                  style={{
                    padding: "24px 20px",
                    background: `${text}02`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Index watermark */}
                  <div className="lpu-speaker-idx">
                    {String(idx + 1).padStart(2, "0")}
                  </div>

                  {/* Avatar */}
                  <div style={{ marginBottom: "16px" }}>
                    {speaker.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={speaker.avatarUrl}
                        alt={speaker.name}
                        style={{
                          width: "52px", height: "52px",
                          objectFit: "cover",
                          border: `1px solid ${primary}30`,
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "52px", height: "52px",
                          background: `${primary}10`,
                          border: `1px solid ${primary}25`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "22px", fontWeight: 800,
                          color: primary,
                          fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                        }}
                      >
                        {speaker.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: "13px", fontWeight: 700,
                      color: text, lineHeight: 1.3, marginBottom: "5px",
                    }}
                  >
                    {speaker.name}
                  </div>

                  {speaker.role && (
                    <div
                      style={{
                        fontSize: "10px", color: `${text}40`,
                        lineHeight: 1.4, marginBottom: "5px",
                      }}
                    >
                      {speaker.role}
                    </div>
                  )}

                  {speaker.company && (
                    <div
                      style={{
                        fontSize: "8px", color: accent,
                        letterSpacing: "0.18em", textTransform: "uppercase",
                      }}
                    >
                      {speaker.company}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── LINEUP CARD ── */}
        <section
          className="lpu-card"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 28px 88px",
          }}
        >
          <div
            style={{
              display: "flex", alignItems: "center", gap: "16px",
              marginBottom: "36px",
            }}
          >
            <span
              style={{
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                fontSize: "13px", letterSpacing: "0.5em",
                color: primary, textTransform: "uppercase", whiteSpace: "nowrap",
              }}
            >
              CARD DO EVENTO
            </span>
            <div
              style={{
                flex: 1, height: "1px",
                background: `linear-gradient(90deg, ${primary}30, transparent)`,
              }}
            />
          </div>

          <div
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: "28px",
            }}
          >
            {/* Framed preview */}
            <div
              style={{
                position: "relative", padding: "2px",
                background: `linear-gradient(135deg, ${primary}50, ${accent}20, transparent 70%)`,
              }}
            >
              <div
                style={{
                  overflow: "hidden",
                  width: `${1080 * scale}px`,
                  height: `${1080 * scale}px`,
                  background: bg, display: "block",
                }}
              >
                <div
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    width: "1080px", height: "1080px",
                  }}
                >
                  <LineupPreview
                    event={event}
                    theme={theme}
                    previewId={PREVIEW_ID}
                  />
                </div>
              </div>

              {/* Corner accents */}
              <div style={cornerStyle({ top: "-3px", left: "-3px", borderTop: `2px solid ${primary}`, borderLeft: `2px solid ${primary}` })} />
              <div style={cornerStyle({ top: "-3px", right: "-3px", borderTop: `2px solid ${primary}`, borderRight: `2px solid ${primary}` })} />
              <div style={cornerStyle({ bottom: "-3px", left: "-3px", borderBottom: `2px solid ${primary}`, borderLeft: `2px solid ${primary}` })} />
              <div style={cornerStyle({ bottom: "-3px", right: "-3px", borderBottom: `2px solid ${primary}`, borderRight: `2px solid ${primary}` })} />
            </div>

            {/* Download CTA */}
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "14px 40px",
                border: `1px solid ${primary}`, background: `${primary}15`,
                color: primary, fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.35em", textTransform: "uppercase",
                cursor: isGenerating ? "not-allowed" : "pointer",
                opacity: isGenerating ? 0.6 : 1,
                fontFamily: "inherit",
                transition: "background 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.background = `${primary}28`;
                  e.currentTarget.style.boxShadow = `0 0 28px ${primary}30`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${primary}15`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              {isGenerating ? "GERANDO PNG..." : "BAIXAR CARD 1080×1080"}
            </button>

            <p
              style={{
                fontSize: "9px", color: `${text}25`,
                letterSpacing: "0.12em", textAlign: "center",
              }}
            >
              Imagem PNG · ideal para redes sociais
            </p>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer
          style={{
            borderTop: `1px solid ${primary}0c`,
            padding: "18px 28px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "8px",
          }}
        >
          <span style={{ fontSize: "8px", letterSpacing: "0.2em", color: `${text}18` }}>
            /lineup/{event.slug}
          </span>
          <span style={{ fontSize: "8px", letterSpacing: "0.2em", color: `${text}18` }}>
            CRIADO COM{" "}
            <span style={{ color: `${primary}50` }}>LINEUP SYSTEM</span>
          </span>
        </footer>
      </div>
    </>
  );
}
