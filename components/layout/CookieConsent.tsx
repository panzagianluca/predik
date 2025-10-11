'use client'

import { useEffect } from 'react'
import * as CookieConsent from 'vanilla-cookieconsent'
import 'vanilla-cookieconsent/dist/cookieconsent.css'

export function CookieConsentBanner() {
  useEffect(() => {
    CookieConsent.run({
      disablePageInteraction: false,
      autoShow: true,
      mode: 'opt-in',
      revision: 0,
      
      guiOptions: {
        consentModal: {
          layout: 'box inline',
          position: 'bottom right',
          equalWeightButtons: true,
          flipButtons: false,
        },
        preferencesModal: {
          layout: 'box',
          position: 'right',
          equalWeightButtons: true,
          flipButtons: false,
        },
      },
      
      categories: {
        necessary: {
          readOnly: true,
          enabled: true,
        },
        analytics: {
          enabled: false,
        },
      },
      
      language: {
        default: 'es',
        translations: {
          es: {
            consentModal: {
              title: 'Usamos cookies',
              description:
                'Utilizamos cookies para mejorar tu experiencia en Predik. Las cookies necesarias son esenciales para el funcionamiento básico del sitio, mientras que las analíticas nos ayudan a comprender cómo interactúas con la plataforma.',
              acceptAllBtn: 'Aceptar todo',
              acceptNecessaryBtn: 'Solo necesarias',
              showPreferencesBtn: 'Gestionar preferencias',
              footer: `
                <a href="/privacidad">Política de Privacidad</a>
                <a href="/terminos">Términos de Servicio</a>
              `,
            },
            preferencesModal: {
              title: 'Preferencias de Cookies',
              acceptAllBtn: 'Aceptar todo',
              acceptNecessaryBtn: 'Solo necesarias',
              savePreferencesBtn: 'Guardar preferencias',
              closeIconLabel: 'Cerrar',
              serviceCounterLabel: 'Servicio|Servicios',
              sections: [
                {
                  title: 'Uso de Cookies',
                  description:
                    'Utilizamos cookies para garantizar las funcionalidades básicas del sitio web y mejorar tu experiencia en línea. Puedes elegir para cada categoría si deseas activarla o desactivarla cuando lo desees.',
                },
                {
                  title: 'Cookies Estrictamente Necesarias',
                  description:
                    'Estas cookies son esenciales para el correcto funcionamiento de Predik. Sin estas cookies, el sitio web no funcionaría correctamente.',
                  linkedCategory: 'necessary',
                  cookieTable: {
                    headers: {
                      name: 'Nombre',
                      domain: 'Dominio',
                      description: 'Descripción',
                      expiration: 'Expiración',
                    },
                    body: [
                      {
                        name: 'cc_cookie',
                        domain: location.hostname,
                        description: 'Almacena tus preferencias de cookies',
                        expiration: '6 meses',
                      },
                    ],
                  },
                },
                {
                  title: 'Cookies de Análisis',
                  description:
                    'Estas cookies nos permiten analizar el uso del sitio web y mejorar la experiencia del usuario.',
                  linkedCategory: 'analytics',
                  cookieTable: {
                    headers: {
                      name: 'Nombre',
                      domain: 'Dominio',
                      description: 'Descripción',
                      expiration: 'Expiración',
                    },
                    body: [
                      {
                        name: '_ga',
                        domain: location.hostname,
                        description: 'Cookie de Google Analytics para análisis de uso',
                        expiration: '2 años',
                      },
                    ],
                  },
                },
                {
                  title: 'Más información',
                  description:
                    'Para cualquier consulta relacionada con nuestra política de cookies y tus opciones, por favor <a href="mailto:support@predik.io">contáctanos</a>.',
                },
              ],
            },
          },
        },
      },
    })
  }, [])

  return null
}
