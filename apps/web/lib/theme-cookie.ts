/**
 * Theme cookie utilities for cross-domain sync between predik.io and app.predik.io
 */

const THEME_COOKIE_NAME = "theme";
const COOKIE_DOMAIN = ".predik.io";
const COOKIE_MAX_AGE = 31536000; // 1 year

export function setThemeCookie(theme: string) {
  if (typeof document === "undefined") return;

  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Set cookie on root domain for production, or no domain for localhost
  const domain = isLocalhost ? "" : `domain=${COOKIE_DOMAIN};`;

  document.cookie = `${THEME_COOKIE_NAME}=${theme}; ${domain} path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function getThemeCookie(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`(^| )${THEME_COOKIE_NAME}=([^;]+)`),
  );
  return match ? match[2] : null;
}
