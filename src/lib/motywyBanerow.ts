// Animacja w tle banera podstrony — tylko telefon (silnik: src/scripts/baner/silnik.ts; zlecenie 02, decyzje 31.10.2026).
// Mapa: adres strony (bez bazy, bez /en, bez ukośników na końcach) → nazwa motywu = nazwa pliku w src/scripts/baner/motywy/.
// Nowy motyw: plik motywy/<nazwa>.ts (domyślny eksport — fabryka motywu, opcjonalnie `ustawienia` maski) i wpis tutaj;
// silnik znajdzie plik sam (import.meta.glob) i wczyta tylko jego kod. Strony spoza mapy mają statyczny rysunek działu.
// Wartość: „nazwa” albo „nazwa/wariant” (wariant trafia do motywu jako Pole.wariant). Klucz zakończony „/*” obejmuje
// wszystkie podstrony danego adresu (np. „obrony-doktorskie/*” — każda obrona), dokładny adres ma pierwszeństwo.
export const MOTYWY_STRON: Record<string, string> = {
  instytut: 'dendryt',
  nauka: 'lorenz',
  studia: 'riemann',
  aktualnosci: 'fourier',
  popularyzacja: 'zloty-podzial',
  // zlecenie 03: podstrony Nauki, seminaria (zakłady dostają wariant „zaklad” motywu swojego seminarium — Zaklad.astro)
  'nauka/konferencje': 'banach',
  'obrony-doktorskie': 'genealogia',
  'obrony-doktorskie/*': 'genealogia/obrona',
  kalendarz: 'trzy-odleglosci',
  seminaria: 'rozsadnik',
  'seminaria/analiza-harmoniczna': 'haar',
  'seminaria/dyskretna-analiza-harmoniczna': 'czebyszew',
  'seminaria/rownania-rozniczkowe': 'wahadlo',
  'seminaria/prawdopodobienstwo': 'brown',
  'seminaria/statystyka': 'histogram',
  'seminaria/geometria': 'longimetr',
  'seminaria/topologia': 'knaster',
  'seminaria/teoria-modeli': 'eliptyczna',
  'seminaria/dydaktyka': 'geoplan',
  'nauka/granty': 'wachlarz',
  'nauka/granty/*': 'wachlarz/grant',
  'nauka/publikacje': 'cytowania',
  'nauka/publikacje/*': 'wspolautorzy',
  'nauka/sukcesy': 'bernoulli',
  'nauka/sukcesy/historia': 'bernoulli/historia',
};

/** motyw dla ścieżki strony (np. „/nauka/”, „/en/studia”) albo undefined */
export function motywStrony(sciezka: string): string | undefined {
  const klucz = sciezka.replace(/^\/en(?=\/|$)/, '').replace(/^\/+|\/+$/g, '');
  if (MOTYWY_STRON[klucz]) return MOTYWY_STRON[klucz];
  const czlony = klucz.split('/');
  for (let i = czlony.length - 1; i > 0; i--) {
    const m = MOTYWY_STRON[czlony.slice(0, i).join('/') + '/*'];
    if (m) return m;
  }
  return undefined;
}
