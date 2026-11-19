// Zlecenie 42: osoby w formularzach CMS wybierane ze spisu pracowników (Web-Pracownicy).
// - Pole „… ze spisu” (reference do katalogu _cms/pracownicy/<id>.yml w repozytorium treści) zapisuje ścieżkę pliku katalogu;
//   content.config.ts zamienia ją na <id> = nazwę pliku osoby w Web-Pracownicy. Imię, nazwisko, tytuł, link i zakład strona bierze
//   z aktualnego spisu (zmiana nazwiska niczego nie psuje).
// - Pole „… spoza spisu” to zwykły tekst (osoby spoza Instytutu): pokazywany tak, jak wpisany, bez linku.
// - Stare pole tekstowe (przed migracją albo po zapisie formularza otwartego przed zmianą konfiguracji) działa jak dotąd:
//   dopasowanie po imieniu i nazwisku albo nazwisku z inicjałem.
// Osoba, która odeszła (pole „Pracuje w Instytucie” odznaczone, pracuje: false), znika ze spisu pracowników i list zakładów. W polach:
// - historia (kierownik grantu): imię i nazwisko z tytułem jako zwykły tekst, bez linku i bez dopisku;
// - funkcja (kierownik zakładu, koordynator seminarium, opiekun specjalności, sekretariat, dyrekcja, władze Wydziału): jak brak osoby.
// Funkcja bez osoby (pusta albo same osoby, które odeszły): na Podglądzie (domyślna budowa) znacznik „nie przypisano osoby —
// uzupełnij w CMS” w miejscu osoby (BrakOsoby.astro, styl etykiety „szkic”), ostrzeżenie w logu budowy i wiersz na plakietce stanu
// budowy z linkiem do formularza (StanBudowy.astro); na stronie publicznej (TYLKO_OPUBLIKOWANE=1) wiersz z tą funkcją się nie pokazuje.
// Odwołanie do osoby, której nie ma w spisie: ostrzeżenie w budowie, pozycja pominięta (nie powinno się zdarzać: plików nie kasujemy).
// Bez importu z tresci.ts (tresci.ts korzysta z tego modułu przy kierownikach grantów): flaga i widoczność jak tam.
import { getCollection, type CollectionEntry } from 'astro:content';
import { zTytulem, tytulyWJezyku } from './osoby';

type Pracownik = CollectionEntry<'pracownicy'>;
const TYLKO_OPUBLIKOWANE = process.env.TYLKO_OPUBLIKOWANE === '1';

/** Osoba widoczna w spisie (jak widoczny() w tresci.ts) i pracująca w Instytucie (pole „Pracuje w Instytucie”; brak pola = pracuje). */
export const aktywny = (p: Pracownik) => (!TYLKO_OPUBLIKOWANE || p.data.opublikowany !== false) && p.data.pracuje !== false;

/** Wszystkie osoby ze spisu, także te, które odeszły — do odwołań z pól „… ze spisu”. */
export async function wszyscyPracownicy(): Promise<Pracownik[]> {
  return getCollection('pracownicy');
}

const ostrzezone = new Set<string>();
/** Ostrzeżenie w logu budowy (raz na treść). Na GitHubie (Podgląd) jako adnotacja ::warning. */
export function ostrzez(tytul: string, tresc: string) {
  const linia = `${tytul}: ${tresc}`;
  if (ostrzezone.has(linia)) return;
  ostrzezone.add(linia);
  // od nowej linii: Astro wypisuje adres strony i czas w jednej linii, a polecenie ::warning działa tylko na początku linii
  console.log(process.env.GITHUB_ACTIONS === 'true' ? `\n::warning title=${tytul}::${tresc.replace(/%/g, '%25')}` : `\n[${tytul}] ${tresc}`);
}

/** Osoba z pola „… ze spisu” po id; brak w spisie = ostrzeżenie i undefined. `gdzie` — np. „Grant 2019-…: Kierownik ze spisu”. */
export function osobaPoId(id: string, wszyscy: Pracownik[], gdzie: string): Pracownik | undefined {
  const o = wszyscy.find((p) => p.id === id);
  if (!o) ostrzez('Osoba spoza spisu', `${gdzie}: odwołanie do osoby „${id}”, której nie ma w spisie pracowników — pominięta.`);
  return o;
}

/** Lista identyfikatorów z pola „… ze spisu” bez pustych pozycji (lista z CMS może mieć puste wiersze). */
export const idy = (lista?: (string | null | undefined)[]) => (lista ?? []).map((x) => (x ?? '').trim()).filter(Boolean);
/** Lista tekstów z pola „… spoza spisu” bez pustych pozycji. */
export const teksty = (lista?: (string | null | undefined)[]) => (lista ?? []).map((x) => (x ?? '').trim()).filter(Boolean);

