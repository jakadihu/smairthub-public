/**
 * Egyszerű, gyors duplikáció detektor.
 * 
 * A `keys` mezők alapján összeállít egy egyedi kulcsot minden sorhoz,
 * majd visszaadja azoknak a kulcsoknak a listáját, amelyek többször is előfordulnak.
 *
 * Példa:
 *   keys = ["email"]
 *   rows = [{ email: "a@a.com" }, { email: "b@b.com" }, { email: "a@a.com" }]
 *   → ["a@a.com"]
 */

export function findDuplicates(
  rows: Record<string, any>[],
  keys: string[]
): string[] {
  const seen = new Map<string, number>();
  const duplicates = new Set<string>();

  for (const row of rows) {
    // összeállítjuk a kulcsot a megadott mezőkből
    const compositeKey = keys.map((k) => row[k]).join("|");

    if (seen.has(compositeKey)) {
      duplicates.add(compositeKey);
    } else {
      seen.set(compositeKey, 1);
    }
  }

  return Array.from(duplicates);
}
