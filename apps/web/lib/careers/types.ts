import {
  Briefcase,
  Code,
  Megaphone,
  Palette,
  Users,
  Server,
  TrendingUp,
  MessageSquare,
  Shield,
  Calculator,
  Layers,
  type LucideIcon,
} from "lucide-react";

export type JobType = "full-time" | "part-time" | "contract";
export type JobCategory = "engineering" | "marketing" | "design" | "operations";

export interface JobPosition {
  id: string;
  slug: string;
  title: string;
  category: JobCategory;
  type: JobType;
  icon: LucideIcon;
  shortDescription: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  isLeadership: boolean;
}

export const jobCategories: Record<
  JobCategory,
  { label: string; color: string }
> = {
  engineering: { label: "Ingeniería", color: "text-blue-500" },
  marketing: { label: "Marketing", color: "text-pink-500" },
  design: { label: "Diseño", color: "text-purple-500" },
  operations: { label: "Operaciones", color: "text-green-500" },
};

export const jobTypes: Record<JobType, string> = {
  "full-time": "Tiempo Completo",
  "part-time": "Medio Tiempo",
  contract: "Contrato",
};

export const whyWorkAtPredik = [
  {
    title: "Startup en etapa temprana",
    description:
      "Sé parte del equipo fundador y ayuda a definir el futuro de los mercados de predicción en Latinoamérica.",
    icon: TrendingUp,
  },
  {
    title: "100% Remoto",
    description:
      "Trabajá desde donde quieras. Preferimos timezone LATAM pero somos flexibles.",
    icon: Users,
  },
  {
    title: "Web3 Nativo",
    description:
      "Trabaja con tecnología blockchain de punta: smart contracts, DeFi, y mercados descentralizados.",
    icon: Layers,
  },
  {
    title: "Equity para líderes",
    description:
      "Los roles de liderazgo incluyen participación en el equity de la empresa.",
    icon: Briefcase,
  },
];

// Re-export icons for use in job positions
export {
  Briefcase,
  Code,
  Megaphone,
  Palette,
  Users,
  Server,
  MessageSquare,
  Shield,
  Calculator,
  Layers,
};
