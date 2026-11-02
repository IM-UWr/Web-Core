// Dane podstrony zakładu: opis i treść, skład, seminaria z najbliższym referatem, granty, konferencje, obrony, aktualności, baner.
import { render } from 'astro:content';
import { motywStrony } from '../motywyBanerow';
import { wybierz } from '../i18n';
import { now, today, hasTime, type Lang } from '../daty';
import { renderMarkdown } from '../markdown';
import {
  zaklady, pracownicy, seminaria, referaty, granty, konferencje, obrony, aktualnosci,
  seminariumReferatu, zakladGrantu, rangaStopnia, type Zaklad, type Pracownik,
} from '../tresci';

export async function daneZakladu(zaklad: Zaklad, lang: Lang) {
  const d = zaklad.data;
  const id = zaklad.id;
  const nazwa = wybierz(d, 'nazwa', lang);
  const opis = wybierz(d, 'opis', lang);
  const opisZdjecia = wybierz(d, 'zdjecie_opis', lang);
  const obszary = lang === 'en' && d.obszary_en.length ? d.obszary_en : d.obszary;
  const { Content } = await render(zaklad);
  const htmlEn = lang === 'en' && d.tresc_en ? await renderMarkdown(d.tresc_en) : '';

  // Skład. Osoba ze stroną domową to jedno klikalne pole (klasy .os-link / .os-a w global.css).
  // Telefonów pracowników naukowych nie podajemy (pole „telefon” zakładu — tylko numer ogólny, jeśli jest).
  const osoby = await pracownicy();
  const nazwisko = (s: string) => s.trim().split(/\s+/).pop() ?? s;
  const sortuj = (a: Pracownik, b: Pracownik) =>
    rangaStopnia(a.data.stopien) - rangaStopnia(b.data.stopien) || nazwisko(a.data.imie_nazwisko).localeCompare(nazwisko(b.data.imie_nazwisko), 'pl');
  const czlonkowie = osoby.filter((o) => o.data.zaklad === id);
  const kierownik = czlonkowie.find((o) => o.data.imie_nazwisko === d.kierownik);
  const grupySkladu = [
    { tytul: lang === 'en' ? 'Staff' : 'Pracownicy', osoby: czlonkowie.filter((o) => o.data.grupa === 'nauczyciel' && o !== kierownik).sort(sortuj) },
    { tytul: lang === 'en' ? 'PhD students' : 'Doktoranci', osoby: czlonkowie.filter((o) => o.data.grupa === 'doktorant').sort(sortuj) },
    { tytul: lang === 'en' ? 'Retired staff' : 'Emerytowani pracownicy', osoby: czlonkowie.filter((o) => o.data.grupa === 'emeryt').sort(sortuj) },
  ].filter((g) => g.osoby.length);

  // Seminaria z najbliższym referatem
  const sem = (await seminaria()).filter((s) => s.data.zaklad.includes(id));
  // Animacja banera na telefonie (zlecenie 03): wariant „zaklad” motywu seminarium tego zakładu (pole `zaklad` seminarium);
  // zakład bez seminarium z motywem — Lorenz z działu Nauka.
  const motywSem = sem.map((s) => motywStrony(`/seminaria/${s.id}`)).find(Boolean);
  const motyw = motywSem ? `${motywSem.split('/')[0]}/zaklad` : 'lorenz';
  const ref = await referaty();
  const n = now();
  const nastepny = (sid: string) => ref.find((r) => seminariumReferatu(r) === sid && (hasTime(r.data.termin) ? r.data.termin >= n : r.data.termin >= today()));

  // Granty (pole „zakład” albo zakład kierownika)
  const rok = Number(today().slice(0, 4));
  const gr = (await granty()).filter((g) => zakladGrantu(g, osoby) === id);
  const grTrwa = gr.filter((g) => (g.data.rok_do ?? 0) >= rok);
  const grKon = gr.filter((g) => (g.data.rok_do ?? 0) < rok);

  const konf = (await konferencje()).filter((k) => k.data.zaklad === id);
  const obr = (await obrony()).filter((o) => o.data.zaklad === id);
  const akt = (await aktualnosci()).filter((a) => a.data.zaklad === id).slice(0, 5);

  // Baner na telefonie: hasło (po angielsku tylko haslo_en — bez polskich resztek) i liczby z danych strony:
  // nauczyciele akademiccy zakładu (z kierownikiem) · projekty (realizowane i zakończone) · konferencje z polem „zakład”.
  // Zera pomijamy (LiczbyBanera.astro) — np. pracownia bez projektów i konferencji ma jedną liczbę. „Pracownik” jest
  // męskoosobowy — przy 2–4 też dopełniacz („czterech pracowników”, „22 pracowników”).
  const haslo = (lang === 'en' ? d.haslo_en : d.haslo) || undefined;
  const liczby: { n: number; pl: [string, string, string]; en: [string, string] }[] = [
    { n: czlonkowie.filter((o) => o.data.grupa === 'nauczyciel').length, pl: ['pracownik', 'pracowników', 'pracowników'], en: ['staff member', 'staff members'] },
    { n: gr.length, pl: ['projekt badawczy', 'projekty badawcze', 'projektów badawczych'], en: ['research project', 'research projects'] },
    { n: konf.length, pl: ['konferencja', 'konferencje', 'konferencji'], en: ['conference', 'conferences'] },
  ];

  // Spis sekcji strony (obecnie szablon go nie używa)
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const naglowki = [
    { depth: 2, slug: 'o-zakladzie', text: T('O zakładzie', 'About') },
    { depth: 2, slug: 'sklad', text: T('Skład', 'People') },
    ...(sem.length ? [{ depth: 2, slug: 'seminaria', text: sem.length > 1 ? T('Seminaria', 'Seminars') : T('Seminarium', 'Seminar') }] : []),
    ...(gr.length ? [{ depth: 2, slug: 'granty', text: T('Projekty i granty', 'Grants') }] : []),
    ...(konf.length ? [{ depth: 2, slug: 'konferencje', text: T('Konferencje', 'Conferences') }] : []),
    ...(obr.length ? [{ depth: 2, slug: 'obrony', text: T('Obrony doktorskie', 'PhD defences') }] : []),
    ...(akt.length ? [{ depth: 2, slug: 'aktualnosci', text: T('Aktualności', 'News') }] : []),
  ];
  const wszystkieZaklady = await zaklady();

  return {
    d, id, nazwa, opis, opisZdjecia, obszary, Content, htmlEn,
    czlonkowie, kierownik, grupySkladu,
    sem, motyw, nastepny,
    gr, grTrwa, grKon, konf, obr, akt,
    haslo, liczby, naglowki, wszystkieZaklady,
  };
}
