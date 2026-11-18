// Grafik dyżurów z bloku :::grafik w jawnym Markdownie (zlecenie 45: Tutornia). Jeden kod dla wtyczki Markdownu
// (src/plugins/rehype-bloki.mjs), widoku strony (src/components/grafik/), kafelka Szybkiego dostępu (DrugiEkran.astro),
// skryptu przeglądarki (src/scripts/grafik.ts) i testów node. Czysty JS bez zależności; kalendarz zajęć (kolory-dni)
// przychodzi z zewnątrz jako funkcja `info(data)`, żeby ten moduł nie ciągnął danych do testów.
//
// Składnia bloku (jedna linia = jedna informacja; puste linie i komentarze <!-- … --> pomijane, kolejność dowolna):
//   Sala: 202
//   Od: 19.10.2026            pierwszy dzień dyżurów (też 2026-10-19)
//   Do:                       ostatni dzień; puste = koniec zajęć semestru, w którym leży „Od” (liczy widok)
//   - pon. 12:15–14:00 **Imię Nazwisko** — przedmioty
// Linie, których parser nie rozumie, nie trafiają na stronę: lista `bledy` (numer linii w bloku, licząc „:::grafik” jako 1).

// dni: polskie skróty i nazwy (z kropką albo bez, dowolna wielkość liter); angielskie — dla pełnego bloku w treści EN
export const DNI_GRAFIKU = {
  pn: 0, pon: 0, 'poniedziałek': 0, poniedzialek: 0, mon: 0, monday: 0,
  wt: 1, wto: 1, wtorek: 1, tue: 1, tues: 1, tuesday: 1,
  'śr': 2, sr: 2, 'środa': 2, sroda: 2, wed: 2, wednesday: 2,
  cz: 3, czw: 3, czwartek: 3, thu: 3, thur: 3, thurs: 3, thursday: 3,
  pt: 4, 'pią': 4, pia: 4, 'piątek': 4, piatek: 4, fri: 4, friday: 4,
};

export const POWODY = {
  myslnik: 'linia grafiku zaczyna się od myślnika i spacji',
  godziny: 'nie widzę dnia i godzin (wzór: pon. 12:15–14:00)',
  dzien: (d) => `nie znam dnia „${d}” (pon., wt., śr., czw., pt.)`,
  koniec: 'koniec dyżuru jest przed początkiem',
  kto: 'brak imienia i nazwiska tutora',
  data: 'zła data — wpisz ją jak 19.10.2026',
  doPrzedOd: '„Do” jest wcześniej niż „Od”',
  drugi: 'drugi blok :::grafik na tej stronie — strona pokazuje tylko pierwszy',
};
// wzór linii w ramce błędów i w ostrzeżeniu sprawdz_tresci.py
export const WZOR_LINII = '- pon. 12:15–14:00 **Imię Nazwisko** — przedmioty';

const dwa = (n) => String(n).padStart(2, '0');
function data(wart) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(wart) || /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(wart);
  if (!m) return undefined;
  const [r, mi, d] = m[1].length === 4 ? [+m[1], +m[2], +m[3]] : [+m[3], +m[2], +m[1]];
  const t = new Date(Date.UTC(r, mi - 1, d));
  if (t.getUTCFullYear() !== r || t.getUTCMonth() !== mi - 1 || t.getUTCDate() !== d) return undefined;
  return `${r}-${dwa(mi)}-${dwa(d)}`;
}
const minuty = (h, m) => (h > 24 || m > 59 ? NaN : h * 60 + m);

/** Linie wnętrza bloku (bez „:::grafik” i końcowych „:::”) → { dyzury, bledy, pola, pusty }.
 *  dyzury: [{ dz (0 = pon.), od, do (minuty od północy), kto, przedm, nr }], posortowane według dnia i godziny. */
