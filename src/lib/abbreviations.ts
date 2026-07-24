import type { Abbreviation } from '../types'
import { ABBREVIATIONS } from '../data/abbreviations'

/**
 * Fold a string to lowercase alphanumerics only — dropping spaces, hyphens,
 * slashes, and punctuation. This makes search case-, hyphen-, space-, and
 * punctuation-insensitive, so e.g. "HRS AKI" matches "HRS-AKI" and
 * "portal hypertension" matches "clinically significant portal hypertension".
 */
function fold(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/** The full glossary, already sorted alphabetically by abbreviation. */
export function getAbbreviations(): Abbreviation[] {
  return ABBREVIATIONS
}

/**
 * Filter the glossary by a query, matching against the abbreviation, the full
 * term, and internal aliases (aliases are search-only and never displayed).
 * An empty query returns the full list. Matching is a folded-substring test.
 */
export function searchAbbreviations(query: string): Abbreviation[] {
  const q = fold(query)
  if (!q) return ABBREVIATIONS
  return ABBREVIATIONS.filter(
    (a) =>
      fold(a.abbreviation).includes(q) ||
      fold(a.fullName).includes(q) ||
      (a.aliases?.some((alias) => fold(alias).includes(q)) ?? false)
  )
}
