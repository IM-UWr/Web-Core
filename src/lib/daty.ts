// Daty jako tekst w czasie lokalnym Warszawy: "RRRR-MM-DD" albo "RRRR-MM-DDTGG:MM".
export type Lang = 'pl' | 'en';

const MIES_D = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const MIES_M = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
const MIES_K = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
const MON_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON_EN_S = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DNI = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
const DNI_K = ['niedz.', 'pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_EN_S = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface Parts { y: number; m: number; d: number; hh?: number; mm?: number }

export function parse(s: string): Parts {
  const [date, time] = s.split('T');
  const [y, m, d] = date.split('-').map(Number);
  if (time) {
    const [hh, mm] = time.split(':').map(Number);
    return { y, m, d, hh, mm };
  }
  return { y, m, d };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function hasTime(s?: string): boolean {
  return !!s && s.includes('T');
}

export function weekday(s: string): number {
  const p = parse(s);
  return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
}

// "Teraz" w Warszawie, w tym samym formacie co daty w treściach.
export function now(): string {
  const f = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  });
  return f.format(new Date()).replace(' ', 'T');
}

export function today(): string {
  return now().slice(0, 10);
}

export function addDays(day: string, n: number): string {
  const p = parse(day);
  const t = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

// Poniedziałek i niedziela bieżącego tygodnia.
export function weekRange(day = today()): [string, string] {
  const wd = weekday(day);
  const monday = addDays(day, -((wd + 6) % 7));
  return [monday, addDays(monday, 6)];
}

export function daysBetween(a: string, b: string): number {
  const pa = parse(a), pb = parse(b);
  return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / 86400000);
}

export function time(s: string): string {
  const p = parse(s);
  return p.hh === undefined ? '' : `${pad(p.hh)}:${pad(p.mm ?? 0)}`;
}

export function short(s: string): string {
  const p = parse(s);
  return `${pad(p.d)}.${pad(p.m)}.${p.y}`;
}

export function long(s: string, lang: Lang = 'pl', withTime = true): string {
  const p = parse(s);
  const base = lang === 'pl' ? `${p.d} ${MIES_D[p.m - 1]} ${p.y}` : `${p.d} ${MON_EN[p.m - 1]} ${p.y}`;
  return withTime && p.hh !== undefined ? `${base}, ${time(s)}` : base;
}

export function longWithDay(s: string, lang: Lang = 'pl'): string {
  const dn = lang === 'pl' ? DNI[weekday(s)] : DAYS_EN[weekday(s)];
  return `${dn}, ${long(s, lang)}`;
}

export function dayShort(s: string, lang: Lang = 'pl'): string {
  return lang === 'pl' ? DNI_K[weekday(s)] : DAYS_EN_S[weekday(s)];
}

export function monthShort(s: string, lang: Lang = 'pl'): string {
  const p = parse(s);
  return lang === 'pl' ? MIES_K[p.m - 1] : MON_EN_S[p.m - 1];
}

export function monthYear(s: string, lang: Lang = 'pl'): string {
  const p = parse(s);
  return lang === 'pl' ? `${MIES_M[p.m - 1]} ${p.y}` : `${MON_EN[p.m - 1]} ${p.y}`;
}

export function dayNum(s: string): string {
  return String(parse(s).d);
}

// Zakres dat wydarzenia, np. "21–22 września 2026" albo "15 września 2026, 13:00".
export function range(start: string, end: string | undefined, lang: Lang = 'pl'): string {
  if (!end || end.slice(0, 10) === start.slice(0, 10)) {
    const t = end && hasTime(end) ? `–${time(end)}` : '';
    return long(start, lang) + t;
  }
  const a = parse(start), b = parse(end);
  const M = lang === 'pl' ? MIES_D : MON_EN;
  if (a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${M[a.m - 1]} ${a.y}`;
  if (a.y === b.y) return `${a.d} ${M[a.m - 1]} – ${b.d} ${M[b.m - 1]} ${a.y}`;
  return `${long(start, lang, false)} – ${long(end, lang, false)}`;
}

// Do kalendarza .ics: "20261026T151500"
export function ics(s: string, defaultTime = '00:00'): string {
  const p = parse(s);
  const hh = p.hh ?? Number(defaultTime.slice(0, 2));
  const mm = p.mm ?? Number(defaultTime.slice(3, 5));
  return `${p.y}${pad(p.m)}${pad(p.d)}T${pad(hh)}${pad(mm)}00`;
}

export function plusMinutes(s: string, minutes: number): string {
  const p = parse(s);
  const t = new Date(Date.UTC(p.y, p.m - 1, p.d, p.hh ?? 0, (p.mm ?? 0) + minutes));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}T${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}`;
}
