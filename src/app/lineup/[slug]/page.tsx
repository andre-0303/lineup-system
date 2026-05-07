import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LineupPublicView } from "@/components/lineup/LineupPublicView";
import type { ThemeConfig } from "@/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: "#00ff00",
  backgroundColor: "#000000",
  textColor: "#ffffff",
  accentColor: "#ff00ff",
  fontFamily: "monospace",
  layout: "compact",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({
    where: { slug, isPublished: true },
    select: { name: true, description: true, location: true },
  });

  if (!event) return { title: "Lineup não encontrado" };

  return {
    title: `${event.name} — LineUp`,
    description: event.description ?? `Lineup do evento ${event.name}${event.location ? ` em ${event.location}` : ""}`,
    openGraph: {
      title: event.name,
      description: event.description ?? undefined,
    },
  };
}

export default async function LineupPublicPage({ params }: Props) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug, isPublished: true },
    include: {
      stages: { orderBy: { displayOrder: "asc" } },
      sessions: {
        include: {
          stage: true,
          speakers: { include: { speaker: true } },
        },
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!event) notFound();

  const theme: ThemeConfig = event.themeConfig
    ? { ...DEFAULT_THEME, ...(event.themeConfig as Partial<ThemeConfig>) }
    : DEFAULT_THEME;

  return <LineupPublicView event={event} theme={theme} />;
}
