import { FadeIn } from "@/components/animations/FadeIn";
import { blogPosts } from "@/lib/blogData";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Predik",
  description:
    "Noticias, análisis y actualizaciones sobre mercados de predicción, blockchain y la plataforma Predik.",
};

export default function BlogPage() {
  // Sort posts by date (newest first)
  const sortedPosts = [...blogPosts].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen relative pt-24 pb-8">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_100px)] -z-10" />
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Blog</h1>
            <p className="text-muted-foreground">
              Noticias, análisis y guías sobre mercados de predicción,
              blockchain y todo lo que hacemos en Predik.
            </p>
          </div>
        </FadeIn>

        {/* All posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map((post, index) => (
            <FadeIn key={post.slug} delay={0.1 + index * 0.05}>
              <Link href={`/blog/${post.slug}`} className="block group h-full">
                <article className="h-full bg-card/50 backdrop-blur-sm border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[hsl(var(--electric-purple))]/50 hover:-translate-y-1">
                  <div className="h-32 bg-gradient-to-br from-[hsl(var(--electric-purple))]/20 to-[hsl(var(--electric-purple))]/5 flex items-center justify-center">
                    <div className="text-4xl">
                      {post.category === "Mercados"
                        ? "⚽"
                        : post.category === "Tecnología"
                        ? "⚙️"
                        : post.category === "Educación"
                        ? "📊"
                        : "📈"}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-[hsl(var(--electric-purple))]/10 text-[hsl(var(--electric-purple))] rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                      <span className="text-muted-foreground text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readingTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-[hsl(var(--electric-purple))] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishedAt)}
                    </div>
                  </div>
                </article>
              </Link>
            </FadeIn>
          ))}
        </div>

        {/* CTA */}
        <FadeIn delay={0.3}>
          <div className="relative overflow-hidden mt-12 bg-gradient-to-r from-[hsl(var(--electric-purple))]/10 to-[hsl(var(--electric-purple))]/5 rounded-xl p-6 border border-[hsl(var(--electric-purple))]/20">
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            <h2 className="text-xl font-bold mb-2">
              ¿Listo para hacer tu primera predicción?
            </h2>
            <p className="text-muted-foreground mb-4">
              Explorá los mercados activos y empezá a predecir sobre los eventos
              que más te interesan.
            </p>
            <a
              href="https://app.predik.io"
              className="group/button relative inline-flex items-center justify-center overflow-hidden rounded-md bg-[hsl(var(--electric-purple))] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[hsl(var(--electric-purple))]/50"
            >
              <span className="relative z-10">Explorar Mercados</span>
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                <div className="relative h-full w-10 bg-white/30"></div>
              </div>
            </a>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
