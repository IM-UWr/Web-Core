// Tekst, baner i powiązania specjalności pochodzą z jednego pliku w Web-Studia.
import { getCollection } from 'astro:content';
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import { renderSpecjalnosci, type WstawkaSpecjalnosci, type DaneSpecjalnosci } from '../markdown';
import { zaklady, pracownicy, seminaria } from '../tresci';
import type { Specjalnosc } from '../specjalnosci';

export type CzescTresci = { html: string } | { wstawka: WstawkaSpecjalnosci };
// klasa tekstu w ramce uwagi z cytatu „> **Dla kogo**” (style w Specjalnosc.astro, jak dotąd)
const KLASA_RAMKI = 'sp-dla';

export async function daneSpecjalnosci(specjalnosc: Specjalnosc, lang: Lang) {
  const d = specjalnosc.data;
  const w = (o: any, pole: string) => wybierz(o, pole, lang);

  const kierunek = (await getCollection('kierunki')).find((k) => k.id === d.kierunek);
  const nazwaKierunku = kierunek ? wybierz(kierunek.data, 'nazwa', lang) : d.kierunek;
  const zaklad = d.zaklad ? (await zaklady()).find((z) => z.id === d.zaklad) : undefined;
  const osoby = await pracownicy();
  // imię i nazwisko jak w spisie pracowników (bez tytułów) — wtedy pokazujemy e-mail, pokój (telefon tylko u administracji),
  // a gdy osoba ma stronę domową, całe pole jest linkiem do niej (klasy .os-link / .os-a w global.css)
  // (przy dwóch wpisach o tym samym nazwisku pierwszeństwo ma nauczyciel akademicki, nie administracja)
  const znajdz = (n: string) => {
    const kand = osoby.filter((p) => p.data.imie_nazwisko === n.trim());
    return kand.find((p) => p.data.grupa === 'nauczyciel') ?? kand.find((p) => p.data.grupa !== 'administracja') ?? kand[0];
  };
  const opiekunowie = d.opiekunowie.map((o) => ({ ...o, osoba: znajdz(o.imie_nazwisko) }));
  const nazwa = w(d, 'nazwa');
  const sem = d.seminaria.length ? (await seminaria()).filter((s) => d.seminaria.includes(s.id)).sort((a, b) => d.seminaria.indexOf(a.id) - d.seminaria.indexOf(b.id)) : [];

  // Treść: po angielsku tresc_en; pusta — treść polska (sekcje z lang="pl", nagłówki sekcji liczonych po polsku).
  const polski = lang === 'en' && !d.tresc_en?.trim();
  const zrodlo = lang === 'en' && !polski ? d.tresc_en : specjalnosc.tresc.body;
  const jezykTresci: Lang = polski ? 'pl' : lang;
  const T = (pl: string, en: string) => (jezykTresci === 'en' ? en : pl);
  const wstawki = { seminaria: sem.length > 0, opiekun: opiekunowie.length > 0, wybor: true };
  const naglowki = {
    seminaria: T('Seminaria', 'Seminars'),
    opiekun: opiekunowie.length > 1 ? T('Opiekunowie specjalności', 'Coordinators') : T('Opiekun specjalności', 'Coordinator'),
  };
  const opcje = { wstawki, naglowki, klasaRamki: KLASA_RAMKI, polski };
  const { html, sekcje, dane } = await renderSpecjalnosci(zrodlo, lang, opcje);
  const czesci: CzescTresci[] = html.split(/<!--wstaw:(\w+)-->/).map((x, i) => (i % 2 ? { wstawka: x as WstawkaSpecjalnosci } : { html: x }));

  // Baner na telefonie (zlecenie 01). Hasło z pól haslo / haslo_en (po angielsku tylko haslo_en — bez polskich resztek;
  // puste = opis jak dotąd). Liczby — z danych specjalności (zawsze z treści polskiej, jak dotąd z pól polskich):
  // • stopnie studiów: cyfry rzymskie z pola „poziom” („studia I i II stopnia” → „I i II”);
  // • semestr wyboru: pierwszy krok osi „Jak przebiega specjalność”, którego tytuł mówi o deklaracji albo wyborze specjalności —
  //   numer semestru z etykiety kroku („Koniec semestru 4” → „4. sem.”);
  // • przedmioty specjalności: punkty grup (###) „Czego się uczysz” z bieżącego programu (nazwa grupy z „program od …”),
  //   bez grup przedmiotów wspólnych kierunku (np. „Przedmioty wspólne z wymaganiami specjalności”).
  // Brak danych = pozycja pominięta (LiczbyBanera.astro). Komputer bez zmian.
  const danePl: DaneSpecjalnosci = lang === 'pl' || polski ? dane : (await renderSpecjalnosci(specjalnosc.tresc.body, 'pl', { ...opcje, polski: false })).dane;
  const haslo = (lang === 'en' ? d.haslo_en : d.haslo) || undefined;
  const stopnie = (d.poziom ?? '').match(/\b(?:III|II|I)\b/g) ?? [];
  const semWyboru = danePl.etapy.find((e) => /deklaracj|wyb[oó]r specjalno/i.test(e.t))?.etyk.match(/\d+/)?.[0];
  const ilePrzedmiotow = danePl.grupy
    .filter((g) => /program od/i.test(g.nazwa) && !/wspóln/i.test(g.nazwa))
    .reduce((s, g) => s + g.n, 0);
  const liczbyTel = [
    { n: stopnie.join(' i '), n_en: stopnie.join(' and '), pl: 'stopień studiów', en: stopnie.length > 1 ? 'study cycles' : 'study cycle' },
    { n: semWyboru ? `${semWyboru}. sem.` : '', n_en: semWyboru ? `sem. ${semWyboru}` : '', pl: 'wybór specjalności', en: 'choice of specialisation' },
    { n: ilePrzedmiotow, pl: ['przedmiot specjalności', 'przedmioty specjalności', 'przedmiotów specjalności'] as [string, string, string], en: ['specialisation course', 'specialisation courses'] as [string, string] },
  ];

  return { czesci, sekcje, nazwaKierunku, zaklad, opiekunowie, nazwa, sem, haslo, liczbyTel };
}
