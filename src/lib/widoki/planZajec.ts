// Dane planu zajęć (PlanZajec.astro): semestry z sekcjami przedmiotów, aktywny semestr, hasło i nazwy typów zajęć.
import { wybierzSemestr } from '../../components/wyborSemestru';
import surowe from '../../data/plan/plan.json';
import studia from '../../data/dzialy/studia.json';
import { today, type Lang } from '../daty';

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
  // hasło na telefonie (po angielsku tylko plan_haslo_en — bez polskich resztek)
  const tekstStudiow = studia as { plan_haslo?: string; plan_haslo_en?: string };
  const haslo = (en ? tekstStudiow.plan_haslo_en : tekstStudiow.plan_haslo) || undefined;

  const typPelny = (t: string) => dane.typy?.[t]?.[lang] || t;
  const typKrotki = (t: string) => KROTKO[t]?.[en ? 1 : 0] ?? typPelny(t).toLowerCase();
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
          .map((p) => ({ ...p, nazwaW: (en && p.nazwa_en) || p.nazwa, zajecia: s.zajecia.filter((z) => z.kod === p.kod) })),
      }))
      .filter((k) => k.przedmioty.length);
    const kotwica = m ? (zimowy ? 'zimowy' : 'letni') : s.id.replace(/[^\w-]/g, '-');
    // kotwice sekcji: #zimowy-o, #letni-np … (nie kolidują z #zimowy / #letni)
    const spis = sekcje.map((k) => ({ depth: 2, slug: `${kotwica}-${k.id.toLowerCase().replace(/[^\w-]/g, '-')}`, text: k.nazwa }));
    return { s, kotwica, krotko: (en && s.nazwa_en) || s.nazwa, tytul, sekcje, spis };
  });
  // Przełącznik semestrów: wybór podczas budowania (w przeglądarce poprawiany wg daty i adresu).
  const wiele = semestry.length > 1;
  const aktywny = semestry[wybierzSemestr(semestry.map((x) => ({ od: x.s.od, do: x.s.do })), today())]?.kotwica ?? '';

  return { haslo, typPelny, typKrotki, grupa, semestry, wiele, aktywny };
}
