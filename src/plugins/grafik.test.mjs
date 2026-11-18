// Parser bloku :::grafik i stany „teraz” (zlecenie 45, src/lib/grafik.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsujGrafik, blokGrafiku, grafikZMarkdown, liczbyGrafiku, stanGrafiku, dzienGrafiku, minal, osGodzin, hm, POWODY } from '../lib/grafik.mjs';

// wnętrze bloku z załącznika A zlecenia 45 (Web-Studia src/content/strony/studia/tutornia.md)
const ZALACZNIK_A = `Sala: 202
Od: 19.10.2026
Do:

- pon. 12:15–14:00 **Paulina Pawlik** — AM1, AM3, Algebra liniowa 1
- pon. 14:15–16:00 **Miłosz Cierkosz** — AM1/I, AM3/III, Algebra liniowa 1R
- pon. 16:15–17:00 **Eliza Laskowska** — AiT(R), Algebra 1/1R, Alglin 1/1R
- wt. 12:15–14:00 **Cezary Goszczyński** — Algebra liniowa 1, AM1, Programowanie, WdM, Wstęp do kombinatoryki
- wt. 14:15–16:00 **Olaf Jankowski-Pluntke** — WdM(R), Miara i całka, Algebra liniowa 1/1R, AiT(R)
- śr. 12:15–14:00 **Jakub Abramek** — WdM(R), AiT(R), Miara i całka, Algebra 1/1R, Alglin 1R
- śr. 14:15–16:00 **Jacek Kowalski** — AM1, Algebra liniowa 1
- czw. 13:15–15:00 **Róża Deć** — AM1, AM3, Algebra liniowa 1
- czw. 15:15–16:00 **Eliza Laskowska** — WdM(R), AM3(III)
- pt. 14:15–16:00 **Jagna Olszewska** — WdM(R), AM1/I, Algebra 1/1R, Algebra liniowa 1/1R`;
const linie = (s) => s.split('\n');
const A = parsujGrafik(linie(ZALACZNIK_A));

test('załącznik A: pola, 10 dyżurów, 9 tutorów, bez błędów', () => {
  assert.deepEqual(A.pola, { sala: '202', od: '2026-10-19' });
  assert.equal(A.bledy.length, 0);
  assert.equal(A.pusty, false);
  assert.equal(A.dyzury.length, 10);
  assert.deepEqual(liczbyGrafiku(A.dyzury), { tutorzy: 9, dyzury: 10 });
  assert.deepEqual(A.dyzury[0], { dz: 0, od: 735, do: 840, kto: 'Paulina Pawlik', przedm: 'AM1, AM3, Algebra liniowa 1', nr: 6 });
  assert.equal(A.dyzury[4].kto, 'Olaf Jankowski-Pluntke');
  assert.equal(A.dyzury[9].dz, 4);
});

test('warianty zapisu: kropka w godzinie, pełna godzina, łącznik, „do”, pełna nazwa dnia, bez pogrubienia, kolejność dowolna', () => {
  const w = parsujGrafik(linie(`- piątek 12.15-14 Jan Nowak — AM1
- Poniedziałek, 9 do 10:30 **Anna Kowalska**
* WT 8:00–9:00 Ola Zet: Algebra, Analiza
- sr 10–11 Piotr Lis - Topologia
- czwartek 11:00—12:00 **Ewa Mak**: Logika
+ pon 8–9 Kasia Bąk
- Mon 7-8 Tom Lee — Calculus`));
  assert.equal(w.bledy.length, 0, JSON.stringify(w.bledy));
  assert.deepEqual(w.dyzury.map((x) => [x.dz, x.od, x.do, x.kto, x.przedm]), [
    [0, 420, 480, 'Tom Lee', 'Calculus'],
    [0, 480, 540, 'Kasia Bąk', ''],
    [0, 540, 630, 'Anna Kowalska', ''],
    [1, 480, 540, 'Ola Zet', 'Algebra, Analiza'],
    [2, 600, 660, 'Piotr Lis', 'Topologia'],
    [3, 660, 720, 'Ewa Mak', 'Logika'],
    [4, 735, 840, 'Jan Nowak', 'AM1'],
  ]);
});

