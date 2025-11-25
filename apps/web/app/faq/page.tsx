"use client";

import { FadeIn } from "@/components/animations/FadeIn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqCategories, searchFAQs, type FAQCategory } from "@/lib/faqData";
import { Search, MessageSquare, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    return searchFAQs(searchQuery);
  }, [searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const displayedCategories = selectedCategory
    ? faqCategories.filter((c) => c.id === selectedCategory)
    : faqCategories;

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_100px)] -z-10" />
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">¿Cómo podemos ayudarte?</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontrá respuestas rápidas a las preguntas más frecuentes sobre
              Predik.
            </p>
          </div>
        </FadeIn>

        {/* Search Bar */}
        <FadeIn delay={0.1}>
          <div className="relative mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar en las preguntas frecuentes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pl-12 pr-12 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-300"
              />
              {isSearching && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Results */}
            <AnimatePresence mode="wait">
              {isSearching && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-[100] max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30"
                >
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={`${result.categoryId}-${index}`}
                          onClick={() => {
                            setSelectedCategory(result.categoryId);
                            setSearchQuery("");
                          }}
                          className="w-full text-left p-4 rounded-lg hover:bg-muted/50 transition-colors duration-200"
                        >
                          <p className="font-medium text-sm mb-1">
                            {result.question}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {result.answer}
                          </p>
                          <span className="text-xs text-electric-purple mt-2 inline-block">
                            {result.categoryTitle}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground mb-2">
                        No encontramos resultados para &quot;{searchQuery}&quot;
                      </p>
                      <Link
                        href="/contacto"
                        className="text-sm text-electric-purple hover:underline"
                      >
                        Contactanos para más ayuda →
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeIn>

        {/* Category Cards */}
        <AnimatePresence mode="wait">
          {!isSearching && !selectedCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FadeIn delay={0.2}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                  {faqCategories.map((category, index) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onClick={() => setSelectedCategory(category.id)}
                      delay={index * 0.05}
                    />
                  ))}
                </div>
              </FadeIn>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Category Header */}
        <AnimatePresence mode="wait">
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="mb-8"
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Volver a todas las categorías
              </button>
              <h2 className="text-2xl font-bold">
                {displayedCategories[0]?.title}
              </h2>
              <p className="text-muted-foreground">
                {displayedCategories[0]?.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ Accordions */}
        <AnimatePresence mode="wait">
          {!isSearching && (
            <motion.div
              key={selectedCategory || "all"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {displayedCategories.map((category, categoryIndex) => (
                <FadeIn
                  key={category.id}
                  delay={selectedCategory ? 0 : 0.3 + categoryIndex * 0.1}
                >
                  <div className="mb-8">
                    {!selectedCategory && (
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-electric-purple/10 flex items-center justify-center">
                          <category.icon className="h-5 w-5 text-electric-purple" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {category.faqs.length} preguntas
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <Accordion type="single" collapsible className="w-full">
                        {category.faqs.map((faq, faqIndex) => (
                          <AccordionItem
                            key={`${category.id}-${faqIndex}`}
                            value={`${category.id}-${faqIndex}`}
                            className="px-6"
                          >
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact CTA */}
        {!isSearching && (
          <FadeIn delay={0.5}>
            <div className="mt-16 p-8 bg-card border border-border rounded-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-electric-purple/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-7 w-7 text-electric-purple" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                ¿No encontraste lo que buscabas?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Nuestro equipo de soporte está listo para ayudarte con cualquier
                pregunta adicional.
              </p>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center gap-2 px-6 h-9 bg-electric-purple text-white text-sm font-medium rounded-lg hover:bg-electric-purple/90 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Contactar Soporte
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}

interface CategoryCardProps {
  category: FAQCategory;
  onClick: () => void;
  delay?: number;
}

function CategoryCard({ category, onClick, delay = 0 }: CategoryCardProps) {
  const Icon = category.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      className="p-4 md:p-6 bg-card border border-border rounded-xl text-left hover:border-electric-purple/30 hover:shadow-lg hover:shadow-electric-purple/5 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-electric-purple/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-5 w-5 md:h-6 md:w-6 text-electric-purple" />
      </div>
      <h3 className="font-semibold text-sm md:text-base mb-1">
        {category.title}
      </h3>
      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
        {category.description}
      </p>
    </motion.button>
  );
}
