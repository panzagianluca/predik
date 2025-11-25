import {
  Rocket,
  Wallet,
  Shield,
  BarChart3,
  CreditCard,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  faqs: FAQItem[];
}

export const faqCategories: FAQCategory[] = [
  {
    id: "getting-started",
    title: "Empezar con Predik",
    description: "Todo lo que necesitás para comenzar",
    icon: Rocket,
    faqs: [
      {
        question: "¿Qué es Predik?",
        answer:
          "Predik es una interfaz frontend que te conecta con los mercados de predicción de Myriad Protocol en la red BNB Smart Chain. Myriad Protocol es una plataforma descentralizada construida sobre la tecnología de Polkamarkets, que permite crear y operar mercados de predicción de forma transparente y segura. Predik funciona como tu puerta de entrada a estos mercados, enfocándose en eventos de Latinoamérica: política, economía, deportes y más. Todas las transacciones quedan registradas en blockchain, garantizando transparencia total y pagos instantáneos.",
      },
      {
        question: "¿Cómo creo una cuenta?",
        answer:
          "Tenés dos opciones para crear tu cuenta en Predik. La más fácil: iniciá sesión con Google o X (Twitter) y nosotros creamos automáticamente una wallet segura para vos (embedded wallet). No necesitás saber nada de crypto, solo usá tu cuenta existente. La opción avanzada: si ya tenés una wallet como MetaMask o Trust Wallet, podés conectarla directamente. Tu wallet es tu cuenta.",
      },
      {
        question: "¿Qué es una embedded wallet?",
        answer:
          'Cuando iniciás sesión con Google o X, Predik crea automáticamente una wallet de blockchain vinculada a tu cuenta. Esta "embedded wallet" funciona igual que una wallet tradicional, pero sin que tengas que manejar claves privadas ni frases semilla. Es la forma más simple de empezar con mercados de predicción. Siempre podés acceder a tu wallet iniciando sesión con la misma cuenta de Google o X.',
      },
      {
        question: "¿Qué wallet puedo usar?",
        answer:
          "Podés usar cualquier wallet compatible con BNB Smart Chain: MetaMask, Trust Wallet, Coinbase Wallet, WalletConnect, entre otras. Recomendamos MetaMask para desktop y Trust Wallet para mobile. O simplemente usá Google o X para que creemos una wallet automáticamente.",
      },
      {
        question: "¿Necesito experiencia previa con crypto?",
        answer:
          "No es necesario. Predik está diseñado para que cualquier persona pueda participar. Si iniciás sesión con Google o X, nosotros creamos y manejamos tu wallet automáticamente. No necesitás entender de claves privadas ni blockchain. Si es tu primera vez, te recomendamos empezar con poco capital mientras aprendés cómo funcionan los mercados.",
      },
    ],
  },
  {
    id: "payments",
    title: "Pagos y Retiros",
    description: "Depósitos, retiros y métodos de pago",
    icon: CreditCard,
    faqs: [
      {
        question: "¿Qué moneda usa Predik?",
        answer:
          "Predik usa USDT (Tether) en la red BNB Smart Chain. Es una stablecoin pegada al dólar estadounidense, por lo que 1 USDT ≈ 1 USD.",
      },
      {
        question: "¿Cómo deposito fondos?",
        answer:
          "Podés depositar USDT desde cualquier exchange (Binance, Bybit, OKX, etc.) o wallet. Simplemente enviá USDT a tu dirección de wallet en Predik usando la red BNB Smart Chain (BSC). También ofrecemos opción de bridge para convertir desde otras redes.",
      },
      {
        question: "¿Cuánto tarda un retiro?",
        answer:
          "Los retiros son instantáneos. Una vez que retirás tus fondos, aparecen directamente en tu wallet en cuestión de segundos. Sin esperas, sin intermediarios.",
      },
      {
        question: "¿Hay mínimos para depositar o retirar?",
        answer:
          "No hay mínimo para depositar. Para operar en mercados, el mínimo depende del mercado específico. Los retiros no tienen mínimo, pero tené en cuenta las comisiones de red (gas) de BNB Smart Chain.",
      },
    ],
  },
  {
    id: "security",
    title: "Seguridad",
    description: "Protección de tus fondos e información",
    icon: Shield,
    faqs: [
      {
        question: "¿Mis fondos están seguros?",
        answer:
          "Sí. Tus fondos están protegidos por los smart contracts de Myriad Protocol, auditados y desplegados en BNB Smart Chain. Importante: Predik no tiene acceso ni custodia sobre tus fondos. Todo se maneja directamente en la blockchain a través de Myriad Protocol. Vos tenés el control total de tus activos.",
      },
      {
        question: "¿Predik puede manipular los resultados?",
        answer:
          "No. Predik es solo una interfaz frontend. La resolución de los mercados está a cargo de Myriad Protocol, que usa oráculos descentralizados para obtener información de múltiples fuentes verificables. Si no estás de acuerdo con una resolución, el sistema permite elevar disputas a Kleros, un tribunal descentralizado que actúa como árbitro final. Los resultados quedan registrados en blockchain y son inmutables.",
      },
      {
        question: "¿Qué pasa si pierdo acceso a mi wallet?",
        answer:
          "Depende de cómo creaste tu cuenta. Si usaste Google o X para iniciar sesión, simplemente volvé a iniciar sesión con la misma cuenta y recuperás acceso a tu embedded wallet automáticamente. Si usaste una wallet externa (MetaMask, Trust Wallet, etc.), necesitás tu frase semilla (seed phrase) para recuperarla. En ese caso, guardala en un lugar seguro y nunca la compartas. Predik no puede recuperar fondos de wallets externas perdidas.",
      },
    ],
  },
  {
    id: "markets",
    title: "Mercados",
    description: "Cómo funcionan los mercados de predicción",
    icon: BarChart3,
    faqs: [
      {
        question: "¿Cómo funcionan los mercados de predicción?",
        answer:
          'Los mercados de predicción son como mercados bursátiles, pero en vez de acciones de empresas, comprás y vendés "acciones" de resultados posibles de eventos futuros. Por ejemplo, si hay un mercado sobre quién ganará una elección, cada candidato tiene acciones con un precio que refleja su probabilidad de ganar según el mercado.\n\nAsí funciona:\n1. Elegís un mercado que te interese (ej: "¿Quién será el próximo presidente?")\n2. Comprás acciones del resultado que creés que va a ocurrir\n3. El precio de cada acción va de $0 a $1 USDT\n4. Si tu predicción es correcta, cada acción vale $1 cuando se resuelve el mercado\n5. Si es incorrecta, las acciones valen $0\n\nEjemplo práctico: Si comprás 100 acciones de "Candidato A" a $0.30 cada una (invertís $30), y Candidato A gana, recibís $100 (100 acciones × $1). Tu ganancia es $70.\n\nLos precios se mueven según la oferta y demanda. Si mucha gente cree que algo va a pasar, el precio de esas acciones sube. Podés comprar cuando pensás que el mercado subestima una opción y vender cuando pensás que la sobrestima.',
      },
      {
        question: "¿Puedo vender mi posición antes de que termine el mercado?",
        answer:
          "Sí. Podés vender tu posición en cualquier momento al precio actual del mercado. Esto te permite asegurar ganancias o limitar pérdidas antes de que se resuelva el evento. No estás obligado a esperar hasta el final.",
      },
      {
        question: "¿Cuándo recibo mis ganancias?",
        answer:
          "Una vez que el mercado se resuelve (el evento ocurre y se confirma el resultado), podés reclamar tus ganancias inmediatamente. El proceso es automático y los fondos van directo a tu wallet.",
      },
      {
        question: "¿Qué tipos de mercados tiene Predik?",
        answer:
          "Predik muestra todos los mercados globales de Myriad Protocol, incluyendo política internacional, criptomonedas, deportes y más. Nuestro objetivo es enfocarnos especialmente en eventos de Latinoamérica: elecciones y política, indicadores económicos (dólar, inflación), fútbol, y otros eventos regionales relevantes.",
      },
    ],
  },
  {
    id: "wallet",
    title: "Wallet y Balance",
    description: "Gestión de tu wallet y fondos",
    icon: Wallet,
    faqs: [
      {
        question: "¿Por qué no veo mi balance?",
        answer:
          "Asegurate de estar conectado con la wallet correcta y en la red BNB Smart Chain. Si usás MetaMask, verificá que hayas agregado la red BSC y el token USDT correctamente.",
      },
      {
        question: "¿Qué es el gas y por qué lo necesito?",
        answer:
          "El gas es una pequeña comisión en BNB que se paga para procesar transacciones en la blockchain. Necesitás tener un poco de BNB en tu wallet para pagar estas comisiones. Generalmente, 0.01 BNB es suficiente para muchas operaciones.",
      },
      {
        question: "¿Puedo usar múltiples wallets?",
        answer:
          "Sí. Cada wallet funciona como una cuenta separada. Podés conectar diferentes wallets en distintos momentos, pero solo una puede estar activa a la vez.",
      },
    ],
  },
  {
    id: "support",
    title: "Soporte",
    description: "Ayuda y contacto",
    icon: HelpCircle,
    faqs: [
      {
        question: "¿Cómo contacto al soporte?",
        answer:
          "Podés contactarnos por email a support@predik.io o usar el formulario de contacto en nuestra web. Respondemos en menos de 24 horas hábiles.",
      },
      {
        question: "¿Tienen redes sociales?",
        answer:
          "Sí. Estamos en X (@predikapp), Instagram (@predikapp) y TikTok (@predikapp) donde compartimos actualizaciones, nuevos mercados y novedades de la plataforma.",
      },
      {
        question: "¿Dónde reporto un bug o problema?",
        answer:
          "Podés reportar bugs enviando un email a support@predik.io con los detalles del problema, capturas de pantalla y la wallet usada (sin compartir claves privadas). También aceptamos reportes por DM en nuestras redes sociales.",
      },
    ],
  },
];

/**
 * Get all FAQs flattened (useful for search)
 */
export function getAllFAQs(): (FAQItem & {
  categoryId: string;
  categoryTitle: string;
})[] {
  return faqCategories.flatMap((category) =>
    category.faqs.map((faq) => ({
      ...faq,
      categoryId: category.id,
      categoryTitle: category.title,
    })),
  );
}

/**
 * Search FAQs by query
 */
export function searchFAQs(
  query: string,
): (FAQItem & { categoryId: string; categoryTitle: string })[] {
  if (!query.trim()) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const allFaqs = getAllFAQs();

  return allFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(normalizedQuery) ||
      faq.answer.toLowerCase().includes(normalizedQuery),
  );
}
