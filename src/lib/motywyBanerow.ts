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
  // zlecenie 04: Studia — kierunki i specjalności, codzienność; pozostałe strony Studiów (MOST, sprawy studenckie, skrypty,
  // archiwalne programy i strony spoza tabeli) dziedziczą sumy Riemanna z działu (reguła „studia/*”)
  'studia/*': 'riemann',
  'studia/matematyka': 'riemann',
  'studia/siad': 'gradient',
  'studia/isim': 'permutacje',
  'studia/matematyka/analiza-danych': 'kmeans',
  'studia/matematyka/matematyka-aktuarialno-finansowa': 'przezycie',
  'studia/matematyka/matematyka-nauczycielska': 'okrag',
  'studia/matematyka/matematyka-stosowana': 'lotka',
  'studia/matematyka/matematyka-teoretyczna': 'kule',
  'studia/plan-zajec': 'trzy-odleglosci/rytm',
  'studia/rok-akademicki': 'trzy-odleglosci/rytm',
  'studia/zajecia': 'trzy-odleglosci/rytm',
  'studia/pierwszy-rok': 'droga',
  'studia/egzaminy-i-dyplom': 'droga',
  'studia/procedura-dyplomowania': 'droga',
  'studia/szkola-doktorska': 'banach/pajeczyna',
  'studia/szkola-doktorska/*': 'banach/pajeczyna',
  'studia/podyplomowe': 'geoplan/podyplomowe',
  // zlecenie 05: podstrony Instytutu (spoza tabeli — dendryt z działu; zakłady ustawia Zaklad.astro) i strony ogólne
  'instytut/*': 'dendryt',
  'instytut/wladze': 'kanapka',
  pracownicy: 'luki',
  'instytut/struktura': 'dendrogram',
  'instytut/kontakt': 'mapa',
  'instytut/infrastruktura-informatyczna': 'motyl',
  'warto-wiedziec': 'trzy-odleglosci/warto',
  'warto-wiedziec/*': 'trzy-odleglosci/warto',
  szukaj: 'banach/kratka',
  'deklaracja-dostepnosci': 'kratka',
  'polityka-prywatnosci': 'kratka',
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
