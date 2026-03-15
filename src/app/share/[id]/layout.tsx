import { Metadata } from "next";
import { getAuditById } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) return { title: "Audit Not Found" };

  const scores = JSON.parse(audit.scores || "{}");
  const avgScore = Math.round(
    ((scores.communication || 0) + (scores.aesthetic || 0) + (scores.drive || 0) + (scores.structure || 0)) / 4
  );

  const domain = new URL(audit.link.startsWith("http") ? audit.link : `https://${audit.link}`).hostname;

  return {
    title: `Growth Audit: ${domain}`,
    description: `Cosmic alignment score: ${avgScore}/100. See the full growth audit for ${domain}.`,
    openGraph: {
      title: `Growth Audit: ${domain} — ${avgScore}/100`,
      description: `AI-powered cosmic growth audit for ${domain}`,
      images: [`/api/og?score=${avgScore}&domain=${domain}`],
    },
  };
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
