// Zlecenie 31, etap 4: symulacja formularza Pages CMS — wczytanie wpisu, zmiany redaktora, sprawdzenie (czerwone komunikaty)
// i zapis do pliku, bez przeglądarki. Logika przeniesiona z Pages CMS (github.com/pages-cms/pages-cms, gałąź main, licencja MIT):
// lib/schema.ts (initializeState, getDefaultValue, isEffectivelyEmpty, generateZodSchema, sanitizeObject, generateFilename),
// fields/core/*/index.ts (schematy pól, read/write dat), lib/serialization.ts (YAML przez bibliotekę „yaml”),
// app/api/.../files/[path]/route.ts (sprawdzenie i zapis po stronie serwera), components/entry/entry.tsx (nazwa pliku).
// Uproszczenia: obrazy i pliki bez zamiany przedrostka ścieżki (read/write dają tę samą wartość), slugify tylko z polskimi literami.
//
// Uruchomienie:  node skrypty/test-edytora/formularz.mjs <katalog z klonami Web-*> [<katalog ze starymi klonami>]
// Drugi katalog (opcjonalnie): te same scenariusze na starej konfiguracji — dla porównania (jak było przed zleceniem 31).
// Zlecenie 33: scenariusz 8 — przełącznik „Opublikowane” (stara strona bez pola, nowa strona, odznaczenie) w 12 formularzach.
// Zlecenie 44: scenariusz 9 — grupa „Termin zgłoszeń” w aktualnościach (oferty „Kariera”).
// Zlecenie 47: scenariusz 10 — „Warto wiedzieć”: nowa sylwetka z szablonu (nazwa pliku, TBA, „Dodano”), rok historii, dopisanie laureata.
// Zlecenie 48: scenariusz 11 — przełącznik „Opublikowane” w Aktualnościach, opisie seminarium i Referatach (9 × Web-Sem-*).
// Zlecenie 49: scenariusz 12 — rodzaj „Seminarium wydziałowe” w Aktualnościach. Zlecenie 54 cofnęło 49: scenariusz 12 sprawdza, że
//   „Rodzaj” ma opcje Ogłoszenie, Wydarzenie, Sukces, Kariera, opisy nie wspominają seminarium, a dwa wpisy o seminarium
//   wydziałowym (rodzaj „Wydarzenie”) otwarte i zapisane bez zmian dają pusty diff.
// Zlecenie 52: scenariusz 13 — pole „Liczby w banerze” w Sylwetkach (zapis bez zmian, zmiana liczby, pusty podpis, szablon).
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { z } from 'zod/v3';
import { liczLaureatow } from '../../src/lib/ww.mjs';

// ---------- pola (fields/core) ----------
const fmt = (d, wzor) => {
  const p = (n) => String(n).padStart(2, '0');
  const s = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  return wzor.includes('HH') ? `${s}T${p(d.getHours())}:${p(d.getMinutes())}` : s;
};
const wzorDaty = (f) => (f?.options?.time ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd');
const poprawnaData = (v, wzor) => (wzor.includes('HH') ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/ : /^\d{4}-\d{2}-\d{2}$/).test(v);
const tekstowy = (field) => {
  let s = z.string();
  if (field.required) s = s.min(1, 'This field is required');
  if (field.pattern) {
    s = typeof field.pattern === 'string' ? s.regex(new RegExp(field.pattern), 'Invalid format')
      : s.regex(new RegExp(field.pattern.regex), field.pattern.message || 'Invalid pattern format');
  }
  return s;
};
const plikowy = (field) => z.string().optional().nullable().superRefine((d, ctx) => {
  if (field.required && (d == null || d === '')) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'This field is required' });
});
const POLA = {
  string: { schema: tekstowy }, text: { schema: tekstowy }, code: { schema: tekstowy },
  'rich-text': { schema: tekstowy },
  boolean: { schema: () => z.coerce.boolean(), defaultValue: false },
  number: { schema: (f) => z.literal('').refine(() => !f.required, { message: 'This field is required' }).or(z.coerce.number()) },
  image: { schema: plikowy, defaultValue: (f) => (f.options?.multiple ? [] : '') },
  file: { schema: plikowy, defaultValue: (f) => (f.options?.multiple ? [] : '') },
  select: {
    schema: (f) => {
      const wart = (f.options?.values ?? []).map((i) => (typeof i === 'object' ? String(i.value ?? i.name ?? '') : String(i)));
      const opcja = z.string().refine((v) => wart.includes(v), { message: 'Invalid option' });
      if (f.options?.multiple) {
        let s = z.array(opcja);
        if (f.required) s = s.min(1, 'This field is required');
        return z.preprocess((v) => (v === '' || v == null ? [] : Array.isArray(v) ? v.map(String) : v), s);
      }
      return z.preprocess((v) => (v == null ? '' : v), f.required ? opcja : z.union([z.literal(''), opcja]).optional());
    },
  },
  reference: {
    schema: (f) => {
      const jeden = z.preprocess((v) => (v == null || v === '' ? '' : typeof v === 'object' && 'value' in v ? String(v.value ?? '') : String(v)), z.string());
      if (f.options?.multiple) {
        let s = z.array(jeden.refine((v) => v.length > 0, { message: 'Invalid reference' }));
        if (f.required) s = s.min(1, 'This field is required');
        return z.preprocess((v) => (v === '' || v == null ? [] : Array.isArray(v) ? v : [v]), s);
      }
      return z.preprocess((v) => (v == null ? '' : v),
        f.required ? jeden.refine((v) => v.length > 0, { message: 'This field is required' }) : z.union([z.literal(''), jeden]).optional());
    },
  },
  date: {
    defaultValue: (f) => fmt(new Date(), wzorDaty(f)),
    // read: z pliku do formularza (format zapisu → format pola); write: odwrotnie
    read: (v, f) => {
      if (!v) return '';
      const s = String(v instanceof Date ? v.toISOString().slice(0, 16) : v);
      const zapis = f.options?.format || wzorDaty(f);
      if (zapis === wzorDaty(f) && poprawnaData(s, zapis)) return s;
      if (zapis === 'yyyy-MM-dd' && /^\d{4}-\d{2}-\d{2}$/.test(s)) return f.options?.time ? `${s}T00:00` : s;
      console.warn(`  (CMS: Invalid date for field ${f.name}: "${s}" does not match format "${zapis}")`);
      return '';
    },
    write: (v, f) => (poprawnaData(String(v ?? ''), wzorDaty(f)) ? String(v) : ''),
    schema: (f) => z.string().refine((v) => (!v ? !f.required : poprawnaData(v, wzorDaty(f))), 'Invalid date'),
  },
};