test('każdy powód błędu, numer linii w bloku („:::grafik” = 1), błędne linie poza planem', () => {
  const w = parsujGrafik(linie(`Sala: 202
Od: 32.10.2026
Do: 2026-02-30
pon. 12:15–14:00 **Bez myślnika**
- pon. **Bez godzin**
- sob. 10:00–11:00 **Sobota**
- xyz 10:00–11:00 **Nieznany dzień**
- wt. 14:00–12:00 **Odwrotnie**
- śr. 12:00–13:00
- śr. 12:00–13:00 —   Przedmiot bez osoby
- czw. 25:00–26:00 **Zła godzina**
- pt. 10:00–11:00 **Dobra Linia**`));
  assert.deepEqual(w.bledy.map((b) => [b.nr, b.powod]), [
    [3, POWODY.data],
    [4, POWODY.data],
    [5, POWODY.myslnik],
    [6, POWODY.godziny],
    [7, POWODY.dzien('sob')],
    [8, POWODY.dzien('xyz')],
    [9, POWODY.koniec],
    [10, POWODY.kto],
    [11, POWODY.kto],
    [12, POWODY.godziny],
  ]);
  assert.equal(w.dyzury.length, 1);
  assert.equal(w.dyzury[0].kto, 'Dobra Linia');
  assert.equal(w.bledy[2].tekst, 'pon. 12:15–14:00 **Bez myślnika**');
});

test('komentarze i puste linie pomijane; „Do” wpisane albo puste; „Do” przed „Od” to błąd', () => {
  const w = parsujGrafik(linie(`<!-- komentarz
  w dwóch liniach -->
Sala: HS
Od: 2026-10-19 <!-- pierwszy dzień -->
Do: 15.12.2026

- pon. 12–13 **A B**`));
  assert.deepEqual(w.pola, { sala: 'HS', od: '2026-10-19', do: '2026-12-15' });
  assert.equal(w.bledy.length, 0);
  const z = parsujGrafik(linie('Od: 19.10.2026\nDo: 1.10.2026'));
  assert.deepEqual(z.pola, { od: '2026-10-19' });
  assert.deepEqual(z.bledy.map((b) => [b.nr, b.powod]), [[3, POWODY.doPrzedOd]]);
});

test('pusty blok (np. w treści EN) i blok z samymi komentarzami są puste', () => {
  assert.equal(parsujGrafik([]).pusty, true);
  assert.equal(parsujGrafik(['', '<!-- tylko komentarz -->', '']).pusty, true);
  assert.equal(parsujGrafik(['Sala: 202']).pusty, false);
});

test('blok z całego Markdownu: pierwszy blok, kod pominięty, drugi blok zgłoszony', () => {
  const md = '## Plan\n\n```\n:::grafik\n- pon. 1–2 **Kod**\n:::\n```\n\n:::grafik\nSala: 1\n- pon. 12–13 **A B**\n:::\n\nTekst.\n\n:::grafik\n:::\n';
  const b = blokGrafiku(md);
  assert.deepEqual(b.linie, ['Sala: 1', '- pon. 12–13 **A B**']);
  assert.equal(b.ile, 2);
  const w = grafikZMarkdown(md);
  assert.equal(w.dyzury.length, 1);
  assert.deepEqual(w.bledy.map((x) => x.powod), [POWODY.drugi]);
  assert.equal(grafikZMarkdown('Bez bloku.'), undefined);
});

test('nakładające się dyżury zostają osobno, w kolejności godzin', () => {
  const w = parsujGrafik(linie('- pon. 13–15 **B**\n- pon. 12–14 **A**\n- pon. 12–13 **C**'));
  assert.deepEqual(w.dyzury.map((x) => x.kto), ['A', 'C', 'B']);
});

// ---------- stany (kalendarz jak w kolory-dni 2026/27 Z, uproszczony) ----------
const WOLNE = { '2026-11-11': 'Narodowe Święto Niepodległości', '2026-11-12': 'Dzień rektorski', '2026-11-13': 'Dzień rektorski (Święto Uniwersytetu)' };
const info = (s) => {
  if (s < '2026-10-02' || s > '2027-02-05') return null;
  const t = (new Date(`${s}T12:00:00Z`).getUTCDay() + 6) % 7;
  if (s === '2026-12-18') return { kolor: 'niebieski', plan: 3, wolne: null, zamiana: true };
  if (WOLNE[s] || (s >= '2026-12-21' && s <= '2027-01-06')) return t > 4 ? { kolor: null, plan: null, wolne: null } : { kolor: null, plan: null, wolne: { opis: WOLNE[s] ?? 'Przerwa świąteczna', opis_en: 'Christmas break' } };
  return t > 4 ? { kolor: null, plan: null, wolne: null } : { kolor: 'niebieski', plan: t + 1, wolne: null, zamiana: false };
};
const KAL = { sala: '202', od: '2026-10-19', do: '2027-02-05', info };
const st = (data, g, m = 0, lang = 'pl') => stanGrafiku(A.dyzury, KAL, { data, min: g * 60 + m }, lang);