export function parsujGrafik(linie) {
  const dyzury = [], bledy = [], pola = {};
  let kom = false, pusty = true;
  linie.forEach((L, i) => {
    const nr = i + 2; // „:::grafik” to linia 1
    let t = String(L).trim();
    if (kom) { if (t.includes('-->')) { kom = false; t = t.slice(t.indexOf('-->') + 3).trim(); } else return; }
    // komentarze także w środku linii (np. „Do: <!-- puste = koniec semestru -->”)
    t = t.replace(/<!--[\s\S]*?-->/g, '').trim();
    if (t.includes('<!--')) { kom = true; t = t.slice(0, t.indexOf('<!--')).trim(); }
    if (!t) return;
    pusty = false;
    const f = /^(sala|od|do)\s*:\s*(.*)$/i.exec(t);
    if (f) {
      const k = f[1].toLowerCase(), w = f[2].trim();
      if (k === 'sala') { if (w) pola.sala = w; return; }
      if (!w) return;
      const d = data(w);
      if (!d) bledy.push({ nr, tekst: t, powod: POWODY.data });
      else pola[k] = d;
      return;
    }
    if (!/^[-*+]\s+/.test(t)) { bledy.push({ nr, tekst: t, powod: POWODY.myslnik }); return; }
    const tr = t.replace(/^[-*+]\s+/, '');
    const m = /^([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+)\.?,?\s+(\d{1,2})(?:[:.](\d{2}))?\s*(?:[–—-]|do)\s*(\d{1,2})(?:[:.](\d{2}))?(?:\s+|$)(.*)$/.exec(tr);
    const od = m ? minuty(+m[2], +(m[3] || 0)) : NaN, d0 = m ? minuty(+m[4], +(m[5] || 0)) : NaN;
    if (!m || Number.isNaN(od) || Number.isNaN(d0)) { bledy.push({ nr, tekst: tr, powod: POWODY.godziny }); return; }
    const dz = DNI_GRAFIKU[m[1].toLowerCase()];
    if (dz === undefined) { bledy.push({ nr, tekst: tr, powod: POWODY.dzien(m[1]) }); return; }
    if (d0 <= od) { bledy.push({ nr, tekst: tr, powod: POWODY.koniec }); return; }
    const reszta = m[6].trim();
    let kto, przedm;
    const b = /^\*\*(.+?)\*\*\s*(.*)$/.exec(reszta);
    if (b) { kto = b[1].trim(); przedm = b[2]; }
    else if (/^[—–\-:,]/.test(reszta)) { kto = ''; przedm = reszta; } // od razu przedmioty: brak osoby
    else { const p = reszta.split(/\s+[—–-]\s+|:\s+/); kto = (p.shift() || '').trim(); przedm = p.join(', '); }
    przedm = przedm.replace(/^[\s—–\-:,]+/, '').trim();
    if (!kto) { bledy.push({ nr, tekst: tr, powod: POWODY.kto }); return; }
    dyzury.push({ dz, od, do: d0, kto, przedm, nr });
  });
  if (pola.od && pola.do && pola.do < pola.od) {
    bledy.push({ nr: linie.findIndex((l) => /^\s*do\s*:/i.test(l)) + 2, tekst: `Do: ${pola.do}`, powod: POWODY.doPrzedOd });
    delete pola.do;
  }
  dyzury.sort((a, b) => a.dz - b.dz || a.od - b.od || a.nr - b.nr);
  bledy.sort((a, b) => a.nr - b.nr);
  return { dyzury, bledy, pola, pusty };
}

/** Pierwszy blok :::grafik w tekście Markdownu (źródło strony): linie wnętrza i liczba bloków; bez bloku — undefined.
 *  Pomija bloki kodu (``` i ~~~), jak src/plugins/remark-jawne-bloki.mjs. */
export function blokGrafiku(md) {
  const linie = String(md ?? '').split(/\r?\n/);
  let fence, start = -1, dl = 0, wnetrze, ile = 0;
  for (let i = 0; i < linie.length; i++) {
    const L = linie[i];
    const code = /^\s*(`{3,}|~{3,})/.exec(L);
    if (code) { if (!fence) fence = code[1][0]; else if (fence === code[1][0]) fence = undefined; continue; }
    if (fence) continue;
    const s = /^(:{3,})grafik\b/.exec(L);
    if (s) { ile++; if (start < 0) { start = i; dl = s[1].length; } continue; }
    if (start >= 0 && !wnetrze) {
      const e = /^(:{3,})\s*$/.exec(L);
      if (e && e[1].length === dl) wnetrze = linie.slice(start + 1, i);
    }
  }
  if (start < 0) return undefined;
  return { linie: wnetrze ?? linie.slice(start + 1), linia: start + 1, ile };
}

/** Grafik z całego Markdownu (np. treść polska dla pustego bloku w wersji angielskiej); bez bloku — undefined. */
export function grafikZMarkdown(md) {
  const b = blokGrafiku(md);
  if (!b) return undefined;
  const w = parsujGrafik(b.linie);
  if (b.ile > 1) w.bledy.push({ nr: 1, tekst: ':::grafik', powod: POWODY.drugi });
  return w;
}

// ---------- odmiana i napisy ----------
export const odm = (n, f1, f2, f5) => {
  const d = n % 10, s = n % 100;
  return n === 1 ? f1 : d >= 2 && d <= 4 && (s < 12 || s > 14) ? f2 : f5;
};

/** Liczby do banera: różne osoby i liczba dyżurów w tygodniu. */
export function liczbyGrafiku(dyzury) {
  return { tutorzy: new Set(dyzury.map((x) => x.kto)).size, dyzury: dyzury.length };
}

const N = {
  pl: {
    dni: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'],
    dniM: ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'],
    dniKr: ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.'],
    dniPlanu: ['poniedziałku', 'wtorku', 'środy', 'czwartku', 'piątku'],
    mies: ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'],
    miesKr: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
  },
  en: {
    dni: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    dniM: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    dniKr: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    dniPlanu: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    mies: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    miesKr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
};
export const nazwyDni = (lang) => N[lang === 'en' ? 'en' : 'pl'];

// ---------- daty (napisy RRRR-MM-DD, bez stref czasowych) ----------
const dz = (s) => new Date(`${s}T12:00:00Z`);
export const dPlus = (s, k) => { const d = dz(s); d.setUTCDate(d.getUTCDate() + k); return d.toISOString().slice(0, 10); };
export const dTyg = (s) => (dz(s).getUTCDay() + 6) % 7; // 0 = poniedziałek
export const hm = (x) => `${Math.floor(x / 60)}:${dwa(x % 60)}`;
export const godziny = (x) => `${hm(x.od)}–${hm(x.do)}`;

/** Oś godzin planu (zlecenie 45, aktualizacja 18:33) — liczona sama z grafiku, nic nie ustawia się ręcznie:
 *  - zakres p–k: od najwcześniejszego początku do najpóźniejszego końca dyżuru w tygodniu (zaokrąglone w dół i w górę do `krok` minut);
 *  - etykiety i poziome linie na każdym różnym początku dyżuru, etykieta (bez linii) na końcu ostatniego (k);
 *  - luki: gdy między sąsiednimi etykietami (z końcem włącznie) jest ponad 90 min, w luce dochodzą pełne godziny z liniami,
 *    tylko te co najmniej 30 min od obu sąsiednich etykiet (9:00 → 12:15: 10:00 i 11:00, bez 12:00; 16:15 → 18:00: 17:00).
 *  Zwraca { p, k, linie, etykiety } (minuty od północy, rosnąco); pusty grafik — p = k = 0 i puste listy. */
export function osGodzin(dyzury, krok = 5) {
  if (!dyzury.length) return { p: 0, k: 0, linie: [], etykiety: [] };
  const p = Math.floor(Math.min(...dyzury.map((x) => x.od)) / krok) * krok;
  const k = Math.ceil(Math.max(...dyzury.map((x) => x.do)) / krok) * krok;
  const starty = [...new Set(dyzury.map((x) => x.od))].sort((a, b) => a - b);
  const punkty = [...starty, k];
  const pelne = [];
  for (let i = 0; i + 1 < punkty.length; i++) {
    const a = punkty[i], b = punkty[i + 1];
    if (b - a <= 90) continue;
    for (let h = (Math.floor(a / 60) + 1) * 60; h < b; h += 60) if (h - a >= 30 && b - h >= 30) pelne.push(h);
  }
  const linie = [...starty, ...pelne].sort((a, b) => a - b);
  return { p, k, linie, etykiety: [...linie, k] };
}
/** „19 października” / „19 October” (z rokiem: „19 października 2026”) */
export const dataSlownie = (s, lang, rok = false) => {
  const d = dz(s);
  return `${d.getUTCDate()} ${nazwyDni(lang).mies[d.getUTCMonth()]}${rok ? ` ${d.getUTCFullYear()}` : ''}`;
};
const dataKrotko = (s, lang) => { const d = dz(s); return `${d.getUTCDate()} ${nazwyDni(lang).miesKr[d.getUTCMonth()]}`; };

/** Dzień z perspektywy grafiku. kal: { od, do (RRRR-MM-DD albo ''), info(data) → dzień z kolory-dni ({ kolor, plan 1–5,
 *  wolne: { opis, opis_en } | null, zamiana }) albo null }. Dzień otwarty = dzień zajęć w zakresie Od–Do; dyżury dnia = dyżury
 *  dnia tygodnia, według którego planu są zajęcia (zamiana dni). */
export function dzienGrafiku(kal, s, lang = 'pl') {
  const t = dTyg(s);
  if (kal.od && s < kal.od) return { stan: 'przed', t };
  if (kal.do && s > kal.do) return { stan: 'po', t };
  const i = kal.info(s);
  if (i?.kolor && i.plan >= 1 && i.plan <= 5) return { stan: 'zajecia', t, plan: i.plan - 1, zamiana: !!i.zamiana && i.plan - 1 !== t };
  if (t > 4) return { stan: 'weekend', t };
  return { stan: 'wolne', t, nazwa: i?.wolne ? (lang === 'en' && i.wolne.opis_en) || i.wolne.opis || '' : '' };
}

/** Najbliższy dyżur od dnia now.data (tego dnia — zaczynający się po minucie poMin), najwyżej 200 dni naprzód. */
export function nastepnyDyzur(dyzury, kal, now, poMin, lang = 'pl') {
  for (let k = 0; k < 200; k++) {
    const s = dPlus(now.data, k), inf = dzienGrafiku(kal, s, lang);
    if (inf.stan === 'po') return null;
    if (inf.stan !== 'zajecia') continue;
    const lista = dyzury.filter((x) => x.dz === inf.plan && (k > 0 || x.od > poMin));
    if (lista.length) return { data: s, k, d: lista[0], dzien: inf };
  }
  return null;
}

const inicjaly = (kto) => kto.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
const wielka = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Stan „teraz” dla ramki nad treścią i kafelka Szybkiego dostępu. now: { data: RRRR-MM-DD, min: minuty od północy } (Europe/Warsaw).
 *  Wynik: typ (teraz | wkrotce | dzis | koniec | weekend | wolne | brak | przed | po), etykieta, tytul, opis, kolko (inicjały),
 *  pelne (kółko pełne: dyżur trwa), krotko (podpis kafelka), kropka (kropka przy podpisie), inf (dzień), dzisPlan (kolumna „dziś”). */
export function stanGrafiku(dyzury, kal, now, lang = 'pl') {
  const en = lang === 'en', T = (pl, a) => (en ? a : pl), D = nazwyDni(lang);
  const sala = kal.sala || '', salaT = sala ? T(`sala ${sala}`, `room ${sala}`) : '';
  const zSala = (s) => [s, salaT].filter(Boolean).join(' · ');
  const lacz = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')}${T(' i ', ' and ')}${a[a.length - 1]}`);
  const kiedy = (n) => n.k === 0 ? T('dziś', 'today') : n.k === 1 ? T(`jutro (${D.dniM[n.dzien.t]})`, `tomorrow (${D.dniM[n.dzien.t]})`)
    : `${D.dniM[n.dzien.t]}, ${dataSlownie(n.data, lang)}`;
  const inf = dzienGrafiku(kal, now.data, lang);
  const dzis = inf.stan === 'zajecia' ? dyzury.filter((x) => x.dz === inf.plan) : [];
  const tz = dzis.filter((x) => x.od <= now.min && now.min < x.do);
  const dalej = dzis.filter((x) => x.od > now.min);
  const minione = dzis.filter((x) => x.do <= now.min);
  const n = nastepnyDyzur(dyzury, kal, now, now.min, lang);
  const r = { inf, dzisPlan: inf.stan === 'zajecia' ? (inf.plan ?? -1) : -1, typ: '', etykieta: '', tytul: '', opis: '', kolko: '', pelne: false, krotko: '', kropka: false };
  const zaPrzedm = (x) => (x.przedm ? ` · ${x.przedm}` : '');
  if (tz.length) {
    const ost = Math.max(...tz.map((x) => x.do));
    const potem = nastepnyDyzur(dyzury, kal, now, ost - 1, lang);
    Object.assign(r, { typ: 'teraz', kolko: inicjaly(tz[0].kto), pelne: true, kropka: true });
    r.tytul = (tz.length > 1 ? T('Teraz dyżurują ', 'On duty now: ') : T('Teraz dyżuruje ', 'On duty now: ')) + lacz(tz.map((x) => x.kto));
    r.opis = `${zSala(T('Do ', 'Until ') + hm(ost) + (tz.length === 1 ? zaPrzedm(tz[0]) : ''))}.`
      + (potem ? (potem.k === 0 ? T(` Potem od ${hm(potem.d.od)}: ${potem.d.kto}.`, ` Then from ${hm(potem.d.od)}: ${potem.d.kto}.`)
        : T(` Następny dyżur: ${kiedy(potem)}, ${hm(potem.d.od)} — ${potem.d.kto}.`, ` Next session: ${kiedy(potem)}, ${hm(potem.d.od)} — ${potem.d.kto}.`)) : '');
    r.krotko = `${T('teraz', 'now')}: ${tz.length > 1 ? T(`${tz.length} ${odm(tz.length, 'tutor', 'tutorów', 'tutorów')}`, `${tz.length} tutors`) : tz[0].kto}, ${T('do', 'until')} ${hm(ost)}`;
  } else if (dalej.length && dalej[0].od - now.min <= 30) {
    const x = dalej[0];
    Object.assign(r, { typ: 'wkrotce', kolko: inicjaly(x.kto) });
    r.tytul = T('Za chwilę: ', 'Coming up: ') + x.kto;
    r.opis = `${zSala(T(`Od ${hm(x.od)} do ${hm(x.do)}`, `From ${hm(x.od)} to ${hm(x.do)}`) + zaPrzedm(x))}.`;
    r.krotko = T(`od ${hm(x.od)}: ${x.kto}`, `from ${hm(x.od)}: ${x.kto}`);
  } else if (dalej.length) {
    Object.assign(r, { typ: 'dzis', kolko: inicjaly(dalej[0].kto) });
    r.tytul = (minione.length ? T('Dziś jeszcze od ', 'Later today from ') : T('Dziś od ', 'Today from ')) + hm(dalej[0].od);
    r.opis = `${zSala(dalej.map((x) => `${godziny(x)} ${x.kto}`).join(' · '))}.`;
    r.krotko = zSala(T(`dziś od ${hm(dalej[0].od)}`, `today from ${hm(dalej[0].od)}`));
  } else {
    r.kolko = n ? inicjaly(n.d.kto) : '';
    const dalejTxt = n ? T(`Następny dyżur: ${kiedy(n)}, ${hm(n.d.od)} — ${n.d.kto}.`, `Next session: ${kiedy(n)}, ${hm(n.d.od)} — ${n.d.kto}.`)
      : T('Plan dyżurów na kolejny semestr jeszcze nie jest gotowy.', 'The schedule for the next semester is not ready yet.');
    if (inf.stan === 'przed') {
      r.typ = 'przed';
      r.tytul = T(`Tutornia rusza ${dataSlownie(kal.od, lang)}`, `The tutoring room opens on ${dataSlownie(kal.od, lang)}`);
      r.opis = n ? `${zSala(T(`Pierwszy dyżur: ${D.dniM[n.dzien.t]}, ${dataSlownie(n.data, lang)}, ${hm(n.d.od)} — ${n.d.kto}`,
        `First session: ${D.dniM[n.dzien.t]}, ${dataSlownie(n.data, lang)}, ${hm(n.d.od)} — ${n.d.kto}`))}.` : '';
    } else if (inf.stan === 'po') {
      r.typ = 'po';
      r.tytul = T('Dyżury w tym semestrze już się skończyły', 'Sessions for this semester have ended');
      r.opis = T('Plan na kolejny semestr pojawi się tutaj, gdy będzie gotowy.', 'The schedule for the next semester will appear here when it is ready.');
    } else if (inf.stan === 'wolne') {
      r.typ = 'wolne';
      r.tytul = T('Dziś tutornia nieczynna', 'The tutoring room is closed today');
      r.opis = (inf.nazwa ? `${wielka(inf.nazwa)}. ` : '') + dalejTxt;
    } else if (inf.stan === 'weekend') {
      r.typ = 'weekend';
      r.tytul = T('W weekend tutornia nie działa', 'The tutoring room is closed at weekends');
      r.opis = dalejTxt;
    } else if (dzis.length) {
      r.typ = 'koniec';
      r.tytul = T('Na dziś to wszystko', "That's all for today");
      r.opis = dalejTxt;
    } else {
      r.typ = 'brak';
      r.tytul = T('Dziś nie ma dyżurów', 'No sessions today');
      r.opis = dalejTxt;
    }
    if (inf.stan === 'po' || !n) r.krotko = salaT;
    else if (inf.stan === 'przed') r.krotko = T(`rusza ${dataKrotko(kal.od, lang)}`, `starts ${dataKrotko(kal.od, lang)}`);
    else if (inf.stan === 'wolne' && n.k > 1) r.krotko = T(`nieczynna, wraca ${dataKrotko(n.data, lang)}`, `closed, back ${dataKrotko(n.data, lang)}`);
    else r.krotko = zSala(`${n.k === 1 ? T('jutro', 'tomorrow') : D.dniKr[n.dzien.t]} ${T('od', 'from')} ${hm(n.d.od)}`);
  }
  r.etykieta = `${D.dni[inf.t]}, ${dataSlownie(now.data, lang, true)}, ${hm(now.min)}`;
  if (inf.zamiana) r.opis += T(` Dziś zajęcia według planu ${D.dniPlanu[inf.plan]}, więc dyżury też.`, ` Today classes follow the ${D.dniPlanu[inf.plan]} timetable, and so do the sessions.`);
  return r;
}

/** Czy dyżur już się w tym tygodniu odbył (przygaszony): wcześniejsze dni pn–pt i dzisiejsze dyżury z końcem ≤ teraz.
 *  W dzień zamiany „dziś” to dzień planu. W weekend, w przerwach i poza okresem grafiku nic (siatka pokazuje następny tydzień). */
export function minal(x, inf, now) {
  const wTygodniu = inf.stan === 'zajecia' || (inf.stan === 'wolne' && inf.t <= 4);
  if (!wTygodniu) return false;
  const dzisIdx = inf.stan === 'zajecia' ? inf.plan : inf.t;
  return x.dz < dzisIdx || (x.dz === dzisIdx && x.do <= now.min);
}

/** Dane do osadzenia w stronie (siatka i kafelek): dyżury bez numerów linii, zwięźle. */
export const daneDoSkryptu = (dyzury, kal) => ({ d: dyzury.map((x) => [x.dz, x.od, x.do, x.kto, x.przedm]), sala: kal.sala || '', od: kal.od || '', do: kal.do || '' });
export const zDanych = (dane) => ({ dyzury: (dane?.d ?? []).map(([dz, od, d0, kto, przedm], i) => ({ dz, od, do: d0, kto, przedm, nr: i })), sala: dane?.sala ?? '', od: dane?.od ?? '', do: dane?.do ?? '' });
