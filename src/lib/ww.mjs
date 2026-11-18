// „Warto wiedzieć” (zlecenie 47): czyste funkcje bez Astro — pole „Lata”, linie bloków :::w-skrocie i :::laureaci, powiązania
// z linków w Treści, odmiany, wybór stałym ziarnem, rozsuwanie punktów osi czasu, rocznice i wybór pozycji na stronę główną.
// Korzystają: src/lib/wartoWiedziec.ts (dane przy budowie), src/plugins/remark-jawne-bloki.mjs (sprawdzanie linii bloków),
// src/plugins/rehype-bloki.mjs (HTML bloków), skrypty w przeglądarce i testy (src/plugins/ww.test.mjs).
// Funkcje oznaczone „(przeglądarka)” trafiają do skryptów w linii przez Function.prototype.toString(), więc są samowystarczalne:
// bez importów i bez odwołań do innych funkcji modułu (wszystko, czego potrzebują, dostają w argumentach).

// ---------- pole „Lata” (wzór: parsuj_lata w prototypie, build.py) ----------
/**
 * Jedna data = rok urodzenia („1956”, „ur. 1956” → „ur. 1956”, EN „b. 1956”); dwie daty z dowolną kreską i spacjami → „1956–2020”;
 * inny tekst zostaje, jak wpisany (typ 'tekst' — ostrzeżenie „Lata: nie data”); puste → typ 'pusto'.
 * @returns {{ tekst: string, typ: 'urodzenie'|'zycie'|'tekst'|'pusto', rok?: number, liczba?: string }}
 */
export function parsujLata(s, lang = 'pl') {
  const t = String(s ?? '').trim();
  if (!t) return { tekst: '', typ: 'pusto' };
  const m = /^(?:(?:ur|b)\.?\s*)?(\d{4})(?:\s*[-–—]\s*(\d{4}))?$/i.exec(t);
  if (!m) return { tekst: t, typ: 'tekst' };
  if (m[2]) return { tekst: `${m[1]}–${m[2]}`, typ: 'zycie', rok: +m[1], liczba: `${m[1]}–${m[2]}` };
  return { tekst: lang === 'en' ? `b. ${m[1]}` : `ur. ${m[1]}`, typ: 'urodzenie', rok: +m[1], liczba: m[1] };
}

/** Rok urodzenia do kolejności sylwetek: pierwsza liczba 4-cyfrowa w polu „Lata”; brak = undefined (na koniec listy). */
export function rokZLat(s) {
  const m = /\d{4}/.exec(String(s ?? ''));
  return m ? +m[0] : undefined;
}

// ---------- odmiany ----------
/** Polska odmiana: 1 — f1, 2–4 (bez 12–14) — f2, reszta — f5. */
export const odm = (n, f1, f2, f5) => (n === 1 ? f1 : n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14) ? f2 : f5);
/** „22 źródła” / „22 sources”. */
export const zrodlaLicz = (n, lang = 'pl') => (lang === 'en' ? `${n} ${n === 1 ? 'source' : 'sources'}` : `${n} ${odm(n, 'źródło', 'źródła', 'źródeł')}`);
/** „3 laureatów z Instytutu” / „3 recipients from the Institute”. */
export const laureaciLicz = (n, lang = 'pl') =>
  (lang === 'en' ? `${n} ${n === 1 ? 'recipient' : 'recipients'} from the Institute` : `${n} ${odm(n, 'laureat', 'laureatów', 'laureatów')} z Instytutu`);

