// Zlecenie 40: Strony i strona działu dowolnego repozytorium treści → jawny Markdown (format_tresci: jawne), bez zmian tekstu.
// Uruchomienie z katalogu Web-Core:  node skrypty/jawny-markdown-repo.mjs <checkout repozytorium treści> [--zapisz] [--formularze strony,strona-dzialu]
// Bez --zapisz tylko raport. Formularze (domyślnie „strony” i „strona-dzialu” z .pages.yml): każdy plik bez format_tresci: jawne dostaje
//  • przy każdym ## (Treść i Treść EN) {#id} z dzisiejszym id nagłówka — liczonym tym samym silnikiem co budowa strony (Astro:
//    github-slugger, stałe id z kotwic typu 'naglowek', np. „Konsultacje”), więc adresy sekcji się nie zmienią;
//  • przy sekcji przenoszonej (kotwica typu 'strona' w src/plugins/kotwice.mjs, np. „Ostatnie sukcesy” na /instytut) id kotwicy
//    i komentarz dla redaktora (jawny tryb przenosi sekcję tylko po {#id}, src/lib/tekstyStron.ts);
//  • na początku Treści i Treści EN komentarz <!-- UKŁAD JAWNY: … --> jak w Studiach;
//  • w nagłówku pliku linię format_tresci: jawne.
// Pliki zmienia tekstowo: pozostałe pola nagłówka bez zmian, Treść EN w miejscu bloku YAML (| albo |-). Nagłówek ## w bloku kodu
// i nagłówek z {#…} pomija. Kontrola po migracji: porównanie zbudowanego HTML przed i po (0 różnic) i sprawdz-jawny-markdown.mjs.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import YAML from 'yaml';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkWzoryEdytora from '../src/plugins/remark-wzory-edytora.mjs';
import rehypeBloki from '../src/plugins/rehype-bloki.mjs';
import { KOTWICE, klucz } from '../src/plugins/kotwice.mjs';

export const UKLAD = '<!-- UKŁAD JAWNY: ## rozpoczyna sekcję w spisie. Nazwę można zmieniać; {#id} zachowuje adres. Bloki :::nazwa … ::: sterują wyglądem; komentarze są tylko instrukcjami dla redaktora. -->';
// Komentarze przy sekcjach przenoszonych (kotwice typu 'strona').
const KOMENTARZ_KOTWICY = {
  sukcesy: '<!-- SUKCESY: Tekst pod tym nagłówkiem strona pokazuje nad listą ostatnich sukcesów. Zachowaj {#sukcesy}; bez niego tekst stanie na końcu „O Instytucie”. -->',
  czasopisma: '<!-- CZASOPISMA: Tekst pod tym nagłówkiem strona pokazuje nad listą czasopism. Zachowaj {#czasopisma}; bez niego tekst stanie nad listą publikacji. -->',
};