test('stany z tabeli zlecenia (PL)', () => {
  let s = st('2026-11-18', 14, 55);
  assert.equal(s.typ, 'teraz');
  assert.equal(s.tytul, 'Teraz dyżuruje Jacek Kowalski');
  assert.equal(s.opis, 'Do 16:00 · AM1, Algebra liniowa 1 · sala 202. Następny dyżur: jutro (czwartek), 13:15 — Róża Deć.');
  assert.equal(s.etykieta, 'Środa, 18 listopada 2026, 14:55');
  assert.equal(s.krotko, 'teraz: Jacek Kowalski, do 16:00');
  assert.equal(s.kolko, 'JK');
  s = st('2026-11-18', 13);
  assert.equal(s.opis, 'Do 14:00 · WdM(R), AiT(R), Miara i całka, Algebra 1/1R, Alglin 1R · sala 202. Potem od 14:15: Jacek Kowalski.');
  s = st('2026-11-23', 14, 5);
  assert.equal(s.tytul, 'Za chwilę: Miłosz Cierkosz');
  assert.equal(s.opis, 'Od 14:15 do 16:00 · AM1/I, AM3/III, Algebra liniowa 1R · sala 202.');
  assert.equal(s.krotko, 'od 14:15: Miłosz Cierkosz');
  s = st('2026-11-24', 9, 30);
  assert.equal(s.tytul, 'Dziś od 12:15');
  assert.equal(s.opis, '12:15–14:00 Cezary Goszczyński · 14:15–16:00 Olaf Jankowski-Pluntke · sala 202.');
  assert.equal(s.krotko, 'dziś od 12:15 · sala 202');
  assert.equal(st('2026-11-24', 14, 5).tytul, 'Za chwilę: Olaf Jankowski-Pluntke');
  const przerwa = parsujGrafik(['- pon. 9–10 **X Y**', '- pon. 12–13 **Z W**']).dyzury;
  assert.equal(stanGrafiku(przerwa, KAL, { data: '2026-11-23', min: 630 }, 'pl').tytul, 'Dziś jeszcze od 12:00');
  s = st('2026-11-18', 16, 51);
  assert.equal(s.tytul, 'Na dziś to wszystko');
  assert.equal(s.opis, 'Następny dyżur: jutro (czwartek), 13:15 — Róża Deć.');
  assert.equal(s.krotko, 'jutro od 13:15 · sala 202');
  s = st('2026-11-20', 17, 30);
  assert.equal(s.opis, 'Następny dyżur: poniedziałek, 23 listopada, 12:15 — Paulina Pawlik.');
  assert.equal(s.krotko, 'pon. od 12:15 · sala 202');
  s = st('2026-11-21', 11);
  assert.equal(s.tytul, 'W weekend tutornia nie działa');
  s = st('2026-11-12', 10);
  assert.equal(s.tytul, 'Dziś tutornia nieczynna');
  assert.equal(s.opis, 'Dzień rektorski. Następny dyżur: poniedziałek, 16 listopada, 12:15 — Paulina Pawlik.');
  assert.equal(s.krotko, 'nieczynna, wraca 16 lis');
  s = st('2026-12-18', 13);
  assert.equal(s.tytul, 'Teraz dyżuruje Jakub Abramek');
  assert.match(s.opis, / Dziś zajęcia według planu środy, więc dyżury też\.$/);
  s = st('2026-12-28', 12);
  assert.equal(s.opis, 'Przerwa świąteczna. Następny dyżur: czwartek, 7 stycznia, 13:15 — Róża Deć.');
  assert.equal(s.krotko, 'nieczynna, wraca 7 sty');
  s = st('2026-10-12', 12);
  assert.equal(s.tytul, 'Tutornia rusza 19 października');
  assert.equal(s.opis, 'Pierwszy dyżur: poniedziałek, 19 października, 12:15 — Paulina Pawlik · sala 202.');
  assert.equal(s.krotko, 'rusza 19 paź');
  s = st('2027-02-15', 12);
  assert.equal(s.tytul, 'Dyżury w tym semestrze już się skończyły');
  assert.equal(s.krotko, 'sala 202');
});

