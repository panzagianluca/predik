import { roadmapData } from "@/lib/roadmapData";
import { RoadmapColumnComponent } from "@/components/roadmap/RoadmapColumn";
import { FadeIn } from "@/components/animations/FadeIn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap - Predik",
  description:
    "See what we're building at Predik - the future of prediction markets",
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen relative pt-24 pb-8">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_100px)] -z-10" />
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Roadmap</h1>
            <p className="text-muted-foreground">
              Mirá en qué estamos trabajando y lo que viene para Predik
            </p>
          </div>
        </FadeIn>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmapData.map((column, index) => (
            <FadeIn key={column.id} delay={index * 0.1} className="h-full">
              <RoadmapColumnComponent column={column} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
