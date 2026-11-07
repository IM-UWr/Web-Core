// Dane jednego semestru kolorów dni (KoloryDniSemestr.astro): siatki miesięcy, statystyki, listy dni wolnych i zamian.
import { addDays, monthYear, type Lang } from '../daty';
import {
  dniSemestru, statystykiSemestru, wolneSemestru, zamianySemestru, dzienTygodnia, DNI_SKROT, type Dzien, type Semestr,
} from '../kolory-dni';

export type Komorka = { data: string; d: Dzien | null };

export async function daneKolorowDniSemestru(s: Semestr, lang: Lang, listy: boolean) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);

  const NAGLOWKI = lang === 'en' ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

  // Miesiące od początku do końca zajęć; tygodnie od poniedziałku.
  const dni = new Map(dniSemestru(s).map((d) => [d.data, d]));
  const miesiace: { nazwa: string; tygodnie: (Komorka | null)[][] }[] = [];
  for (let m = s.poczatek.slice(0, 7); m <= s.koniec.slice(0, 7); ) {
    const pierwszy = `${m}-01`;
    let d = addDays(pierwszy, 1 - dzienTygodnia(pierwszy));
    const tygodnie: (Komorka | null)[][] = [];
    do {
      const tydz: (Komorka | null)[] = [];
      for (let i = 0; i < 7; i++, d = addDays(d, 1)) tydz.push(d.slice(0, 7) === m ? { data: d, d: dni.get(d) ?? null } : null);
      tygodnie.push(tydz);
    } while (d.slice(0, 7) === m);
    miesiace.push({ nazwa: monthYear(pierwszy, lang), tygodnie });
    const [y, mm] = m.split('-').map(Number);
    m = mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, '0')}`;
  }

  const st = statystykiSemestru(s);
  const plan = st.plan.slice(1);
  const rowne = plan.every((n) => n === plan[0]);
  const liczby = rowne
    ? T(`każdy dzień tygodnia ${plan[0]} razy`, `each weekday ${plan[0]} times`)
    : plan.map((n, i) => `${DNI_SKROT[lang][i + 1]} ${n}`).join(', ');
  const wolne = listy ? wolneSemestru(s) : [];
  const zamiany = listy ? zamianySemestru(s) : [];
  const uwagi = (lang === 'en' && s.uwagi_en) || s.uwagi || '';
  const hId = `semestr-${s.poczatek}`;

  return { NAGLOWKI, miesiace, st, liczby, wolne, zamiany, uwagi, hId };
}
