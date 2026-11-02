// Dane strony kierunku studiów (Kierunek.astro): treść, specjalności, napisy, liczby banera na telefon i spis sekcji.
import { render, getCollection, type CollectionEntry } from 'astro:content';
import { zTytulem } from '../osoby';
import { wybierz } from '../i18n';
import { today, type Lang } from '../daty';
import { renderMarkdown } from '../markdown';
import { zaklady, pracownicy } from '../tresci';

export async function daneKierunku(kierunek: CollectionEntry<'kierunki'>, lang: Lang) {
  const d = kierunek.data;
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const w = (o: any, pole: string) => wybierz(o, pole, lang);
  const { Content } = await render(kierunek);
  const htmlEn = lang === 'en' && d.tresc_en ? await renderMarkdown(d.tresc_en) : '';
  const md = (pl?: string, en?: string) => renderMarkdown((lang === 'en' && en) || pl || '');
  const kariera = await md(d.kariera, d.kariera_en);
  const praktyki = await md(d.praktyki, d.praktyki_en);
  const faq = await Promise.all(d.faq.map(async (f) => ({ q: w(f, 'pytanie'), a: await md(f.odpowiedz, f.odpowiedz_en) })));
  const nazwyZakladow = Object.fromEntries((await zaklady()).map((z) => [z.id, z]));
  // Kafelki specjalności budują się z plików specjalności (src/content/specjalnosci) — jedno miejsce edycji.
  const osoby = await pracownicy();
  const zTytulemZeSpisu = (n: string) => {
    const kand = osoby.filter((p) => p.data.imie_nazwisko === n.trim());
    const o = kand.find((p) => p.data.grupa === 'nauczyciel') ?? kand.find((p) => p.data.grupa !== 'administracja') ?? kand[0];
    return zTytulem(o?.data.stopien, n);
  };
  const specjalnosci = (await getCollection('specjalnosci'))
    .filter((s) => s.data.kierunek === kierunek.id && s.data.opublikowany !== false && s.data.na_stronie_kierunku)
    .sort((a, b) => Number(a.data.wygaszana) - Number(b.data.wygaszana) || a.data.kolejnosc - b.data.kolejnosc || a.data.nazwa.localeCompare(b.data.nazwa, 'pl'))
    .map((s) => ({
      ...s.data,
      strona: s.data.bez_podstrony ? undefined : s.id,
      opiekunowie: s.data.opiekunowie.map((o) => zTytulemZeSpisu(o.imie_nazwisko)).join(', '),
      dla_kogo: s.data.kafelek_dla_kogo,
      dla_kogo_en: s.data.kafelek_dla_kogo_en,
      kariera: s.data.kafelek_kariera,
      kariera_en: s.data.kafelek_kariera_en,
    }));

  const nazwa = w(d, 'nazwa');
  const etapyI = d.etapy.filter((e) => e.stopien === 'I');
  const etapyII = d.etapy.filter((e) => e.stopien === 'II');
  const etapyIII = d.etapy.filter((e) => e.stopien === 'III');
  // Szkoła doktorska (etapy III stopnia, bez I/II): inne napisy niż na kierunkach studiów.
  const doktorat = etapyIII.length > 0 && etapyI.length + etapyII.length === 0;
  const N = {
    o: doktorat ? T('O szkole doktorskiej', 'About the doctoral school') : T('O kierunku', 'About'),
    przebieg: doktorat ? T('Ścieżka doktoranta', 'The doctoral path') : T('Jak wyglądają studia', 'How the studies work'),
    program: doktorat ? T('Program kształcenia', 'Programme') : T('Program studiów', 'Curriculum'),
  };
  const rok = Number(today().slice(0, 4));
  const lata = Array.from({ length: rok - 2016 + 1 }, (_, i) => rok - i);
  // Wybór roku i zakładki tylko przy kilku programach; przy jednym od razu pokazujemy jego dokumenty.
  const wieleProgramow = d.programy.length > 1;
  // Strona „Egzaminy i dyplom” opisuje egzaminy kierunku matematyka — inne kierunki jej nie linkują.
  const linkDyplom = kierunek.id === 'matematyka';

  // Baner na telefonie (zlecenie 01): hasło z pól haslo / haslo_en (po angielsku tylko haslo_en — bez polskich resztek;
  // puste = opis jak dotąd) i trzy liczby z faktów — pierwsze trzy, których wartość zaczyna się od cyfry („3 lata”, „180”;
  // bez „licencjat”, „A+”, „PL / EN”); po angielsku tylko fakty z etykieta_en. Kolumny na telefonie są wąskie, więc:
  // • etykieta: krótka z pola etykieta_krotka / etykieta_krotka_en, jeśli fakt ją ma, inaczej pełna bez dopowiedzenia
  //   w nawiasie i po przecinku („studia I stopnia (licencjackie)” → „studia I stopnia”);
  // • wartość „liczba + słowo” dłuższa niż 8 znaków dzieli się na liczbę i słowo-etykietę („6 semestrów” → „6” / „semestrów”).
  // Szkoła doktorska: na początku liczba doktorantów (spis pracowników, grupa „doktorant”), po niej dwa fakty.
  // Komputer bez zmian: pełne fakty w wierszu w banerze (.kh-liczby).
  const haslo = (lang === 'en' ? d.haslo_en : d.haslo) || undefined;
  const bezDopowiedzenia = (s: string) => s.replace(/\s*\([^)]*\)/g, '').replace(/,.*$/, '').trim();
  type Fakt = (typeof d.fakty)[number];
  const ileDoktorantow = doktorat ? osoby.filter((o) => o.data.grupa === 'doktorant').length : 0;
  const liczbyTel = [
    ...(ileDoktorantow > 0 ? [{ n: ileDoktorantow, pl: ['doktorant', 'doktorantów', 'doktorantów'] as [string, string, string], en: ['PhD student', 'PhD students'] as [string, string] }] : []),
    ...(d.fakty as Fakt[])
      .filter((f) => /^\d/.test(w(f, 'wartosc')) && (lang !== 'en' || f.etykieta_en))
      .map((f) => {
        const wartosc = w(f, 'wartosc').trim();
        const etykieta = (lang === 'en' ? f.etykieta_krotka_en : f.etykieta_krotka) || bezDopowiedzenia(w(f, 'etykieta'));
        const m = wartosc.length > 8 ? wartosc.match(/^(\d+)\s+(\S+)$/) : null;
        return m ? { n: m[1], pl: m[2] } : { n: wartosc, pl: etykieta };
      }),
  ].slice(0, 3);
  // Nadtytuł na telefonie w jednej linii: bez dopowiedzeń w nawiasie („Studia I stopnia (licencjackie)” → „Studia I stopnia”),
  // a dłuższy niż 40 znaków — tylko pierwszy człon przed „ · ” (szkoła doktorska: „Kolegium Doktorskie Matematyki”).
  // NaglowekStrony ma jeden nadtytuł, więc wersja na telefon leży w slocie i jest przestawiana nad tytuł (style na dole).
  const nadtytul = d.podtytul ? w(d, 'podtytul') : undefined;
  const nadtytulTel = nadtytul && ((s) => (s.length > 40 ? s.split(' · ')[0] : s))(nadtytul.replace(/\s*\([^)]*\)/g, '').trim());

  const sekcje = [
    { slug: 'o-kierunku', text: N.o },
    ...(d.etapy.length ? [{ slug: 'przebieg', text: N.przebieg }] : []),
    ...(specjalnosci.length ? [{ slug: 'specjalnosci', text: T('Specjalności', 'Specialisations') }] : []),
    ...(d.programy.length ? [{ slug: 'program', text: N.program }] : []),
    ...(d.terminy.length ? [{ slug: 'terminy', text: T('Terminy i formularze', 'Deadlines and forms') }] : []),
    ...(praktyki ? [{ slug: 'praktyki', text: T('Praktyki pedagogiczne', 'Teaching placements') }] : []),
    ...(kariera ? [{ slug: 'po-studiach', text: T('Po studiach', 'After graduation') }] : []),
    ...(faq.length ? [{ slug: 'pytania', text: T('Pytania i odpowiedzi', 'FAQ') }] : []),
    ...(d.kontakt.length ? [{ slug: 'kontakt', text: T('Kontakt', 'Contact') }] : []),
    ...(d.akty.length ? [{ slug: 'akty', text: T('Akty prawne', 'Regulations') }] : []),
  ].map((s) => ({ depth: 2, ...s }));

  return {
    Content, htmlEn, kariera, praktyki, faq, nazwyZakladow, specjalnosci, nazwa, etapyI, etapyII, etapyIII, doktorat, N, lata,
    wieleProgramow, linkDyplom, haslo, liczbyTel, nadtytul, nadtytulTel, sekcje,
  };
}