// ---------- lib/schema.ts ----------
function deepMap(obj, fields, apply) {
  const traverse = (data, schema) => {
    const wynik = {};
    const dane = data || {};
    for (const field of schema) {
      const v = dane[field.name];
      if (field.list) {
        wynik[field.name] = v === undefined ? apply(v, field)
          : Array.isArray(v) ? v.map((x) => (field.type === 'object' ? traverse(x, field.fields || []) : apply(x, field))) : [];
      } else if (field.type === 'object') wynik[field.name] = traverse(v, field.fields || []);
      else wynik[field.name] = apply(v, field);
    }
    return wynik;
  };
  return traverse(obj, fields);
}
function getDefaultValue(field) {
  if (field.default !== undefined) return field.default;
  if (field.type === 'object') return initializeState(field.fields, {});
  const d = POLA[field.type]?.defaultValue;
  return typeof d === 'function' ? d(field) : d !== undefined ? d : '';
}
function initializeState(fields, obj = {}) {
  if (!fields) return {};
  return deepMap(obj || {}, fields, (v, field) => {
    if (v === undefined) return field.list ? (typeof field.list === 'object' && field.list.default !== undefined ? field.list.default : []) : getDefaultValue(field);
    if (v === null && field.type !== 'object' && !field.list) return getDefaultValue(field);
    return v;
  });
}
function isEffectivelyEmpty(v) {
  if (v == null || v === '') return true;
  if (Array.isArray(v)) return v.length === 0 || v.every(isEffectivelyEmpty);
  if (v instanceof Date) return false;
  if (typeof v === 'object') { const e = Object.values(v); return e.length === 0 || e.every(isEffectivelyEmpty); }
  return false;
}
function generateZodSchema(fields) {
  const zbuduj = (pola) => Object.fromEntries(pola.map((field) => {
    let s;
    if (field.type === 'object') {
      const o = z.object(zbuduj(field.fields || []));
      s = field.required ? o : z.preprocess((v) => (isEffectivelyEmpty(v) ? undefined : v), o.optional());
    } else s = (POLA[field.type]?.schema ?? tekstowy)(field);
    if (field.list) {
      let a = z.array(s);
      if (typeof field.list === 'object') {
        if (field.list.min > 0) a = a.min(field.list.min);
        if (field.list.max > 0) a = a.max(field.list.max);
      }
      s = field.required ? a.min(1, { message: 'Field requires at least one item.' }) : a.optional();
    } else if (!field.required) s = s.optional();
    return [field.name, s];
  }));
  return z.object(zbuduj(fields));
}
function sanitizeObject(o) {
  const pusta = (v) => v == null || v === '';
  if (Array.isArray(o)) return o.map((v) => (v && typeof v === 'object' ? sanitizeObject(v) : v)).filter((v) => !pusta(v));
  if (o && typeof o === 'object') {
    const k = { ...o };
    for (const key of Object.keys(k)) {
      if (k[key] && typeof k[key] === 'object') k[key] = sanitizeObject(k[key]);
      if ((Array.isArray(k[key]) && k[key].every(pusta)) || (typeof k[key] === 'object' && !Array.isArray(k[key]) && k[key] != null
        && !Object.keys(k[key]).length) || pusta(k[key])) delete k[key];
    }
    return k;
  }
  return o;
}
const PL = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z', Ą: 'A', Ć: 'C', Ę: 'E', Ł: 'L', Ń: 'N', Ó: 'O', Ś: 'S', Ź: 'Z', Ż: 'Z' };
const slugify = (s) => [...s.normalize()].map((c) => (PL[c] ?? c)).join('').replace(/[^\w\s$*_+~.()'"!\-:@]+/g, '')
  .replace(/[^A-Za-z0-9\s]/g, '').trim().replace(/\s+/g, '-').toLowerCase();
function generateFilename(wzor, schema, stan) {
  const t = new Date();
  const p = (n) => String(n).padStart(2, '0');
  wzor = wzor.replace(/\{year\}/g, t.getFullYear()).replace(/\{month\}/g, p(t.getMonth() + 1)).replace(/\{day\}/g, p(t.getDate()));
  wzor = wzor.replace(/\{primary\}/g, `{fields.${schema.view?.primary}}`);
  return wzor.replace(/\{(?:fields\.)?([^}]+)\}/g, (_, n) => (stan[n] ? slugify(String(stan[n])) : ''));
}

// ---------- wczytanie i zapis (serialization.ts, entries/[path]/route.ts, files/[path]/route.ts) ----------
// format jak w lib/config.ts: jawny „format” w .pages.yml, inaczej z rozszerzenia pliku
const formatPliku = (form, plik) => form.format
  || ({ json: 'json', yml: 'yaml', yaml: 'yaml', toml: 'toml' }[path.extname(plik || form.path || '').slice(1)] ?? 'yaml-frontmatter');
function wczytajPlik(tekst, form, plik) {
  const format = formatPliku(form, plik);
  let dane;
  if (format === 'json') dane = tekst.trim() ? JSON.parse(tekst) : {};
  else if (format === 'yaml') dane = tekst.trim() ? YAML.parse(tekst, { strict: false, uniqueKeys: false }) || {} : {};
  else {
    const m = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/.exec(tekst);
    dane = m ? { ...(m[1].trim() ? YAML.parse(m[1], { strict: false, uniqueKeys: false }) || {} : {}), body: (m[2] || '').replace(/^\r?\n/, '') } : { body: tekst };
  }
  return deepMap(dane, form.fields, (v, f) => (POLA[f.type]?.read ? POLA[f.type].read(v, f) : v));
}
// formularz: stan po otwarciu (entry-form.tsx: initializeState(fields, sanitizeObject(contentObject)))
const otworz = (form, tekst, plik) => initializeState(form.fields, sanitizeObject(tekst == null ? {} : wczytajPlik(tekst, form, plik)));
function bledy(wynik) {
  return wynik.success ? [] : wynik.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
}
// zapis: sprawdzenie w przeglądarce (zodResolver) → wysłanie → sprawdzenie na serwerze → write → sanitize → YAML/JSON
function zapisz(form, stan, plik = 'nowy.md') {
  const schemat = generateZodSchema(form.fields);
  const klient = schemat.safeParse(stan);
  if (!klient.success) return { bledy: bledy(klient) };
  const wyslane = JSON.parse(JSON.stringify(klient.data));
  const serwer = schemat.safeParse(wyslane);
  if (!serwer.success) return { bledy: bledy(serwer) };
  const zapisane = JSON.parse(JSON.stringify(deepMap(serwer.data, form.fields, (v, f) => (POLA[f.type]?.write ? POLA[f.type].write(v, f) : v))));
  const czyste = sanitizeObject(zapisane);
  const format = formatPliku(form, plik);
  if (format === 'json') return { bledy: [], tekst: Object.keys(czyste).length ? JSON.stringify(czyste, null, 2) : '', dane: czyste };
  if (format === 'yaml') return { bledy: [], tekst: Object.keys(czyste).length ? YAML.stringify(czyste) : '', dane: czyste };
  const { body = '', ...fm } = czyste;
  const yamlTekst = Object.keys(fm).length ? YAML.stringify(fm).trim() + '\n' : '';
  return { bledy: [], tekst: `---\n${yamlTekst}---\n${body}`, dane: czyste };
}

// ---------- scenariusze ----------
const konfiguracja = (kat, repo) => YAML.parse(fs.readFileSync(path.join(kat, repo, '.pages.yml'), 'utf8'));
const formularz = (konf, nazwa) => {
  const szukaj = (lista) => { for (const c of lista || []) { if (c.name === nazwa) return c; const g = szukaj(c.items); if (g) return g; } };
  const f = szukaj(konf.content);
  if (f.filename && typeof f.filename === 'object') { f.filenameField = f.filename.field; f.filename = f.filename.template; }
  return f;
};
let problemy = 0;
const sprawdz = (warunek, opis) => { console.log(`  ${warunek ? 'OK ' : 'ŹLE'} ${opis}`); if (!warunek) problemy++; };
const pokaz = (w) => (w.bledy.length ? `zapis zablokowany: ${w.bledy.join('; ')}` : `zapisano:\n${w.tekst.split('\n').map((l) => '      | ' + l).join('\n')}`);

function scenariusze(kat, nazwaKonf, nowa) {
  const form = formularz(konfiguracja(kat, 'Web-Aktualnosci'), 'aktualnosci');
  console.log(`\n===== ${nazwaKonf} =====`);
  const nowy = (zmiany) => Object.assign(otworz(form, null), { tytul: 'Medale Uniwersytetu dla profesorów — test', body: 'Treść.' }, zmiany);
  const pustyTermin = () => initializeState(form.fields.find((f) => f.name === 'termin')?.fields, {});

  console.log('1. Nowy wpis bez terminu');
  let w = zapisz(form, nowy({}));
  console.log('   ' + pokaz(w));
  if (nowa) sprawdz(!w.bledy.length && !/termin|wydarzenie_/.test(w.tekst), 'w pliku nie ma terminu ani dat wydarzenia');

  if (nowa) {
    console.log('2. „Add an item” w terminie i zapis bez wypełnienia');
    w = zapisz(form, nowy({ termin: [pustyTermin()] }));
    console.log('   ' + pokaz(w));
    sprawdz(w.bledy.some((b) => b.startsWith('termin.0.dzien')), 'czerwone przy „Dzień”, zapis zablokowany');

    console.log('3a. Sam dzień');
    w = zapisz(form, nowy({ termin: [{ ...pustyTermin(), dzien: '2026-12-02' }] }));
    console.log('   ' + pokaz(w));
    sprawdz(!w.bledy.length && /dzien: 2026-12-02/.test(w.tekst) && !/godzina/.test(w.tekst), 'zapisany termin całodniowy (bez godziny)');
    console.log('3b. Godzina „9.30”');
    w = zapisz(form, nowy({ termin: [{ ...pustyTermin(), dzien: '2026-12-02', godzina: '9.30' }] }));
    console.log('   ' + pokaz(w));
    sprawdz(!w.bledy.length && /godzina: "9\.30"/.test(w.tekst), 'przyjęta (strona: 09:30 — test budowy w raporcie)');
    console.log('3c. Godzina „25:00”');
    w = zapisz(form, nowy({ termin: [{ ...pustyTermin(), dzien: '2026-12-02', godzina: '25:00' }] }));
    console.log('   ' + pokaz(w));
    sprawdz(w.bledy.includes('termin.0.godzina: Wpisz godzinę w formacie 13:00'), 'czerwone „Wpisz godzinę w formacie 13:00”');
    console.log('3d. Drugi termin (przycisk „Add an item” znika przy 1 pozycji; gdyby jednak)');
    w = zapisz(form, nowy({ termin: [{ ...pustyTermin(), dzien: '2026-12-02' }, { ...pustyTermin(), dzien: '2026-12-03' }] }));
    sprawdz(w.bledy.length > 0, `zablokowany: ${w.bledy.join('; ')}`);
  }

  const galeria = form.fields.find((f) => f.name === 'galeria');
  const pustaGaleria = () => initializeState(galeria.fields, {});
  console.log('4a. „Add an item” w galerii bez zdjęcia');
  w = zapisz(form, nowy({ galeria: [pustaGaleria()] }));
  console.log('   ' + pokaz(w));
  if (nowa) sprawdz(w.bledy.includes('galeria.0.plik: This field is required'), 'czerwone przy „Zdjęcie”, zapis zablokowany');
  console.log('4b. Pozycja galerii z samym podpisem');
  w = zapisz(form, nowy({ galeria: [{ ...pustaGaleria(), podpis: 'Sam podpis' }] }));
  console.log('   ' + pokaz(w));
  if (nowa) sprawdz(w.bledy.includes('galeria.0.plik: This field is required'), 'czerwone przy „Zdjęcie”, zapis zablokowany');
  console.log('4c. Galeria ze zdjęciem');
  w = zapisz(form, nowy({ galeria: [{ ...pustaGaleria(), plik: 'public/pliki/aktualnosci/mb.jpeg' }] }));
  if (nowa) sprawdz(!w.bledy.length && /pozycja: false/.test(w.tekst), 'zapisana; w pliku „pozycja: false”');
  const zal = form.fields.find((f) => f.name === 'zalaczniki');
  console.log('4d. „Add an item” w załącznikach bez pliku');
  w = zapisz(form, nowy({ zalaczniki: [initializeState(zal.fields, {})] }));
  console.log('   ' + pokaz(w));
  if (nowa) sprawdz(w.bledy.includes('zalaczniki.0.plik: This field is required'), 'czerwone przy „Plik”, zapis zablokowany');

  console.log('5. Stary wpis bez terminu (2026-10-17-rusza-tutornia.md) otwarty i zapisany bez zmian');
  const plik5 = path.join(kat, 'Web-Aktualnosci/src/content/aktualnosci/2026-10-17-rusza-tutornia.md');
  w = zapisz(form, otworz(form, fs.readFileSync(plik5, 'utf8')));
  console.log('   ' + (w.bledy.length ? pokaz(w) : `w pliku: ${Object.keys(w.dane).filter((k) => /termin|wydarzenie/.test(k)).map((k) => `${k}: ${w.dane[k]}`).join(', ') || 'bez terminu i dat wydarzenia'}`));
  if (nowa) sprawdz(!w.bledy.length && !Object.keys(w.dane).some((k) => /termin|wydarzenie/.test(k)), 'nie dostaje terminu ani dat');

  console.log('6. Nazwa pliku nowego wpisu');
  const otwarcie = form.filenameField === 'create' ? generateFilename(form.filename, form, otworz(form, null)) : null;
  const nazwa = otwarcie ?? generateFilename(form.filename, form, nowy({}));
  console.log(`   ${otwarcie ? 'pole nazwy przy otwarciu (tytuł jeszcze pusty), redaktor go nie zmienia' : 'nazwa przy zapisie z tytułu'}: ${nazwa}`);
  if (nowa) sprawdz(nazwa.endsWith('-medale-uniwersytetu-dla-profesorow-test.md'), 'nazwa z tytułu');

  console.log('7. Nazwa pliku nowego wpisu w innych kolekcjach z {primary} w nazwie (konferencje, granty, referaty)');
  const inne = [['Web-Nauka', 'konferencje'], ['Web-Nauka', 'granty'],
    ...fs.readdirSync(kat).filter((r) => r.startsWith('Web-Sem-')).sort().map((r) => [r, 'referaty'])];
  for (const [repo, kolekcja] of inne) {
    const f = formularz(konfiguracja(kat, repo), kolekcja);
    const przyOtwarciu = f.filenameField === 'create';
    const stan = przyOtwarciu ? otworz(f, null) : Object.assign(otworz(f, null), { [f.view.primary]: 'Medale Uniwersytetu dla profesorów — test' });
    const n = generateFilename(f.filename, f, stan);
    console.log(`   ${repo}/${kolekcja}: ${przyOtwarciu ? 'przy otwarciu (tytuł pusty)' : 'przy zapisie z tytułu'}: ${n}`);
    if (nowa) sprawdz(n.endsWith('-medale-uniwersytetu-dla-profesorow-test.md'), `${repo}/${kolekcja}: nazwa z tytułu`);
  }

  // Zlecenie 44: termin zgłoszeń w ofercie (grupa „zgloszenia”, lista najwyżej 1, pole „Do dnia”) — jak termin wydarzenia wyżej
  const poleZgl = form.fields.find((f) => f.name === 'zgloszenia');
  if (poleZgl) {
    const pustyZgl = () => initializeState(poleZgl.fields, {});
    const oferta = (zmiany) => nowy({ rodzaj: 'kariera', ...zmiany });
    console.log('9a. Stara oferta bez terminu zgłoszeń (2026-10-16-praca-dla-korepetytora-z-matematyki.md) otwarta i zapisana bez zmian');
    const plik9 = path.join(kat, 'Web-Aktualnosci/src/content/aktualnosci/2026-10-16-praca-dla-korepetytora-z-matematyki.md');
    const tekst9 = fs.readFileSync(plik9, 'utf8');
    w = zapisz(form, otworz(form, tekst9));
    console.log('   ' + (w.bledy.length ? pokaz(w) : `w pliku: ${Object.keys(w.dane).filter((k) => /zgloszenia|termin|wydarzenie/.test(k)).join(', ') || 'bez terminu zgłoszeń, terminu i dat wydarzenia'}`));
    sprawdz(!w.bledy.length && !Object.keys(w.dane).some((k) => /zgloszenia|termin|wydarzenie/.test(k)), 'nie dostaje terminu zgłoszeń ani dat');
    console.log('9b. „Add an item” w terminie zgłoszeń i zapis bez wypełnienia');
    w = zapisz(form, oferta({ zgloszenia: [pustyZgl()] }));
    console.log('   ' + pokaz(w));
    sprawdz(w.bledy.some((b) => b.startsWith('zgloszenia.0.do_dnia')), 'czerwone przy „Do dnia”, zapis zablokowany');
    console.log('9c. Termin zgłoszeń 15.12.2026');
    w = zapisz(form, oferta({ zgloszenia: [{ ...pustyZgl(), do_dnia: '2026-12-15' }] }));
    console.log('   ' + pokaz(w));
    sprawdz(!w.bledy.length && w.tekst.includes(['', 'zgloszenia:', '  - do_dnia: 2026-12-15', '    pozycja: false', ''].join('\n')), 'zapisana grupa „zgloszenia: - do_dnia: 2026-12-15” (i „pozycja: false”)');
    console.log('9d. Stara oferta: dodany termin zgłoszeń, reszta bez zmian');
    w = zapisz(form, Object.assign(otworz(form, tekst9), { zgloszenia: [{ ...pustyZgl(), do_dnia: '2026-12-15' }] }));
    const bez = zapisz(form, otworz(form, tekst9));
    const { zgloszenia: _z, ...reszta } = w.dane ?? {};
    sprawdz(!w.bledy.length && JSON.stringify(reszta) === JSON.stringify(bez.dane) && w.dane.zgloszenia?.[0]?.do_dnia === '2026-12-15', 'w pliku dochodzi tylko „zgloszenia”');
    console.log('9e. Drugi termin zgłoszeń (przycisk znika przy 1 pozycji; gdyby jednak)');
    w = zapisz(form, oferta({ zgloszenia: [{ ...pustyZgl(), do_dnia: '2026-12-15' }, { ...pustyZgl(), do_dnia: '2026-12-16' }] }));
    sprawdz(w.bledy.length > 0, `zablokowany: ${w.bledy.join('; ')}`);
  }

  // Zlecenie 47: „Warto wiedzieć” — grupa trzech kolekcji w Web-Instytut (Sylwetki, Nagrody i wyróżnienia, Historie)
  const konfI = konfiguracja(kat, 'Web-Instytut');
  const wws = JSON.stringify(konfI.content).includes('"ww_sylwetki"') ? formularz(konfI, 'ww_sylwetki') : undefined;
  if (wws) {
    console.log('10a. Nowa sylwetka z szablonu (Imię i nazwisko „Władysław Żółkiewski Test”)');
    const s = Object.assign(otworz(wws, null), { tytul: 'Władysław Żółkiewski Test' });
    const nazwaS = generateFilename(wws.filename, wws, s);
    w = zapisz(wws, s);
    console.log('   ' + pokaz(w));
    sprawdz(nazwaS === 'wladyslaw-zolkiewski-test.md', `nazwa pliku z imienia i nazwiska (polskie litery): ${nazwaS}`);
    const tresc = String(w.dane?.body ?? '');
    sprawdz(!w.bledy.length && tresc.includes('<!--') && !tresc.replace(/<!--[\s\S]*?-->/g, '').trim(), 'Treść z szablonu: same komentarze (= TBA na Podglądzie)');
    sprawdz(!w.bledy.length && !w.dane.dodano && w.dane.opublikowany === true && w.dane.format_tresci === 'jawne', '„Dodano” puste, „Opublikowane” zaznaczone, format_tresci: jawne');
    console.log('10b. Nowa historia bez roku i z rokiem „19xx” (rok wymagany, 4 cyfry)');
    const fh = formularz(konfI, 'ww_historie');
    w = zapisz(fh, Object.assign(otworz(fh, null), { tytul: 'Historia testowa' }));
    sprawdz(w.bledy.some((b) => b.startsWith('karta.rok')), `bez roku zablokowany: ${w.bledy.join('; ')}`);
    w = zapisz(fh, Object.assign(otworz(fh, null), { tytul: 'Historia testowa', karta: { ...otworz(fh, null).karta, rok: '19xx' } }));
    sprawdz(w.bledy.includes('karta.rok: Wpisz rok, np. 1946'), `rok „19xx” zablokowany: ${w.bledy.join('; ')}`);
    console.log('10c. Dopisanie laureata do Medalu Uniwersytetu (blok :::laureaci w Treści)');
    const fn = formularz(konfI, 'ww_nagrody');
    const plikM = path.posix.join(fn.path, 'medal-uniwersytetu.md');
    const tekstM = fs.readFileSync(path.join(kat, 'Web-Instytut', plikM), 'utf8');
    const stanM = otworz(fn, tekstM, plikM);
    const przed = liczLaureatow(stanM.body);
    stanM.body = stanM.body.replace(/(:::laureaci\r?\n[\s\S]*?)(\r?\n\r?\n:::)/, '$1\n- **2027** Jan Testowy — [aktualność](/aktualnosci/test)$2');
    w = zapisz(fn, stanM, plikM);
    const bez = zapisz(fn, otworz(fn, tekstM, plikM), plikM);
    const { body: _b1, ...r1 } = w.dane ?? {};
    const { body: _b2, ...r2 } = bez.dane ?? {};
    sprawdz(!w.bledy.length && liczLaureatow(w.dane.body) === przed + 1 && JSON.stringify(r1) === JSON.stringify(r2),
      `licznik ${przed} → ${liczLaureatow(w.dane?.body ?? '')}, poza Treścią bez zmian`);
  }

  // Zlecenie 52: pole „Liczby w banerze (3 pozycje)” w Sylwetkach — zapis bez zmian (kosmetyka pokazana), zmiana jednej liczby,
  // pozycja bez podpisu, nowa sylwetka z szablonu bez :::w-skrocie
  const poleL = wws?.fields.find((f) => f.name === 'liczby');
  if (poleL) {
    console.log('13. Sylwetka z polem „Liczby” (zlecenie 52): Hugo Steinhaus wczytany i zapisany, zmiana liczby, pusty podpis, nowa sylwetka');
    const pola = wws.fields.map((f) => f.name);
    sprawdz(pola.indexOf('liczby') === pola.indexOf('podpis_en') + 1 && poleL.label === 'Liczby w banerze (3 pozycje)' && poleL.list?.collapsible?.summary === '{n} {etykieta}'
      && poleL.fields.map((f) => `${f.name}${f.hidden ? '(ukryte)' : ''}`).join(',') === 'n,n_en,etykieta,etykieta_en,pozycja(ukryte)',
      `pole pod „Podpis EN”, zwinięta lista {n} {etykieta}, pola: ${poleL.fields.map((f) => f.name).join(', ')}`);
    const plikS = path.posix.join(wws.path, 'hugo-steinhaus.md');
    const tekstS = fs.readFileSync(path.join(kat, 'Web-Instytut', plikS), 'utf8').replace(/\r\n/g, '\n');
    const bezZm = zapisz(wws, otworz(wws, tekstS, plikS), plikS);
    const fm = (t) => t.split('\n---\n')[0].split('\n');
    const usuniete = fm(tekstS).filter((l) => !fm(bezZm.tekst).includes(l));
    const dodane = fm(bezZm.tekst).filter((l) => !fm(tekstS).includes(l));
    console.log(`   zapis bez zmian — nagłówek: usunięte ${usuniete.length} linii, dodane ${dodane.length}:\n${[...usuniete.map((l) => '      - ' + l), ...dodane.map((l) => '      + ' + l)].join('\n')}`);
    const liczbyS = (d) => (d?.liczby ?? []).map((x) => `${x.n}|${x.n_en ?? ''}|${x.etykieta}|${x.etykieta_en ?? ''}`).join(' · ');
    const wPliku = YAML.parse(tekstS.split('\n---\n')[0].replace(/^---\n/, ''));
    sprawdz(!bezZm.bledy.length && liczbyS(bezZm.dane) === liczbyS(wPliku) && bezZm.dane.body.trimEnd() === tekstS.split('\n---\n').slice(1).join('\n---\n').trimEnd(),
      `liczby po zapisie te same (${liczbyS(bezZm.dane)}), Treść bez zmian`);
    const stanZ = otworz(wws, tekstS, plikS);
    stanZ.liczby[1].n = '21';
    w = zapisz(wws, stanZ, plikS);
    sprawdz(!w.bledy.length && w.dane.liczby[1].n === '21' && w.dane.liczby[0].n === wPliku.liczby[0].n, `zmiana drugiej liczby: ${liczbyS(w.dane)}`);
    const stanP = otworz(wws, tekstS, plikS);
    stanP.liczby.push({ ...initializeState(poleL.fields, {}), n: '1887' });
    w = zapisz(wws, stanP, plikS);
    sprawdz(w.bledy.some((b) => b.startsWith('liczby.3.etykieta')), `pozycja bez podpisu zablokowana: ${w.bledy.join('; ')}`);
    w = zapisz(wws, Object.assign(otworz(wws, null), { tytul: 'Sylwetka Testowa' }));
    sprawdz(!w.bledy.length && !/w-skrocie/.test(w.dane.body) && /Liczby do banera wpisuje się w polu „Liczby”/.test(w.dane.body) && !/^liczby:/m.test(w.tekst),
      'nowa sylwetka: szablon bez :::w-skrocie, ze zdaniem o polu „Liczby”; puste pole nie trafia do pliku');
  }

  // Zlecenie 33: przełącznik „Opublikowane” (default: true) w Stronach, stronach działów, kierunkach i specjalnościach.
  const Z33 = [['Web-Aktualnosci', 'strony'], ['Web-Instytut', 'strona-dzialu'], ['Web-Instytut', 'strony'], ['Web-Nauka', 'strona-dzialu'],
    ['Web-Nauka', 'strony'], ['Web-Popularyzacja', 'popularyzacja'], ['Web-Popularyzacja', 'strony'], ['Web-Pracownicy', 'strony'],
    ['Web-Studia', 'strona-dzialu'], ['Web-Studia', 'kierunki'], ['Web-Studia', 'specjalnosci'], ['Web-Studia', 'strony']];
  if (!formularz(konfiguracja(kat, 'Web-Studia'), 'strony').fields.some((f) => f.name === 'opublikowany' && !f.hidden)) return;
  console.log('8. Przełącznik „Opublikowane” (zlecenie 33): stara strona bez pola, nowa strona, odznaczenie');
  for (const [repo, nazwaF] of Z33) {
    const f = formularz(konfiguracja(kat, repo), nazwaF);
    const pole = f.fields.find((x) => x.name === 'opublikowany');
    const plik = f.type === 'file' ? f.path : path.posix.join(f.path, fs.readdirSync(path.join(kat, repo, f.path), { recursive: !!f.subfolders })
      .map((n) => n.replaceAll('\\', '/')).filter((n) => n.endsWith('.md')).sort()[0]);
    const tekst = fs.readFileSync(path.join(kat, repo, plik), 'utf8').replace(/^opublikowany:.*\r?\n/m, '');
    const stara = zapisz(f, otworz(f, tekst, plik), plik);
    const tytul = f.fields.find((x) => ['tytul', 'nazwa', 'imie_nazwisko'].includes(x.name)).name;
    const nowaS = zapisz(f, Object.assign(otworz(f, null), { [tytul]: 'Strona testowa', ...(f.fields.some((x) => x.name === 'kierunek') ? { kierunek: 'src/content/kierunki/matematyka.md' } : {}) }));
    const szkic = zapisz(f, Object.assign(otworz(f, tekst, plik), { opublikowany: false }), plik);
    sprawdz(pole?.type === 'boolean' && pole.default === true && !pole.hidden && f.fields[f.fields.indexOf(pole) - 1].name.startsWith(tytul),
      `${repo}/${nazwaF}: pole pod tytułem, tak/nie, domyślnie zaznaczone`);
    sprawdz(!stara.bledy.length && stara.dane.opublikowany === true, `${repo}/${nazwaF}: stara strona bez pola (${plik}) po zapisie bez zmian: opublikowany: true`);
    sprawdz(!nowaS.bledy.length && nowaS.dane.opublikowany === true, `${repo}/${nazwaF}: nowa strona startuje jako opublikowana${nowaS.bledy.length ? ` (${nowaS.bledy.join('; ')})` : ''}`);
    sprawdz(!szkic.bledy.length && /^opublikowany: false$/m.test(szkic.tekst), `${repo}/${nazwaF}: po odznaczeniu w pliku „opublikowany: false” (szkic)`);
  }

  // Zlecenie 48: to samo w Aktualnościach, opisie seminarium (formularz jednego pliku) i Referatach wszystkich 9 seminariów.
  // Nowy wpis dostaje wartości pól wymaganych (prelegent, termin…), żeby zapis nie zatrzymał się na nich.
  const Z48 = [['Web-Aktualnosci', 'aktualnosci'], ...fs.readdirSync(kat).filter((r) => r.startsWith('Web-Sem-')).sort().flatMap((r) => [[r, 'seminarium'], [r, 'referaty']])];
  if (!formularz(konfiguracja(kat, 'Web-Aktualnosci'), 'aktualnosci').fields.some((f) => f.name === 'opublikowany')) return;
  console.log('11. Przełącznik „Opublikowane” (zlecenie 48): aktualności, opis seminarium, referaty — stary wpis bez pola, nowy wpis, odznaczenie');
  const wymagane = (f) => Object.fromEntries(f.fields.filter((x) => x.required && !x.hidden).map((x) => [x.name,
    x.type === 'date' ? fmt(new Date(2026, 10, 25, 14, 15), wzorDaty(x)) : x.type === 'select' ? (x.options?.values?.[0]?.value ?? x.options?.values?.[0]?.name ?? x.options?.values?.[0]) : 'Test']));
  const opisy = new Set();
  for (const [repo, nazwaF] of Z48) {
    const f = formularz(konfiguracja(kat, repo), nazwaF);
    const pole = f.fields.find((x) => x.name === 'opublikowany');
    const plik = f.type === 'file' ? f.path : path.posix.join(f.path, fs.readdirSync(path.join(kat, repo, f.path), { recursive: !!f.subfolders })
      .map((n) => n.replaceAll('\\', '/')).filter((n) => n.endsWith('.md')).sort()[0]);
    const tekst = fs.readFileSync(path.join(kat, repo, plik), 'utf8').replace(/^opublikowany:.*\r?\n/m, '');
    const stara = zapisz(f, otworz(f, tekst, plik), plik);
    const tytul = f.fields.find((x) => ['tytul', 'nazwa'].includes(x.name)).name;
    const nowyW = zapisz(f, Object.assign(otworz(f, null), wymagane(f), { [tytul]: 'Wpis testowy' }));
    const szkic = zapisz(f, Object.assign(otworz(f, tekst, plik), { opublikowany: false }), plik);
    opisy.add(`${nazwaF}: ${pole?.description}`);
    sprawdz(pole?.type === 'boolean' && pole.default === true && !pole.hidden && f.fields[f.fields.indexOf(pole) - 1].name.startsWith(tytul)
      && pole.label === 'Opublikowane — widoczne na stronie publicznej (na Podglądzie widać zawsze)', `${repo}/${nazwaF}: pole pod tytułem, tak/nie, domyślnie zaznaczone, etykieta jak w zleceniu 33`);
    sprawdz(!stara.bledy.length && stara.dane.opublikowany === true, `${repo}/${nazwaF}: stary wpis bez pola (${plik}) po zapisie bez zmian: opublikowany: true`);
    sprawdz(!nowyW.bledy.length && nowyW.dane.opublikowany === true, `${repo}/${nazwaF}: nowy wpis startuje jako opublikowany${nowyW.bledy.length ? ` (${nowyW.bledy.join('; ')})` : ''}`);
    sprawdz(!szkic.bledy.length && /^opublikowany: false$/m.test(szkic.tekst), `${repo}/${nazwaF}: po odznaczeniu w pliku „opublikowany: false” (szkic)`);
  }
  sprawdz(opisy.size === 3, `trzy opisy pola (aktualność, seminarium, referat), takie same w 9 seminariach:\n      ${[...opisy].join('\n      ')}`);

  const rodzaj = form.fields.find((f) => f.name === 'rodzaj');
  const opcje = (rodzaj?.options?.values ?? []).map((v) => [v.name ?? v.value ?? v, v.label ?? v]);
  // zlecenie 54 cofnęło 49: rodzaju „Seminarium wydziałowe” w formularzu już nie ma, seminarium wydziałowe to „Wydarzenie”
  console.log('12. Seminarium wydziałowe jako „Wydarzenie” (zlecenie 54, cofnięcie 49): opcje „Rodzaju”, opisy bez seminarium, dwa wpisy zapisane bez zmian');
  sprawdz(opcje.map(([n]) => n).join(',') === 'ogloszenie,wydarzenie,sukces,kariera',
    `opcje „Rodzaju”: ${opcje.map(([, l]) => l).join(', ')}; domyślnie ${rodzaj?.default}`);
  sprawdz(!/seminari/i.test(rodzaj?.description ?? ''), `opis pola „Rodzaj” bez seminarium: ${rodzaj?.description}`);
  sprawdz(!/seminari/i.test(form.description ?? ''), `opis kolekcji bez seminarium: ${form.description}`);
  for (const nazwa of ['2026-11-10-seminarium-wydzialowe-problem-milenijny.md', '2026-06-16-seminarium-wydzialowe.md']) {
    const p = `src/content/aktualnosci/${nazwa}`;
    const przed = fs.readFileSync(path.join(kat, 'Web-Aktualnosci', p), 'utf8').replace(/\r\n/g, '\n');
    const z = zapisz(form, otworz(form, przed, p), p);
    sprawdz(!z.bledy.length && z.dane.rodzaj === 'wydarzenie' && z.tekst === przed,
      `${nazwa}: otwarty i zapisany bez zmian (pusty diff) — rodzaj ${z.dane?.rodzaj}, tytuł „${z.dane?.tytul}”${z.bledy.length ? ` (${z.bledy.join('; ')})` : ''}`);
  }
}

// Każdy plik każdego formularza otwarty i zapisany bez zmian: czy dane po zapisie są te same. Za równe uznane są: brak wartości
// i wartość pusta (Pages CMS usuwa puste), brak pola tak/nie i jego wartość domyślna (Pages CMS ją dopisuje, m.in. „pozycja: false”),
// treść różniąca się tylko pustymi znakami na końcu.
function zapisBezZmian(kat) {
  const repozytoria = JSON.parse(fs.readFileSync(new URL('../../tresci.json', import.meta.url), 'utf8')).repozytoria;
  const norm = (v) => {
    if (Array.isArray(v)) { const a = v.map(norm).filter((x) => x !== undefined); return a.length ? a : undefined; }
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (v && typeof v === 'object') {
      const o = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === 'body' && typeof x === 'string' ? norm(x.trimEnd()) : norm(x)]).filter(([, x]) => x !== undefined));
      return Object.keys(o).length ? o : undefined;
    }
    return v === '' || v == null ? undefined : typeof v === 'number' ? v : String(v);
  };
  // pole tak/nie z wartością domyślną z formularza = pole bez wartości (Pages CMS dopisuje domyślną; strona przyjmuje tę samą:
  // pozycja i inne bez „default” → false, opublikowany, w_menu, na_stronie_glownej → true)
  const bezDomyslnych = (dane, pola) => {
    if (!dane || typeof dane !== 'object' || Array.isArray(dane)) return dane;
    const o = { ...dane };
    for (const f of pola || []) {
      const v = o[f.name];
      if (f.type === 'object') o[f.name] = f.list ? (Array.isArray(v) ? v.map((x) => bezDomyslnych(x, f.fields)) : v) : bezDomyslnych(v, f.fields);
      else if (f.type === 'boolean' && !f.list && v === (f.default ?? false)) delete o[f.name];
    }
    return o;
  };
  let plikow = 0;
  const roznice = [];
  for (const repo of repozytoria) {
    const konf = konfiguracja(kat, repo);
    const formy = [];
    const zbierz = (l) => { for (const c of l || []) { if (c.type === 'group') zbierz(c.items); else formy.push(c); } };
    zbierz(konf.content);
    for (const form of formy) {
      if (!form.fields?.length || form.list) continue;
      const pliki = form.type === 'file' ? [form.path]
        : fs.existsSync(path.join(kat, repo, form.path)) ? fs.readdirSync(path.join(kat, repo, form.path), { recursive: !!form.subfolders })
          .filter((n) => /\.(md|json|ya?ml)$/.test(n)).map((n) => path.posix.join(form.path, n.replaceAll('\\', '/'))) : [];
      for (const p of pliki) {
        const plik = path.join(kat, repo, p);
        if (!fs.existsSync(plik)) continue;
        const tekst = fs.readFileSync(plik, 'utf8');
        plikow++;
        const w = zapisz(form, otworz(form, tekst, p), p);
        if (w.bledy.length) { roznice.push(`${repo}/${p}: zapis zablokowany: ${w.bledy.join('; ')}`); continue; }
        const surowo = { ...form, fields: form.fields.map((f) => ({ ...f, type: f.type === 'date' ? 'string' : f.type })) };
        const przed = norm(bezDomyslnych(wczytajPlik(tekst, surowo, p), form.fields));
        const po = norm(bezDomyslnych(wczytajPlik(w.tekst, surowo, p), form.fields));
        const a = JSON.stringify(przed), b = JSON.stringify(po);
        if (a !== b) {
          const klucze = new Set([...Object.keys(przed || {}), ...Object.keys(po || {})]);
          const zmienione = [...klucze].filter((k) => JSON.stringify(przed?.[k]) !== JSON.stringify(po?.[k]));
          roznice.push(`${repo}/${p}: ${zmienione.map((k) => `${k}: ${JSON.stringify(przed?.[k])?.slice(0, 80)} → ${JSON.stringify(po?.[k])?.slice(0, 80)}`).join('; ')}`);
        }
      }
    }
  }
  return { plikow, roznice };
}

const [katNowy, katStary] = process.argv.slice(2);
if (!katNowy) { console.error('Użycie: node skrypty/test-edytora/formularz.mjs <katalog z klonami> [<stare klony>]'); process.exit(2); }
console.warn = () => {};
if (katStary) scenariusze(katStary, 'STARA konfiguracja (przed zleceniem 31), dla porównania', false);
scenariusze(katNowy, 'NOWA konfiguracja (zlecenie 31)', true);
for (const [kat, opis] of [[katNowy, 'NOWA'], ...(katStary ? [[katStary, 'STARA']] : [])]) {
  const { plikow, roznice } = zapisBezZmian(kat);
  console.log(`\n===== Zapis bez zmian, ${opis} konfiguracja: ${plikow} plików, różnice w ${roznice.length} =====`);
  for (const r of roznice) console.log('  ' + r);
  if (opis === 'NOWA') sprawdz(roznice.length === 0, 'każdy plik otwarty i zapisany bez zmian ma te same dane');
}
console.log(`\nProblemów: ${problemy}`);
process.exit(problemy ? 1 : 0);
