// Dane planu zajęć (PlanZajec.astro): semestry z sekcjami przedmiotów, aktywny semestr, hasło i nazwy typów zajęć.
import { wybierzSemestr } from '../../components/wyborSemestru';
import surowe from '../../data/plan/plan.json';
import { today, short, type Lang } from '../daty';
import { odmiana } from '../i18n';
import { TYPY_EN, salaEn, nazwaPrzedmiotuEn, uwagaEn } from '../en/plan';
import { stronaListy } from '../tekstyStron';

const MIESIACE = [
  ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
];

type Fragm = string | { t: string; a: string };
interface Zajecie { kod: string; typ: string; grupa?: number | string; prowadzacy?: string[]; dzien?: number; od?: string; do?: string; czestotliwosc?: string; sala?: string; uwagi?: Fragm[] }
interface Przedmiot { kod: string; nazwa: string; nazwa_en?: string; kategoria: string; usos: string }
interface Semestr { id: string; nazwa: string; nazwa_en?: string; od?: string | null; do?: string | null; zaktualizowano?: string | null; przedmioty: Przedmiot[]; zajecia: Zajecie[] }
interface Dane { semestry?: Semestr[]; typy?: Record<string, { pl: string; en: string }>; kategorie?: { id: string; pl: string; en: string }[] }

const dane = surowe as unknown as Dane;

// krótkie nazwy typów zajęć (pełna nazwa z USOS w podpowiedzi <abbr>)
const KROTKO: Record<string, [string, string]> = {
  WYK: ['wyk.', 'lect.'], CW: ['ćw.', 'class'], CW2: ['ćw.', 'class'], KONW: ['konw.', 'conv.'], KONW2: ['konw.', 'conv.'],
  LAB: ['lab.', 'lab'], PRAC: ['prac.', 'lab'], SEM: ['sem.', 'sem.'], 'SEM-MGR': ['sem. mgr', 'MSc sem.'], 'SEM-PRO': ['prosem.', 'prosem.'],
  WAR: ['warszt.', 'worksh.'], EGZ: ['egz.', 'exam'], LEK: ['lekt.', 'lang.'], 'PRK-PED': ['prakt.', 'pract.'],
};