/** Funkcja bez osoby — miejsce na stronie i formularz w CMS (plakietka stanu budowy, ostrzeżenie w logu). */
export interface BrakOsoby {
  /** adres strony bez /en i bazy, np. /instytut/zaklady/geometria */
  adres: string;
  /** czego brakuje, np. „Kierownik zakładu” */
  funkcja: string;
  /** kolekcja w danych strony (formularzWCms) i plik w repozytorium treści */
  kolekcja: string;
  plik?: string;
}
const braki = new Map<string, BrakOsoby>();
/** Zapisuje funkcję bez osoby (raz) i ostrzega w logu budowy. Zwraca true, gdy wiersz ma się pokazać ze znacznikiem (Podgląd),
 *  false — gdy ma zniknąć (strona publiczna). */
export function brakOsoby(b: BrakOsoby): boolean {
  const klucz = `${b.adres}|${b.funkcja}|${b.plik ?? ''}`;
  if (!braki.has(klucz)) {
    braki.set(klucz, b);
    ostrzez('Brak osoby', `${b.funkcja} (${b.plik ?? b.adres}): nie przypisano osoby — uzupełnij w CMS.`);
  }
  return !TYLKO_OPUBLIKOWANE;
}
/** Funkcje bez osoby zebrane do tej pory na danej stronie (adres bez /en i bazy). Plakietka stanu budowy liczy je sama
 *  (brakiNaStronie w StanBudowy.astro), żeby nie zależeć od kolejności renderowania. */
export const wszystkieBraki = () => [...braki.values()];
export const zebraneBraki = (adres: string) => [...braki.values()].filter((b) => b.adres === adres);

// ---------- kierownik zakładu (funkcja) ----------
type Zaklad = CollectionEntry<'zaklady'>;
/** Kierownik zakładu. `osoba` — pracująca osoba ze spisu; `tekst` — stare pole tekstowe bez dopasowania (pokazywane jak dotąd);
 *  `brak` — funkcja bez osoby: true na Podglądzie (znacznik), na stronie publicznej false (wiersz znika, bo nie ma też osoby). */
export function kierownikZakladu(z: Zaklad, wszyscy: Pracownik[]): { osoba?: Pracownik; tekst?: string; brak: boolean } {
  const d = z.data;
  const brak = () => ({ brak: brakOsoby({ adres: `/instytut/zaklady/${z.id}`, funkcja: 'Kierownik zakładu', kolekcja: 'zaklady', plik: z.filePath }) });
  if (d.kierownik_ze_spisu) {
    const o = osobaPoId(d.kierownik_ze_spisu, wszyscy, `Zakład ${z.id}: Kierownik`);
    return o && aktywny(o) ? { osoba: o, brak: false } : brak();
  }
  if (d.kierownik?.trim()) {
    // stare pole (przed migracją): dokładne imię i nazwisko wśród osób zakładu, jak dotąd; bez dopasowania — sam tekst
    const o = wszyscy.find((p) => aktywny(p) && p.data.zaklad === z.id && p.data.imie_nazwisko === d.kierownik);
    return o ? { osoba: o, brak: false } : { tekst: d.kierownik, brak: false };
  }
  return brak();
}

// ---------- koordynatorzy seminarium (funkcja) ----------
type Seminarium = CollectionEntry<'seminaria'>;
export interface Koordynator { /** z tytułem */ nazwa: string; /** bez tytułu (lista seminariów) */ imie: string; strona?: string; osoba?: Pracownik }
/** Koordynatorzy seminarium: najpierw ze spisu (pracujący), potem spoza spisu; stare pole „prowadzacy” jak dotąd (dokładne imię
 *  i nazwisko, przy dwóch wpisach tej osoby — nauczyciel akademicki). `brak` jak w kierownikZakladu. */
export function koordynatorzySeminarium(s: Seminarium, wszyscy: Pracownik[], lang: 'pl' | 'en'): { lista: Koordynator[]; brak: boolean } {
  const d = s.data;
  const ze = idy(d.prowadzacy_ze_spisu);
  const spoza = teksty(d.prowadzacy_spoza);
  let lista: Koordynator[];
  if (ze.length || spoza.length) {
    lista = [
      ...ze.map((id) => osobaPoId(id, wszyscy, `Seminarium ${s.id}: Koordynator ze spisu`))
        .filter((o): o is Pracownik => !!o && aktywny(o))
        .map((o) => ({ nazwa: zTytulem(o.data.stopien, o.data.imie_nazwisko, lang), imie: o.data.imie_nazwisko, strona: o.data.strona, osoba: o })),
      ...spoza.map((t) => ({ nazwa: tytulyWJezyku(t, lang), imie: t })),
    ];
  } else {
    const aktywni = wszyscy.filter(aktywny);
    lista = teksty(d.prowadzacy).map((imie) => {
      const kand = aktywni.filter((p) => p.data.imie_nazwisko === imie);
      const o = kand.find((p) => p.data.grupa === 'nauczyciel') ?? kand.find((p) => p.data.grupa !== 'administracja') ?? kand[0];
      return { nazwa: zTytulem(o?.data.stopien, imie, lang), imie, strona: o?.data.strona, osoba: o };
    });
  }
  const brak = lista.length === 0 && brakOsoby({ adres: `/seminaria/${s.id}`, funkcja: 'Koordynator seminarium', kolekcja: 'seminaria', plik: s.filePath });
  return { lista, brak };
}
