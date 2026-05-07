"use client";

import { SESSION_TYPES } from "@/lib/validations/session";
import type { ThemeConfig, EventWithRelations } from "@/types";

interface LineupPreviewProps {
  event: EventWithRelations;
  theme: ThemeConfig;
  previewId?: string;
}

export const LINEUP_SIZE = 1080; // 1080×1080 — Instagram/social post

function getFontFamily(fontFamily: ThemeConfig["fontFamily"]): string {
  switch (fontFamily) {
    case "monospace": return '"JetBrains Mono", "Courier New", monospace';
    case "sans-serif": return '"Inter", system-ui, sans-serif';
    case "serif": return '"Georgia", "Times New Roman", serif';
  }
}

function getScheduleFontSize(size?: ThemeConfig["scheduleSize"]): number {
  switch (size) {
    case "small": return 11;
    case "large": return 19;
    default: return 14;
  }
}

function formatUtcDateParts(date: Date) {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getUTCFullYear());
  return { dd, mm, yyyy };
}

export function LineupPreview({ event, theme, previewId = "lineup-preview" }: LineupPreviewProps) {
  const font = getFontFamily(theme.fontFamily);
  const isCompact = theme.layout === "compact";
  const scheduleFontSize = getScheduleFontSize(theme.scheduleSize);
  const S = LINEUP_SIZE;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const sameDay = startDate.toUTCString().slice(0, 16) === endDate.toUTCString().slice(0, 16);
  const { dd, mm, yyyy } = formatUtcDateParts(startDate);
  const { dd: dd2 } = formatUtcDateParts(endDate);
  const dateDisplay = sameDay ? dd : `${dd}·${dd2}`;

  const allSessions = [...event.sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  const maxSessions = isCompact ? 10 : 8;
  const visibleSessions = allSessions.slice(0, maxSessions);

  const PAD = 64;
  // Left panel width ≈ 38% of canvas
  const LEFT_W = Math.round(S * 0.38);
  const DIVIDER_GAP = 44;
  const RIGHT_X = PAD + LEFT_W + DIVIDER_GAP;
  const RIGHT_W = S - RIGHT_X - PAD;

  return (
    <div
      id={previewId}
      style={{
        width: `${S}px`,
        height: `${S}px`,
        position: "relative",
        overflow: "hidden",
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: font,
        backgroundImage: `
          linear-gradient(${theme.primaryColor}05 1px, transparent 1px),
          linear-gradient(90deg, ${theme.primaryColor}05 1px, transparent 1px)
        `,
        backgroundSize: "36px 36px",
      }}
    >
      {/* ── Top accent bar ── */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "4px",
        background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.primaryColor}00 70%)`,
      }} />

      {/* ── Triangle top-right ── */}
      <div style={{
        position: "absolute",
        top: 0, right: 0,
        width: 0, height: 0,
        borderLeft: "130px solid transparent",
        borderTop: `130px solid ${theme.primaryColor}`,
      }} />

      {/* ═══════════════════════════ LEFT PANEL ═══════════════════════════ */}
      <div style={{
        position: "absolute",
        left: PAD,
        top: PAD,
        bottom: PAD,
        width: `${LEFT_W}px`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>

        {/* — Event name — */}
        <div>
          {theme.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={theme.logoUrl}
              alt=""
              style={{ height: "32px", marginBottom: "14px", objectFit: "contain", display: "block" }}
            />
          )}
          <div style={{
            fontSize: isCompact ? "36px" : "44px",
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: theme.textColor,
          }}>
            {event.name.split(" ").map((word, i) => <div key={i}>{word}</div>)}
          </div>
          <div style={{ marginTop: "12px", width: "36px", height: "3px", background: theme.primaryColor }} />
        </div>

        {/* — Date (fills the middle space) — */}
        <div style={{ lineHeight: 0.88, flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Day: massive, solid, glowing */}
          <div style={{
            fontSize: isCompact ? "140px" : "164px",
            fontWeight: 900,
            letterSpacing: "-0.05em",
            color: theme.primaryColor,
            textShadow: `0 0 50px ${theme.primaryColor}55, 0 0 100px ${theme.primaryColor}1a`,
          }}>
            {dateDisplay}
          </div>
          {/* Month.Year: readable, solid */}
          <div style={{
            fontSize: isCompact ? "26px" : "31px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: theme.textColor,
            opacity: 0.88,
            marginTop: "6px",
          }}>
            {mm}
            <span style={{ color: theme.primaryColor, margin: "0 3px" }}>.</span>
            {yyyy}
          </div>
        </div>

        {/* — Location + URL — */}
        <div style={{ paddingBottom: "2px" }}>
          <div style={{
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: `${theme.textColor}55`,
            marginBottom: "4px",
          }}>
            {event.location ?? ""}
          </div>
          <div style={{
            fontSize: "9px",
            letterSpacing: "0.12em",
            color: `${theme.primaryColor}60`,
          }}>
            /lineup/{event.slug}
          </div>
        </div>
      </div>

      {/* ── Vertical divider ── */}
      <div style={{
        position: "absolute",
        left: `${PAD + LEFT_W + 20}px`,
        top: PAD,
        bottom: PAD,
        width: "1px",
        background: `linear-gradient(to bottom,
          transparent,
          ${theme.primaryColor}25 15%,
          ${theme.primaryColor}25 85%,
          transparent)`,
      }} />

      {/* ═══════════════════════════ RIGHT PANEL ═══════════════════════════ */}
      <div style={{
        position: "absolute",
        left: `${RIGHT_X}px`,
        top: PAD,
        bottom: PAD,
        width: `${RIGHT_W}px`,
        display: "flex",
        flexDirection: "column",
      }}>

        {/* SCHEDULE label */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}>
          <span style={{
            fontSize: "8px",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: `${theme.primaryColor}70`,
          }}>SCHEDULE</span>
          <div style={{ flex: 1, height: "1px", background: `${theme.primaryColor}25` }} />
        </div>

        {/* ── Sessions: flex column, space-between so they fill the panel ── */}
        {visibleSessions.length === 0 ? (
          <div style={{ color: `${theme.textColor}25`, fontSize: "12px" }}>
            Sem sessões cadastradas.
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            // Distribute sessions to fill available height
            justifyContent: visibleSessions.length <= 4 ? "flex-start" : "space-between",
            gap: visibleSessions.length <= 4 ? `${Math.max(8, 60 / visibleSessions.length)}px` : "0",
          }}>
            {visibleSessions.map((session, idx) => {
              const start = new Date(session.startTime).toISOString().slice(11, 16);
              const end = new Date(session.endTime).toISOString().slice(11, 16);
              const typeInfo = SESSION_TYPES.find((t) => t.value === session.sessionType);
              const accentColor = typeInfo?.color ?? theme.primaryColor;
              const speakerNames = session.speakers.map((ss) => ss.speaker.name).join(", ");
              const isLast = idx === visibleSessions.length - 1;

              return (
                <div
                  key={session.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr",
                    gap: "10px",
                    paddingBottom: isLast || visibleSessions.length > 4 ? "0" : "0",
                    borderBottom: !isLast ? `1px solid ${theme.textColor}07` : "none",
                    paddingTop: idx > 0 && visibleSessions.length > 4 ? "0" : "0",
                  }}
                >
                  {/* Time: white, readable */}
                  <div style={{
                    fontSize: `${scheduleFontSize - 1}px`,
                    fontWeight: 600,
                    color: theme.textColor,
                    opacity: 0.9,
                    letterSpacing: "0.02em",
                    paddingTop: "2px",
                    lineHeight: 1.3,
                  }}>
                    {start}
                    <div style={{ fontSize: `${scheduleFontSize - 3}px`, opacity: 0.45, marginTop: "1px" }}>{end}</div>
                  </div>

                  {/* Title + badge + speakers */}
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "5px", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: `${scheduleFontSize}px`,
                        fontWeight: 600,
                        color: theme.textColor,
                        lineHeight: 1.25,
                      }}>
                        {session.title}
                      </span>
                      {typeInfo && (
                        <span style={{
                          fontSize: `${Math.max(7, scheduleFontSize - 5)}px`,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: accentColor,
                          background: `${accentColor}15`,
                          padding: "1px 4px",
                          whiteSpace: "nowrap",
                        }}>
                          {typeInfo.label}
                        </span>
                      )}
                    </div>
                    {speakerNames && (
                      <div style={{
                        fontSize: `${Math.max(9, scheduleFontSize - 3)}px`,
                        color: `${theme.textColor}60`,
                        marginTop: "2px",
                        lineHeight: 1.2,
                      }}>
                        {speakerNames}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {allSessions.length > maxSessions && (
              <div style={{
                fontSize: "10px",
                letterSpacing: "0.1em",
                color: `${theme.primaryColor}45`,
                marginTop: "6px",
              }}>
                +{allSessions.length - maxSessions} sessões
              </div>
            )}
          </div>
        )}

        {/* — Decorative bars bottom-right — */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", marginTop: "14px" }}>
          {[36, 24, 12].map((w, i) => (
            <div key={i} style={{
              width: `${w}px`,
              height: "2px",
              background: theme.primaryColor,
              opacity: 0.15 + i * 0.12,
            }} />
          ))}
        </div>
      </div>

      {/* ── Triangle bottom-left ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0,
        width: 0, height: 0,
        borderRight: "60px solid transparent",
        borderBottom: `60px solid ${theme.primaryColor}`,
        opacity: 0.35,
      }} />
    </div>
  );
}
