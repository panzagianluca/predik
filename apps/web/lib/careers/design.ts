import { Palette } from "lucide-react";
import type { JobPosition } from "./types";

export const designJobs: JobPosition[] = [
  {
    id: "ui-ux-designer",
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    category: "design",
    type: "full-time",
    icon: Palette,
    shortDescription:
      "Diseña experiencias de usuario intuitivas para la plataforma.",
    description:
      "Buscamos un UI/UX Designer para crear experiencias de usuario excepcionales en nuestra plataforma de mercados de predicción. Trabajarás en hacer complejo lo simple.",
    responsibilities: [
      "Diseñar interfaces intuitivas para web y mobile",
      "Crear prototipos interactivos y flujos de usuario",
      "Conducir investigación de usuarios y tests de usabilidad",
      "Mantener y evolucionar el design system",
      "Colaborar con desarrollo para implementar diseños",
      "Iterar basándose en métricas y feedback",
    ],
    requirements: [
      "3+ años de experiencia en UI/UX design",
      "Dominio de Figma",
      "Portfolio demostrando trabajo en producto digital",
      "Experiencia con design systems",
      "Conocimiento de accesibilidad y responsive design",
      "Capacidad de comunicar decisiones de diseño",
    ],
    niceToHave: [
      "Experiencia diseñando productos Web3/DeFi",
      "Conocimiento básico de desarrollo frontend",
      "Experiencia con motion design",
      "Familiaridad con Tailwind CSS",
    ],
    isLeadership: false,
  },
  {
    id: "brand-designer",
    slug: "brand-designer",
    title: "Brand Designer",
    category: "design",
    type: "full-time",
    icon: Palette,
    shortDescription: "Define y evoluciona la identidad visual de Predik.",
    description:
      "Buscamos un Brand Designer para definir y mantener la identidad visual de Predik. Crearás assets de marca, materiales de marketing, y asegurarás consistencia visual en todos los touchpoints.",
    responsibilities: [
      "Desarrollar y mantener las guías de marca",
      "Crear assets visuales para marketing y redes sociales",
      "Diseñar materiales promocionales y presentaciones",
      "Producir ilustraciones y gráficos para la plataforma",
      "Colaborar en campañas de marketing visual",
      "Asegurar consistencia de marca en todos los canales",
    ],
    requirements: [
      "3+ años de experiencia en diseño gráfico/brand",
      "Dominio de Adobe Creative Suite y Figma",
      "Portfolio fuerte en identidad de marca",
      "Experiencia creando contenido para redes sociales",
      "Habilidades de ilustración y composición visual",
      "Ojo para el detalle y la tipografía",
    ],
    niceToHave: [
      "Experiencia en branding de startups tech",
      "Conocimiento del ecosistema crypto/Web3",
      "Habilidades de motion graphics",
      "Experiencia con 3D o ilustración digital avanzada",
    ],
    isLeadership: false,
  },
];
