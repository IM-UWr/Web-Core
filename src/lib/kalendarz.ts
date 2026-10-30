// Pliki kalendarza (.ics) i linki „Dodaj do Kalendarza Google”.
import { hasTime, ics, addDays, plusMinutes } from './daty';
import { absolute } from './url';
import type { Wydarzenie } from './tresci';

const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Warsaw',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
];

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');

// Zawijanie linii do 75 bajtów (wymóg formatu iCalendar).
function fold(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = '';
  for (const ch of line) {
    if (enc.encode(cur + ch).length > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = ch;
    } else cur += ch;
  }
  out.push(cur);
  return out.join('\r\n ');
}

const dzien = (s: string) => s.slice(0, 10).replace(/-/g, '');

function zakres(w: Wydarzenie): string[] {
  if (hasTime(w.poczatek)) {
    const koniec = w.koniec && hasTime(w.koniec) ? w.koniec : w.koniecIcs && hasTime(w.koniecIcs) ? w.koniecIcs : plusMinutes(w.poczatek, 90);
    return [`DTSTART;TZID=Europe/Warsaw:${ics(w.poczatek)}`, `DTEND;TZID=Europe/Warsaw:${ics(koniec)}`];
  }
  const ostatni = w.koniec ? w.koniec.slice(0, 10) : w.poczatek.slice(0, 10);
  return [`DTSTART;VALUE=DATE:${dzien(w.poczatek)}`, `DTEND;VALUE=DATE:${dzien(addDays(ostatni, 1))}`];
}

export function plikIcs(wydarzenia: Wydarzenie[], nazwa: string, site: URL | undefined): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const host = site ? site.host : 'math.uni.wroc.pl';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Instytut Matematyczny UWr//Strona IM//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(nazwa)}`,
    'X-WR-TIMEZONE:Europe/Warsaw',
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...VTIMEZONE,
  ];
  for (const w of wydarzenia) {
    // adres: nasza podstrona albo strona zewnętrzna (konferencje); konferencja bez strony — bez linku i bez pola URL
    const adres = w.href ? absolute(w.href, site) : undefined;
    const opis = [w.podtytul, w.opis, adres].filter(Boolean).join('\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${w.uid}@${host}`,
      `DTSTAMP:${stamp}`,
      ...zakres(w),
      `SUMMARY:${esc(w.tytul)}`,
      ...(w.miejsce ? [`LOCATION:${esc(w.miejsce)}`] : []),
      `DESCRIPTION:${esc(opis)}`,
      ...(adres ? [`URL:${adres}`] : []),
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function linkGoogle(w: Wydarzenie, site: URL | undefined): string {
  let dates: string;
  if (hasTime(w.poczatek)) {
    const koniec = w.koniec && hasTime(w.koniec) ? w.koniec : w.koniecIcs && hasTime(w.koniecIcs) ? w.koniecIcs : plusMinutes(w.poczatek, 90);
    dates = `${ics(w.poczatek)}/${ics(koniec)}`;
  } else {
    const ostatni = w.koniec ? w.koniec.slice(0, 10) : w.poczatek.slice(0, 10);
    dates = `${dzien(w.poczatek)}/${dzien(addDays(ostatni, 1))}`;
  }
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: w.tytul,
    dates,
    ctz: 'Europe/Warsaw',
    details: [w.podtytul, w.href && absolute(w.href, site)].filter(Boolean).join('\n'),
  });
  if (w.miejsce) p.set('location', w.miejsce);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// Adres pliku .ics dla jednego wydarzenia albo całego kanału.
export const adresIcs = (nazwa: string) => `/kalendarz/${nazwa}.ics`;
