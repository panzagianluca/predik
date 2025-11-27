/**
 * Predik Roadmap Data
 * Static content for the roadmap page
 */

export interface Feature {
  id: string;
  title: string;
  description: string;
  badges: Array<{
    label: string;
    color: "purple" | "blue" | "green" | "orange" | "red" | "yellow";
  }>;
}

export interface RoadmapColumn {
  id: string;
  title: string;
  features: Feature[];
}

export const roadmapData: RoadmapColumn[] = [
  {
    id: "ideas",
    title: "Ideas",
    features: [
      {
        id: "multilang",
        title: "Soporte Multi-idioma",
        description: "Agregar traducciones en portugués e inglés",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "UX", color: "purple" },
        ],
      },
      {
        id: "competitions",
        title: "Modo Competencia de Trading",
        description:
          "Competencias semanales con tablas de clasificación y premios",
        badges: [
          { label: "Backend", color: "green" },
          { label: "Frontend", color: "blue" },
          { label: "UX", color: "purple" },
        ],
      },
      {
        id: "referral",
        title: "Programa de Referidos",
        description: "Ganá recompensas por invitar amigos",
        badges: [
          { label: "Backend", color: "green" },
          { label: "Frontend", color: "blue" },
        ],
      },
      {
        id: "push-notifs",
        title: "Notificaciones Push",
        description:
          "Alertas de resolución de mercados y movimientos de precio",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "Infra", color: "orange" },
        ],
      },
      {
        id: "charts",
        title: "Gráficos Avanzados",
        description: "Historial de precios, gráficos de volumen y profundidad",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "Analytics", color: "yellow" },
        ],
      },
      {
        id: "api",
        title: "Acceso API",
        description: "API pública para que desarrolladores integren Predik",
        badges: [
          { label: "Backend", color: "green" },
          { label: "Infra", color: "orange" },
        ],
      },
      {
        id: "gifs",
        title: "Soporte de GIFs en Comentarios",
        description: "Agregar GIFs a los comentarios vía Giphy/Tenor",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "UX", color: "purple" },
        ],
      },
    ],
  },
  {
    id: "validated",
    title: "Validadas",
    features: [
      {
        id: "balance-agg",
        title: "Agregación de Balance de Wallets",
        description: "Mostrar balance total entre todas las wallets conectadas",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "UX", color: "purple" },
        ],
      },
      {
        id: "portfolio",
        title: "Analytics de Portfolio",
        description: "Seguimiento de P&L, tasa de acierto, mejores trades",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "Analytics", color: "yellow" },
        ],
      },
      {
        id: "pwa",
        title: "App Móvil (PWA)",
        description: "Instalar Predik como una app nativa",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "Infra", color: "orange" },
        ],
      },
    ],
  },
  {
    id: "in-progress",
    title: "En Progreso",
    features: [
      {
        id: "error-handling",
        title: "Manejo de Errores de Transacciones",
        description: "Mejores mensajes de error cuando fallan los trades",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "UX", color: "purple" },
        ],
      },
    ],
  },
  {
    id: "done",
    title: "Completadas",
    features: [
      {
        id: "contacto",
        title: "Página de Contacto",
        description: "Formulario de contacto para usuarios y soporte",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "UX", color: "purple" },
        ],
      },
      {
        id: "blog",
        title: "Blog",
        description: "Sección de blog con artículos y noticias",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "UX", color: "purple" },
        ],
      },
      {
        id: "carreras",
        title: "Página de Carreras",
        description: "Portal de empleo y oportunidades laborales",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "UX", color: "purple" },
        ],
      },
      {
        id: "posthog",
        title: "PostHog Analytics",
        description: "Seguimiento de comportamiento de usuarios e insights",
        badges: [
          { label: "Analytics", color: "yellow" },
          { label: "Infra", color: "orange" },
        ],
      },
      {
        id: "dynamic",
        title: "Autenticación Dynamic Wallet",
        description: "Login social (Google, Twitter) + MetaMask",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "Security", color: "red" },
        ],
      },
      {
        id: "search",
        title: "Búsqueda de Mercados",
        description: "Búsqueda global de mercados",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "UX", color: "purple" },
        ],
      },
      {
        id: "lifi",
        title: "Integración Li.Fi Bridge",
        description: "Depositar desde cualquier chain vía bridge integrado",
        badges: [
          { label: "Frontend", color: "blue" },
          { label: "Infra", color: "orange" },
        ],
      },
      {
        id: "comments",
        title: "Comentarios y Discusión de Mercados",
        description: "Hilos de discusión comunitaria en mercados",
        badges: [
          { label: "Backend", color: "green" },
          { label: "Frontend", color: "blue" },
          { label: "UX", color: "purple" },
        ],
      },
    ],
  },
];
