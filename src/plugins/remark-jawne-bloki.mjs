// Jawna składnia układu; remark-directive odpowiada za standardową gramatykę.
import { liniaWSkrocie, liniaLaureata, POWODY_WW } from '../lib/ww.mjs';

const BLOKI = new Set(['proza', 'kafelki', 'etapy', 'kontakty', 'linki', 'pliki', 'pytania', 'ramka', 'zakladki', 'tabela', 'kreski', 'tematy', 'specjalnosci', 'pary', 'grafik', 'w-skrocie', 'laureaci']);
// Bloki „Warto wiedzieć” (zlecenie 47): zła linia nie zatrzymuje budowy (bloki zmieniają redaktorzy, „strona bezobsługowa”) —
// punkt, który nie pasuje do wzoru (linia w tekście źródłowym), wypada z bloku, a błąd (numer linii Treści, linia, powód) idzie
// w data-bledy do rehype-bloki.mjs (ramka na Podglądzie i ostrzeżenie w logu: src/lib/wartoWiedziec.ts).
const LINIE_WW = { 'w-skrocie': liniaWSkrocie, laureaci: liniaLaureata };
function sprawdzLinieWW(node, zrodlo) {
  const linie = zrodlo.split(/\r?\n/);
  const bledy = [];
  const zla = (n) => {
    for (let l = n.position.start.line; l <= n.position.end.line; l++) if ((linie[l - 1] ?? '').trim()) bledy.push({ nr: l, tekst: linie[l - 1].trim(), powod: POWODY_WW[node.name] });
  };
  node.children = node.children.filter((c) => {
    if (c.type === 'html' && /^\s*<!--[\s\S]*?-->\s*$/.test(c.value)) return true;
    if (c.type !== 'list' || c.ordered) { zla(c); return false; }
    c.children = c.children.filter((li) => {
      if (LINIE_WW[node.name](linie[li.position.start.line - 1])) return true;
      zla(li);
      return false;
    });
    return c.children.length > 0;
  });
  return bledy;
}
const WSTAWKI = new Set(['opiekun', 'seminaria', 'wybor']);

