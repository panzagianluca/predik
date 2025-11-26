import { FadeIn } from "@/components/animations/FadeIn";
import { JobCard } from "@/components/careers/JobCard";
import { jobPositions, getLeadershipJobs, getRegularJobs } from "@/lib/careers";
import {
  MapPin,
  Globe,
  TrendingUp,
  Users,
  Layers,
  Briefcase,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Únete al equipo - Predik",
  description:
    "Únete al equipo de Predik y ayuda a construir el futuro de los mercados de predicción en Latinoamérica. Posiciones remotas disponibles.",
  openGraph: {
    title: "Únete al equipo - Predik",
    description:
      "Únete al equipo de Predik y ayuda a construir el futuro de los mercados de predicción en Latinoamérica.",
  },
};

export default function CareersPage() {
  const leadershipJobs = getLeadershipJobs();
  const regularJobs = getRegularJobs();

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_100px)] -z-10" />
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Únete al equipo
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Estamos construyendo el futuro de los mercados de predicción en
              Latinoamérica. Buscamos personas apasionadas por Web3, crypto, y
              productos que cambian las reglas del juego.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-electric-purple" />
                100% Remoto
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-electric-purple" />
                Preferencia LATAM
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Why Work at Predik */}
        <FadeIn delay={0.1}>
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">
              ¿Por qué trabajar en Predik?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-card border border-border rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-electric-purple/10 flex items-center justify-center mb-3">
                  <TrendingUp className="h-5 w-5 text-electric-purple" />
                </div>
                <h3 className="font-semibold mb-2">
                  Startup en etapa temprana
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sé parte del equipo fundador y ayuda a definir el futuro de
                  los mercados de predicción en Latinoamérica.
                </p>
              </div>
              <div className="p-5 bg-card border border-border rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-electric-purple/10 flex items-center justify-center mb-3">
                  <Users className="h-5 w-5 text-electric-purple" />
                </div>
                <h3 className="font-semibold mb-2">100% Remoto</h3>
                <p className="text-sm text-muted-foreground">
                  Trabajá desde donde quieras. Preferimos timezone LATAM pero
                  somos flexibles.
                </p>
              </div>
              <div className="p-5 bg-card border border-border rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-electric-purple/10 flex items-center justify-center mb-3">
                  <Layers className="h-5 w-5 text-electric-purple" />
                </div>
                <h3 className="font-semibold mb-2">Web3 Nativo</h3>
                <p className="text-sm text-muted-foreground">
                  Trabaja con tecnología blockchain de punta: smart contracts,
                  DeFi, y mercados descentralizados.
                </p>
              </div>
              <div className="p-5 bg-card border border-border rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-electric-purple/10 flex items-center justify-center mb-3">
                  <Briefcase className="h-5 w-5 text-electric-purple" />
                </div>
                <h3 className="font-semibold mb-2">Equity para líderes</h3>
                <p className="text-sm text-muted-foreground">
                  Los roles de liderazgo incluyen participación en el equity de
                  la empresa.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Open Positions */}
        <FadeIn delay={0.2}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Posiciones Abiertas</h2>
            <p className="text-muted-foreground">
              {jobPositions.length} posiciones disponibles
            </p>
          </div>
        </FadeIn>

        {/* Leadership Positions */}
        {leadershipJobs.length > 0 && (
          <FadeIn delay={0.25}>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
                Liderazgo
              </h3>
              <div className="space-y-3">
                {leadershipJobs.map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        {/* Regular Positions */}
        <FadeIn delay={0.3}>
          <div className="mb-12">
            <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
              Equipo
            </h3>
            <div className="space-y-3">
              {regularJobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index + leadershipJobs.length}
                />
              ))}
            </div>
          </div>
        </FadeIn>

        {/* CTA Section */}
        <FadeIn delay={0.4}>
          <div className="p-8 bg-card border border-border rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">
              ¿No ves un rol que te interese?
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Siempre estamos buscando talento excepcional. Envianos tu CV a{" "}
              <a
                href="mailto:support@predik.io"
                className="text-electric-purple hover:underline"
              >
                support@predik.io
              </a>{" "}
              y contanos cómo podés aportar al equipo.
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
