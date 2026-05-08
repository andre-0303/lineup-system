import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | LineUp System",
    default: "LineUp System",
  },
  description: "Gerador de lineups visuais para eventos de tecnologia.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
