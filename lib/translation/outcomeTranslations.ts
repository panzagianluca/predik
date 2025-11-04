/**
 * Translate common outcome titles to Spanish
 * Only translates: Yes/No and Above/Below
 */
export function translateOutcomeTitle(title: string): string {
  const normalizedTitle = title.trim().toLowerCase();

  // Yes/No translations
  if (normalizedTitle === "yes") return "Sí";
  if (normalizedTitle === "no") return "No";

  // Above/Below translations
  if (normalizedTitle === "above") return "Arriba";
  if (normalizedTitle === "below") return "Abajo";

  // Return original if not a standard outcome
  return title;
}