const procesory = new Map();
async function procesor(lang) {
  if (!procesory.has(lang)) {
    procesory.set(lang, await createMarkdownProcessor({
      remarkPlugins: [remarkMath, remarkWzoryEdytora],
      rehypePlugins: [rehypeKatex, [rehypeBloki, { lang }]],
    }));
  }
  return procesory.get(lang);
}
const H2 = /^##\s+(.+?)\s*#*\s*$/;
const KOD = /^\s*(```|~~~)/;
/** Indeksy linii z nagłówkiem ## (poza blokami kodu). */
function liniH2(linie) {
  const w = []; let kod = false;
  linie.forEach((l, i) => { if (KOD.test(l)) kod = !kod; else if (!kod && H2.test(l)) w.push(i); });
  return w;
}
/** Dzisiejsze id nagłówków ## tekstu (render jak w budowie; tekst strony działu bez sekcji przenoszonych, jak podziel()). */
async function idNaglowkow(src, lang, bloki) {
  if (!src.trim()) return [];
  const r = await (await procesor(lang)).render(src, { frontmatter: { bloki } });
  return (r.metadata.headings ?? []).filter((h) => h.depth === 2).map((h) => h.slug);
}

/** Migracja jednego tekstu Markdown: {#id} przy ## i komentarz UKŁAD JAWNY na początku. Zwraca nowy tekst i listę zmian. */
export async function migrujTekst(src, { adres, lang, bloki }) {
  const linie = src.replace(/\r\n/g, '\n').split('\n');
  const kotwice = KOTWICE.filter((k) => k.typ === 'strona' && k.adres === adres);
  const h2 = liniH2(linie);
  // podział jak w src/lib/tekstyStron.ts: sekcja kotwicy (od jej ## do następnego ##) renderowana osobno, bez nagłówka
  const kotwicaLinii = new Map();
  for (const i of h2) {
    const tekst = H2.exec(linie[i])[1].replace(/\\(.)/g, '$1').replace(/[*_]/g, '').trim();
    const k = kotwice.find((x) => x.nazwy.some((n) => klucz(n) === klucz(tekst)));
    if (k) kotwicaLinii.set(i, k);
  }
  const glowne = []; const h2Glowne = []; let wKotwicy = false;
  linie.forEach((l, i) => {
    if (h2.includes(i)) wKotwicy = kotwicaLinii.has(i);
    if (wKotwicy) return;
    if (h2.includes(i)) h2Glowne.push(i);
    glowne.push(l);
  });
  const ids = await idNaglowkow(glowne.join('\n'), lang, bloki);
  if (ids.length !== h2Glowne.length) throw Error(`${adres} (${lang}): ${h2Glowne.length} nagłówków ## w tekście, ${ids.length} w HTML — sprawdź ręcznie.`);
  const zmiany = [];
  const nowe = [...linie];
  h2Glowne.forEach((i, j) => {
    if (/\{#[^}]*\}\s*$/.test(linie[i])) throw Error(`${adres} (${lang}): nagłówek ma już {#…}: ${linie[i]}`);
    nowe[i] = `${linie[i].replace(/\s+$/, '')} {#${ids[j]}}`;
    zmiany.push(`## … {#${ids[j]}}`);
  });
  for (const [i, k] of kotwicaLinii) {
    nowe[i] = `${KOMENTARZ_KOTWICY[k.id] ?? `<!-- Zachowaj {#${k.id}}: sekcja stoi w osobnym miejscu strony. -->`}\n\n${linie[i].replace(/\s+$/, '')} {#${k.id}}`;
    zmiany.push(`## … {#${k.id}} (sekcja przenoszona)`);
  }
  const tekst = nowe.join('\n').replace(/^\n+/, '');
  return { tekst: tekst.trim() ? `${UKLAD}\n\n${tekst}` : `${UKLAD}\n`, zmiany };
}

// ---------- pliki ----------
const NAGLOWEK = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
/** Treść EN z bloku YAML (tresc_en: | / |-): granice w linii nagłówka i tekst bez wcięcia. */
function blokEn(fm) {
  const linie = fm.split('\n');
  const start = linie.findIndex((l) => /^tresc_en:/.test(l));
  if (start < 0) return undefined;
  const m = /^tresc_en:\s*(\|[-+]?)\s*$/.exec(linie[start]);
  if (!m) {
    const wartosc = YAML.parse(fm).tresc_en;
    if (typeof wartosc === 'string' && wartosc.trim()) throw Error(`tresc_en nie jest blokiem | — zmień ręcznie`);
    return undefined;
  }
  let koniec = start + 1;
  while (koniec < linie.length && (linie[koniec] === '' || /^\s/.test(linie[koniec]))) koniec++;
  while (koniec > start + 1 && linie[koniec - 1] === '') koniec--;
  const wciecie = Math.min(...linie.slice(start + 1, koniec).filter((l) => l.trim()).map((l) => /^ */.exec(l)[0].length));
  return { start, koniec, styl: m[1], wciecie, tekst: linie.slice(start + 1, koniec).map((l) => l.slice(wciecie)).join('\n') };
}

async function plikiFormularza(repo, wpis) {
  if (wpis.type === 'file') return [{ plik: path.join(repo, wpis.path), adres: '/' + path.basename(wpis.path, '.md'), dzial: true }];
  const katalog = path.join(repo, wpis.path);
  const w = [];
  async function zbierz(k) {
    for (const e of await fs.readdir(k, { withFileTypes: true })) {
      const p = path.join(k, e.name);
      if (e.isDirectory()) await zbierz(p);
      else if (e.name.endsWith('.md')) w.push({ plik: p, adres: '/' + path.relative(path.join(repo, 'src/content/strony'), p).split(path.sep).join('/').replace(/\.md$/, ''), dzial: false });
    }
  }
  await zbierz(katalog);
  return w.sort((a, b) => a.plik.localeCompare(b.plik));
}

export async function migruj(repo, { zapisz = false, formularze = ['strony', 'strona-dzialu'] } = {}) {
  const config = YAML.parse(await fs.readFile(path.join(repo, '.pages.yml'), 'utf8'));
  const raport = [];
  for (const nazwa of formularze) {
    const wpis = config.content.find((c) => c.name === nazwa);
    if (!wpis) continue;
    for (const { plik, adres, dzial } of await plikiFormularza(repo, wpis)) {
      const zrodlo = await fs.readFile(plik, 'utf8');
      const crlf = zrodlo.includes('\r\n');
      const m = NAGLOWEK.exec(zrodlo.replace(/\r\n/g, '\n'));
      if (!m) throw Error(`Brak nagłówka YAML: ${plik}`);
      const dane = YAML.parse(m[1]) ?? {};
      if (dane.format_tresci === 'jawne') { raport.push({ plik: path.relative(repo, plik), pominiety: 'już jawny' }); continue; }
      if (dane.format_tresci != null) throw Error(`${plik}: nieznany format_tresci ${dane.format_tresci}`);
      const bloki = dzial || dane.bloki === true;
      const pl = await migrujTekst(m[2], { adres, lang: 'pl', bloki });
      let fm = m[1].split('\n');
      const en = blokEn(m[1]);
      let zmianyEn = [];
      if (en && en.tekst.trim()) {
        const wynik = await migrujTekst(en.tekst, { adres, lang: 'en', bloki });
        zmianyEn = wynik.zmiany;
        const wciecie = ' '.repeat(en.wciecie);
        const linie = wynik.tekst.replace(/\n+$/, '').split('\n').map((l) => (l ? wciecie + l : ''));
        fm = [...fm.slice(0, en.start + 1), ...linie, ...fm.slice(en.koniec)];
      }
      fm.push('format_tresci: jawne');
      const nowy = `---\n${fm.join('\n')}\n---\n${pl.tekst.replace(/\n*$/, '\n')}`;
      // kontrola: pola nagłówka bez zmian poza format_tresci i tresc_en; tekst bez zmian poza dopiskami
      const po = YAML.parse(fm.join('\n'));
      for (const k of new Set([...Object.keys(dane), ...Object.keys(po)])) {
        if (k === 'format_tresci' || k === 'tresc_en') continue;
        if (JSON.stringify(dane[k]) !== JSON.stringify(po[k])) throw Error(`${plik}: zmieniłoby się pole ${k}`);
      }
      const bezDopiskow = (t) => String(t ?? '').replace(/<!--[\s\S]*?-->\n*/g, '').replace(/ \{#[\p{L}\p{N}][\p{L}\p{N}\p{M}_-]*\}$/gmu, '').replace(/\s+/g, ' ').trim();
      if (bezDopiskow(pl.tekst) !== bezDopiskow(m[2])) throw Error(`${plik}: zmieniłby się tekst Treści`);
      if (bezDopiskow(po.tresc_en) !== bezDopiskow(dane.tresc_en)) throw Error(`${plik}: zmieniłby się tekst Treści EN`);
      raport.push({ plik: path.relative(repo, plik).split(path.sep).join('/'), adres, pl: pl.zmiany, en: zmianyEn });
      if (zapisz) await fs.writeFile(plik, crlf ? nowy.replace(/\n/g, '\r\n') : nowy);
    }
  }
  return raport;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [repo] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!repo) throw Error('Podaj ścieżkę checkoutu repozytorium treści; --zapisz zapisuje migrację.');
  const i = process.argv.indexOf('--formularze');
  const formularze = i > 0 ? process.argv[i + 1].split(',') : undefined;
  const zapisz = process.argv.includes('--zapisz');
  const raport = await migruj(path.resolve(repo), { zapisz, formularze });
  for (const r of raport) console.log(r.pominiety ? `${r.plik}: pominięty (${r.pominiety})` : `${r.plik} (${r.adres}): PL ${r.pl.length ? r.pl.join(', ') : 'bez ##'}; EN ${r.en.length ? r.en.join(', ') : 'bez ##'}`);
  console.log(`${zapisz ? 'Zapisano' : 'Do zmiany (bez --zapisz nic nie zapisano)'}: ${raport.filter((r) => !r.pominiety).length} plików.`);
}