// {#id} na końcu nagłówka (zlecenie 53, punkt 2): także bez spacji przed klamrą („## Tytuł{#id}”) i przy każdym poziomie.
const ID_NAGLOWKA = /\s*\{#([\p{L}\p{N}][\p{L}\p{N}\p{M}_-]*)\}\s*$/u;
const KOMENTARZ = (n) => n.type === 'html' && /^\s*<!--[\s\S]*?-->\s*$/.test(n.value);
const tekstMd = (n) => n.type === 'text' || n.type === 'inlineCode' ? n.value : (n.children ?? []).map(tekstMd).join('');
// porównanie z tytułem wpisu: bez wielkości liter, polskich znaków, interpunkcji i podwójnych spacji
const doPorownania = (s) => s.toLocaleLowerCase('pl').normalize('NFD').replace(/\p{M}/gu, '').replace(/ł/g, 'l')
  .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/**
 * Autokorekta nagłówków Treści „Warto wiedzieć” (zlecenie 53, dawniej 51; „strona bezobsługowa”): tekst wklejony z czatu AI
 * („# Imię Nazwisko”, potem same ### z {#id}) ma wyglądać jak inne wpisy — sekcje ## z kreskami, jeden h1 (baner), spis „Na tej stronie”.
 * Tylko tryb ww (frontmatter strona.ww przy renderowaniu, nie przy tworzeniu procesora — reguły nie przechodzą na inne strony),
 * tylko nagłówki na najwyższym poziomie dokumentu (nie w blokach :::), przed {#id} i podziałem na sekcje (trescWW):
 *   A. pierwszy # bez prozy przed nim (najwyżej komentarze <!-- --> i :::w-skrocie) znika, gdy jego tekst zawiera tytuł wpisu
 *      (ww.tytul: PL tytul, EN tytul_en albo tytul) albo tytuł zawiera jego tekst;
 *   B. pozostałe # → ##;
 *   C. gdy po A i B nie ma żadnego ##: najpłytszy użyty poziom (### … ######) → ##, głębsze o tyle samo.
 * Treść z ## zostaje bez zmian (poza A i B). Opis zmian → ww.naglowki (ostrzeżenie w logu budowy: trescWW, ostrzezWW).
 */
function poprawNaglowkiWW(tree, zrodlo, ww) {
  const top = tree.children;
  const opis = [];
  const pierwszy = top.find((n) => !KOMENTARZ(n) && !(n.type === 'containerDirective' && n.name === 'w-skrocie'));
  if (pierwszy?.type === 'heading' && pierwszy.depth === 1 && ww.tytul) {
    const h = doPorownania(tekstMd(pierwszy).replace(ID_NAGLOWKA, '')), t = doPorownania(String(ww.tytul));
    if (h && t && (h.includes(t) || t.includes(h))) {
      top.splice(top.indexOf(pierwszy), 1);
      opis.push(`usunięty tytuł „${zrodlo.slice(pierwszy.position.start.offset, pierwszy.position.end.offset).trim()}”`);
    }
  }
  const naglowki = top.filter((n) => n.type === 'heading');
  const zmiany = new Map();
  const zmien = (n, depth) => { const k = `${'#'.repeat(n.depth)} → ${'#'.repeat(depth)}`; zmiany.set(k, (zmiany.get(k) ?? 0) + 1); n.depth = depth; };
  for (const n of naglowki) if (n.depth === 1) zmien(n, 2);
  if (naglowki.length && !naglowki.some((n) => n.depth === 2)) {
    const o = Math.min(...naglowki.map((n) => n.depth)) - 2;
    for (const n of naglowki) zmien(n, n.depth - o);
  }
  for (const [k, ile] of zmiany) opis.push(`${k} (${ile})`);
  if (opis.length) ww.naglowki = opis;
}

export default function remarkJawneBloki() {
  return (tree, file) => {
    const ww = file.data?.astro?.frontmatter?.strona?.ww;
    if (ww && typeof ww === 'object') poprawNaglowkiWW(tree, String(file.value), ww);
    const fences = []; let codeFence;
    for (const [i, line] of String(file.value).split('\n').entries()) {
      const code = /^\s*(`{3,}|~{3,})/.exec(line);
      if (code) { if (!codeFence) codeFence = code[1][0]; else if (codeFence === code[1][0]) codeFence = undefined; continue; }
      if (codeFence) continue;
      const start = /^(:::{1,})([a-z][a-z0-9-]*)/.exec(line);
      const end = /^(:::{1,})\s*$/.exec(line);
      if (start) fences.push({ length: start[1].length, name: start[2], line: i + 1 });
      else if (end) {
        const open = fences.pop();
        if (!open || open.length !== end[1].length) file.fail('Niedopasowany koniec bloku. Użyj tylu dwukropków, ile na początku.', { line: i + 1, column: 1 });
      }
    }
    if (fences.length) file.fail(`Niezamknięty blok ${fences.at(-1).name}. Dodaj końcowe dwukropki.`, { line: fences.at(-1).line, column: 1 });

    const visit = (node) => {
      // Dwukropki w godzinach i zwykłej prozie nie są składnią naszego układu.
      if (node.type === 'textDirective') {
        const value = String(file.value).slice(node.position.start.offset, node.position.end.offset);
        Object.assign(node, { type: 'text', value });
        delete node.children; delete node.name; delete node.attributes;
        return;
      }
      // {#id}: przy ## — identyfikator sekcji (rehype-bloki.mjs); przy ### i głębszych — samo id nagłówka (bez sekcji i spisu)
      if (node.type === 'heading') {
        const tail = node.children.at(-1);
        const match = tail?.type === 'text' && ID_NAGLOWKA.exec(tail.value);
        if (match) {
          tail.value = tail.value.slice(0, match.index);
          if (!tail.value && node.children.length > 1) node.children.pop();
          const h = node.depth === 2 ? { dataSekcjaId: match[1] } : { id: match[1] };
          node.data = { ...node.data, hProperties: { ...node.data?.hProperties, ...h } };
        }
      }
      if (['containerDirective', 'leafDirective', 'textDirective'].includes(node.type)) {
        const block = node.type === 'containerDirective' && BLOKI.has(node.name);
        const insert = node.type === 'leafDirective' && WSTAWKI.has(node.name);
        if (!block && !insert) file.fail(`Nieznany lub nieprawidłowy znacznik „${node.name}”. Użyj :::blok albo ::wstawka zgodnie z instrukcją.`, node);
        node.data = { ...node.data, hName: 'div', hProperties: {
          ...(block ? { dataBlok: node.name } : { dataWstawka: node.name }),
          ...(node.attributes?.tytul ? { dataTytul: node.attributes.tytul } : {}),
        } };
        // Grafik (zlecenie 45): linie bloku czytamy z tekstu źródłowego, bo Markdown w środku nie ma znaczenia; dalej
        // (rehype-bloki.mjs) parser z src/lib/grafik.mjs. Wnętrze nie idzie do drzewa, więc nic w nim nie zatrzyma budowy.
        if (block && node.name === 'grafik') {
          const linie = String(file.value).slice(node.position.start.offset, node.position.end.offset).split(/\r?\n/).slice(1);
          if (/^:{3,}\s*$/.test(linie.at(-1) ?? '')) linie.pop();
          node.data.hProperties.dataZrodlo = JSON.stringify(linie);
          node.data.hProperties.dataLinia = node.position.start.line;
          node.children = [];
          return;
        }
        if (block && LINIE_WW[node.name]) {
          const bledy = sprawdzLinieWW(node, String(file.value));
          if (bledy.length) node.data.hProperties.dataBledy = JSON.stringify(bledy);
        }
      }
      // Instrukcje redakcyjne nie są zawartością strony (także przy sprawdzaniu pustego tekstu).
      if (node.children) node.children = node.children.filter((child) => !(child.type === 'html' && /^\s*<!--[\s\S]*?-->\s*$/.test(child.value)));
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
