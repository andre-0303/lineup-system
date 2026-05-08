"use client";

import { SESSION_TYPES } from "@/lib/validations/session";
import type { ThemeConfig, EventWithRelations } from "@/types";

interface LineupPreviewProps {
  event: EventWithRelations;
  theme: ThemeConfig;
  previewId?: string;
}

export const LINEUP_SIZE = 1080;

const DISPLAY_FONT = "'Bebas Neue', 'Arial Black', sans-serif";
const MONO_FONT = '"JetBrains Mono", "Courier New", monospace';
const MONTHS_PT = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

function getBodyFont(fontFamily: ThemeConfig["fontFamily"]): string {
  switch (fontFamily) {
    case "monospace": return MONO_FONT;
    case "sans-serif": return '"Inter", system-ui, sans-serif';
    case "serif": return '"Georgia", "Times New Roman", serif';
  }
}

function formatUtcDateParts(date: Date) {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const yyyy = String(date.getUTCFullYear());
  return { dd, yyyy };
}

export function LineupPreview({ event, theme, previewId = "lineup-preview" }: LineupPreviewProps) {
  const bodyFont = getBodyFont(theme.fontFamily);
  const isCompact = theme.layout === "compact";

  const S = LINEUP_SIZE;
  const P = theme.primaryColor;
  const A = theme.accentColor ?? P;
  const BG = theme.backgroundColor;
  const TC = theme.textColor;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const sameDay = startDate.toUTCString().slice(0, 16) === endDate.toUTCString().slice(0, 16);
  const { dd, yyyy } = formatUtcDateParts(startDate);
  const { dd: dd2 } = formatUtcDateParts(endDate);
  const dateDisplay = sameDay ? dd : `${dd}·${dd2}`;
  const monthName = MONTHS_PT[startDate.getUTCMonth()];

  // Date font size — shrinks for multi-day ranges
  const dateFontSize = isCompact
    ? (dateDisplay.length <= 2 ? 118 : dateDisplay.length <= 5 ? 82 : 62)
    : (dateDisplay.length <= 2 ? 145 : dateDisplay.length <= 5 ? 100 : 74);

  // Event name font size — shrinks for many words
  const wordCount = event.name.split(" ").length;
  const nameFontSize = isCompact
    ? (wordCount <= 2 ? 88 : wordCount <= 3 ? 70 : 54)
    : (wordCount <= 2 ? 108 : wordCount <= 3 ? 86 : 66);

  const allSessions = [...event.sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  const maxSessions = isCompact ? 12 : 9;
  const visibleSessions = allSessions.slice(0, maxSessions);

  // ── Fixed zone heights (must sum to 1080) ──
  // HEADER: 70  NAME: 255  DATE: 178  SCHED_HDR: 52  FOOTER: 70
  // SESSIONS: 1080 - 70 - 255 - 178 - 52 - 70 = 455
  const HEADER_H = 70;
  const NAME_H = 255;
  const DATE_H = 178;
  const SCHED_HDR_H = 52;
  const FOOTER_H = 70;
  const SESSIONS_H = S - HEADER_H - NAME_H - DATE_H - SCHED_HDR_H - FOOTER_H; // 455
  const PAD = 56;

  // Adaptive font sizes based on available row height
  const ROW_H = visibleSessions.length > 0
    ? Math.floor(SESSIONS_H / visibleSessions.length)
    : SESSIONS_H;
  const sizeM = theme.scheduleSize === "small" ? 0.82 : theme.scheduleSize === "large" ? 1.18 : 1.0;
  const timeFontSize = Math.min(54, Math.max(20, Math.floor(ROW_H * 0.33 * sizeM)));
  const titleFontSize = Math.min(28, Math.max(13, Math.floor(ROW_H * 0.21 * sizeM)));
  const speakerFontSize = Math.min(17, Math.max(10, Math.floor(ROW_H * 0.14 * sizeM)));
  const timeEndSize = Math.max(9, timeFontSize - 14);

  return (
    <div
      id={previewId}
      style={{
        width: `${S}px`,
        height: `${S}px`,
        position: "relative",
        overflow: "hidden",
        backgroundColor: BG,
        color: TC,
        fontFamily: bodyFont,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Background grid ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(${P}05 1px, transparent 1px),
          linear-gradient(90deg, ${P}05 1px, transparent 1px)
        `,
        backgroundSize: "44px 44px",
      }} />

      {/* ── Radial glow: top-left ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 65% 50% at 12% 14%, ${P}0d 0%, transparent 55%)`,
      }} />

      {/* ── Radial glow: bottom-right (accent) ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 50% 50% at 88% 90%, ${A}09 0%, transparent 55%)`,
      }} />

      {/* ── Diagonal hatching: top-right corner ── */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "210px", height: "210px", pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(-45deg, ${P}09, ${P}09 1px, transparent 1px, transparent 13px)`,
      }} />

      {/* ── Top accent stripe ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "4px",
        background: `linear-gradient(90deg, ${P}, ${P}70 65%, transparent)`,
      }} />

      {/* ── Corner registration marks ── */}
      <div style={{ position: "absolute", top: 16, left: 16, width: 22, height: 22,
        borderTop: `2px solid ${P}45`, borderLeft: `2px solid ${P}45` }} />
      <div style={{ position: "absolute", top: 16, right: 16, width: 22, height: 22,
        borderTop: `2px solid ${P}45`, borderRight: `2px solid ${P}45` }} />
      <div style={{ position: "absolute", bottom: 16, left: 16, width: 22, height: 22,
        borderBottom: `2px solid ${P}45`, borderLeft: `2px solid ${P}45` }} />
      <div style={{ position: "absolute", bottom: 16, right: 16, width: 22, height: 22,
        borderBottom: `2px solid ${P}45`, borderRight: `2px solid ${P}45` }} />

      {/* ════════ HEADER BAR (70px) ════════ */}
      <div style={{
        position: "relative", zIndex: 1,
        height: `${HEADER_H}px`, flexShrink: 0,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: `0 ${PAD}px`,
        borderBottom: `1px solid ${P}10`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "7px", height: "7px", background: P }} />
          <span style={{
            fontFamily: MONO_FONT,
            fontSize: "9px", letterSpacing: "0.52em",
            textTransform: "uppercase", color: `${TC}42`,
          }}>
            EVENTO TECH
          </span>
        </div>
        {event.sessions.length > 0 && (
          <span style={{
            fontFamily: MONO_FONT,
            fontSize: "9px", letterSpacing: "0.38em",
            color: `${A}68`, textTransform: "uppercase",
          }}>
            {event.sessions.length} SESSÕES
          </span>
        )}
      </div>

      {/* ════════ EVENT NAME (255px) ════════ */}
      <div style={{
        position: "relative", zIndex: 1,
        height: `${NAME_H}px`, flexShrink: 0,
        padding: `18px ${PAD}px 0`,
        display: "flex", flexDirection: "column",
        justifyContent: "flex-start",
        overflow: "hidden",
      }}>
        {theme.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={theme.logoUrl}
            alt=""
            style={{ height: "22px", marginBottom: "8px", objectFit: "contain", display: "block" }}
          />
        )}

        <div style={{
          fontFamily: DISPLAY_FONT,
          fontSize: `${nameFontSize}px`,
          fontWeight: 400,
          lineHeight: 0.92,
          letterSpacing: "0.01em",
          textTransform: "uppercase",
          color: TC,
        }}>
          {event.name.split(" ").map((word, i) => (
            <div key={i}>{word}</div>
          ))}
        </div>

        <div style={{ marginTop: "14px", width: "48px", height: "3px", background: P }} />
      </div>

      {/* ════════ DATE BAND (178px) ════════ */}
      <div style={{
        position: "relative", zIndex: 1,
        height: `${DATE_H}px`, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: `0 ${PAD}px`, gap: "28px",
        background: `${P}07`,
        borderTop: `1px solid ${P}18`,
        borderBottom: `1px solid ${P}18`,
        overflow: "hidden",
      }}>
        {/* Faint year watermark behind the band */}
        <div style={{
          position: "absolute",
          right: `${PAD - 8}px`, top: "50%",
          fontFamily: DISPLAY_FONT,
          fontSize: "210px",
          color: `${P}06`,
          lineHeight: 0,
          letterSpacing: "-0.04em",
          pointerEvents: "none", userSelect: "none",
        }}>
          {yyyy}
        </div>

        {/* Day number */}
        <div style={{
          fontFamily: DISPLAY_FONT,
          fontSize: `${dateFontSize}px`,
          fontWeight: 400,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: P,
          textShadow: `0 0 36px ${P}40`,
          flexShrink: 0,
        }}>
          {dateDisplay}
        </div>

        {/* Divider */}
        <div style={{
          width: "1px", height: "55%",
          background: `${P}28`, flexShrink: 0,
        }} />

        {/* Month + Year */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            fontFamily: DISPLAY_FONT,
            fontSize: "42px", letterSpacing: "0.12em",
            color: TC, lineHeight: 1,
          }}>
            {monthName}
          </div>
          <div style={{
            fontFamily: DISPLAY_FONT,
            fontSize: "34px", letterSpacing: "0.12em",
            color: TC, opacity: 0.42, lineHeight: 1,
            marginTop: "3px",
          }}>
            {yyyy}
          </div>
        </div>

        {/* Location — right-aligned in the band */}
        {event.location && (
          <div style={{
            marginLeft: "auto",
            fontFamily: MONO_FONT,
            fontSize: "10px", letterSpacing: "0.3em",
            textTransform: "uppercase", color: `${TC}35`,
          }}>
            {event.location}
          </div>
        )}
      </div>

      {/* ════════ SCHEDULE HEADER (52px) ════════ */}
      <div style={{
        position: "relative", zIndex: 1,
        height: `${SCHED_HDR_H}px`, flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: `0 ${PAD}px`, gap: "12px",
      }}>
        <span style={{
          fontFamily: DISPLAY_FONT,
          fontSize: "11px", letterSpacing: "0.55em",
          textTransform: "uppercase", color: `${P}60`,
        }}>
          PROGRAMAÇÃO
        </span>
        <div style={{ flex: 1, height: "1px", background: `${P}18` }} />
        {allSessions.length > maxSessions && (
          <span style={{
            fontFamily: MONO_FONT,
            fontSize: "9px", letterSpacing: "0.12em",
            color: `${P}40`,
          }}>
            +{allSessions.length - maxSessions} mais
          </span>
        )}
      </div>

      {/* ════════ SESSIONS (flex, 455px total) ════════ */}
      <div style={{
        position: "relative", zIndex: 1,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {visibleSessions.length === 0 ? (
          <div style={{
            flex: 1, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontFamily: MONO_FONT, fontSize: "14px",
            color: `${TC}25`, letterSpacing: "0.12em",
          }}>
            Sem sessões cadastradas.
          </div>
        ) : (
          visibleSessions.map((session, idx) => {
            const start = new Date(session.startTime).toISOString().slice(11, 16);
            const end = new Date(session.endTime).toISOString().slice(11, 16);
            const typeInfo = SESSION_TYPES.find((t) => t.value === session.sessionType);
            const sColor = typeInfo?.color ?? P;
            const speakerNames = session.speakers.map((ss) => ss.speaker.name).join(", ");
            const isLast = idx === visibleSessions.length - 1;

            return (
              <div
                key={session.id}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  padding: `0 ${PAD}px`,
                  gap: "18px",
                  borderBottom: !isLast ? `1px solid ${TC}07` : "none",
                  background: idx % 2 === 1 ? `${TC}025` : "transparent",
                }}
              >
                {/* Session type color bar */}
                <div style={{
                  width: "4px",
                  height: "62%",
                  background: sColor,
                  opacity: 0.62,
                  flexShrink: 0,
                  borderRadius: "2px",
                }} />

                {/* Time */}
                <div style={{
                  fontFamily: DISPLAY_FONT,
                  fontSize: `${timeFontSize}px`,
                  lineHeight: 1,
                  color: TC,
                  opacity: 0.88,
                  flexShrink: 0,
                  minWidth: `${Math.round(timeFontSize * 2.6)}px`,
                }}>
                  {start}
                  <div style={{
                    fontFamily: MONO_FONT,
                    fontSize: `${timeEndSize}px`,
                    opacity: 0.35,
                    marginTop: "2px",
                    letterSpacing: "0.03em",
                    fontWeight: 400,
                  }}>
                    {end}
                  </div>
                </div>

                {/* Title + speakers */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: `${titleFontSize}px`,
                    fontWeight: 700,
                    color: TC,
                    lineHeight: 1.2,
                    marginBottom: speakerNames ? "4px" : "0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {session.title}
                  </div>
                  {speakerNames && (
                    <div style={{
                      fontFamily: MONO_FONT,
                      fontSize: `${speakerFontSize}px`,
                      color: `${TC}52`,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {speakerNames}
                    </div>
                  )}
                </div>

                {/* Type label */}
                {typeInfo && (
                  <div style={{
                    fontFamily: MONO_FONT,
                    fontSize: "8px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: sColor,
                    opacity: 0.7,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                    {typeInfo.label}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ════════ FOOTER (70px) ════════ */}
      <div style={{
        position: "relative", zIndex: 1,
        height: `${FOOTER_H}px`, flexShrink: 0,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: `0 ${PAD}px`,
        borderTop: `1px solid ${P}12`,
      }}>
        <span style={{
          fontFamily: MONO_FONT,
          fontSize: "9px", letterSpacing: "0.25em",
          color: `${TC}22`, textTransform: "uppercase",
        }}>
          {event.location ?? ""}
        </span>
        <span style={{
          fontFamily: MONO_FONT,
          fontSize: "9px", letterSpacing: "0.12em",
          color: `${P}45`,
        }}>
          /lineup/{event.slug}
        </span>
      </div>

      {/* ── Bottom accent stripe ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, transparent, ${P}45 60%, ${P})`,
      }} />
    </div>
  );
}
