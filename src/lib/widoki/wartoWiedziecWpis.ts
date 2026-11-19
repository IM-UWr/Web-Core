// Dane strony wpisu „Warto wiedzieć” (/instytut/warto-wiedziec/<plik>; zlecenie 47, punkty 5, 6 i 12): sylwetka (SylwetkaWW.astro)
// albo nagroda / historia (WartoWiedziecWpis.astro). Treść (jawny Markdown z blokami :::w-skrocie, :::laureaci, :::pliki) i powiązania
// — src/lib/wartoWiedziec.ts; tu teksty interfejsu i wybór wpisów do sekcji pod Treścią.
import type { Lang } from '../daty';
import { isExternal } from '../url';
import { wybierz, langPola } from '../i18n';
import { stronaListy } from '../tekstyStron';
import { parsujLata, wybierzZZiarnem } from '../ww.mjs';
import { ADRES_WW, nazwaGrupy, trescWW, wpisyZOsoba, ludzieWpisu, widoczneWW, bezTlumaczenia, type WW } from '../wartoWiedziec';

export async function daneWpisuWW(w: WW, lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const { tytul: tytulListy } = await stronaListy('instytut/warto-wiedziec', lang);
  const tresc = await trescWW(w, lang);
  const wszystkie = await widoczneWW();
  return {
    T,
    tytul: wybierz(w, 'tytul', lang),
    tytulLang: langPola(w, 'tytul', lang),
    zajawka: wybierz(w, 'zajawka', lang),
    zajawkaLang: langPola(w, 'zajawka', lang),
    podpis: wybierz(w, 'podpis', lang),
    podpisLang: langPola(w, 'podpis', lang),
    lata: parsujLata(w.lata, lang).tekst,
    tresc,
    // na /en: Treść tylko po polsku — ramka „Translation in preparation” z linkiem do strony polskiej
    bezTlumaczenia: bezTlumaczenia(w, lang),
    tytulListy,
    wstecz: { etykieta: tytulListy, adres: `${ADRES_WW}#${w.grupa}` },
    nazwaGrupy: nazwaGrupy(w.grupa, lang),
    wszystkie,
  };
}

/** Sylwetka: „Zobacz też” (nagrody i historie, które linkują do osoby) i „Inne sylwetki” (4 losowe, bez TBA i bez bieżącej). */
export async function sekcjeSylwetki(w: WW, wszystkie: WW[]) {
  const pula = wszystkie.filter((x) => x.grupa === 'sylwetki' && !x.tba && x.slug !== w.slug);
  return {
    powiazane: await wpisyZOsoba(w.slug),
    inne: pula,
    // bez JS: 4 wybrane stałym ziarnem (nazwa pliku) — różne na różnych stronach, te same przy każdej budowie
    inneStart: new Set<string>((wybierzZZiarnem(pula, w.slug, 4) as WW[]).map((x) => x.slug)),
  };
}

/** Nagroda / historia: ludzie (sylwetki, do których Treść linkuje), pozostałe wpisy tej grupy, przycisk linku z karty. */
export async function sekcjeWpisu(w: WW, wszystkie: WW[], lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const zewnetrzny = !!w.link && isExternal(w.link);
  return {
    ludzie: await ludzieWpisu(w),
    ludzieTytul: w.maLaureatow ? T('Sylwetki laureatów', 'Recipients’ profiles') : T('Ludzie w tej historii', 'People in this story'),
    pozostale: wszystkie.filter((x) => x.grupa === w.grupa && x.slug !== w.slug),
    przycisk: w.link ? { adres: w.link, zew: zewnetrzny, etykieta: wybierz(w, 'link_etykieta', lang) || (zewnetrzny ? T('Strona zewnętrzna', 'External website') : T('Więcej', 'More')) } : undefined,
    opisObrazu: wybierz(w, 'obraz_opis', lang),
  };
}
