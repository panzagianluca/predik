import { RoadmapColumn } from "@/lib/roadmapData";
import { FeatureCard } from "./FeatureCard";
import { Lightbulb, CheckCircle, Construction, Sparkles } from "lucide-react";

interface RoadmapColumnProps {
  column: RoadmapColumn;
}

const iconMap = {
  ideas: Lightbulb,
  validated: CheckCircle,
  "in-progress": Construction,
  done: Sparkles,
};

export function RoadmapColumnComponent({ column }: RoadmapColumnProps) {
  const Icon = iconMap[column.id as keyof typeof iconMap];

  return (
    <div className="flex flex-col gap-4">
      {/* Column Header */}
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <h2 className="text-xl font-bold">{column.title}</h2>
        <span className="text-sm text-muted-foreground">
          ({column.features.length})
        </span>
      </div>

      {/* Feature Cards */}
      <div className="flex flex-col gap-3">
        {column.features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </div>
  );
}
