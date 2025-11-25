import { Metadata } from "next";
import { FadeIn } from "@/components/animations/FadeIn";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies | Predik",
  description:
    "Información sobre el uso de cookies en la plataforma Predik y cómo gestionarlas.",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,transparent,black_100px)] -z-10" />
      <div className="max-w-4xl mx-auto px-4">
        <FadeIn>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Política de Cookies</h1>
            <p className="text-muted-foreground mb-4">
              Última actualización: 24 de noviembre de 2025
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          {/* Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-muted-foreground leading-relaxed">
                Esta Política de Cookies explica qué son las cookies, cómo las
                utilizamos en Predik (incluyendo nuestro sitio web en{" "}
                <a
                  href="https://predik.io"
                  className="text-foreground underline hover:text-electric-purple transition-colors"
                >
                  predik.io
                </a>{" "}
                y nuestra aplicación en{" "}
                <a
                  href="https://app.predik.io"
                  className="text-foreground underline hover:text-electric-purple transition-colors"
                >
                  app.predik.io
                </a>
                ), qué tipos de cookies usamos y cómo podés gestionar tus
                preferencias.
              </p>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                1. ¿Qué son las cookies?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Las cookies son pequeños archivos de texto que se almacenan en
                tu dispositivo (computadora, tablet o celular) cuando visitás un
                sitio web. Se utilizan ampliamente para hacer que los sitios
                funcionen de manera más eficiente, así como para proporcionar
                información a los propietarios del sitio.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Cookies que utilizamos
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Predik utiliza los siguientes tipos de cookies:
              </p>

              {/* Necessary Cookies */}
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-lg mb-2">
                  Cookies Necesarias (Siempre activas)
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Son esenciales para el funcionamiento básico del sitio y la
                  aplicación. Sin estas cookies, ciertos servicios no pueden ser
                  proporcionados.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-semibold">
                          Cookie
                        </th>
                        <th className="text-left py-2 pr-4 font-semibold">
                          Dominio
                        </th>
                        <th className="text-left py-2 pr-4 font-semibold">
                          Propósito
                        </th>
                        <th className="text-left py-2 font-semibold">
                          Duración
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">
                          cookie-consent
                        </td>
                        <td className="py-2 pr-4">predik.io</td>
                        <td className="py-2 pr-4">
                          Almacena tus preferencias de cookies
                        </td>
                        <td className="py-2">6 meses</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">theme</td>
                        <td className="py-2 pr-4">predik.io</td>
                        <td className="py-2 pr-4">
                          Recuerda tu preferencia de tema (claro/oscuro)
                        </td>
                        <td className="py-2">1 año</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Behavioral Cookies */}
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-lg mb-2">
                  Cookies de Comportamiento
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Nos ayudan a entender cómo interactuás con el sitio para
                  mejorar la experiencia de usuario. Usamos PostHog para este
                  propósito.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-semibold">
                          Cookie
                        </th>
                        <th className="text-left py-2 pr-4 font-semibold">
                          Proveedor
                        </th>
                        <th className="text-left py-2 pr-4 font-semibold">
                          Propósito
                        </th>
                        <th className="text-left py-2 font-semibold">
                          Duración
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">
                          ph_phc_*
                        </td>
                        <td className="py-2 pr-4">PostHog</td>
                        <td className="py-2 pr-4">
                          Identifica sesiones y comportamiento de usuario
                        </td>
                        <td className="py-2">1 año</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">
                          __ph_opt_*
                        </td>
                        <td className="py-2 pr-4">PostHog</td>
                        <td className="py-2 pr-4">
                          Almacena preferencias de opt-in/opt-out
                        </td>
                        <td className="py-2">1 año</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">
                  Cookies de Analytics
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Nos permiten medir el tráfico y analizar el rendimiento del
                  sitio de forma agregada y anónima.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-semibold">
                          Cookie
                        </th>
                        <th className="text-left py-2 pr-4 font-semibold">
                          Proveedor
                        </th>
                        <th className="text-left py-2 pr-4 font-semibold">
                          Propósito
                        </th>
                        <th className="text-left py-2 font-semibold">
                          Duración
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                        <td className="py-2 pr-4">Google Analytics</td>
                        <td className="py-2 pr-4">Distingue usuarios únicos</td>
                        <td className="py-2">2 años</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-2 pr-4 font-mono text-xs">_ga_*</td>
                        <td className="py-2 pr-4">Google Analytics</td>
                        <td className="py-2 pr-4">
                          Mantiene el estado de la sesión
                        </td>
                        <td className="py-2">2 años</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Cookies en la aplicación (app.predik.io)
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Cuando usás nuestra aplicación en{" "}
                <a
                  href="https://app.predik.io"
                  className="text-foreground underline hover:text-electric-purple transition-colors"
                >
                  app.predik.io
                </a>
                , te mostramos un banner de consentimiento donde podés:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>
                  <strong>Aceptar todo:</strong> Habilitás todas las cookies
                  (necesarias, comportamiento y analytics)
                </li>
                <li>
                  <strong>Solo necesarias:</strong> Solo usamos cookies
                  esenciales para el funcionamiento del sitio
                </li>
                <li>
                  <strong>Personalizar:</strong> Podés elegir específicamente
                  qué categorías de cookies aceptar
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Podés cambiar tus preferencias en cualquier momento desde el
                footer de la aplicación haciendo clic en &quot;Preferencias de
                Cookies&quot;.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                4. Cookies en el sitio web (predik.io)
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Actualmente, nuestro sitio web marketing (predik.io) utiliza
                únicamente cookies necesarias para el funcionamiento básico. No
                implementamos analytics en el sitio web por el momento, aunque
                esto puede cambiar en el futuro, en cuyo caso actualizaremos
                esta política y te solicitaremos consentimiento.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                5. Cómo gestionar las cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Tenés varias opciones para gestionar las cookies:
              </p>

              <h3 className="font-semibold text-lg mb-2 mt-4">
                En la aplicación Predik
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Hacé clic en &quot;Preferencias de Cookies&quot; en el footer de{" "}
                <a
                  href="https://app.predik.io"
                  className="text-foreground underline hover:text-electric-purple transition-colors"
                >
                  app.predik.io
                </a>{" "}
                para modificar tus preferencias en cualquier momento.
              </p>

              <h3 className="font-semibold text-lg mb-2 mt-4">
                En tu navegador
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                La mayoría de navegadores permiten controlar las cookies a
                través de sus configuraciones. Podés:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Ver qué cookies tenés almacenadas y eliminarlas</li>
                <li>Bloquear cookies de terceros</li>
                <li>Bloquear todas las cookies</li>
                <li>Eliminar todas las cookies al cerrar el navegador</li>
              </ul>

              <p className="text-muted-foreground leading-relaxed mt-4">
                Consultá la documentación de tu navegador para instrucciones
                específicas:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-2">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline hover:text-electric-purple transition-colors"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline hover:text-electric-purple transition-colors"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline hover:text-electric-purple transition-colors"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline hover:text-electric-purple transition-colors"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Cookies de terceros
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Algunos de nuestros proveedores de servicios pueden establecer
                sus propias cookies cuando usás nuestro sitio. Estos terceros
                tienen sus propias políticas de privacidad:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
                <li>
                  <a
                    href="https://posthog.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline hover:text-electric-purple transition-colors"
                  >
                    PostHog - Política de Privacidad
                  </a>
                </li>
                <li>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline hover:text-electric-purple transition-colors"
                  >
                    Google Analytics - Política de Privacidad
                  </a>
                </li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                7. Cambios en esta política
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos actualizar esta Política de Cookies ocasionalmente para
                reflejar cambios en las cookies que utilizamos o por otras
                razones operativas, legales o regulatorias. Te recomendamos
                revisar esta página periódicamente para mantenerte informado
                sobre nuestro uso de cookies.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contacto</h2>
              <p className="text-muted-foreground leading-relaxed">
                Si tenés preguntas sobre nuestra Política de Cookies, podés
                contactarnos en:{" "}
                <a
                  href="mailto:support@predik.io"
                  className="text-foreground underline hover:text-electric-purple transition-colors"
                >
                  support@predik.io
                </a>
              </p>
            </section>

            {/* Related Links */}
            <section className="border-t pt-6 mt-8">
              <p className="text-muted-foreground leading-relaxed">
                También podés consultar nuestros{" "}
                <Link
                  href="/terminos"
                  className="text-foreground underline hover:text-electric-purple transition-colors"
                >
                  Términos de Servicio
                </Link>{" "}
                y{" "}
                <Link
                  href="/privacidad"
                  className="text-foreground underline hover:text-electric-purple transition-colors"
                >
                  Política de Privacidad
                </Link>{" "}
                para más información sobre cómo manejamos tus datos.
              </p>
            </section>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
