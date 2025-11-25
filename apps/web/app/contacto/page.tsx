import { FadeIn } from "@/components/animations/FadeIn";
import { ContactForm } from "@/components/contact/ContactForm";
import type { Metadata } from "next";
import { Mail, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto - Predik",
  description:
    "Ponte en contacto con el equipo de Predik. Estamos aquí para ayudarte con tus consultas, sugerencias y cualquier duda que tengas.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_100px)] -z-10" />
      <div className="max-w-7xl mx-auto px-4">
        <FadeIn>
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contacto</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Estamos acá para ayudarte. Envianos tu consulta y te responderemos
              lo antes posible.
            </p>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ContactForm />
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* Contact Info Card */}
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold text-lg mb-4">
                  Información de Contacto
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-electric-purple mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <a
                        href="mailto:support@predik.io"
                        className="text-sm text-muted-foreground hover:text-electric-purple transition-colors"
                      >
                        support@predik.io
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-electric-purple mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">
                        Horario de Respuesta
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Lunes a Viernes
                        <br />
                        9:00 - 18:00 (ART)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-electric-purple mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Tiempo de Respuesta</p>
                      <p className="text-sm text-muted-foreground">
                        Normalmente respondemos en menos de 24 horas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Link Card */}
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="font-semibold text-lg mb-2">
                  ¿Tenés una pregunta?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Revisá nuestra sección de preguntas frecuentes, tal vez
                  encuentres la respuesta ahí.
                </p>
                <a
                  href="/faq"
                  className="inline-flex items-center text-sm font-medium text-electric-purple hover:underline"
                >
                  Ver Preguntas Frecuentes →
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
