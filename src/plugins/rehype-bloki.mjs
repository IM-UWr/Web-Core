// Bloki wzorca treści (src/styles/zal-tresc.css) z samego Markdownu, bez HTML (zlecenie 15, punkt 4; przebudowa: zlecenie 28).
// Formularz CMS (rich-text) nie przepuszcza surowego HTML, więc blok rozpoznajemy po budowie listy. Działa:
// - na stronach z polem „Bloki wzorca” (bloki: true w nagłówku) — na najwyższym poziomie treści; pierwszy akapit po pierwszym ## — .wst;
// - na kierunkach zawsze (opcja frontmatter.kierunek z src/lib/markdown.ts): treść dzielona na sekcje po ## (kotwice w kotwice.mjs).
//
// Linie punktu listy: osobne akapity oraz kawałki akapitu rozdzielone <br>. Edytor Pages CMS (TipTap) robi oba zapisy:
// Enter w liście tworzy nowy punkt, Shift+Enter zapisuje złamanie linii („  \n”, czyli <br> w jednym akapicie).
// Pierwsza linia: pogrubienie i dalej (po separatorze „ — ”, „ – ” albo „: ”, usuwanym) reszta linii.
// - lista punktowana, każdy punkt zaczyna się pogrubieniem — ul.dwa (kafelki): <b> tytuł, <span> reszta pierwszej linii
//   (albo druga linia), pary „Klucz: wartość” — dl.para, linia z samym linkiem — p.akcja;
// - lista numerowana, pierwszy punkt zaczyna się pogrubieniem — ol.etapy (oś): pogrubienie „Etykieta: Tytuł” — span.etyk + p.t,
//   bez dwukropka etykieta „Krok N” („Step N”); reszta pierwszej linii — akapit opisu; punkt bez pogrubienia doklejamy do
//   poprzedniego kroku jako dalsze linie (edytor wcisnął Enter zamiast Shift+Enter);
// - lista „*rola*” i „**osoba**” (w tej samej albo w następnej linii), dalej pary — .kontakty;
// - lista samych linków (opcjonalnie „ — opis”) — ul.pliki z ikoną i typem (PDF, DOCX…, „strona”/„page”), gdy w sekcji ## jest
//   choć jeden link do pliku (rozszerzenie w adresie albo /pliki/); inaczej ul.linki; akapit z samym linkiem — ul.linki;
// - ### zakończony „?” — rozwijane pytanie (.faq, details/summary), odpowiedź = wszystko do następnego nagłówka;
// - cytat zaczynający się akapitem z samym pogrubieniem — ramka uwagi z etykietą .etyk;
// - tylko kierunki: tabela w sekcji blokowej — table.tab; sekcja „Program studiów” — ### jako zakładki; „Specjalności” —
//   miejsce na kafelki (komentarz <!--specjalnosci-->, wstawia je widok Kierunek.astro).
// Opcje: lang ('pl' | 'en', domyślnie pl), site i base (linki poza stronę: typ „strona”/„website” na liście plików).
import { kotwica, kolejnosc, KOTWICE, NAGLOWEK_SPECJALNOSCI } from './kotwice.mjs';
import { zewnetrzny } from './rehype-zewn.mjs';

const el = (tagName, klasa, children = [], props = {}) => ({
  type: 'element', tagName, properties: { ...(klasa ? { className: [klasa] } : {}), ...props }, children,
});
const tekst = (value) => ({ type: 'text', value });
const pusty = (c) => c?.type === 'text' && !c.value.trim();
// dzieci bez pustych tekstów (nowych linii między blokami)
const bloki = (n) => (n.children ?? []).filter((c) => !pusty(c));
const jest = (n, tag) => n?.type === 'element' && n.tagName === tag;
const tekstW = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(tekstW).join(''));
// akapit złożony wyłącznie z jednego elementu tag (np. <p><strong>…</strong></p>)
const sam = (p, tag) => {
  if (!jest(p, 'p')) return undefined;
  const d = bloki(p);
  return d.length === 1 && jest(d[0], tag) ? d[0] : undefined;
};
const pozycje = (lista) => bloki(lista).filter((n) => jest(n, 'li'));
// rozpoznany blok (w sekcjach „proza” stoi poza div.prose); node.data nie trafia do HTML
const zBlokiem = (n) => { n.data = { ...n.data, blok: true }; return n; };
const jestBlokiem = (n) => !!n?.data?.blok;

