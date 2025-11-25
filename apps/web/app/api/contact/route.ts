import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Upstash Redis rate limiter
// 3 requests per day (24 hours) per IP
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "24 h"),
  analytics: true,
  prefix: "contact",
});

const CONTACT_REASONS: Record<string, string> = {
  soporte: "Soporte Técnico",
  sugerencia: "Sugerencia",
  partnership: "Alianzas / Partnership",
  prensa: "Prensa / Medios",
  otro: "Otro",
};

export async function POST(request: NextRequest) {
  try {
    // Get IP address for rate limiting
    const ip = request.headers.get("x-forwarded-for") || "anonymous";

    // Check rate limit
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: `Has alcanzado el límite de mensajes. Podrás enviar otro mensaje en ${Math.ceil(
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

    // Parse request body
    const body = await request.json();
    const { fullName, email, reason, message } = body;

    // Validate required fields
    if (!fullName || !email || !reason || !message) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Validate message length
    if (message.length < 20 || message.length > 3000) {
      return NextResponse.json(
        { error: "El mensaje debe tener entre 20 y 3000 caracteres" },
        { status: 400 },
      );
    }

    // Validate reason
    if (!CONTACT_REASONS[reason]) {
      return NextResponse.json({ error: "Motivo inválido" }, { status: 400 });
    }

    const reasonLabel = CONTACT_REASONS[reason];
    const timestamp = new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      dateStyle: "full",
      timeStyle: "short",
    });

    // Send email to support@predik.io
    await resend.emails.send({
      from: "Predik Contact Form <no-reply@predik.io>",
      to: "support@predik.io",
      replyTo: email,
      subject: `[${reasonLabel}] Nuevo mensaje de contacto - ${fullName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Nuevo Mensaje de Contacto</h1>
            </div>

            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #667eea; margin-top: 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Información del Contacto</h2>

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
                  <strong style="color: #555;">Motivo:</strong>
                  <p style="margin: 5px 0;">
                    <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px;">${reasonLabel}</span>
                  </p>
                </div>

                <div style="margin: 15px 0;">
                  <strong style="color: #555;">Fecha y Hora:</strong>
                  <p style="margin: 5px 0; color: #666; font-size: 14px;">${timestamp}</p>
                </div>
              </div>

              <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h2 style="color: #667eea; margin-top: 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Mensaje</h2>
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; margin-top: 15px;">
                  <p style="white-space: pre-wrap; color: #333; margin: 0;">${message}</p>
                </div>
              </div>

              <div style="margin-top: 20px; padding: 15px; background: #e0e7ff; border-radius: 6px; text-align: center;">
                <p style="margin: 0; color: #667eea; font-size: 14px;">
                  💡 <strong>Recordá responder desde support@predik.io</strong>
                </p>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p style="margin: 5px 0;">Este mensaje fue enviado desde el formulario de contacto de Predik</p>
              <p style="margin: 5px 0;">IP: ${ip}</p>
            </div>
          </body>
        </html>
      `,
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: "Predik <no-reply@predik.io>",
      to: email,
      subject: "Recibimos tu mensaje - Predik",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">¡Gracias por contactarnos!</h1>
            </div>

            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <p style="font-size: 16px; color: #333; margin-top: 0;">Hola <strong>${fullName}</strong>,</p>

                <p style="color: #555;">
                  Recibimos tu mensaje y queremos agradecerte por ponerte en contacto con nosotros.
                  Nuestro equipo lo revisará y te responderá a la brevedad.
                </p>

                <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                  <p style="margin: 0; color: #667eea; font-weight: bold;">Resumen de tu consulta:</p>
                  <div style="margin-top: 10px; color: #555;">
                    <p style="margin: 5px 0;"><strong>Motivo:</strong> ${reasonLabel}</p>
                    <p style="margin: 5px 0;"><strong>Fecha:</strong> ${timestamp}</p>
                  </div>
                </div>

                <p style="color: #555;">
                  <strong>Tiempo de respuesta estimado:</strong><br>
                  Normalmente respondemos en menos de 24 horas durante días hábiles (Lunes a Viernes, 9:00 - 18:00 ART).
                </p>

                <p style="color: #555;">
                  Mientras tanto, te invitamos a explorar nuestra sección de
                  <a href="https://predik.io/faq" style="color: #667eea; text-decoration: none; font-weight: bold;">Preguntas Frecuentes</a>
                  donde podrías encontrar respuestas rápidas a consultas comunes.
                </p>

                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <a href="https://predik.io" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                    Volver a Predik
                  </a>
                </div>
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #666; font-size: 14px; margin: 5px 0;">
                  <strong>¿Tenés dudas?</strong> Respondé este email y te ayudaremos.
                </p>
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
        message: "Mensaje enviado correctamente",
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
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        error:
          "Error al procesar tu mensaje. Por favor intenta nuevamente más tarde.",
      },
      { status: 500 },
    );
  }
}
