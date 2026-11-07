// Plan zajęć na /en (/en/studia/plan-zajec): tłumaczenia przy wyświetlaniu danych z USOS (src/data/plan/plan.json,
// pobiera skrypty/plan/pobierz_plan.py). Danych nie zmieniamy — tłumaczymy w kodzie (zlecenie 11, zalecenie 12;
// dok/en/RAPORT-EN.md: K9, K12, D1). Lista do akceptacji: dok/en/TLUMACZENIA.md, sekcja „Plan zajęć”.

// Typy zajęć: angielskie nazwy z USOS to kalki („Conversatorium”, „Master Degree Seminar”, „Class” dla ćwiczeń) —
// tu nazwy przyjęte w brytyjskich uczelniach. Pełna nazwa w podpowiedzi (<abbr title>), krótka w wierszu.
export const TYPY_EN: Record<string, { pelna: string; krotka?: string }> = {
  CW: { pelna: 'Exercise class' }, CW2: { pelna: 'Exercise class' },
  KONW: { pelna: 'Discussion class', krotka: 'disc.' }, KONW2: { pelna: 'Discussion class', krotka: 'disc.' },
  'SEM-MGR': { pelna: 'Master’s seminar' },
  WAR: { pelna: 'Workshop', krotka: 'wkshp' },
  'PRK-PED': { pelna: 'Teaching practice' },
  EGZ: { pelna: 'Exam' },
  KON: { pelna: 'Office hours (optional)' },
};

// Sale: oznaczenia z USOS, które nie są numerem sali.
const SALE_EN: Record<string, string> = { inna: 'other', zd: 'online' };
export const salaEn = (s: string): string => SALE_EN[s.trim().toLowerCase()] ?? s;

// Nazwy przedmiotów bez angielskiej nazwy w USOS (plan.json: brak nazwa_en) — klucz: kod przedmiotu z USOS.
// Gdy USOS dostanie angielską nazwę, ma ona pierwszeństwo (nazwaPrzedmiotuEn niżej). Lista do akceptacji w TLUMACZENIA.md.
export const PRZEDMIOTY_EN: Record<string, string> = {
  '28-MT-S-oObow4': 'Graphs and Algorithms',
  '28-MT-S-oPWarAI': 'Basic AI Workshop',
  '28-MT-S-oObow5': 'Programming 2 (Python) (AI)',
  '28-MT-S-oObow3': 'Probability Theory (AI)',
  '28-MT-S-oObow1': 'Computing Workshop for Mathematicians',
  '28-MT-S-oObow2': 'Introduction to Combinatorics',
  '28-MT-S-tNielRDyf': 'Nonlinear Diffusion Equations',
  '28-MT-S-tTopologia2R': 'Topology 2 R',
  '28-MT-S-qAnRyzP': 'Analysis of Liquidity Risk and Excessive Concentration',
  '28-MT-S-qGrOl': 'Oligomorphic Groups',
  '28-MT-S-qKurProLDr': 'Programming Drone Flight Trajectories',
  '28-MT-S-qMetProb': 'The Probabilistic Method',
  '28-MT-S-qTopos': 'Toposes',
  '28-MT-S-uWarPomDyd': 'Teaching Aids Workshop',
  '28-MT-S-yPisEgzLic': 'Written Bachelor’s Examination 1',
  '28-MT-S-yPisEgzLic2': 'Written Bachelor’s Examination 2',
  '28-MT-S-yPisEgzMgr': 'Written Master’s Examination 1',
  '28-MT-S-yPisEgzMgr2': 'Written Master’s Examination 2',
  '28-MT-S-yPisEgzWst': 'Written Entrance Examination',
  '28-MT-S-oPodStatAI': 'Foundations of Statistics (AI)',
  '28-MT-S-oProjKarAI': 'Career Planning',
  '28-MT-S-oUczMaszAI': 'Machine Learning (AI)',
  '28-MT-S-oZaaWarAI': 'Advanced AI Workshop',
  '28-MT-S-lMatPodSiecN': 'Mathematical Foundations of Neural Networks',
  '28-MT-S-t0122': 'Intelligent Decision Systems: the Practice of a Modern Mathematician',
  '28-MT-S-tMUbezpZdr': 'Health Insurance Mathematics',
  '28-MT-S-tTopologia1R': 'Topology R',
  '28-MT-S-qPAktFin': 'Actuarial and Financial Mathematics Survey',
  '28-MT-S-qSemNaucz': 'Seminar for Teachers',
  '28-MT-S-qSpacLosZ': 'Random Walks and Their Applications',
  '28-MT-S-qUczWzmZ': 'Reinforcement Learning and Its Applications',
};
// nazwa przedmiotu na /en: z USOS (nazwa_en), potem z mapy, na końcu polska (nowy przedmiot, którego nie ma jeszcze w mapie)
export const nazwaPrzedmiotuEn = (p: { kod: string; nazwa: string; nazwa_en?: string | null }): string =>
  (p.nazwa_en && p.nazwa_en !== p.nazwa ? p.nazwa_en : PRZEDMIOTY_EN[p.kod]) || p.nazwa_en || p.nazwa;

