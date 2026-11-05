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
