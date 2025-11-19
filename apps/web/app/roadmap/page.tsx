import { roadmapData } from "@/lib/roadmapData";
import { RoadmapColumnComponent } from "@/components/roadmap/RoadmapColumn";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap - Predik",
  description:
    "See what we're building at Predik - the future of prediction markets",
};

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Roadmap</h1>
          <p className="text-muted-foreground">
            Mirá en qué estamos trabajando y lo que viene para Predik
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmapData.map((column) => (
            <RoadmapColumnComponent key={column.id} column={column} />
          ))}
        </div>
      </div>
    </div>
  );
}