// ---------- linie bloków ----------
export const WZOR_W_SKROCIE = '- **1973** — doktorat w IM PAN';
export const WZOR_LAUREATA = '- **2026** Imię Nazwisko — [aktualność](/aktualnosci/…)';
const RE_W_SKROCIE = /^\s*[-*+]\s+\*\*(?!\s)(.+?)\*\*\s*[—–-]\s*(\S.*?)\s*$/;
const RE_LAUREAT = /^\s*[-*+]\s+\*\*(?!\s)([^*]+?)\*\*\s+(\S.*?)\s*$/;
/** Punkt „W skrócie”: `- **wartość** — podpis` (podpis: Markdown w jednej linii) → { wartosc, podpis } albo undefined (zła linia). */
export function liniaWSkrocie(linia) {
  const m = RE_W_SKROCIE.exec(String(linia ?? ''));
  return m ? { wartosc: m[1].trim(), podpis: m[2] } : undefined;
}
/** Punkt laureata: `- **rok** kto — reszta` (reszta opcjonalna) → { rok, kto, po } albo undefined (zła linia). */
export function liniaLaureata(linia) {
  const m = RE_LAUREAT.exec(String(linia ?? ''));
  if (!m) return undefined;
  const s = /^(.*?\S)\s+[—–-]\s+(\S.*)$/.exec(m[2]);
  return { rok: m[1].trim(), kto: s ? s[1] : m[2], po: s ? s[2] : '' };
}
/** Podpisy punktów „W skrócie”, które strona pomija, bo lata są w polu „Lata” (pokazane raz, pod portretem). */
export const PODPISY_LAT = new Set(['lata życia', 'rok urodzenia', 'urodzony', 'urodzona', 'years', 'born', 'year of birth', 'life']);
export const pomijanyPunkt = (wartosc, podpis, lata) =>
  PODPISY_LAT.has(String(podpis ?? '').replace(/<[^>]+>/g, '').replace(/[*_]/g, '').trim().toLowerCase()) || (!!lata && String(wartosc).trim() === lata);

/** Powód złej linii w ramce na Podglądzie. */
export const POWODY_WW = {
  'w-skrocie': `punkt ma mieć postać: ${WZOR_W_SKROCIE}`,
  laureaci: `punkt ma mieć postać: ${WZOR_LAUREATA}`,
};

const bezKomentarzy = (t) => String(t ?? '').replace(/<!--[\s\S]*?-->/g, '');
/** Linie wnętrza bloków o danej nazwie (poza komentarzami i blokami kodu): [[linia, …], …] — po jednej tablicy na blok. */
export function linieBlokow(md, nazwa) {
  const out = [];
  let biez, kod;
  for (const l of bezKomentarzy(md).replace(/\r\n/g, '\n').split('\n')) {
    const k = /^\s*(`{3,}|~{3,})/.exec(l);
    if (k) { kod = kod ? (kod === k[1][0] ? undefined : kod) : k[1][0]; if (biez) biez.push(l); continue; }
    if (kod) { if (biez) biez.push(l); continue; }
    if (!biez && new RegExp(`^:{3,}${nazwa}\\s*(\\{.*\\})?\\s*$`).test(l)) { biez = []; continue; }
    if (biez && /^:{3,}\s*$/.test(l)) { out.push(biez); biez = undefined; continue; }
    if (biez) biez.push(l);
  }
  return out;
}
/** Liczba poprawnych punktów we wszystkich blokach :::laureaci (licznik „N laureatów z Instytutu”). */
export const liczLaureatow = (md) => linieBlokow(md, 'laureaci').flat().filter((l) => liniaLaureata(l)).length;
/** Czy Treść ma blok :::laureaci (taki wpis nie losuje się na stronie głównej). */
export const maBlokLaureatow = (md) => linieBlokow(md, 'laureaci').length > 0;

// ---------- liczby w banerze sylwetki (zlecenie 52) ----------
/**
 * Krótki tekst z Markdownu jednej linii: bez linków (zostaje ich tekst), znaczników HTML i wyróżnień; gdy dłuższy niż `limit`
 * znaków — całe słowa do `limit` i „…” (wzór: utnij() w prototypie 52, buduj.py). Podpisy zapasu z :::w-skrocie są długie.
 */
export function krotkiTekst(md, limit = Infinity) {
  const s = String(md ?? '').replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, '').replace(/[*`]/g, '')
    .replace(/(^|\s)_+|_+(?=\s|$|[.,;:!?])/g, '$1').replace(/\s+/g, ' ').trim();
  if (s.length <= limit) return s;
  let out = '';
  for (const w of s.split(' ')) {
    if (`${out} ${w}`.trim().length > limit) break;
    out = `${out} ${w}`.trim();
  }
  return `${(out || s.slice(0, limit - 1)).replace(/[,;:—–-]+$/, '').trim()}…`;
}
/**
 * Liczby do banera sylwetki: pole „Liczby” (pozycje z liczbą i podpisem; puste pozycje pominięte), a gdy w nim nic nie ma —
 * zapas dla starych plików: punkty pierwszego bloku :::w-skrocie Treści polskiej (bez linków, podpis do 20 znaków, bez punktu
 * z latami życia, jak w treści do zlecenia 52). Pokazują się pierwsze 3.
 * @param {{ n?: unknown, n_en?: unknown, etykieta?: unknown, etykieta_en?: unknown }[] | undefined} liczby pole „Liczby”
 * @param {string | undefined} md Treść polska
 * @param {string | undefined} lata liczba z pola „Lata” (parsujLata().liczba)
 * @returns {{ pozycje: { n: string, n_en?: string, pl: string, en?: string }[], zrodlo: 'pole' | 'w-skrocie' | 'brak', wszystkich: number, blok: boolean }}
 *   wszystkich — ile pozycji było (przed obcięciem do 3); blok — czy Treść ma blok :::w-skrocie
 */
