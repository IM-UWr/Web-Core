// Dane strony „Władze Instytutu”: osoby (z danymi ze spisu pracowników), władze Wydziału, sekretariat, kadencja, Rada, linki.
import { wybierz } from '../i18n';
import { zTytulem } from '../osoby';
import { renderMarkdown } from '../markdown';
import { zaklady, type Pracownik } from '../tresci';
import { wszyscyPracownicy, aktywny, osobaPoId, idy, brakOsoby } from '../osobySpisu';
import type { Lang } from '../daty';
import wladze from '../../data/wladze.json';

type Tekst = string | null | undefined;
// Dane inne niż w spisie (zlecenie 42: grupa „Inne dane niż w spisie”; przed migracją te pola leżały wprost w pozycji)
type Inne = { stopien?: Tekst; email?: Tekst; pokoj?: Tekst; strona?: Tekst };
type Osoba = Inne & {
  rola?: Tekst; rola_en?: Tekst; zakres?: Tekst; zakres_en?: Tekst; dyzur?: Tekst; dyzur_en?: Tekst; zdjecie?: Tekst;
  // zlecenie 42: osoba wybrana ze spisu (ścieżka pliku katalogu _cms/pracownicy/<id>.yml); imie_nazwisko — przed migracją imię
  // i nazwisko jak w spisie, po migracji tylko osoba spoza spisu (władze Wydziału)
  osoba?: Tekst; imie_nazwisko?: Tekst; inne?: Inne | null;
};
type Link = { etykieta: string; etykieta_en?: Tekst; adres: string };
type Dane = {
  tytul?: Tekst; tytul_en?: Tekst; wstep?: Tekst; wstep_en?: Tekst; haslo?: Tekst; haslo_en?: Tekst;
  osoby?: Osoba[] | null;
  sekretariat?: {
    nazwa?: Tekst; nazwa_en?: Tekst; opis?: Tekst; opis_en?: Tekst; email?: Tekst; telefony?: string[] | null;
    adres?: Tekst; adres_en?: Tekst; pokoj?: Tekst; godziny?: Tekst; godziny_en?: Tekst; osoby?: string[] | null; osoby_ze_spisu?: string[] | null;
  } | null;
  wydzial?: { tytul?: Tekst; tytul_en?: Tekst; opis?: Tekst; opis_en?: Tekst; osoby?: Osoba[] | null; link?: Link | null } | null;
  kadencja?: Tekst; kadencja_en?: Tekst;
  rada?: { tytul?: Tekst; tytul_en?: Tekst; opis?: Tekst; opis_en?: Tekst } | null;
  linki?: Link[] | null;
};

// Pole obiektu w wybranym języku (brak obiektu → pusty tekst); używane też w szablonie widoku.
export const poleWJezyku = (lang: Lang) => (o: any, pole: string) => (o ? wybierz(o, pole, lang) : '');

const inicjaly = (imie: string) => {
  const s = imie.trim().split(/\s+/);
  return ((s[0]?.[0] ?? '') + (s.length > 1 ? s[s.length - 1][0] : '')).toUpperCase();
};