test('stany po angielsku i dwóch tutorów naraz', () => {
  const s = st('2026-11-18', 14, 55, 'en');
  assert.equal(s.tytul, 'On duty now: Jacek Kowalski');
  assert.equal(s.opis, 'Until 16:00 · AM1, Algebra liniowa 1 · room 202. Next session: tomorrow (Thursday), 13:15 — Róża Deć.');
  assert.equal(s.etykieta, 'Wednesday, 18 November 2026, 14:55');
  assert.equal(st('2026-12-28', 12, 0, 'en').krotko, 'closed, back 7 Jan');
  const dwa = parsujGrafik(['- pon. 12–14 **A A**', '- pon. 13–15 **B B**']).dyzury;
  const r = stanGrafiku(dwa, KAL, { data: '2026-11-23', min: 13 * 60 + 30 }, 'pl');
  assert.equal(r.tytul, 'Teraz dyżurują A A i B B');
  assert.equal(r.krotko, 'teraz: 2 tutorów, do 15:00');
});

test('przygaszone: cały bieżący tydzień do obecnej godziny; w weekend i w przerwie nic', () => {
  const ile = (data, g, m = 0) => {
    const inf = dzienGrafiku(KAL, data);
    return A.dyzury.filter((x) => minal(x, inf, { data, min: g * 60 + m })).map((x) => x.kto);
  };
  assert.deepEqual(ile('2026-11-18', 13), ['Paulina Pawlik', 'Miłosz Cierkosz', 'Eliza Laskowska', 'Cezary Goszczyński', 'Olaf Jankowski-Pluntke']);
  assert.equal(ile('2026-11-18', 16, 51).length, 7);
  assert.equal(ile('2026-11-21', 12).length, 0);
  assert.equal(ile('2026-12-28', 12).length, 0);
  // zamiana dni: piątek 18.12 z planem środy — przygaszone pn, wt i środowe do 13:00
  assert.deepEqual(ile('2026-12-18', 14, 30), ['Paulina Pawlik', 'Miłosz Cierkosz', 'Eliza Laskowska', 'Cezary Goszczyński', 'Olaf Jankowski-Pluntke', 'Jakub Abramek']);
});

test('oś godzin sama z grafiku: zakres, początki dyżurów, koniec ostatniego, pełne godziny w lukach ponad 90 min', () => {
  const os = (d) => osGodzin(d).etykiety.map(hm).join(' ');
  assert.equal(os(A.dyzury), '12:15 13:15 14:15 15:15 16:15 17:00');
  assert.deepEqual([osGodzin(A.dyzury).p, osGodzin(A.dyzury).k], [735, 1020]);
  // linie: bez końca ostatniego dyżuru (dolna kreska siatki)
  assert.equal(osGodzin(A.dyzury).linie.map(hm).join(' '), '12:15 13:15 14:15 15:15 16:15');
  const zLuka = parsujGrafik(linie(`${ZALACZNIK_A}
- pt. 9:00–10:30 **Ktoś Rano**
- pon. 16:15–18:00 **Ktoś Późno**`)).dyzury;
  assert.equal(os(zLuka), '9:00 10:00 11:00 12:15 13:15 14:15 15:15 16:15 17:00 18:00');
  assert.deepEqual([osGodzin(zLuka).p, osGodzin(zLuka).k], [540, 1080]);
  // pełne godziny z liniami (10:00, 11:00, 17:00)
  assert.equal(osGodzin(zLuka).linie.map(hm).join(' '), '9:00 10:00 11:00 12:15 13:15 14:15 15:15 16:15 17:00');
  // 10:40 → 12:15 (95 min): 11:00 i 12:00 za blisko sąsiednich etykiet (mniej niż 30 min)
  const blisko = parsujGrafik(linie(`${ZALACZNIK_A}
- pt. 10:40–11:20 **Ktoś Rano**
- pon. 16:15–18:00 **Ktoś Późno**`)).dyzury;
  assert.equal(os(blisko), '10:40 12:15 13:15 14:15 15:15 16:15 17:00 18:00');
  // luka dokładnie 90 min — bez dodatkowych godzin; 120 min — pełna godzina w środku; pusty grafik — pusta oś
  assert.equal(os(parsujGrafik(linie(`- pon. 9:00–10:00 **A**
- pon. 10:30–11:00 **B**`)).dyzury), '9:00 10:30 11:00');
  assert.equal(os(parsujGrafik(linie(`- pon. 9:00–9:30 **A**
- pon. 11:00–11:30 **B**`)).dyzury), '9:00 10:00 11:00 11:30');
  assert.deepEqual(osGodzin([]), { p: 0, k: 0, linie: [], etykiety: [] });
});
