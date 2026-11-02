// Dane strony „Władze Instytutu”: osoby (z danymi ze spisu pracowników), władze Wydziału, sekretariat, kadencja, Rada, linki.
import { wybierz } from '../i18n';
import { zTytulem } from '../osoby';
import { renderMarkdown } from '../markdown';
import { pracownicy, zaklady, type Pracownik } from '../tresci';
import type { Lang } from '../daty';
import wladze from '../../data/wladze.json';

type Tekst = string | null | undefined;
type Osoba = {
  rola?: Tekst; rola_en?: Tekst; imie_nazwisko: string; zakres?: Tekst; zakres_en?: Tekst;
  dyzur?: Tekst; dyzur_en?: Tekst; zdjecie?: Tekst;
  // tylko gdy osoby nie ma w Pracownikach:
  stopien?: Tekst; email?: Tekst; pokoj?: Tekst; strona?: Tekst;
};
type Link = { etykieta: string; etykieta_en?: Tekst; adres: string };
type Dane = {
  tytul?: Tekst; tytul_en?: Tekst; wstep?: Tekst; wstep_en?: Tekst; haslo?: Tekst; haslo_en?: Tekst;
  osoby?: Osoba[] | null;
  sekretariat?: {
    nazwa?: Tekst; nazwa_en?: Tekst; opis?: Tekst; opis_en?: Tekst; email?: Tekst; telefony?: string[] | null;
    adres?: Tekst; adres_en?: Tekst; pokoj?: Tekst; godziny?: Tekst; godziny_en?: Tekst; osoby?: string[] | null;
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

  // Dane osób z kolekcji pracowników
  const kadra = await pracownicy();
  const listaZakladow = await zaklady();
  const znajdz = (imie: string): Pracownik | undefined => kadra.find((p) => p.data.imie_nazwisko.trim() === imie.trim());

  // Dane wpisane przy osobie (e-mail, pokój, strona) mają pierwszeństwo przed spisem pracowników.
  // zeSpisuPokoj = false: pokój tylko z wpisu (np. dziekan — pokój w IM to nie biuro dziekana).
  const osobaZ = (o: Osoba, zeSpisuPokoj = true) => {
    const p = znajdz(o.imie_nazwisko);
    const z = p?.data.zaklad ? listaZakladow.find((x) => x.id === p.data.zaklad) : undefined;
    return {
      rola: w(o, 'rola'),
      nazwa: zTytulem(o.stopien || p?.data.stopien, o.imie_nazwisko),
      inicjaly: inicjaly(o.imie_nazwisko),
      email: o.email || p?.data.email || '',
      pokoj: o.pokoj || (zeSpisuPokoj ? p?.data.pokoj : '') || '',
      strona: o.strona || p?.data.strona || '',
      zakres: w(o, 'zakres'),
      dyzur: w(o, 'dyzur'),
      zdjecie: o.zdjecie || '',
      zaklad: z ? { nazwa: w(z.data, 'nazwa'), adres: `/instytut/zaklady/${z.id}` } : undefined,
    };
  };
  const osoby = (d.osoby ?? []).filter((o) => o && o.imie_nazwisko?.trim()).map((o) => osobaZ(o));
  // Władze Wydziału Matematyki i Informatyki (dziekan i prodziekan ds. matematyki)
  const wyd = d.wydzial ?? undefined;
  const osobyWydzialu = (wyd?.osoby ?? []).filter((o) => o && o.imie_nazwisko?.trim()).map((o) => osobaZ(o, false));
  const linkWydzialu = wyd?.link?.adres && wyd.link.etykieta ? wyd.link : undefined;
  const [dyrektor, ...zastepcy] = osoby;

  // Sekretariat
  const sek = d.sekretariat ?? undefined;
  const sekOsoby = (sek?.osoby ?? []).filter(Boolean).map((imie) => {
    const p = znajdz(imie);
    return { nazwa: imie, email: p?.data.email ?? '', telefon: p?.data.grupa === 'administracja' ? p.data.telefon ?? '' : '' };
  });
  const sekTelefony = (sek?.telefony ?? []).filter(Boolean);
  const sekJest = !!sek && !!(sek.email || sekTelefony.length || sekOsoby.length);

  // Teksty w Markdownie
  const kadencjaHtml = await renderMarkdown(w(d, 'kadencja') || undefined);
  const radaHtml = await renderMarkdown(w(d.rada, 'opis') || undefined);
  const linki = (d.linki ?? []).filter((l) => l && l.adres && l.etykieta);

  return {
    d, tytul, lead, haslo, dyrektor, zastepcy, wyd, osobyWydzialu, linkWydzialu,
    sek, sekOsoby, sekTelefony, sekJest, kadencjaHtml, radaHtml, linki,
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
  } : undefined;
  const radaTytul = w(x.d.rada, 'tytul') || T('Rada Instytutu', 'Institute Council');
  const linki = x.linki.map((l) => ({ etykieta: w(l, 'etykieta'), adres: l.adres }));
  const spis = [
    x.dyrektor && { id: 'z-dyrekcja', etykieta: T('Dyrekcja', 'Management') },
    wydzial.osoby.length > 0 && { id: 'z-wydzial', etykieta: wydzial.tytul },
    sekretariat && { id: 'z-sekretariat', etykieta: sekretariat.nazwa },
    x.kadencjaHtml && { id: 'z-kadencja', etykieta: T('Kadencja', 'Term of office') },
    x.radaHtml && { id: 'z-rada', etykieta: radaTytul },
    linki.length > 0 && { id: 'z-zobacz', etykieta: T('Zobacz też', 'See also') },
  ].filter(Boolean) as { id: string; etykieta: string }[];
  return { wstep: x.lead || undefined, dyrektor: x.dyrektor, zastepcy: x.zastepcy, wydzial, sekretariat, kadencjaHtml: x.kadencjaHtml || undefined, radaHtml: x.radaHtml || undefined, radaTytul, linki, spis };
}
