import { FadeIn } from "@/components/animations/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Predik",
  description: "Noticias, análisis y actualizaciones de la plataforma Predik.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen relative pt-24 pb-8">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_100px)] -z-10" />
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Blog</h1>
            <p className="text-muted-foreground">
              Noticias, análisis y actualizaciones de la plataforma.
            </p>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p>Contenido en construcción...</p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
