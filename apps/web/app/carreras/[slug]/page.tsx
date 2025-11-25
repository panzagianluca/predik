import { notFound } from "next/navigation";
import Link from "next/link";
import { FadeIn } from "@/components/animations/FadeIn";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import {
  getJobBySlug,
  jobPositions,
  jobCategories,
  jobTypes,
} from "@/lib/careers";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import type { Metadata } from "next";

interface JobPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return jobPositions.map((job) => ({
    slug: job.slug,
  }));
}

export async function generateMetadata({
  params,
}: JobPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);

  if (!job) {
    return {
      title: "Posición no encontrada - Predik",
    };
  }

  return {
    title: `${job.title} - Carreras | Predik`,
    description: job.shortDescription,
    openGraph: {
      title: `${job.title} - Predik`,
      description: job.shortDescription,
    },
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  const job = getJobBySlug(slug);

  if (!job) {
    notFound();
  }

  const Icon = job.icon;
  const category = jobCategories[job.category];

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_100px)] -z-10" />
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Link */}
        <FadeIn>
          <Link
            href="/carreras"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a todas las posiciones
          </Link>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <FadeIn>
              <div className="mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-electric-purple/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-7 w-7 text-electric-purple" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full bg-muted ${category.color}`}
                      >
                        {category.label}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {jobTypes[job.type]}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        Remoto (LATAM)
                      </span>
                      {job.isLeadership && (
                        <span className="text-sm font-medium px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 flex items-center gap-1.5">
                          <Briefcase className="h-3.5 w-3.5" />
                          Equity
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Description */}
            <FadeIn delay={0.1}>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Sobre el rol</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {job.description}
                </p>
              </div>
            </FadeIn>

            {/* Responsibilities */}
            <FadeIn delay={0.15}>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">
                  Responsabilidades
                </h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-electric-purple flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Requirements */}
            <FadeIn delay={0.2}>
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Requisitos</h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>

            {/* Nice to Have */}
            {job.niceToHave.length > 0 && (
              <FadeIn delay={0.25}>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Deseable</h2>
                  <ul className="space-y-3">
                    {job.niceToHave.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Sidebar - Application Form */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.3}>
              <div className="lg:sticky lg:top-28">
                <ApplicationForm jobTitle={job.title} jobSlug={job.slug} />
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
