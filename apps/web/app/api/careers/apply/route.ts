import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Upstash Redis rate limiter
// 5 applications per day (24 hours) per IP
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "24 h"),
  analytics: true,
  prefix: "careers",
});

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous";

    // Check rate limit
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: `Has alcanzado el límite de aplicaciones. Podrás enviar otra en ${Math.ceil(
            (reset - Date.now()) / 1000 / 60 / 60,
          )} horas.`,
          limit,
          remaining: 0,
          reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }

    // Parse form data
    const formData = await request.formData();
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const jobSlug = formData.get("jobSlug") as string;
    const cvFile = formData.get("cv") as File | null;
    const coverLetterFile = formData.get("coverLetter") as File | null;

    // Validate required fields
    if (!fullName || !email || !jobTitle || !jobSlug) {
      return NextResponse.json(
        { error: "Todos los campos obligatorios deben estar completos" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Validate CV
    if (!cvFile) {
      return NextResponse.json(
        { error: "El CV es obligatorio" },
        { status: 400 },
      );
    }

    if (cvFile.type !== "application/pdf") {
      return NextResponse.json(
        { error: "El CV debe ser un archivo PDF" },
        { status: 400 },
      );
    }

    if (cvFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El CV no puede superar 2MB" },
        { status: 400 },
      );
    }

    // Validate cover letter if provided
    if (coverLetterFile) {
      if (coverLetterFile.type !== "application/pdf") {
        return NextResponse.json(
          { error: "La carta de presentación debe ser un archivo PDF" },
          { status: 400 },
        );
      }

      if (coverLetterFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "La carta de presentación no puede superar 2MB" },
          { status: 400 },
        );
      }
    }

    const timestamp = new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      dateStyle: "full",
      timeStyle: "short",
    });

    // Convert files to base64 for email attachments
    const cvBuffer = await cvFile.arrayBuffer();
    const cvBase64 = Buffer.from(cvBuffer).toString("base64");

    const attachments: Array<{
      filename: string;
      content: string;
    }> = [
      {
        filename: `CV_${fullName.replace(/\s+/g, "_")}.pdf`,
        content: cvBase64,
      },
    ];

    if (coverLetterFile) {
      const coverLetterBuffer = await coverLetterFile.arrayBuffer();
      const coverLetterBase64 =
        Buffer.from(coverLetterBuffer).toString("base64");
      attachments.push({
        filename: `Carta_${fullName.replace(/\s+/g, "_")}.pdf`,
        content: coverLetterBase64,
      });
    }

    // Send email to support@predik.io
    await resend.emails.send({
      from: "Predik Careers <no-reply@predik.io>",
      to: "support@predik.io",
      replyTo: email,
      subject: `[Aplicación] ${jobTitle} - ${fullName}`,
      attachments,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Aplicación de Trabajo</h1>
            </div>

            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #667eea; margin-top: 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Información del Candidato</h2>

                <div style="margin: 15px 0;">
                  <strong style="color: #555;">Nombre:</strong>
                  <p style="margin: 5px 0; color: #333;">${fullName}</p>
                </div>

                <div style="margin: 15px 0;">
                  <strong style="color: #555;">Email:</strong>
                  <p style="margin: 5px 0;">
                    <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                  </p>
                </div>

                <div style="margin: 15px 0;">
                  <strong style="color: #555;">Posición:</strong>
                  <p style="margin: 5px 0;">
                    <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px;">${jobTitle}</span>
                  </p>
                </div>

                <div style="margin: 15px 0;">
                  <strong style="color: #555;">Fecha y Hora:</strong>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">${timestamp}</p>
                </div>
              </div>

              <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #667eea; margin-top: 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Archivos Adjuntos</h2>
                <ul style="list-style: none; padding: 0; margin: 15px 0 0 0;">
                  <li style="padding: 10px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px;">
                    📄 <strong>CV:</strong> ${cvFile.name} (${(
                      cvFile.size / 1024
                    ).toFixed(0)} KB)
                  </li>
                  ${
                    coverLetterFile
                      ? `<li style="padding: 10px; background: #f9fafb; border-radius: 6px;">
                      📄 <strong>Carta de Presentación:</strong> ${
                        coverLetterFile.name
                      } (${(coverLetterFile.size / 1024).toFixed(0)} KB)
                    </li>`
                      : ""
                  }
                </ul>
              </div>

              <div style="margin-top: 20px; padding: 15px; background: #e0e7ff; border-radius: 6px; text-align: center;">
                <p style="margin: 0; color: #667eea; font-size: 14px;">
                  💡 <strong>Los archivos están adjuntos a este email</strong>
                </p>
              </div>

              <div style="margin-top: 15px; text-align: center;">
                <a href="https://predik.io/carreras/${jobSlug}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                  Ver Descripción del Puesto
                </a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p style="margin: 5px 0;">Esta aplicación fue enviada desde el portal de carreras de Predik</p>
              <p style="margin: 5px 0;">IP: ${ip}</p>
            </div>
          </body>
        </html>
      `,
    });

    // Send confirmation email to applicant
    await resend.emails.send({
      from: "Predik <no-reply@predik.io>",
      to: email,
      subject: `Recibimos tu aplicación para ${jobTitle} - Predik`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">¡Gracias por postularte!</h1>
            </div>

            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333; margin-top: 0;">Hola <strong>${fullName}</strong>,</p>

                <p style="color: #555;">
                  Recibimos tu aplicación para la posición de <strong>${jobTitle}</strong> en Predik.
                  ¡Gracias por tu interés en formar parte de nuestro equipo!
                </p>

                <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 0; color: #667eea; font-weight: bold;">Resumen de tu aplicación:</p>
                  <div style="margin-top: 10px; color: #555;">
                    <p style="margin: 5px 0;"><strong>Posición:</strong> ${jobTitle}</p>
                    <p style="margin: 5px 0;"><strong>Fecha:</strong> ${timestamp}</p>
                    <p style="margin: 5px 0;"><strong>CV:</strong> ✅ Recibido</p>
                    <p style="margin: 5px 0;"><strong>Carta de Presentación:</strong> ${
                      coverLetterFile ? "✅ Recibida" : "No enviada"
                    }</p>
                  </div>
                </div>

                <p style="color: #555;">
                  <strong>¿Qué sigue?</strong><br>
                  Nuestro equipo revisará tu perfil cuidadosamente. Si tu experiencia coincide con lo que buscamos,
                  nos pondremos en contacto contigo para coordinar los próximos pasos.
                </p>

                <p style="color: #555;">
                  Ten en cuenta que revisamos todas las aplicaciones, pero solo contactamos a los candidatos
                  que avanzan en el proceso. ¡Te deseamos mucha suerte!
                </p>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <a href="https://predik.io" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                    Conocer más sobre Predik
                  </a>
                </div>
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #666; font-size: 14px; margin: 5px 0;">
                  Seguinos en nuestras redes para estar al tanto de novedades
                </p>
                <div style="margin: 15px 0;">
                  <a href="https://twitter.com/predikapp" style="color: #667eea; text-decoration: none; margin: 0 10px;">X (Twitter)</a>
                  <a href="https://instagram.com/predikapp" style="color: #667eea; text-decoration: none; margin: 0 10px;">Instagram</a>
                  <a href="https://tiktok.com/@predikapp" style="color: #667eea; text-decoration: none; margin: 0 10px;">TikTok</a>
                </div>
                <p style="color: #999; font-size: 12px; margin: 15px 0;">
                  © 2025 Predik. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Aplicación enviada correctamente",
        remaining: remaining - 1,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": (remaining - 1).toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      },
    );
  } catch (error) {
    console.error("Career application error:", error);
    return NextResponse.json(
      {
        error:
          "Error al procesar tu aplicación. Por favor intenta nuevamente más tarde.",
      },
      { status: 500 },
    );
  }
}
