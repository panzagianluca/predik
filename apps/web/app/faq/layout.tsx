import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes - Predik",
  description:
    "Encontrá respuestas rápidas a las preguntas más frecuentes sobre Predik. Todo sobre pagos, seguridad, mercados y más.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
