"use client";

import { useState } from "react";
import { Button } from "@predik/ui";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

const CONTACT_REASONS = [
  { value: "soporte", label: "Soporte Técnico" },
  { value: "sugerencia", label: "Sugerencia" },
  { value: "partnership", label: "Alianzas / Partnership" },
  { value: "prensa", label: "Prensa / Medios" },
  { value: "otro", label: "Otro" },
];

export function ContactForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    reason: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar el mensaje");
      }

      setSubmitStatus("success");
      setFormData({ fullName: "", email: "", reason: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Error al enviar el mensaje",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.reason &&
    formData.message.trim().length >= 20 &&
    formData.message.trim().length <= 3000;

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Tu nombre completo"
            disabled={isSubmitting}
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="tu@email.com"
            disabled={isSubmitting}
          />
        </div>

        {/* Reason */}
        <div>
          <label
            htmlFor="reason"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            Motivo <span className="text-red-500">*</span>
          </label>
          <select
            id="reason"
            required
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            className="w-full px-4 py-2.5 rounded-md border border-border bg-background text-foreground transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            }}
            disabled={isSubmitting}
          >
            <option value="">Selecciona un motivo</option>
            {CONTACT_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            Mensaje <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            required
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            rows={6}
            minLength={20}
            maxLength={3000}
            className="w-full px-4 py-2.5 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed resize-y"
            placeholder="Escribe tu mensaje aquí (mínimo 20 caracteres)..."
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.message.length} / 3000 caracteres
            {formData.message.length > 0 && formData.message.length < 20 && (
              <span className="text-orange-500 ml-2">
                (Mínimo 20 caracteres)
              </span>
            )}
          </p>
        </div>

        {/* Submit Button */}
        <div>
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-electric-purple text-white rounded-md font-semibold transition-all duration-300 ease-in-out hover:bg-electric-purple/90 hover:scale-105 hover:shadow-lg hover:shadow-electric-purple/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2 justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Enviar Mensaje
              </>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div className="flex items-start gap-3 p-4 rounded-md bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-600 dark:text-green-400">
                ¡Mensaje enviado con éxito!
              </p>
              <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                Hemos recibido tu mensaje y te responderemos pronto. También te
                enviamos una confirmación a tu email.
              </p>
            </div>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="flex items-start gap-3 p-4 rounded-md bg-red-500/10 border border-red-500/20">
            <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <p className="font-semibold text-red-600 dark:text-red-400">
                Error al enviar el mensaje
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
                {errorMessage}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
