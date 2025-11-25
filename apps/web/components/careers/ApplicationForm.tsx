"use client";

import { useState, useRef } from "react";
import { Button } from "@predik/ui";
import { Send, Loader2, CheckCircle2, Upload, X, FileText } from "lucide-react";

interface ApplicationFormProps {
  jobTitle: string;
  jobSlug: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function ApplicationForm({ jobTitle, jobSlug }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const cvInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Solo se permiten archivos PDF";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "El archivo no puede superar 2MB";
    }
    return null;
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        setSubmitStatus("error");
        setTimeout(() => setSubmitStatus("idle"), 3000);
        return;
      }
      setCvFile(file);
    }
  };

  const handleCoverLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        setSubmitStatus("error");
        setTimeout(() => setSubmitStatus("idle"), 3000);
        return;
      }
      setCoverLetterFile(file);
    }
  };

  const resetForm = () => {
    setFormData({ fullName: "", email: "" });
    setCvFile(null);
    setCoverLetterFile(null);
    if (cvInputRef.current) cvInputRef.current.value = "";
    if (coverLetterInputRef.current) coverLetterInputRef.current.value = "";
  };

  const buildFormData = (): FormData => {
    const formDataToSend = new FormData();
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("jobTitle", jobTitle);
    formDataToSend.append("jobSlug", jobSlug);
    formDataToSend.append("cv", cvFile as File);
    if (coverLetterFile) {
      formDataToSend.append("coverLetter", coverLetterFile);
    }
    return formDataToSend;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    if (!cvFile) {
      setErrorMessage("El CV es requerido");
      setSubmitStatus("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        body: buildFormData(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al enviar la aplicación");
      }

      setSubmitStatus("success");
      resetForm();
      setTimeout(() => setSubmitStatus("idle"), 10000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error al enviar la aplicación",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.fullName.trim() && formData.email.trim() && cvFile;

  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      <h3 className="text-xl font-bold mb-4">Postularse a este puesto</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
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

        {/* CV Upload */}
        <div>
          <label
            htmlFor="cv"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            CV (PDF) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              ref={cvInputRef}
              id="cv"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleCvChange}
              className="hidden"
              disabled={isSubmitting}
            />
            {cvFile ? (
              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/30">
                <FileText className="h-5 w-5 text-electric-purple flex-shrink-0" />
                <span className="text-sm flex-1 truncate">{cvFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(cvFile.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCvFile(null);
                    if (cvInputRef.current) cvInputRef.current.value = "";
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => cvInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-md border-2 border-dashed border-border hover:border-electric-purple/50 hover:bg-muted/30 transition-all duration-300 text-sm text-muted-foreground"
              >
                <Upload className="h-5 w-5" />
                Subir CV (PDF, máx 2MB)
              </button>
            )}
          </div>
        </div>

        {/* Cover Letter Upload */}
        <div>
          <label
            htmlFor="coverLetter"
            className="block text-sm font-medium mb-2 text-foreground"
          >
            Carta de Presentación (PDF){" "}
            <span className="text-muted-foreground font-normal">
              - Opcional
            </span>
          </label>
          <div className="relative">
            <input
              ref={coverLetterInputRef}
              id="coverLetter"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleCoverLetterChange}
              className="hidden"
              disabled={isSubmitting}
            />
            {coverLetterFile ? (
              <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-muted/30">
                <FileText className="h-5 w-5 text-electric-purple flex-shrink-0" />
                <span className="text-sm flex-1 truncate">
                  {coverLetterFile.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(coverLetterFile.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCoverLetterFile(null);
                    if (coverLetterInputRef.current)
                      coverLetterInputRef.current.value = "";
                  }}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => coverLetterInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-md border-2 border-dashed border-border hover:border-electric-purple/50 hover:bg-muted/30 transition-all duration-300 text-sm text-muted-foreground"
              >
                <Upload className="h-5 w-5" />
                Subir Carta de Presentación (PDF, máx 2MB)
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full h-11 px-8 text-sm bg-electric-purple text-white rounded-md font-semibold transition-all duration-300 ease-in-out hover:bg-electric-purple/90 hover:scale-[1.02] hover:shadow-lg hover:shadow-electric-purple/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2 justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Aplicación
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
                ¡Aplicación enviada con éxito!
              </p>
              <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                Recibimos tu aplicación para {jobTitle}. Te contactaremos pronto
                si tu perfil coincide con lo que buscamos.
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
                Error al enviar
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
