/**
 * Translate market status to Spanish
 */
export function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    open: "Abierto",
    closed: "Cerrado",
    resolved: "Resuelto",
  };

  return statusMap[status.toLowerCase()] || status;
}

/**
 * Translate market tags/topics to Spanish
 */
export function translateTag(tag: string): string {
  const tagMap: Record<string, string> = {
    // Sports
    sports: "Deportes",
    deportes: "Deportes",
    deporte: "Deportes",
    soccer: "Fútbol",
    football: "Fútbol",
    basketball: "Baloncesto",
    tennis: "Tenis",
    baseball: "Béisbol",
    mma: "MMA",
    boxing: "Boxeo",
    racing: "Carreras",
    f1: "Fórmula 1",
    "formula 1": "Fórmula 1",
    nfl: "NFL",
    nba: "NBA",
    mlb: "MLB",

    // Economy
    economy: "Economía",
    economía: "Economía",
    economia: "Economía",
    finance: "Finanzas",
    finanzas: "Finanzas",
    stocks: "Acciones",
    trading: "Trading",
    markets: "Mercados",
    inflation: "Inflación",
    gdp: "PIB",

    // Politics
    politics: "Política",
    política: "Política",
    politica: "Política",
    elections: "Elecciones",
    government: "Gobierno",
    legislation: "Legislación",
    international: "Internacional",
    diplomacy: "Diplomacia",

    // Crypto
    crypto: "Cripto",
    cryptocurrency: "Criptomonedas",
    bitcoin: "Bitcoin",
    ethereum: "Ethereum",
    btc: "BTC",
    eth: "ETH",
    defi: "DeFi",
    nft: "NFT",
    blockchain: "Blockchain",
    web3: "Web3",

    // Culture
    culture: "Cultura",
    cultura: "Cultura",
    entertainment: "Entretenimiento",
    music: "Música",
    movies: "Películas",
    tv: "TV",
    television: "Televisión",
    streaming: "Streaming",
    celebrity: "Celebridades",
    awards: "Premios",
    "pop culture": "Cultura Pop",

    // Gaming
    gaming: "Gaming",
    videogames: "Videojuegos",
    esports: "eSports",
    "e-sports": "eSports",
    twitch: "Twitch",
    youtube: "YouTube",

    // Technology
    technology: "Tecnología",
    tech: "Tecnología",
    ai: "IA",
    "artificial intelligence": "Inteligencia Artificial",
    space: "Espacio",
    science: "Ciencia",
    innovation: "Innovación",

    // Others
    weather: "Clima",
    health: "Salud",
    education: "Educación",
    environment: "Medio Ambiente",
    social: "Social",
    news: "Noticias",
    trending: "Tendencias",
    viral: "Viral",
    memes: "Memes",
  };

  // Try exact match first (case insensitive)
  const normalized = tag.toLowerCase().trim();
  if (tagMap[normalized]) {
    return tagMap[normalized];
  }

  // Try partial match
  for (const [key, value] of Object.entries(tagMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value;
    }
  }

  // Return original if no match
  return tag;
}

/**
 * Translate "shares" to Spanish based on context
 */
export function translateShares(count?: number): string {
  if (count === undefined) {
    return "Acciones";
  }

  return count === 1 ? "Acción" : "Acciones";
}
