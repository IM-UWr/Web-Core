// Dane podstrony specjalności (Specjalnosc.astro): treść, kierunek, opiekunowie, seminaria, liczby banera i spis sekcji.
import { render, getCollection, type CollectionEntry } from 'astro:content';
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import { renderMarkdown } from '../markdown';
import { zaklady, pracownicy, seminaria } from '../tresci';

export async function daneSpecjalnosci(specjalnosc: CollectionEntry<'specjalnosci'>, lang: Lang) {
  const d = specjalnosc.data;
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const w = (o: any, pole: string) => wybierz(o, pole, lang);
  const { Content } = await render(specjalnosc);
  const htmlEn = lang === 'en' && d.tresc_en ? await renderMarkdown(d.tresc_en) : '';
  const md = (pl?: string, en?: string) => renderMarkdown((lang === 'en' && en) || pl || '');
  const kariera = await md(d.kariera, d.kariera_en);
  const dlaKogo = await md(d.dla_kogo, d.dla_kogo_en);
  const faq = await Promise.all(d.faq.map(async (f) => ({ q: w(f, 'pytanie'), a: await md(f.odpowiedz, f.odpowiedz_en) })));
  const umiejetnosci = lang === 'en' && d.umiejetnosci_en.length ? d.umiejetnosci_en : d.umiejetnosci;

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

  // Baner na telefonie (zlecenie 01). Hasło z pól haslo / haslo_en (po angielsku tylko haslo_en — bez polskich resztek;
  // puste = opis jak dotąd). Nadtytuł „Specjalność” ze skrótem (i „wygaszana”) zamiast „<kierunek> · specjalność” — kierunek
  // jest w linku powrotu; etykiety z banera (skrót, poziom) są w nadtytule i w liczbach. Liczby — z danych specjalności:
  // • stopnie studiów: cyfry rzymskie z pola „poziom” („studia I i II stopnia” → „I i II”);
  // • semestr wyboru: pierwszy etap „Jak przebiega”, którego tytuł mówi o deklaracji albo wyborze specjalności — numer
  //   semestru z pola „kiedy” („Koniec semestru 4” → „4. sem.”);
  // • przedmioty specjalności: pozycje grup „Czego się uczysz” z bieżącego programu (nazwa grupy z „program od …”),
  //   bez grup przedmiotów wspólnych kierunku (np. „Przedmioty wspólne z wymaganiami specjalności”).
  // Brak danych = pozycja pominięta (LiczbyBanera.astro). Komputer bez zmian.
  const haslo = (lang === 'en' ? d.haslo_en : d.haslo) || undefined;
  const nadtytulTel = [T('Specjalność', 'Specialisation'), d.skrot, d.wygaszana ? T('wygaszana', 'phased out') : ''].filter(Boolean).join(' · ');
  const stopnie = (d.poziom ?? '').match(/\b(?:III|II|I)\b/g) ?? [];
  const semWyboru = d.etapy.find((e) => /deklaracj|wyb[oó]r specjalno/i.test(e.tytul))?.kiedy.match(/\d+/)?.[0];
  const ilePrzedmiotow = d.przedmioty
    .filter((g) => /program od/i.test(g.grupa) && !/wspóln/i.test(g.grupa))
    .reduce((s, g) => s + g.lista.length, 0);
  const liczbyTel = [
    { n: stopnie.join(' i '), n_en: stopnie.join(' and '), pl: 'stopień studiów', en: stopnie.length > 1 ? 'study cycles' : 'study cycle' },
    { n: semWyboru ? `${semWyboru}. sem.` : '', n_en: semWyboru ? `sem. ${semWyboru}` : '', pl: 'wybór specjalności', en: 'choice of specialisation' },
    { n: ilePrzedmiotow, pl: ['przedmiot specjalności', 'przedmioty specjalności', 'przedmiotów specjalności'] as [string, string, string], en: ['specialisation course', 'specialisation courses'] as [string, string] },
  ];

  const sekcje = [
    { slug: 'o-specjalnosci', text: T('O specjalności', 'About') },
    ...(d.etapy.length ? [{ slug: 'przebieg', text: T('Jak przebiega', 'How it works') }] : []),
    ...(d.przedmioty.length ? [{ slug: 'przedmioty', text: T('Czego się uczysz', 'What you will learn') }] : []),
    ...(umiejetnosci.length ? [{ slug: 'umiejetnosci', text: T('Co będziesz umieć', 'Skills') }] : []),
    ...(kariera ? [{ slug: 'po-studiach', text: T('Po studiach', 'Careers') }] : []),
    ...(d.tematy_prac.length ? [{ slug: 'tematy', text: T('Przykładowe tematy prac', 'Sample thesis topics') }] : []),
    ...(sem.length ? [{ slug: 'seminaria', text: T('Seminaria', 'Seminars') }] : []),
    ...(d.dokumenty.length ? [{ slug: 'dokumenty', text: T('Dokumenty', 'Documents') }] : []),
    ...(faq.length ? [{ slug: 'pytania', text: T('Pytania i odpowiedzi', 'FAQ') }] : []),
    ...(opiekunowie.length ? [{ slug: 'opiekun', text: T('Opiekun specjalności', 'Coordinator') }] : []),
  ].map((s) => ({ depth: 2, ...s }));

  return { Content, htmlEn, kariera, dlaKogo, faq, umiejetnosci, nazwaKierunku, zaklad, opiekunowie, nazwa, sem, haslo, nadtytulTel, liczbyTel, sekcje };
}