export async function daneWladz(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const w = poleWJezyku(lang);
  const d = wladze as Dane;
  const tytul = w(d, 'tytul') || T('Władze Instytutu', 'Institute management');
  const lead = w(d, 'wstep');
  // hasło w banerze na telefonie — po angielsku tylko haslo_en (bez polskich resztek)
  const haslo = (lang === 'en' ? d.haslo_en : d.haslo) || undefined;

  // Dane osób z kolekcji pracowników. Zlecenie 42: osoba wybrana ze spisu (pole „osoba”); stare imie_nazwisko (przed migracją)
  // dopasowane jak dotąd — dokładne imię i nazwisko wśród osób, które pracują. Osoba, która odeszła, albo brak osoby =
  // „nie przypisano osoby”: na Podglądzie karta z funkcją i znacznikiem, na stronie publicznej karta znika.
  const wszyscy = await wszyscyPracownicy();
  const kadra = wszyscy.filter(aktywny);
  const listaZakladow = await zaklady();
  const znajdz = (imie: string): Pracownik | undefined => kadra.find((p) => p.data.imie_nazwisko.trim() === imie.trim());
  const idZeSciezki = (s: string) => s.trim().replace(/^.*\//, '').replace(/\.ya?ml$/i, '');
  const ADRES = '/instytut/wladze';
  const PLIK = 'src/data/wladze.json';

  // Dane wpisane przy osobie (e-mail, pokój, strona; od zlecenia 42 w grupie „inne”) mają pierwszeństwo przed spisem pracowników.
  // zeSpisuPokoj = false: pokój tylko z wpisu (np. dziekan — pokój w IM to nie biuro dziekana).
  // Wynik undefined = pozycja pomijana (bez osoby na stronie publicznej).
  const osobaZ = (o: Osoba, funkcja: string, zeSpisuPokoj = true) => {
    const inne: Inne = { stopien: o.stopien, email: o.email, pokoj: o.pokoj, strona: o.strona, ...(o.inne ?? {}) };
    const zeSpisu = (o.osoba ?? '').trim();
    const p = zeSpisu ? osobaPoId(idZeSciezki(zeSpisu), wszyscy, `Władze: ${funkcja}`) : o.imie_nazwisko?.trim() ? znajdz(o.imie_nazwisko) : undefined;
    const os = p && aktywny(p) ? p : undefined;
    // imię i nazwisko: osoba ze spisu (pracująca) albo wpisane ręcznie (stare pole albo osoba spoza spisu przy Wydziale)
    const imie = os && zeSpisu ? os.data.imie_nazwisko : (o.imie_nazwisko ?? '').trim();
    if (!imie && !brakOsoby({ adres: ADRES, funkcja: `${funkcja}: ${o.rola || '—'}`, kolekcja: 'wladze', plik: PLIK })) return undefined;
    const z = os?.data.zaklad ? listaZakladow.find((x) => x.id === os.data.zaklad) : undefined;
    return {
      rola: w(o, 'rola'),
      nazwa: imie ? zTytulem(inne.stopien || os?.data.stopien, imie, lang) : '',
      inicjaly: imie ? inicjaly(imie) : '',
      email: imie ? inne.email || os?.data.email || '' : '',
      pokoj: imie ? inne.pokoj || (zeSpisuPokoj ? os?.data.pokoj : '') || '' : '',
      strona: imie ? inne.strona || os?.data.strona || '' : '',
      zakres: w(o, 'zakres'),
      dyzur: imie ? w(o, 'dyzur') : '',
      zdjecie: imie ? o.zdjecie || '' : '',
      zaklad: z ? { nazwa: w(z.data, 'nazwa'), adres: `/instytut/zaklady/${z.id}` } : undefined,
      brak: !imie,
    };
  };
  type OsobaWladz = NonNullable<ReturnType<typeof osobaZ>>;
  const tylko = (l: (OsobaWladz | undefined)[]) => l.filter((x): x is OsobaWladz => !!x);
  // puste pozycje listy w CMS (bez osoby, bez imienia i bez funkcji) pomijamy jak dotąd
  const pozycje = (l?: Osoba[] | null) => (l ?? []).filter((o) => o && (o.osoba?.trim() || o.imie_nazwisko?.trim() || o.rola?.trim()));
  // Dyrektor = pierwsza pozycja dyrekcji. Gdy na stronie publicznej pierwsza pozycja znika (brak osoby), dyrektora nie pokazujemy,
  // a zastępcy zostają zastępcami.
  const [pierwsza, ...dalsze] = pozycje(d.osoby);
  const dyrektor = pierwsza ? osobaZ(pierwsza, 'Dyrekcja') : undefined;
  const zastepcy = tylko(dalsze.map((o) => osobaZ(o, 'Dyrekcja')));
  // Władze Wydziału Matematyki i Informatyki (dziekan i prodziekan ds. matematyki)
  const wyd = d.wydzial ?? undefined;
  const osobyWydzialu = tylko(pozycje(wyd?.osoby).map((o) => osobaZ(o, 'Władze Wydziału', false)));
  const linkWydzialu = wyd?.link?.adres && wyd.link.etykieta ? wyd.link : undefined;

  // Sekretariat: osoby ze spisu (zlecenie 42) albo stare imiona i nazwiska; e-mail i telefon (administracja) ze spisu.
  // Same osoby, które odeszły, albo pusta lista = „nie przypisano osoby” (znacznik na Podglądzie).
  const sek = d.sekretariat ?? undefined;
  const sekIdy = idy(sek?.osoby_ze_spisu ?? undefined).map(idZeSciezki);
  const sekOsoby = (sekIdy.length
    ? sekIdy.map((id) => osobaPoId(id, wszyscy, 'Władze: Sekretariat')).filter((p): p is Pracownik => !!p && aktywny(p)).map((p) => ({ imie: p.data.imie_nazwisko, p }))
    : (sek?.osoby ?? []).filter(Boolean).map((imie) => ({ imie, p: znajdz(imie) })))
    .map(({ imie, p }) => ({ nazwa: imie, email: p?.data.email ?? '', telefon: p?.data.grupa === 'administracja' ? p.data.telefon ?? '' : '' }));
  const sekTelefony = (sek?.telefony ?? []).filter(Boolean);
  const sekBrak = !!sek && sekOsoby.length === 0 && brakOsoby({ adres: ADRES, funkcja: 'Sekretariat: osoby', kolekcja: 'wladze', plik: PLIK });
  const sekJest = !!sek && !!(sek.email || sekTelefony.length || sekOsoby.length);

  // Teksty w Markdownie
  const kadencjaHtml = await renderMarkdown(w(d, 'kadencja') || undefined, lang);
  const radaHtml = await renderMarkdown(w(d.rada, 'opis') || undefined, lang);
  const linki = (d.linki ?? []).filter((l) => l && l.adres && l.etykieta);

  return {
    d, tytul, lead, haslo, dyrektor, zastepcy, wyd, osobyWydzialu, linkWydzialu,
    sek, sekOsoby, sekTelefony, sekJest, sekBrak, kadencjaHtml, radaHtml, linki,
  };
}

// Komputer (kierunek „Założyciele”, src/components/zal/WladzeZ.astro): te same dane w postaci dla schematu dyrekcji,
// Władz Wydziału, Sekretariatu, Kadencji, Rady i „Zobacz też” oraz spis „Na tej stronie”.
export async function daneWladzKomputer(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const w = poleWJezyku(lang);
  const x = await daneWladz(lang);
  const wydzial = {
    tytul: w(x.wyd, 'tytul') || T('Władze Wydziału', 'Faculty authorities'),
    opis: w(x.wyd, 'opis'),
    osoby: x.osobyWydzialu,
    link: x.linkWydzialu ? { etykieta: w(x.linkWydzialu, 'etykieta'), adres: x.linkWydzialu.adres } : undefined,
  };
  const sekretariat = x.sekJest ? {
    nazwa: w(x.sek, 'nazwa') || T('Sekretariat', 'Office'),
    opis: w(x.sek, 'opis'),
    email: x.sek?.email || undefined,
    telefony: x.sekTelefony,
    adres: w(x.sek, 'adres'),
    pokoj: x.sek?.pokoj || undefined,
    godziny: w(x.sek, 'godziny'),
    osoby: x.sekOsoby,
    brak: x.sekBrak,
  } : undefined;
  const radaTytul = w(x.d.rada, 'tytul') || T('Rada Instytutu', 'Institute Council');
  const linki = x.linki.map((l) => ({ etykieta: w(l, 'etykieta'), adres: l.adres }));
  const spis = [
    (x.dyrektor || x.zastepcy.length > 0) && { id: 'z-dyrekcja', etykieta: T('Dyrekcja', 'Management') },
    wydzial.osoby.length > 0 && { id: 'z-wydzial', etykieta: wydzial.tytul },
    sekretariat && { id: 'z-sekretariat', etykieta: sekretariat.nazwa },
    x.kadencjaHtml && { id: 'z-kadencja', etykieta: T('Kadencja', 'Term of office') },
    x.radaHtml && { id: 'z-rada', etykieta: radaTytul },
    linki.length > 0 && { id: 'z-zobacz', etykieta: T('Zobacz też', 'See also') },
  ].filter(Boolean) as { id: string; etykieta: string }[];
  return { wstep: x.lead || undefined, dyrektor: x.dyrektor, zastepcy: x.zastepcy, wydzial, sekretariat, kadencjaHtml: x.kadencjaHtml || undefined, radaHtml: x.radaHtml || undefined, radaTytul, linki, spis };
}
