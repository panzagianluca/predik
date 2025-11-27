import { FadeIn } from "@/components/animations/FadeIn";
import { TwitterEmbed } from "@/components/blog/TwitterEmbed";
import { blogPosts } from "@/lib/blogData";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Market } from "@/types/market";
import { RelatedMarketCard } from "@/components/market/RelatedMarketCard";

type Props = {
  params: Promise<{ slug: string }>;
};

// Fetch latest markets
async function getLatestMarkets(): Promise<Market[]> {
  try {
    const response = await fetch(
      "https://app.predik.io/api/markets?state=open&sort=volume&limit=3",
      {
        next: { revalidate: 60 },
      },
    );

    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Post no encontrado - Predik",
    };
  }

  return {
    title: `${post.title} - Predik Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Fetch markets in parallel
  const markets = await getLatestMarkets();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get related posts (different from current)
  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen relative pt-24 pb-8">
      {/* Twitter widget loader */}
      <TwitterEmbed />

      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_100px)] -z-10" />
      <div className="max-w-7xl mx-auto px-4">
        {/* Back link */}
        <FadeIn>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al blog
          </Link>
        </FadeIn>

        {/* Two column layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content - 80% */}
          <div className="lg:w-4/5">
            <FadeIn delay={0.1}>
              <article>
                {/* Hero Image */}
                <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-[hsl(var(--electric-purple))]/20 to-[hsl(var(--electric-purple))]/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl md:text-8xl">
                      {post.category === "Mercados"
                        ? "⚽"
                        : post.category === "Tecnología"
                        ? "⚙️"
                        : post.category === "Educación"
                        ? "📊"
                        : "📈"}
                    </div>
                  </div>
                </div>

                <header className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">{post.title}</h1>

                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>

                  <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground pb-6 border-b border-border">
                    <span className="px-2 py-0.5 bg-[hsl(var(--electric-purple))]/10 text-[hsl(var(--electric-purple))] rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readingTime}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span>•</span>
                    <span>Por {post.author}</span>
                  </div>
                </header>

                {/* Article content */}
                <div
                  className="prose dark:prose-invert max-w-none mb-8
                    prose-headings:font-bold prose-headings:text-foreground
                    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                    prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
                    prose-h4:text-lg prose-h4:mt-8 prose-h4:mb-3
                    prose-p:text-muted-foreground prose-p:leading-7 prose-p:mb-6
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-a:text-[hsl(var(--electric-purple))] prose-a:no-underline hover:prose-a:underline
                    prose-ul:text-muted-foreground prose-ul:my-6 prose-ul:space-y-3
                    prose-ol:text-muted-foreground prose-ol:my-6 prose-ol:space-y-3
                    prose-li:marker:text-[hsl(var(--electric-purple))] prose-li:mb-3 prose-li:leading-7
                    prose-hr:border-border prose-hr:my-10
                    prose-blockquote:border-l-4 prose-blockquote:border-[hsl(var(--electric-purple))] prose-blockquote:pl-6 prose-blockquote:py-1 prose-blockquote:my-8 prose-blockquote:italic prose-blockquote:text-muted-foreground
                    prose-figure:my-10
                    prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-3
                    prose-img:rounded-xl prose-img:w-full"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap mb-8 pt-6 border-t border-border">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted/50 text-muted-foreground rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </FadeIn>
          </div>

          {/* Sidebar - 20% */}
          <aside className="lg:w-1/5">
            <div className="space-y-6">
              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <FadeIn delay={0.2}>
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm">Otros Posts</h3>
                    <div className="space-y-3">
                      {relatedPosts.map((relatedPost) => (
                        <Link
                          key={relatedPost.slug}
                          href={`/blog/${relatedPost.slug}`}
                          className="group flex items-start gap-3"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[hsl(var(--electric-purple))]/20 to-[hsl(var(--electric-purple))]/5 flex-shrink-0">
                            <div className="absolute inset-0 flex items-center justify-center text-lg">
                              {relatedPost.category === "Mercados"
                                ? "⚽"
                                : relatedPost.category === "Tecnología"
                                ? "⚙️"
                                : relatedPost.category === "Educación"
                                ? "📊"
                                : "📈"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium leading-tight group-hover:text-[hsl(var(--electric-purple))] transition-colors line-clamp-2">
                              {relatedPost.title}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(relatedPost.publishedAt)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}

              {/* Trending Markets */}
              {markets.length > 0 && (
                <FadeIn delay={0.3}>
                  <div className="space-y-4">
                    <h3 className="font-bold text-sm">Mercados en Tendencia</h3>
                    <div className="space-y-3">
                      {markets.map((market) => (
                        <RelatedMarketCard key={market.id} market={market} />
                      ))}
                    </div>
                    <a
                      href="https://app.predik.io"
                      className="block text-center text-xs text-[hsl(var(--electric-purple))] hover:underline"
                    >
                      Ver todos los mercados →
                    </a>
                  </div>
                </FadeIn>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