export async function danePlanuZajec(lang: Lang) {
  const en = lang === 'en';
  // tytuł, opis, hasło na telefonie (po angielsku tylko Hasło EN — bez polskich resztek) i tekst nad planem (html):
  // Web-Studia → Strony → Plan zajęć (src/content/strony/studia/plan-zajec.md; zlecenie 30, src/lib/tekstyStron.ts)
  const { tytul, opis: lead, haslo, html } = await stronaListy('studia/plan-zajec', lang, { wst: true });

  // po angielsku nazwy typów z src/lib/en/plan.ts (zamiast kalk z USOS), potem z USOS
  const typPelny = (t: string) => (en && TYPY_EN[t]?.pelna) || dane.typy?.[t]?.[lang] || t;
  const typKrotki = (t: string) => (en && TYPY_EN[t]?.krotka) || KROTKO[t]?.[en ? 1 : 0] || typPelny(t).toLowerCase();
  // na /en uwagi z USOS po angielsku (src/lib/en/plan.ts: zwroty tłumaczone po kolei, linki bez zmian), nazwy przedmiotów
  // bez angielskiej nazwy w USOS — z mapy PRZEDMIOTY_EN
  const zajecieW = (z: Zajecie): Zajecie => (en && z.uwagi ? { ...z, uwagi: z.uwagi.map((f) => (typeof f === 'string' ? uwagaEn(f) : f)) } : z);
  // sala z USOS; po angielsku „inna” → „other”, „zd” (zdalnie) → „online”
  const salaW = (s?: string) => (s && en ? salaEn(s) : s);
  // jak w dawnym planie: przy wykładzie i konwersatorium bez numeru grupy
  const grupa = (z: Zajecie) => (z.typ === 'WYK' || z.typ === 'KONW' || z.grupa == null ? '' : String(z.grupa));

  const semestry = (dane.semestry || []).map((s) => {
    const m = s.id.match(/^(\d{4})\/(\d{2})-([ZL])$/);
    const zimowy = m?.[3] === 'Z';
    const rok = m ? `${m[1]}/${+m[1] + 1}` : '';
    const tytul = m
      ? en
        ? `Timetable for the ${zimowy ? 'winter' : 'summer'} semester of the academic year ${rok}`
        : `Plan zajęć w semestrze ${zimowy ? 'zimowym' : 'letnim'} roku akademickiego ${rok}`
      : (en && s.nazwa_en) || s.nazwa;
    const sekcje = (dane.kategorie || [])
      .map((k) => ({
        id: k.id,
        nazwa: en ? k.en : k.pl,
        przedmioty: s.przedmioty
          .filter((p) => p.kategoria === k.id)
          .map((p) => ({ ...p, nazwaW: en ? nazwaPrzedmiotuEn(p) : p.nazwa, zajecia: s.zajecia.filter((z) => z.kod === p.kod).map(zajecieW) })),
      }))
      .filter((k) => k.przedmioty.length);
    const kotwica = m ? (zimowy ? 'zimowy' : 'letni') : s.id.replace(/[^\w-]/g, '-');
    // kotwice sekcji: #zimowy-o, #letni-np … (nie kolidują z #zimowy / #letni)
    const spis = sekcje.map((k) => ({ depth: 2, slug: `${kotwica}-${k.id.toLowerCase().replace(/[^\w-]/g, '-')}`, text: k.nazwa }));
    // Komputer (kierunek „Założyciele”): linia informacyjna nad planem, krótka etykieta przycisku semestru, data danych z USOS.
    const krotko = (en && s.nazwa_en) || s.nazwa;
    const przycisk = ((k: string) => k.charAt(0).toUpperCase() + k.slice(1))(krotko.replace(/^semestr\s+/i, '').replace(/\s+semester\b/i, ''));
    const opis = m
      ? en ? `${zimowy ? 'Winter' : 'Summer'} semester of the academic year ${rok}` : `Semestr ${zimowy ? 'zimowy' : 'letni'} roku akademickiego ${rok}`
      : krotko;
    const zakt = (s.zaktualizowano || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    const aktualizacja = zakt
      ? { pelna: `${+zakt[3]} ${MIESIACE[en ? 1 : 0][+zakt[2] - 1]} ${zakt[1]}, ${zakt[4]}:${zakt[5]}`, dzien: short(`${zakt[1]}-${zakt[2]}-${zakt[3]}`, en ? 'en' : 'pl', false), godzina: `${zakt[4]}:${zakt[5]}` }
      : undefined;
    const liczbaPrzedmiotow = sekcje.reduce((a, k) => a + k.przedmioty.length, 0);
    return { s, kotwica, krotko, tytul, sekcje, spis, zimowy: m ? zimowy : undefined, przycisk, opis, aktualizacja, liczbaPrzedmiotow };
  });
  // Przełącznik semestrów: wybór podczas budowania (w przeglądarce poprawiany wg daty i adresu).
  const wiele = semestry.length > 1;
  const aktywny = semestry[wybierzSemestr(semestry.map((x) => ({ od: x.s.od, do: x.s.do })), today())]?.kotwica ?? '';


  // Liczby w nagłówku na komputerze (semestr wybrany podczas budowania): przedmioty w semestrze i ostatnia aktualizacja z USOS.
  const biezacy = semestry.find((x) => x.kotwica === aktywny);
  const liczby = biezacy
    ? [
        {
          n: String(biezacy.liczbaPrzedmiotow),
          l: en
            ? `course${biezacy.liczbaPrzedmiotow === 1 ? '' : 's'}${biezacy.zimowy === undefined ? '' : ` in the ${biezacy.zimowy ? 'winter' : 'summer'} semester`}`
            : `${odmiana(biezacy.liczbaPrzedmiotow, ['przedmiot', 'przedmioty', 'przedmiotów'], ['', ''], 'pl')}${biezacy.zimowy === undefined ? '' : ` w semestrze ${biezacy.zimowy ? 'zimowym' : 'letnim'}`}`,
        },
        ...(biezacy.aktualizacja
          ? [{ n: biezacy.aktualizacja.dzien, l: `${en ? 'last update from USOS' : 'ostatnia aktualizacja z USOS'}, ${biezacy.aktualizacja.godzina}` }]
          : []),
      ]
    : [];
  // Spis „Na tej stronie”: kategorie przedmiotów ze wszystkich semestrów, w kolejności z danych.
  // Kotwica bez semestru (#z-pl-o) wskazuje sekcję w pokazanym semestrze (skrypt w PlanZajec.astro przenosi id przy zmianie).
  const idKategorii = (id: string) => `z-pl-${id.toLowerCase().replace(/[^\w-]/g, '-')}`;
  // W spisie krótkie etykiety kategorii (zlecenie 11, zalecenie 3); w nagłówku sekcji zostaje pełna nazwa z danych.
  const KROTKIE: Record<string, [string, string]> = {
    O: ['Obowiązkowe (O)', 'Compulsory (O)'],
    L: ['Do wyboru (L)', 'Electives (L)'],
    M: ['Zaawansowane do wyboru (M)', 'Advanced electives (M)'],
    E: ['Niestandardowe (E)', 'Non-standard (E)'],
    S: ['Seminaria przeglądowe (S)', 'Survey seminars (S)'],
    H: ['Humanistyczne i społeczne (H)', 'Humanities and social (H)'],
    N: ['Specjalność nauczycielska (N)', 'Teacher training (N)'],
    NP: ['Przyrodnicze (NP)', 'Natural sciences (NP)'],
    inne: ['Pozostałe', 'Other'],
  };
  const spisKomputer = (dane.kategorie || [])
    .filter((k) => semestry.some((x) => x.sekcje.some((s) => s.id === k.id)))
    .map((k) => ({ id: idKategorii(k.id), etykieta: en ? k.en : k.pl, krotka: KROTKIE[k.id]?.[en ? 1 : 0] }));

  return { tytul, lead, html, haslo, typPelny, typKrotki, salaW, grupa, semestry, wiele, aktywny, liczby, idKategorii, spisKomputer };
}