export function liczbySylwetki(liczby, md, lata) {
  const t = (v) => String(v ?? '').trim();
  const blok = linieBlokow(md, 'w-skrocie').length > 0;
  const pole = (Array.isArray(liczby) ? liczby : []).filter((x) => t(x?.n) && t(x?.etykieta))
    .map((x) => ({ n: t(x.n), n_en: t(x.n_en) || undefined, pl: t(x.etykieta), en: t(x.etykieta_en) || undefined }));
  if (pole.length) return { pozycje: pole.slice(0, 3), zrodlo: 'pole', wszystkich: pole.length, blok };
  const pkt = (linieBlokow(md, 'w-skrocie')[0] ?? []).map(liniaWSkrocie)
    .filter((p) => p && !pomijanyPunkt(krotkiTekst(p.wartosc), krotkiTekst(p.podpis), lata))
    .map((p) => ({ n: krotkiTekst(p.wartosc), pl: krotkiTekst(p.podpis, 20) }));
  return pkt.length ? { pozycje: pkt.slice(0, 3), zrodlo: 'w-skrocie', wszystkich: pkt.length, blok } : { pozycje: [], zrodlo: 'brak', wszystkich: 0, blok };
}
/** FNV-1a 32 bit po bajtach UTF-8 (figurka bez JS na stronie sylwetki: pula[fnv1a(nazwa pliku) % długość puli]; wzór: zmiany.md 52, pkt 2). */
export function fnv1a(s) {
  let h = 0x811c9dc5;
  for (const b of new TextEncoder().encode(String(s))) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}

// ---------- adresy ----------
/**
 * Adres wpisu jest płaski (/instytut/warto-wiedziec/<plik>), więc nazwa pliku musi być unikalna we wszystkich trzech grupach.
 * wpisy: [{ slug, … }] w kolejności grup (sylwetki, nagrody, historie); pierwszy wygrywa, kolejne z tą samą nazwą wypadają.
 * @returns {{ wpisy: any[], duplikaty: { slug: string, pominiety: any, zostaje: any }[] }}
 */
export function bezDuplikatow(wpisy) {
  const pierwszy = new Map();
  const duplikaty = [];
  const out = [];
  for (const w of wpisy) {
    const z = pierwszy.get(w.slug);
    if (z) { duplikaty.push({ slug: w.slug, pominiety: w, zostaje: z }); continue; }
    pierwszy.set(w.slug, w);
    out.push(w);
  }
  return { wpisy: out, duplikaty };
}

// ---------- powiązania ----------
/** Pliki „Warto wiedzieć”, do których Treść linkuje: [tekst](/instytut/warto-wiedziec/<plik>) — także z /en, z kotwicą albo ukośnikiem. */
export function linkiDoWW(md) {
  const out = new Set();
  const re = /\]\(\s*(?:https?:\/\/[^)\s/]+(?:\/Web-[A-Za-z]+)?)?(?:\/en)?\/instytut\/warto-wiedziec\/([a-z0-9][a-z0-9-]*)\/?(?:#[^)\s]*)?\s*\)/g;
  for (const m of bezKomentarzy(md).matchAll(re)) out.add(m[1]);
  return out;
}

