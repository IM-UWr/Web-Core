// Animacja w tle banera podstrony — tylko telefon (silnik: src/scripts/baner/silnik.ts; zlecenie 02, decyzje 31.10.2026).
// Mapa: adres strony (bez bazy, bez /en, bez ukośników na końcach) → nazwa motywu = nazwa pliku w src/scripts/baner/motywy/.
// Nowy motyw: plik motywy/<nazwa>.ts (domyślny eksport — fabryka motywu, opcjonalnie `ustawienia` maski) i wpis tutaj;
// silnik znajdzie plik sam (import.meta.glob) i wczyta tylko jego kod. Strony spoza mapy mają statyczny rysunek działu.
export const MOTYWY_STRON: Record<string, string> = {
  instytut: 'dendryt',
  nauka: 'lorenz',
  studia: 'riemann',
  aktualnosci: 'fourier',
  popularyzacja: 'zloty-podzial',
};

/** motyw dla ścieżki strony (np. „/nauka/”, „/en/studia”) albo undefined */
export function motywStrony(sciezka: string): string | undefined {
  const klucz = sciezka.replace(/^\/en(?=\/|$)/, '').replace(/^\/+|\/+$/g, '');
  return MOTYWY_STRON[klucz];
}