// ---------- linie punktu ----------
const BLOKOWE = new Set(['p', 'ul', 'ol', 'table', 'blockquote', 'div', 'pre', 'hr', 'dl', 'details', 'section', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
const jestBr = (n) => jest(n, 'br') || (n?.type === 'raw' && /^<br\s*\/?>$/i.test(n.value.trim()));

// bez pustych tekstów i białych znaków na początku i końcu linii (po <br> zostaje „\n”)
function przytnij(nodes) {
  const w = [...nodes];
  while (w.length && pusty(w[0])) w.shift();
  while (w.length && pusty(w[w.length - 1])) w.pop();
  if (w[0]?.type === 'text') w[0] = tekst(w[0].value.replace(/^\s+/, ''));
  if (w[w.length - 1]?.type === 'text') w[w.length - 1] = tekst(w[w.length - 1].value.replace(/\s+$/, ''));
  return w;
}

// [{ linia: [węzły w linii] } | { blok: element }] — akapity i kawałki akapitu między <br>; inne bloki (lista w liście) osobno
function linie(li) {
  const out = [];
  let biez = [];
  const zamknij = () => {
    const l = przytnij(biez);
    if (l.length) out.push({ linia: l });
    biez = [];
  };
  const wiersz = (nodes) => { for (const n of nodes) { if (jestBr(n)) zamknij(); else biez.push(n); } };
  for (const c of li.children ?? []) {
    if (jest(c, 'p')) { zamknij(); wiersz(c.children ?? []); zamknij(); }
    else if (c.type === 'element' && BLOKOWE.has(c.tagName)) { zamknij(); out.push({ blok: c }); }
    else wiersz([c]);
  }
  zamknij();
  return out;
}

// „**Tytuł** — reszta”: { tytul, reszta } albo undefined (linia nie zaczyna się pogrubieniem albo po nim nie ma separatora)
const SEPARATOR = /^(?:[—–]|:)\s*/;
function pogrubiony(linia) {
  if (!linia?.length || !jest(linia[0], 'strong')) return undefined;
  const reszta = przytnij(linia.slice(1));
  if (!reszta.length) return { tytul: linia[0].children, reszta: [] };
  if (reszta[0].type !== 'text') return undefined;
  const m = SEPARATOR.exec(reszta[0].value);
  if (!m) return undefined;
  return { tytul: linia[0].children, reszta: przytnij([tekst(reszta[0].value.slice(m[0].length)), ...reszta.slice(1)]) };
}

// „Klucz: wartość” — para etykieta–wartość; klucz krótki (do 20 znaków), zwykły tekst na początku linii
function para(linia) {
  const [a, ...r] = linia;
  if (a?.type !== 'text') return undefined;
  const m = /^([^:\n]{1,20}):\s+([\s\S]*)$/.exec(a.value);
  if (!m || !m[1].trim()) return undefined;
  return { klucz: m[1], wartosc: przytnij([...(m[2] ? [tekst(m[2])] : []), ...r]) };
}
const samLink = (linia) => (linia?.length === 1 && jest(linia[0], 'a') ? linia[0] : undefined);

// dalsze linie punktu: pary — dl.para (paryNaPoczatku: wszystkie w jednej liście zaraz po opisie, jak w kafelkach),
// sam link — p.akcja, inne bloki bez zmian, reszta — akapit
function dalszeLinie(lista, paryNaPoczatku = false) {
  const pary = [];
  const out = [];
  let dl;
  for (const x of lista) {
    if (x.blok) {
      out.push(sam(x.blok, 'a') ? el('p', 'akcja', x.blok.children) : x.blok);
      dl = undefined;
      continue;
    }
    const pr = samLink(x.linia) ? undefined : para(x.linia);
    if (pr) {
      const dzieci = [el('dt', null, [tekst(pr.klucz)]), el('dd', null, pr.wartosc)];
      if (paryNaPoczatku) pary.push(...dzieci);
      else {
        if (!dl) { dl = el('dl', 'para'); out.push(dl); }
        dl.children.push(...dzieci);
      }
      continue;
    }
    dl = undefined;
    out.push(el('p', samLink(x.linia) ? 'akcja' : null, x.linia));
  }
  return paryNaPoczatku && pary.length ? [el('dl', 'para', pary), ...out] : out;
}

// ---------- bloki z list ----------
const naDwa = (lista) => {
  lista.properties = { ...lista.properties, className: ['dwa'] };
  lista.children = pozycje(lista).map((li) => {
    const L = linie(li);
    const p = pogrubiony(L[0].linia);
    const dzieci = [el('b', null, p.tytul)];
    let dalej = L.slice(1);
    // opis: reszta linii z tytułem, a przy samym tytule — następna linia (także „Archiwa zadań: …”, jak dotąd; sam link to przycisk)
    if (p.reszta.length) dzieci.push(el('span', null, p.reszta));
    else if (dalej[0]?.linia && !samLink(dalej[0].linia)) {
      dzieci.push(el('span', null, dalej[0].linia));
      dalej = dalej.slice(1);
    }
    li.children = [...dzieci, ...dalszeLinie(dalej, true)];
    return li;
  });
  return zBlokiem(lista);
};

// „Etykieta: Tytuł” w pogrubieniu — mała etykieta i tytuł; bez dwukropka — „Krok N” / „Step N”
function etykieta(tytul, slowo, i) {
  const k = tytul.findIndex((n) => n.type === 'text' && /:\s/.test(n.value));
  if (k >= 0) {
    const t = tytul[k].value;
    const m = /:\s+/.exec(t);
    const przed = przytnij([...tytul.slice(0, k), tekst(t.slice(0, m.index))]);
    const po = przytnij([tekst(t.slice(m.index + m[0].length)), ...tytul.slice(k + 1)]);
    if (przed.length && po.length) return { etyk: przed, t: po };
  }
  return { etyk: [tekst(`${slowo} ${i + 1}`)], t: tytul };
}

const naEtapy = (lista, slowo) => {
  lista.properties = { ...lista.properties, className: ['etapy'] };
  const kroki = [];
  for (const li of pozycje(lista)) {
    const L = linie(li);
    const p = L[0]?.linia ? pogrubiony(L[0].linia) : undefined;
    if (p) kroki.push({ li, p, dalej: L.slice(1) });
    else kroki[kroki.length - 1]?.dalej.push(...L); // punkt bez pogrubienia: dalsze linie poprzedniego kroku
  }
  lista.children = kroki.map(({ li, p, dalej }, i) => {
    const { etyk, t } = etykieta(p.tytul, slowo, i);
    li.children = [el('span', 'etyk', etyk), el('p', 't', t), ...(p.reszta.length ? [el('p', null, p.reszta)] : []), ...dalszeLinie(dalej)];
    return li;
  });
  return zBlokiem(lista);
};

// kontakt: pierwsza linia zaczyna się kursywą (rola), osoba pogrubiona w tej samej linii (po spacji albo separatorze) albo w następnej
function kontakt(L) {
  const [a, ...r] = L[0]?.linia ?? [];
  if (!jest(a, 'em')) return undefined;
  const reszta = przytnij(r);
  if (reszta.length) {
    const i = reszta[0].type === 'text' ? 1 : 0;
    if (i && !/^[\s—–,:]*$/.test(reszta[0].value)) return undefined;
    if (reszta.length !== i + 1 || !jest(reszta[i], 'strong')) return undefined;
    return { rola: a.children, osoba: reszta[i].children, dalej: L.slice(1) };
  }
  const b = L[1]?.linia;
  if (b?.length === 1 && jest(b[0], 'strong')) return { rola: a.children, osoba: b[0].children, dalej: L.slice(2) };
  return undefined;
}

const naKontakty = (lista) => zBlokiem(el('div', 'kontakty', pozycje(lista).map((li) => {
  const k = kontakt(linie(li));
  return el('div', null, [el('span', 'etyk', k.rola), el('b', null, k.osoba), ...dalszeLinie(k.dalej)]);
})));

// punkt listy linków: sam link, opcjonalnie „ — opis”
function linkPunktu(li) {
  const L = linie(li);
  if (L.length !== 1 || !L[0].linia) return undefined;
  const [a, ...r] = L[0].linia;
  if (!jest(a, 'a')) return undefined;
  const reszta = przytnij(r);
  if (!reszta.length) return { a, opis: [] };
  if (reszta[0].type !== 'text') return undefined;
  const m = /^[—–]\s*/.exec(reszta[0].value);
  if (!m) return undefined;
  return { a, opis: przytnij([tekst(reszta[0].value.slice(m[0].length)), ...reszta.slice(1)]) };
}

const adresBez = (h) => String(h ?? '').split(/[?#]/)[0];
const rozszerzenie = (h) => adresBez(h).match(/\.([a-z0-9]{2,5})$/i)?.[1];
const jestPlikiem = (h) => !!rozszerzenie(h) || /(^|\/)pliki\//.test(adresBez(h));
// typ pozycji na liście plików (wzorzec: „PDF”, „strona ↗”): rozszerzenie pliku, strona zewnętrzna albo nasza podstrona
const typPliku = (h, ctx) => {
  const roz = rozszerzenie(h);
  if (roz) return roz.toUpperCase();
  if (zewnetrzny(String(h ?? ''), ctx.site, ctx.base)) return ctx.en ? 'website' : 'strona';
  return ctx.en ? 'page' : 'strona';
};
// ikona „plik” (src/components/Ikona.astro, rozmiar 18)
const IKONA_PLIKU = '<svg class="ico " style="width:18px;height:18px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>';

const naPliki = (lista, ctx) => {
  lista.properties = { ...lista.properties, className: ['pliki'] };
  lista.children = pozycje(lista).map((li) => {
    const { a, opis } = linkPunktu(li);
    const href = a.properties?.href;
    a.children = [
      { type: 'raw', value: IKONA_PLIKU },
      el('span', null, [...a.children, ...(opis.length ? [el('small', null, opis)] : [])]),
      el('span', 'typ', [tekst(typPliku(href, ctx))]),
    ];
    li.children = [a];
    return li;
  });
  return zBlokiem(lista);
};

const naLinki = (lista) => {
  lista.properties = { ...lista.properties, className: ['linki'] };
  lista.children = pozycje(lista).map((li) => {
    const { a, opis } = linkPunktu(li);
    li.children = [a, ...(opis.length ? [el('small', null, opis)] : [])];
    return li;
  });
  return zBlokiem(lista);
};

const listaLinkow = (n) => jest(n, 'ul') && pozycje(n).length > 0 && pozycje(n).every(linkPunktu);
// czy w sekcji jest lista linków z choć jednym plikiem (wtedy wszystkie listy linków w sekcji to listy plików)
const maPliki = (nodes) => nodes.some((n) => listaLinkow(n) && pozycje(n).some((li) => jestPlikiem(linkPunktu(li).a.properties?.href)));

function przeksztalc(n, ctx) {
  if (sam(n, 'a')) return zBlokiem(el('ul', 'linki', [el('li', null, [sam(n, 'a')])]));
  if (jest(n, 'ul')) {
    const li = pozycje(n);
    if (!li.length) return n;
    const L = li.map(linie);
    if (L.every((x) => kontakt(x))) return naKontakty(n);
    const pp = L.map((x) => (x[0]?.linia ? pogrubiony(x[0].linia) : undefined));
    if (pp.every(Boolean) && L.some((x, i) => x.length > 1 || pp[i].reszta.length)) return naDwa(n);
    if (listaLinkow(n)) return ctx.pliki ? naPliki(n, ctx) : naLinki(n);
    return n;
  }
  if (jest(n, 'ol')) {
    const pierwszy = pozycje(n)[0];
    const L = pierwszy ? linie(pierwszy) : [];
    return L[0]?.linia && pogrubiony(L[0].linia) ? naEtapy(n, ctx.slowo) : n;
  }
  if (jest(n, 'blockquote')) {
    const b = bloki(n);
    const g = b.length >= 2 ? sam(b[0], 'strong') : undefined;
    // specjalność: ramka uwagi jak dotąd w szablonie („Dla kogo”): div.uwaga, etykieta i tekst w osobnym div
    if (g && ctx.klasaRamki) return zBlokiem(el('div', 'uwaga', [el('span', 'etyk', g.children), el('div', ctx.klasaRamki, b.slice(1))]));
    if (g) n.children = [el('span', 'etyk', g.children), ...b.slice(1)];
    return n;
  }
  if (jest(n, 'table') && ctx.tab) {
    n.properties = { ...n.properties, className: ['tab'] };
    return zBlokiem(n);
  }
  return n;
}

// ---------- pytania (### zakończony „?”) ----------
const jestNaglowkiem = (n) => n?.type === 'element' && /^h[1-6]$/.test(n.tagName);
const pytanie = (n) => jest(n, 'h3') && /\?\s*$/.test(tekstW(n));
function pytania(nodes) {
  const out = [];
  let faq;
  for (let i = 0; i < nodes.length;) {
    const n = nodes[i];
    if (!pytanie(n)) { out.push(n); faq = undefined; i++; continue; }
    let j = i + 1;
    while (j < nodes.length && !jestNaglowkiem(nodes[j])) j++;
    if (!faq) { faq = zBlokiem(el('div', 'faq')); out.push(faq); }
    faq.children.push(el('details', null, [el('summary', null, n.children), el('div', null, nodes.slice(i + 1, j))]));
    i = j;
  }
  return out;
}

// ---------- lista z kreskami (specjalność: „Co będziesz umieć”, „Przykładowe tematy prac”) ----------
// Punkt w jednej linii: sam tekst (bez <p>, także z listy „luźnej”, jaką bywa zapis edytora). opisPo: „Tytuł — opis” →
// tytuł i span.sp-opis „ — opis”; tytuł wyglądający na polski na stronie EN (ctx.polski) w <span lang="pl">.
function opisPo(linia, ctx) {
  const k = linia.findIndex((n) => n.type === 'text' && n.value.includes(' — '));
  let tytul = linia;
  let opis = [];
  if (k >= 0) {
    const t = linia[k].value;
    const i = t.indexOf(' — ');
    tytul = przytnij([...linia.slice(0, k), tekst(t.slice(0, i))]);
    opis = [el('span', 'sp-opis', [tekst(` — ${t.slice(i + 3).replace(/^\s+/, '')}`), ...linia.slice(k + 1)])];
  }
  if (ctx.en && !ctx.polskaTresc && ctx.polski?.(tekstW({ children: tytul }))) tytul = [el('span', null, tytul, { lang: 'pl' })];
  return [...tytul, ...opis];
}

const naKreski = (lista, ctx) => {
  lista.properties = { ...lista.properties, className: ['kreski'] };
  for (const li of pozycje(lista)) {
    const L = linie(li);
    if (L.length === 1 && L[0].linia) li.children = ctx.opisPo ? opisPo(L[0].linia, ctx) : L[0].linia;
  }
  return zBlokiem(lista);
};

// ---------- kierunki i specjalności: sekcje po ## ----------
// układ sekcji: przekształcone bloki; w „prozie” kolejne zwykłe węzły w div.prose
function uklad(nodes, typ, ctx) {
  const prz = nodes.map((n) => {
    const p = przeksztalc(n, ctx);
    return ctx.kreski && jest(p, 'ul') && !jestBlokiem(p) ? naKreski(p, ctx) : p;
  });
  if (typ !== 'proza') return prz;
  const out = [];
  let prose;
  for (const n of prz) {
    if (jestBlokiem(n)) { out.push(n); prose = undefined; continue; }
    if (!prose) { prose = el('div', 'prose'); out.push(prose); }
    prose.children.push(n);
  }
  return out;
}

const kopia = (x) => structuredClone(x);
// „Program studiów”: ### to zakładki (.tresc-taby i panele .kier-prog jak dotąd); akapit w panelu — p.dotyczy.
// Jedna podsekcja albo brak ### — jeden panel bez zakładek. Bez JS wszystkie panele jeden pod drugim, z podpisami.
function zakladki(nodes, ctx, etykietaSekcji) {
  const iH = nodes.flatMap((n, i) => (jest(n, 'h3') ? [i] : []));
  const wstep = iH.length ? nodes.slice(0, iH[0]) : [];
  const czesci = iH.length ? iH.map((i, k) => ({ h: nodes[i], tresc: nodes.slice(i + 1, iH[k + 1] ?? nodes.length) })) : [{ tresc: nodes }];
  const wiele = czesci.length > 1;
  const panel = (c, i) => zBlokiem(el('div', 'kier-prog', [
    ...(wiele ? [el('p', 'kier-podpis', kopia(c.h.children))] : c.h ? [c.h] : []),
    ...c.tresc.map((n) => (jest(n, 'p') && !sam(n, 'a') ? el('p', 'dotyczy', n.children) : przeksztalc(n, ctx))),
  ], { ...(wiele ? { role: 'tabpanel' } : {}), id: `prog-${i}`, ...(wiele ? { ariaLabelledBy: `tab-${i}` } : {}), dataPanel: '' }));
  const taby = wiele
    ? [zBlokiem(el('div', 'tresc-taby', czesci.map((c, i) => el('button', null, kopia(c.h.children), {
      type: 'button', role: 'tab', id: `tab-${i}`, ariaControls: `prog-${i}`, ariaSelected: i === 0 ? 'true' : 'false', tabIndex: i === 0 ? 0 : -1,
    })), { role: 'tablist', ariaLabel: etykietaSekcji }))]
    : [];
  return [...wstep.map((n) => przeksztalc(n, ctx)), ...taby, ...czesci.map(panel)];
}

const slug = (s) => s.toLocaleLowerCase('pl').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Treść kierunku albo specjalności: <section id aria-labelledby> dla każdego ##; zwraca listę sekcji do spisu „Na tej stronie”.
// typ: 'kierunek' | 'specjalnosc' (kotwice z kotwice.mjs). opcje: lang ('pl', gdy na /en pokazujemy treść polską) oraz
//   kierunek: specjalnosci — czy kierunek ma kafelki specjalności (miejsce: komentarz <!--specjalnosci-->);
//   specjalność: wstawki — { seminaria, opiekun, wybor: czy są dane } (miejsce sekcji liczonej: komentarz <!--wstaw:nazwa-->),
//     naglowki — { seminaria, opiekun: tekst nagłówka sekcji dopisanej przez stronę; opiekun zastępuje też tekst edytora
//     (liczba pojedyncza albo mnoga zależy od liczby opiekunów) }, klasaRamki — klasa tekstu w ramce uwagi („Dla kogo”);
//     dane (wynik) — { etapy: [{ etyk, t }], grupy: [{ nazwa, n }] } z sekcji „Jak przebiega” i „Czego się uczysz”
//     (liczby banera specjalności).
const wstaw = (nazwa) => ({ type: 'comment', value: `wstaw:${nazwa}` });
const ZAMIENIA_NAGLOWEK = new Set(['opiekun']);

function sekcjeTresci(tree, ctx, opcje, typ) {
  const dzieci = bloki(tree);
  const iH2 = dzieci.flatMap((n, i) => (jest(n, 'h2') ? [i] : []));
  const lang = opcje.lang ? { lang: opcje.lang } : {};
  const c0 = { ...ctx, polskaTresc: !!opcje.lang, ...(typ === 'specjalnosc' ? { klasaRamki: opcje.klasaRamki } : {}) };
  const wynik = [];
  const sek = []; // { node, wpis, k } — sekcja, pozycja spisu, miejsce w kolejności kotwic typu (-1: spoza listy)
  const uzyte = new Set();
  const porzadek = kolejnosc(typ);
  const wstawki = opcje.wstawki ?? {};
  const wstawione = new Set();
  const dane = { etapy: [], grupy: [] };
  const przed = dzieci.slice(0, iH2[0] ?? dzieci.length);
  if (przed.length) wynik.push(...uklad(pytania(przed), 'proza', { ...c0, pliki: maPliki(przed), tab: false }).map((n) => (jest(n, 'div') ? { ...n, properties: { ...n.properties, ...lang } } : n)));
  let zeSpecjalnosciami = false;
  const noweId = (baza) => {
    let id = baza;
    for (let n = 2; uzyte.has(id); n++) id = `${baza}-${n}`;
    uzyte.add(id);
    return id;
  };
  const sekcja = (h, srodek, etykietaH, id, krotka, kId) => {
    h.properties = { id: `${id}-h` };
    return { node: el('section', null, [h, ...srodek], { id, ariaLabelledBy: `${id}-h`, ...lang }), wpis: { id, etykieta: etykietaH, ...(krotka ? { krotka } : {}) }, k: porzadek.indexOf(kId) };
  };
  // nagłówek wstawki z osią (np. „Wybór specjalności”) — wtedy wstawka idzie pod niego, nie na koniec osi
  const naglowkiWstawek = new Set(iH2.map((i) => kotwica(tekstW(dzieci[i]).replace(/\s+/g, ' ').trim(), typ)?.wstawka).filter(Boolean));
  iH2.forEach((i, k) => {
    const h = dzieci[i];
    const tresc = dzieci.slice(i + 1, iH2[k + 1] ?? dzieci.length);
    let etykietaH = tekstW(h).replace(/\s+/g, ' ').trim();
    const kt = kotwica(etykietaH, typ);
    if (kt?.wstawka && !wstawki[kt.wstawka] && !tresc.length) return; // sekcja liczona bez danych i bez tekstu: bez nagłówka
    if (kt?.rola === 'specjalnosci') {
      if (!opcje.specjalnosci && !tresc.length) return; // kierunek bez specjalności: bez pustego nagłówka
      zeSpecjalnosciami = true;
    }
    const id = noweId(kt?.id ?? (slug(etykietaH) || 'sekcja'));
    const c = { ...c0, pliki: kt?.pliki !== false && maPliki(tresc), tab: (kt?.uklad ?? 'proza') === 'bloki', kreski: kt?.lista === 'kreski', opisPo: !!kt?.opisPo };
    const srodek = kt?.rola === 'program' ? zakladki(tresc, c, etykietaH) : uklad(pytania(tresc), kt?.uklad ?? 'proza', c);
    if (kt?.rola === 'specjalnosci' && opcje.specjalnosci) srodek.push({ type: 'comment', value: 'specjalnosci' });
    if (kt?.wstawka && wstawki[kt.wstawka] && !wstawione.has(kt.wstawka)) { srodek.push(wstaw(kt.wstawka)); wstawione.add(kt.wstawka); }
    if (kt?.wstawkaNaKoncu && wstawki[kt.wstawkaNaKoncu] && !naglowkiWstawek.has(kt.wstawkaNaKoncu) && !wstawione.has(kt.wstawkaNaKoncu)) {
      srodek.push(wstaw(kt.wstawkaNaKoncu));
      wstawione.add(kt.wstawkaNaKoncu);
    }
    if (kt?.wstawka && ZAMIENIA_NAGLOWEK.has(kt.wstawka) && opcje.naglowki?.[kt.wstawka]) {
      etykietaH = opcje.naglowki[kt.wstawka];
      h.children = [tekst(etykietaH)];
    }
    if (typ === 'specjalnosc' && kt?.id === 'przebieg') {
      for (const ol of srodek.filter((n) => jest(n, 'ol') && n.properties.className?.includes('etapy'))) {
        for (const li of pozycje(ol)) dane.etapy.push({ etyk: tekstW(li.children[0]).trim(), t: tekstW(li.children[1]).trim() });
      }
    }
    if (typ === 'specjalnosc' && kt?.id === 'przedmioty') {
      for (const n of srodek) {
        if (jest(n, 'h3')) dane.grupy.push({ nazwa: tekstW(n).replace(/\s+/g, ' ').trim(), n: 0 });
        else if (jest(n, 'ul') && dane.grupy.length) dane.grupy[dane.grupy.length - 1].n += pozycje(n).length;
      }
    }
    sek.push(sekcja(h, srodek, etykietaH, id, kt?.krotko, kt?.id));
  });
  if (opcje.specjalnosci && !zeSpecjalnosciami) {
    const etykietaH = NAGLOWEK_SPECJALNOSCI[ctx.en && !opcje.lang ? 'en' : 'pl'];
    sek.push(sekcja(el('h2', null, [tekst(etykietaH)]), [{ type: 'comment', value: 'specjalnosci' }], etykietaH, noweId('specjalnosci'), undefined, 'specjalnosci'));
  }
  // specjalność: sekcje liczone bez nagłówka w treści — w ich dawnym miejscu (kolejność kotwic); ramka wyboru bez osi —
  // na końcu pierwszej sekcji („O specjalności”), jak dotąd
  for (const kt of KOTWICE.filter((x) => x.typ === typ && x.wstawka)) {
    const w = kt.wstawka;
    if (!wstawki[w] || wstawione.has(w)) continue;
    wstawione.add(w);
    if (KOTWICE.some((x) => x.typ === typ && x.wstawkaNaKoncu === w)) {
      if (sek.length) sek[0].node.children.push(wstaw(w));
      else wynik.push(wstaw(w));
      continue;
    }
    const etykietaH = opcje.naglowki?.[w] ?? kt.nazwy[0];
    const nowa = sekcja(el('h2', null, [tekst(etykietaH)]), [wstaw(w)], etykietaH, noweId(kt.id), kt.krotko, kt.id);
    const gdzie = sek.findIndex((s) => s.k > nowa.k);
    sek.splice(gdzie < 0 ? sek.length : gdzie, 0, nowa);
  }
  wynik.push(...sek.map((s) => s.node));
  tree.children = wynik;
  if (typ === 'specjalnosc') opcje.dane = dane;
  return sek.map((s) => s.wpis);
}

export default function rehypeBloki(options = {}) {
  const en = options.lang === 'en';
  // polski — (tekst) => czy wygląda na polski (src/lib/jezykTekstu.ts; tematy prac na stronie EN dostają lang="pl")
  const ctx = { slowo: en ? 'Step' : 'Krok', en, site: options.site ?? '', base: options.base ?? '/', polski: options.polski };
  return (tree, file) => {
    const fm = file?.data?.astro?.frontmatter ?? {};
    for (const typ of ['kierunek', 'specjalnosc']) {
      if (fm[typ] && typeof fm[typ] === 'object') {
        fm[typ].sekcje = sekcjeTresci(tree, ctx, fm[typ], typ);
        return;
      }
    }
    if (fm.bloki !== true) return;
    const b = bloki(tree);
    const h = b.findIndex((n) => jest(n, 'h2'));
    if (jest(b[h + 1], 'p') && h >= 0) b[h + 1].properties = { ...b[h + 1].properties, className: ['wst'] };
    if (b.some(pytanie)) tree.children = pytania(b);
    // listy plików: decyzja na sekcję ## (od nagłówka do następnego)
    const pierwszyH2 = tree.children.findIndex((n) => jest(n, 'h2'));
    let pliki = maPliki(pierwszyH2 < 0 ? tree.children : tree.children.slice(0, pierwszyH2));
    tree.children = tree.children.map((n, i, all) => {
      if (jest(n, 'h2')) {
        const k = all.findIndex((m, j) => j > i && jest(m, 'h2'));
        pliki = maPliki(all.slice(i + 1, k < 0 ? all.length : k));
      }
      return przeksztalc(n, { ...ctx, pliki, tab: false });
    });
  };
}