// ---------- stałe ziarno ----------
/** Liczba z tekstu (FNV-1a), ziarno losowania. */
export function ziarno(tekst) {
  let h = 2166136261;
  for (const c of String(tekst)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
/** n pozycji wybranych stałym ziarnem (ten sam wynik przy każdej budowie; inne ziarno — inny wybór). Kolejność listy zostaje. */
export function wybierzZZiarnem(lista, z, n) {
  let s = (typeof z === 'number' ? z : ziarno(z)) || 1;
  const los = () => { s = (Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5) >>> 0; return (s >>> 0) / 4294967296; };
  const idx = lista.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(los() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const wyb = new Set(idx.slice(0, n));
  return lista.filter((_, i) => wyb.has(i));
}

// ---------- daty (Europe/Warsaw) ----------
/** Dzisiejsza data w Warszawie „RRRR-MM-DD” (przeglądarka). */
export function dzisWarszawa(teraz = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(teraz);
}
/**
 * Rocznica „MM-DD” w ±7 dni od dnia „RRRR-MM-DD” (także na przełomie roku): { roznica, rok } — rok tej rocznicy — albo undefined (przeglądarka).
 */
export function rocznicaBlisko(mmdd, dzis, dni = 7) {
  const m = /^(\d{2})-(\d{2})$/.exec(mmdd || '');
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dzis || '');
  if (!m || !d) return undefined;
  const t = Date.UTC(+d[1], +d[2] - 1, +d[3]);
  let best;
  for (const r of [+d[1] - 1, +d[1], +d[1] + 1]) {
    const roz = Math.round((Date.UTC(r, +m[1] - 1, +m[2]) - t) / 864e5);
    if (Math.abs(roz) <= dni && (!best || Math.abs(roz) < Math.abs(best.roznica))) best = { roznica: roz, rok: r };
  }
  return best;
}
/** Czy data „Dodano” („RRRR-MM-DD”) jest w ostatnich 30 dniach (0–30 dni temu) względem dnia „RRRR-MM-DD” (przeglądarka). */
export function nowe(dodano, dzis, dni = 30) {
  const a = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dodano || '');
  const b = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dzis || '');
  if (!a || !b) return false;
  const roz = (Date.UTC(+b[1], +b[2] - 1, +b[3]) - Date.UTC(+a[1], +a[2] - 1, +a[3])) / 864e5;
  return roz >= 0 && roz <= dni;
}

// ---------- oś czasu (przeglądarka) ----------
/**
 * Rozsuwanie punktów osi: x (rosnąco, px), najmniejszy odstęp gap; punkty za blisko siebie rozchodzą się symetrycznie,
 * w granicach [lo, hi]. Zwraca nową tablicę.
 */
export function rozsun(x, gap, lo, hi) {
  const p = x.slice();
  const n = p.length;
  if (!n) return p;
  // gdy wszystkie punkty nie mieszczą się z pełnym odstępem — odstęp tyle, ile się da
  const g = n > 1 ? Math.min(gap, (hi - lo) / (n - 1)) : gap;
  for (let it = 0; it < 1000; it++) {
    let ok = true;
    for (let i = 1; i < n; i++) {
      const d = g - (p[i] - p[i - 1]);
      if (d > 0.01) { ok = false; p[i - 1] -= d / 2; p[i] += d / 2; }
    }
    for (let i = 0; i < n; i++) {
      if (p[i] < lo) { p[i] = lo; ok = false; }
      if (p[i] > hi) { p[i] = hi; ok = false; }
    }
    if (ok) break;
  }
  return p;
}

/**
 * Pozycja startowa osi: wydarzenie z rocznicą w ±7 dni od dziś (najbliższe), a bez takiego — najstarsze (0).
 * rocznice: ['MM-DD' | '', …] w kolejności punktów; rocznicaBlisko — funkcja wyżej (przekazana, bo skrypt jest w linii).
 */
