// Bloki wzorca treści (src/styles/zal-tresc.css) z samego Markdownu, bez HTML — pole „Bloki wzorca” (bloki: true) w nagłówku strony
// (zlecenie 15, punkt 4). Formularz CMS (rich-text) nie przepuszcza surowego HTML, więc blok rozpoznajemy po budowie listy.
// Strony bez tego pola: bez zmian. Działa na najwyższym poziomie treści (nie wewnątrz cytatów i list):
// - pierwszy akapit po pierwszym ## — .wst (kolor nagłówków);
// - lista „**Tytuł** / opis / Klucz: wartość… / [link]” (każda pozycja zaczyna się akapitem z samym pogrubieniem) — ul.dwa, pary dl.para;
// - lista „*etykieta* / **Nazwa** / opis / [link]” — .kontakty;
// - lista z samych linków albo akapit z samym linkiem (ten po liście: dwie listy z rzędu edytor CMS skleiłby w jedną) — ul.linki;
// - lista numerowana „**Tytuł** / opis / [link]” — ol.etapy, z etykietą „Krok N” („Step N”);
// - cytat zaczynający się akapitem z samym pogrubieniem — ramka uwagi z etykietą .etyk.
// Akapit z samym linkiem na końcu pozycji — .akcja (przycisk-link). Opcja: lang ('pl' | 'en', domyślnie pl).

const el = (tagName, klasa, children = []) => ({ type: 'element', tagName, properties: klasa ? { className: [klasa] } : {}, children });
const tekst = (value) => ({ type: 'text', value });
// dzieci bez pustych tekstów (nowych linii między blokami)
const bloki = (n) => (n.children ?? []).filter((c) => !(c.type === 'text' && !c.value.trim()));
const jest = (n, tag) => n?.type === 'element' && n.tagName === tag;
// akapit złożony wyłącznie z jednego elementu tag (np. <p><strong>…</strong></p>)
const sam = (p, tag) => {
  if (!jest(p, 'p')) return undefined;
  const d = bloki(p);
  return d.length === 1 && jest(d[0], tag) ? d[0] : undefined;
};
const pozycje = (lista) => bloki(lista).filter((n) => jest(n, 'li'));
const linkPozycji = (li) => {
  const b = bloki(li);
  return b.length === 1 ? (jest(b[0], 'a') ? b[0] : sam(b[0], 'a')) : undefined;
};
const akcja = (p) => el('p', 'akcja', p.children);

// „Klucz: wartość” — para etykieta–wartość; klucz krótki, bez dwukropka, zwykły tekst na początku akapitu
const para = (p) => {
  const [pierwszy, ...reszta] = p.children ?? [];
  if (pierwszy?.type !== 'text') return undefined;
  const m = /^([^:\n]{1,20}):\s+([\s\S]*)$/.exec(pierwszy.value);
  if (!m) return undefined;
  return { klucz: m[1], wartosc: [...(m[2] ? [tekst(m[2])] : []), ...reszta] };
};

const naDwa = (lista) => {
  lista.properties = { ...lista.properties, className: ['dwa'] };
  lista.children = pozycje(lista).map((li) => {
    const [tytul, opis, ...dalej] = bloki(li);
    const dzieci = [el('b', null, sam(tytul, 'strong').children)];
    if (jest(opis, 'p')) dzieci.push(el('span', null, opis.children));
    const pary = [];
    const po = [];
    for (const b of dalej) {
      const pr = jest(b, 'p') && !sam(b, 'a') ? para(b) : undefined;
      if (pr) pary.push(el('dt', null, [tekst(pr.klucz)]), el('dd', null, pr.wartosc));
      else po.push(sam(b, 'a') ? akcja(b) : b);
    }
    if (pary.length) dzieci.push(el('dl', 'para', pary));
    li.children = [...dzieci, ...po];
    return li;
  });
  return lista;
};

const naKontakty = (lista) => el('div', 'kontakty', pozycje(lista).map((li) => {
  const [etykieta, nazwa, ...dalej] = bloki(li);
  return el('div', null, [
    el('span', 'etyk', sam(etykieta, 'em').children),
    el('b', null, sam(nazwa, 'strong').children),
    ...dalej.map((b) => (sam(b, 'a') ? akcja(b) : b)),
  ]);
}));

const naEtapy = (lista, slowo) => {
  lista.properties = { ...lista.properties, className: ['etapy'] };
  lista.children = pozycje(lista).map((li, i) => {
    const [tytul, ...dalej] = bloki(li);
    li.children = [
      el('span', 'etyk', [tekst(`${slowo} ${i + 1}`)]),
      el('p', 't', sam(tytul, 'strong').children),
      ...dalej.map((b) => (sam(b, 'a') ? akcja(b) : b)),
    ];
    return li;
  });
  return lista;
};

const przeksztalc = (n, slowo) => {
  if (sam(n, 'a')) return el('ul', 'linki', [el('li', null, [sam(n, 'a')])]);
  if (jest(n, 'ul')) {
    const li = pozycje(n);
    if (!li.length) return n;
    const b = li.map(bloki);
    if (b.every((x) => x.length >= 2 && sam(x[0], 'em') && sam(x[1], 'strong'))) return naKontakty(n);
    if (b.every((x) => x.length >= 2 && sam(x[0], 'strong'))) return naDwa(n);
    if (li.every(linkPozycji)) {
      n.properties = { ...n.properties, className: ['linki'] };
      n.children = li.map((x) => { x.children = [linkPozycji(x)]; return x; });
    }
    return n;
  }
  if (jest(n, 'ol')) {
    const b = pozycje(n).map(bloki);
    return b.length && b.every((x) => sam(x[0], 'strong')) ? naEtapy(n, slowo) : n;
  }
  if (jest(n, 'blockquote')) {
    const b = bloki(n);
    const g = b.length >= 2 ? sam(b[0], 'strong') : undefined;
    if (g) n.children = [el('span', 'etyk', g.children), ...b.slice(1)];
  }
  return n;
};

export default function rehypeBloki(options = {}) {
  const slowo = options.lang === 'en' ? 'Step' : 'Krok';
  return (tree, file) => {
    if (file?.data?.astro?.frontmatter?.bloki !== true) return;
    const b = bloki(tree);
    const h = b.findIndex((n) => jest(n, 'h2'));
    if (jest(b[h + 1], 'p') && h >= 0) b[h + 1].properties = { ...b[h + 1].properties, className: ['wst'] };
    tree.children = tree.children.map((n) => przeksztalc(n, slowo));
  };
}