// Uwagi przy zajęciach (kolumna „notes”): zwroty z USOS, tłumaczone po kolei w każdym fragmencie tekstu (linki — np. „N”, „P”
// do oznaczeń tygodni — zostają). Nazwy przedmiotów w uwagach („Analiza numeryczna”) zostają: to nazwy z USOS.
const MIES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const RZYMSKIE: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12 };
const DNI: Record<string, string> = { pn: 'Mon', wt: 'Tue', śr: 'Wed', sr: 'Wed', cz: 'Thu', pt: 'Fri', sb: 'Sat', nd: 'Sun', CZWARTEK: 'Thursday' };
const porzadkowy = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;
const dzien = (d: string, m: string) => `${+d} ${MIES[+m - 1] ?? m}`;
const godz = (s: string) => s.replace('.', ':');

export const UWAGI_EN: [RegExp, string | ((...a: string[]) => string)][] = [
  [/TU będą kolokwia\s*strona www przedmiotu:/, 'Tests will be posted here.\nCourse website:'],
  [/tylko dla studiów II stopnia, obowiązują osobne zapisy/, 'master’s students only; separate registration'],
  [/przedmiot w nowym programie występuje pod nazwą '([^']+)'/, (_, n) => `in the new curriculum this course is called ‘${n}’`],
  [/w semestrze letnim ostatnia edycja przedmiotu/, 'last edition in the summer semester'],
  [/ostatnia edycja przedmiotu zgodna ze starym programem/, 'last edition under the previous curriculum'],
  [/ostatnia edycja przedmiotu \(nadal oferowane będzie ([^)]+)\)/, (_, n) => `last edition of this course (${n} will still be offered)`],
  [/ostatnia edycja przedmiotu/, 'last edition of this course'],
  [/wymagane zaliczenie przedmiotu /, 'requires a pass in '],
  [/(?:zajęcia )?co 2 tygodnie/, 'every other week'],
  [/^dni $/, 'dates '],
  [/, dni $/, ', dates '],
  [/, dni (?=[NP]\b)/, ', dates '],
  [/[Pp]ierwsze zajęcia CZWARTEK (\d{1,2})([IVX]+), godz\.: (\d{1,2}:\d{2})-(\d{1,2}:\d{2})/, (_, d, m, a, b) => `first class on Thursday ${+d} ${MIES[RZYMSKIE[m] - 1]}, ${a}–${b}`],
  [/[Pp]ierwsze zajęcia (\d{1,2})\.(\d{1,2})\.?/g, (_, d, m) => `first class on ${dzien(d, m)}`],
  [/zajęcia od (\d{1,2})([IVX]+)/, (_, d, m) => `classes from ${+d} ${MIES[RZYMSKIE[m] - 1]}`],
  [/pierwsze (\d+) wykładów w sali (\w+)/, (_, n, s) => `first ${n} lectures in room ${s}`],
  [/\(wspólnie z /, '(together with '],
  [/wykład wspólny z /, 'lecture shared with '],
  [/\b(pn|wt|śr|cz|pt|sb|nd) (\d{1,2})\.(\d{1,2}) \((\d{1,2}\.\d{2})-(\d{1,2}\.\d{2})\)/g, (_, dz, d, m, a, b) => `${DNI[dz]} ${dzien(d, m)} (${godz(a)}–${godz(b)})`],
  [/dla semestru (\d+) studiów mgr/g, (_, n) => `for ${porzadkowy(+n)}-semester master’s students`],
  [/tylko dla ([A-Z]+)\b/g, '$1 students only'],
  [/\bdla ([A-Z]+)\b/g, 'for $1'],
  [/^studia I stopnia$/, 'bachelor’s studies'],
  [/^studia II stopnia$/, 'master’s studies'],
  [/^sem\. (\d+)$/, (_, n) => `semester ${n}`],
  [/^wrześniowa$/, 'September resit'],
  [/prow\. /, 'taught by '],
  [/(^|, )ang\.(?=,|$| )/, '$1in English'],
  [/(^|, )(pol\.|pl)(?=,|$)/, '$1in Polish'],
];
export const uwagaEn = (s: string): string => UWAGI_EN.reduce((t, [re, na]) => t.replace(re, na as any), s);