export function startOsi(rocznice, dzis, rocznicaBlisko) {
  let best = -1, roz = 99;
  rocznice.forEach((r, i) => { const b = rocznicaBlisko(r, dzis); if (b && Math.abs(b.roznica) < roz) { roz = Math.abs(b.roznica); best = i; } });
  return best < 0 ? 0 : best;
}

// ---------- strona główna: rząd „Warto wiedzieć” (wzór: GLOWNA_JS w prototypie; przeglądarka) ----------
/**
 * Wybór n pozycji: 1) rocznica w ±7 dni (napis), 2) „Zawsze pokazuj”, 3) najnowsza z „Dodano” w ostatnich 30 dniach (napis „nowe”),
 * 4) reszta losowana z wagami (ulubione ×3), bez powtórzeń.
 * poz: [{ rocznica: 'MM-DD'|'', rok: number|0, zawsze: bool, dodano: 'RRRR-MM-DD'|'', waga: number }]
 * pom: { rocznicaBlisko, nowe } — funkcje wyżej (przekazane, bo skrypt jest w linii); los — () => [0, 1).
 * Wynik: [{ i, napis?: { typ: 'rocznica', lat, mies, dzien } | { typ: 'nowe' } }] w kolejności wyświetlania.
 */
export function wybierzNaGlowna(poz, dzis, n, pom, los) {
  const wyb = [];
  const uzyte = new Set();
  const dodaj = (i, napis) => { if (uzyte.has(i) || wyb.length >= n) return; uzyte.add(i); wyb.push(napis ? { i, napis } : { i }); };
  const rocz = [];
  poz.forEach((p, i) => {
    if (!p.rocznica || !p.rok) return;
    const b = pom.rocznicaBlisko(p.rocznica, dzis);
    if (b) rocz.push({ i, roz: Math.abs(b.roznica), napis: { typ: 'rocznica', lat: b.rok - p.rok, mies: +p.rocznica.slice(0, 2), dzien: +p.rocznica.slice(3) } });
  });
  rocz.sort((a, b) => a.roz - b.roz).forEach((r) => dodaj(r.i, r.napis));
  poz.forEach((p, i) => { if (p.zawsze) dodaj(i); });
  const nw = poz.map((p, i) => ({ p, i })).filter(({ p }) => pom.nowe(p.dodano, dzis)).sort((a, b) => (a.p.dodano < b.p.dodano ? 1 : a.p.dodano > b.p.dodano ? -1 : 0));
  if (nw[0]) dodaj(nw[0].i, { typ: 'nowe' });
  const pula = poz.map((_, i) => i).filter((i) => !uzyte.has(i));
  while (wyb.length < n && pula.length) {
    const suma = pula.reduce((a, i) => a + (poz[i].waga || 1), 0);
    let r = los() * suma, k = 0;
    for (; k < pula.length - 1; k++) { r -= poz[pula[k]].waga || 1; if (r < 0) break; }
    const i = pula.splice(k, 1)[0];
    dodaj(i, pom.nowe(poz[i].dodano, dzis) ? { typ: 'nowe' } : undefined);
  }
  return wyb;
}

/** Napis nad tytułem w rzędzie strony głównej: „140. urodziny · 14 stycznia”, „81 lat temu · 15 listopada”, „Nowa sylwetka” (przeglądarka). */
export function napisNaGlowna(napis, urodziny, sylwetka, lang) {
  if (!napis) return '';
  const en = lang === 'en';
  if (napis.typ === 'nowe') return en ? (sylwetka ? 'New profile' : 'New') : (sylwetka ? 'Nowa sylwetka' : 'Nowe');
  const MPL = ['', 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
  const MEN = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const n = napis.lat;
  if (en) {
    const sfx = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
    return (urodziny ? `${n}${sfx} birthday` : `${n} ${n === 1 ? 'year' : 'years'} ago`) + ` · ${napis.dzien} ${MEN[napis.mies]}`;
  }
  const lat = n === 1 ? 'rok' : n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14) ? 'lata' : 'lat';
  return (urodziny ? `${n}. urodziny` : `${n} ${lat} temu`) + ` · ${napis.dzien} ${MPL[napis.mies]}`;
}
