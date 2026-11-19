// Zlecenie 40 (decyzje właściciela 18.11): formularze Pages CMS „jak w Studiach” — kolejność pól (tytuł, tytuł EN → Treść,
// Treść EN → reszta; pola EN tuż pod polskimi), ściągawki przy Treści, ukryte pole format_tresci (jawny Markdown Stron i strony
// działu), szablony Treści nowych wpisów (default), ukrycia z etapu 0. Zmienia .pages.yml (Document API biblioteki yaml:
// komentarze, cudzysłowy i bloki | zostają; nieruszone fragmenty pliku bez zmian); w Web-Ustawienia także src/data/ustawienia.json
// (pola usunięte decyzją właściciela, zdjęcia nagłówków działów).
// Uruchomienie z katalogu Web-Core:  node skrypty/migracja/formularze_40.mjs <checkout repozytorium treści>
// Repozytorium rozpoznaje po nazwie katalogu (Web-Instytut…); każdy etap zlecenia dopisuje tu swój opis formularzy.
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

export const JAWNY = 'Jawny Markdown: ## rozpoczyna sekcję i pozycję spisu; {#id} zachowuje adres sekcji. Zwykły tekst jest prozą domyślnie; nie wymaga otaczających znaczników. Specjalne układy wymagają znaczników, np. :::kafelki, :::etapy, :::zakladki. Komentarze <!-- … --> objaśniają bloki; na stronie ich nie widać. Zachowaj pasujące końcowe dwukropki. Plik PDF: wgraj w „Media” i wklej link. Wygląd sprawdzaj po przebudowaniu strony (Podgląd).';
export const WPIS = 'Zwykły Markdown: akapity oddziela pusta linia; **pogrubienie**, *kursywa*, [tekst linku](https://…); lista: „- ” na początku linii; ## = nagłówek sekcji. Plik PDF: wgraj w „Media” i wklej link. Komentarze <!-- … --> to podpowiedzi; na stronie ich nie widać.';
const FORMAT_TRESCI = { name: 'format_tresci', label: 'Format treści', type: 'string', hidden: true, default: 'jawne' };

// Biblioteka yaml wcina listę z kotwicą („values: &id001” i niżej „  - name: …”) mimo indentSeq: false. Gdy w pliku źródłowym
// ta sama kotwica stała nad listą bez wcięcia, cofamy wcięcie tej listy — reszta pliku i znaczenie YAML bez zmian.
function wcieciaKotwic(wynik, zrodlo) {
  const linie = wynik.split('\n');
  for (let i = 0; i < linie.length - 1; i++) {
    const m = /^(\s*)(?:- )?[\w-]+: &[\w-]+$/.exec(linie[i]);
    if (!m) continue;
    const zr = zrodlo.split('\n');
    const j = zr.indexOf(linie[i]);
    if (j < 0 || !zr[j + 1]) continue;
    const wciecieZrodla = /^(\s*)- /.exec(zr[j + 1])?.[1];
    const wciecieWyniku = /^(\s*)- /.exec(linie[i + 1])?.[1];
    if (wciecieZrodla === undefined || wciecieWyniku === undefined || wciecieWyniku.length <= wciecieZrodla.length) continue;
    const roznica = wciecieWyniku.length - wciecieZrodla.length;
    for (let k = i + 1; k < linie.length; k++) {
      const w = /^(\s*)/.exec(linie[k])[1].length;
      if (linie[k].trim() && w < wciecieWyniku.length) break;
      linie[k] = linie[k].slice(Math.min(roznica, w));
    }
  }
  return linie.join('\n');
}

export async function formularze(repo, opis) {
  const plik = path.join(repo, '.pages.yml');
  // klon z core.autocrlf=true ma w katalogu roboczym CRLF: porównania linii (wcieciaKotwic) i wynik na LF (Git zapisuje LF)
  const zrodlo = (await fs.readFile(plik, 'utf8')).replace(/\r\n/g, '\n');
  const doc = YAML.parseDocument(zrodlo);
  const wezel = (o) => doc.createNode(o);
  // formularze najwyższego poziomu i z grup (type: group, items: …), np. „Ustawienia strony” w Web-Ustawienia
  const wszystkie = (lista) => lista.flatMap((i) => [i, ...(i.get('items')?.items ? wszystkie(i.get('items').items) : [])]);
  const formularz = (nazwa) => {
    const f = wszystkie(doc.get('content').items).find((i) => i.get('name') === nazwa);
    if (!f) throw Error(`Brak formularza ${nazwa}`);
    return f;
  };
  const dane = [];
  const pole = (seq, nazwa) => {
    const p = seq.items.find((i) => i.get('name') === nazwa);
    if (!p) throw Error(`Brak pola ${nazwa}`);
    return p;
  };
  const api = {
    formularz,
    pola: (nazwa) => formularz(nazwa).get('fields'),
    pole,
    /** Pełna nowa kolejność pól listy (te same nazwy, inna kolejność). */
    kolejnosc(seq, nazwy) {
      const stare = seq.items.map((i) => i.get('name'));
      if ([...stare].sort().join() !== [...nazwy].sort().join()) throw Error(`Kolejność: inne pola niż w formularzu (${stare.join(', ')})`);
      seq.items = nazwy.map((n) => pole(seq, n));
    },
    /** Ustawia klucz pola (opis za etykietą, inne na końcu). */
    ustaw(wezelPola, klucz, wartosc) {
      if (wezelPola.has(klucz)) { wezelPola.set(klucz, wartosc); return; }
      const para = doc.createPair(klucz, wartosc);
      const i = klucz === 'description' ? wezelPola.items.findIndex((p) => p.key.value === 'label') + 1 : 0;
      if (i > 0) wezelPola.items.splice(i, 0, para); else wezelPola.items.push(para);
    },
    /** Dodaje pole format_tresci (ukryte, domyślnie jawne) za Treścią EN, jeśli go nie ma. */
    formatTresci(seq) {
      if (seq.items.some((i) => i.get('name') === 'format_tresci')) return;
      const i = seq.items.findIndex((p) => p.get('name') === 'tresc_en');
      seq.items.splice(i + 1, 0, wezel(FORMAT_TRESCI));
    },
    /** Linia komentarza w nagłówku pliku (pod dotychczasowymi). */
    komentarz(linia) { komentarze.push(`# ${linia}`); },
    /** Usuwa pole z formularza (decyzja właściciela; strona go nie czyta). Brak pola = już usunięte. */
    usun(seq, nazwa) {
      const i = seq.items.findIndex((p) => p.get('name') === nazwa);
      if (i >= 0) seq.items.splice(i, 1);
    },
    /** Przełącznik „Opublikowane” (zlecenie 33; zlecenie 48: aktualności, opis seminarium, referaty): dodaje pole, gdy go nie ma,
     *  i ustawia etykietę, opis, typ i default jak w zleceniu 33. Miejsce (zaraz pod tytułem) ustala potem kolejnosc(). */
    przelacznikOpublikowane(seq, opis) {
      const p = seq.items.find((i) => i.get('name') === 'opublikowany');
      if (!p) { seq.items.push(wezel({ name: 'opublikowany', label: OPUBLIKOWANE, description: opis, type: 'boolean', default: true })); return; }
      for (const [k, v] of [['label', OPUBLIKOWANE], ['description', opis], ['type', 'boolean'], ['default', true]]) api.ustaw(p, k, v);
    },
    /** Wstawia nowe pole tuż za polem `za` (zlecenie 52), gdy pola o tej nazwie jeszcze nie ma; istniejące zostaje bez zmian. */
    wstawZa(seq, za, obiekt) {
      if (seq.items.some((p) => p.get('name') === obiekt.name)) return;
      const i = seq.items.findIndex((p) => p.get('name') === za);
      if (i < 0) throw Error(`Brak pola ${za}`);
      seq.items.splice(i + 1, 0, doc.createNode(obiekt, { aliasDuplicateObjects: false }));
    },
    /** Pokazuje pole w CMS (usuwa hidden). */
    odkryj(wezelPola) { wezelPola.delete('hidden'); },
    /** Zamienia formularz najwyższego poziomu na nowy (to samo miejsce w menu CMS), np. kolekcję na grupę (zlecenie 47). */
    zamienFormularz(nazwa, obiekt) {
      const lista = doc.get('content');
      const i = lista.items.findIndex((x) => x.get('name') === nazwa);
      if (i < 0) throw Error(`Brak formularza ${nazwa}`);
      lista.items[i] = doc.createNode(obiekt, { aliasDuplicateObjects: false });
    },
    /** Etykiety „EN: coś” → „Coś EN” we wszystkich polach listy, także zagnieżdżonych (raport 40-0, sekcja 3). */
    etykietyEn(seq) {
      for (const p of seq.items) {
        const l = p.get('label');
        if (typeof l === 'string' && l.startsWith('EN: ')) {
          const [, tekst, nawias = ''] = /^(.*?)( \(.*\))?$/.exec(l.slice(4));
          p.set('label', `${tekst[0].toUpperCase()}${tekst.slice(1)} EN${nawias}`);
        }
        if (p.get('fields')?.items) api.etykietyEn(p.get('fields'));
      }
    },
    /** Zmiana pliku danych JSON repozytorium (zapis jak w źródle: 2 spacje, ten sam koniec pliku). fn zmienia obiekt w miejscu. */
    daneJson(rel, fn) { dane.push({ rel, fn }); },
    /** Zmiana nagłówka YAML plików .md katalogu (tekstowo: fn(nagłówek) → nagłówek; Treść i reszta pliku bez zmian). */
    naglowkiMd(katalog, fn) { dane.push({ katalog, fn }); },
  };
  const komentarze = [];
  opis(api);
  // styl list jak w źródle: Web-Studia ma listy wcięte („content:” i niżej „  - name:”), pozostałe repozytoria — bez wcięcia
  const indentSeq = /^content:\r?\n +- /m.test(zrodlo);
  let wynik = doc.toString({ indentSeq, lineWidth: 0, flowCollectionPadding: false });
  if (!indentSeq) wynik = wcieciaKotwic(wynik, zrodlo);
  const linie = wynik.split('\n');
  const nowe = komentarze.filter((k) => !linie.includes(k));
  if (nowe.length) {
    const i = linie.findIndex((l) => !l.startsWith('#'));
    linie.splice(i, 0, ...nowe);
    wynik = linie.join('\n');
  }
  await fs.writeFile(plik, wynik);
  let zmiana = wynik !== zrodlo;
  for (const { katalog, fn } of dane.filter((x) => x.katalog)) {
    for (const nazwa of (await fs.readdir(path.join(repo, katalog))).filter((n) => n.endsWith('.md')).sort()) {
      const p = path.join(repo, katalog, nazwa);
      const tekst = await fs.readFile(p, 'utf8');
      const m = /^(---\r?\n)([\s\S]*?)(\r?\n---(?:\r?\n|$))/.exec(tekst);
      if (!m) continue;
      const nowy = m[1] + fn(m[2]) + m[3] + tekst.slice(m[0].length);
      if (nowy !== tekst) { await fs.writeFile(p, nowy); zmiana = true; console.log(`Zapisano ${katalog}/${nazwa}`); }
    }
  }
  for (const { rel, fn } of dane.filter((x) => x.rel)) {
    const p = path.join(repo, rel);
    const tekst = await fs.readFile(p, 'utf8');
    const obiekt = JSON.parse(tekst);
    fn(obiekt);
    const crlf = tekst.includes('\r\n');
    let nowy = JSON.stringify(obiekt, null, 2) + (/\n$/.test(tekst) ? '\n' : '');
    if (crlf) nowy = nowy.replace(/\n/g, '\r\n');
    if (nowy !== tekst) { await fs.writeFile(p, nowy); zmiana = true; console.log(`Zapisano ${rel}`); }
  }
  return zmiana;
}

// ---------- Web-Instytut: „Warto wiedzieć” (zlecenie 47) ----------
const KOMENTARZ_47 = 'Zlecenie 47: „Warto wiedzieć” jako grupa trzech kolekcji (Sylwetki, Nagrody i wyróżnienia, Historie) w podkatalogach src/content/warto_wiedziec/; formularze według wzoru Studiów, „Dodano” z default "".';
const OPUBLIKOWANE = 'Opublikowane — widoczne na stronie publicznej (na Podglądzie widać zawsze)';
const KOM = {
  uklad: '<!-- UKŁAD JAWNY: ## rozpoczyna sekcję w spisie. Nazwę można zmieniać; {#id} zachowuje adres. Bloki :::nazwa … ::: sterują wyglądem; komentarze są tylko instrukcjami dla redaktora. -->',
  tekst: '<!-- TEKST: Zwykły Markdown. Specjalny układ wymaga jawnego znacznika bloku. -->',
  // zlecenie 52: bez :::w-skrocie (liczby do banera — pole „Liczby”, LICZBY_SYLWETKI niżej)
  tba: '<!-- TBA: Pusta Treść = sylwetka „TBA” (imię, lata i znaczek TBA). Tekst pisz według innych sylwetek: wstęp, sekcje ## z {#id}, „## Źródła {#zrodla}”. Liczby do banera wpisuje się w polu „Liczby”. -->',
};
const SZKIELET_SYLWETKI = [
  '<!-- SZKIELET SYLWETKI: skopiuj poniższe linie nad ten komentarz (bez znaczników komentarza) i wypełnij; komentarz TBA wyżej usuń.',
  'Wstęp: dwa, trzy zdania o osobie.',
  '',
  '## Droga naukowa {#droga}',
  '',
  'Tekst sekcji.',
  '',
  '## Źródła {#zrodla}',
  '',
  '- [Tytuł źródła](https://…) — co z niego wzięto',
  '-->',
].join('\n');
const SZKIELET_LAUREATOW = [
  '<!-- LAUREACI: gdy nagrodę dostał ktoś z Instytutu, skopiuj poniższe linie nad ten komentarz (bez znaczników komentarza). Każdy punkt: **rok** imię i nazwisko — [aktualność](/aktualnosci/…); nazwisko jako link do sylwetki dostaje portret; nowych dopisuj na górze.',
  '## Laureaci z Instytutu {#laureaci}',
  '',
  ':::laureaci',
  '',
  '- **2026** Imię Nazwisko — [aktualność](/aktualnosci/…)',
  '',
  ':::',
  '-->',
].join('\n');
const opublikowane = (opis) => ({ name: 'opublikowany', label: OPUBLIKOWANE, description: opis, type: 'boolean', default: true });
const tresc = (opis, szablon) => ({ name: 'body', label: 'Treść', description: `${JAWNY} ${opis}`, type: 'code', options: { format: 'markdown' }, default: szablon });
const trescEn = (opis) => ({ name: 'tresc_en', label: 'Treść EN', description: `${JAWNY} ${opis}`, type: 'code', options: { format: 'markdown' } });
const FORMAT_TRESCI_47 = { ...FORMAT_TRESCI };
const OBRAZ = { name: 'obraz', label: 'Zdjęcie', description: 'Tylko z prawem do publikacji. Puste = bez zdjęcia.', type: 'image', options: { path: 'public/pliki/warto-wiedziec' } };
const POLA_OBRAZU_LINKU = [
  OBRAZ,
  { name: 'obraz_opis', label: 'Opis zdjęcia', description: 'Np. „Medal Uniwersytetu Wrocławskiego”. Pokazuje się pod zdjęciem. Puste = bez opisu.', type: 'string', default: '' },
  { name: 'obraz_opis_en', label: 'Opis zdjęcia EN', description: 'Puste = opis polski.', type: 'string', default: '' },
  { name: 'link', label: 'Link', description: 'Artykuł, nagranie, strona nagrody: /… albo https://…. Przycisk pod Treścią; przy pustej Treści karta prowadzi prosto do linku. Puste = bez przycisku.', type: 'string', default: '' },
  { name: 'link_etykieta', label: 'Napis na przycisku linku', description: 'Np. „Artykuł w Annals of Mathematics”. Puste = „Więcej”.', type: 'string', default: '' },
  { name: 'link_etykieta_en', label: 'Napis na przycisku EN', description: 'Puste = napis polski.', type: 'string', default: '' },
];
const zajawka = (gdzie) => [
  { name: 'zajawka', label: 'Zajawka (1–2 zdania)', description: `${gdzie} Puste = bez zajawki.`, type: 'text', default: '' },
  { name: 'zajawka_en', label: 'Zajawka EN', description: 'Puste = zajawka polska.', type: 'text', default: '' },
];
const STRONA_GLOWNA = [
  { name: 'dodano', label: 'Dodano', description: 'Dzień dodania wpisu: przez 30 dni znaczek „Nowe”. Ustaw tylko przy nowym wpisie albo przy publikacji szkicu, nie przy poprawkach. Puste = bez „Nowe”.', type: 'date', default: '', options: { format: 'yyyy-MM-dd' } },
  { name: 'na_glownej', label: 'Pokaż na stronie głównej', description: 'Wpis losuje się w rzędzie „Warto wiedzieć” na stronie głównej. Wyłączone = tylko na stronie Warto wiedzieć.', type: 'boolean', default: true },
  { name: 'ulubione', label: 'Ulubione', description: 'Na stronie głównej losuje się 3× częściej. Wyłączone = zwykła szansa.', type: 'boolean', default: false },
  { name: 'zawsze', label: 'Zawsze pokazuj na stronie głównej (nie losuj; zwykle zostaw puste)', description: 'Wpis zajmuje na stałe jedno z miejsc w rzędzie „Warto wiedzieć”. Wyłączone = losuje się jak inne.', type: 'boolean', default: false },
];
const ZRODLA = { name: 'zrodla', label: 'Źródła (dla redakcji, niewyświetlane)', description: 'Skąd są fakty: link albo opis, jeden na pozycję. Na stronie się nie pokazuje. Puste = brak.', type: 'string', list: true };
const MMDD = { regex: '^(|(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]))$', message: 'Wpisz datę w formacie MM-DD, np. 01-14' };
// Zlecenie 52: liczby w banerze sylwetki — pole jak „Liczby” Stron i Pracowników (n, n_en, etykieta, etykieta_en, ukryte pozycja),
// tuż pod „Podpis EN”; opis Treści i szablon nowej sylwetki bez :::w-skrocie (blok został w kodzie tylko jako zapas starych plików).
const KOMENTARZ_52 = 'Zlecenie 52: Sylwetki — pole „Liczby w banerze (3 pozycje)” (liczby) pod Podpisem EN; opis i szablon Treści bez bloku :::w-skrocie.';
const LICZBY_SYLWETKI = {
  name: 'liczby', label: 'Liczby w banerze (3 pozycje)',
  description: 'Trzy krótkie pozycje pod podpisem na banerze, np. „1945 · pierwszy dziekan”, „20 · doktorów”. Liczba: same cyfry (rok, liczba, 1800+). Podpis: najwyżej ok. 20 znaków, małą literą, bez linków. Pokazują się pierwsze trzy. Puste = baner bez liczb.',
  type: 'object', list: { collapsible: { collapsed: true, summary: '{n} {etykieta}' } },
  fields: [
    { name: 'n', label: 'Liczba (np. 1945 albo 20)', type: 'string', required: true },
    { name: 'n_en', label: 'Liczba EN (puste = jak po polsku)', type: 'string' },
    { name: 'etykieta', label: 'Podpis (np. pierwszy dziekan)', type: 'string', required: true },
    { name: 'etykieta_en', label: 'Podpis EN (puste = podpis polski)', type: 'string' },
    { name: 'pozycja', type: 'boolean', hidden: true },
  ],
};
const OPIS_TRESCI_SYLWETKI = 'Sylwetka: wstęp (obok portretu), sekcje ## z {#id}, „## Do pobrania {#do-pobrania}” z :::pliki, na końcu „## Źródła {#zrodla}” (na stronie zwinięte). Liczby do banera wpisuje się w polu „Liczby”. Link do innej sylwetki, nagrody albo historii (/instytut/warto-wiedziec/…) łączy wpisy. Pusta Treść (albo same komentarze) = sylwetka „TBA”.';
const kolekcja = (name, label, katalog, description, view, fields) => ({
  name, label, type: 'collection', path: `src/content/warto_wiedziec/${katalog}`, format: 'yaml-frontmatter', filename: '{primary}.md',
  description, view, fields,
});
export const WARTO_WIEDZIEC_47 = {
  name: 'warto_wiedziec',
  label: 'Warto wiedzieć',
  type: 'group',
  items: [
    kolekcja('ww_sylwetki', 'Sylwetki', 'sylwetki',
      'Ludzie Instytutu: siatka portretów na stronie Warto wiedzieć (/instytut/warto-wiedziec) i strona każdej osoby. Pusta Treść = sylwetka „TBA”. Sylwetka osoby żyjącej: odznacz „Opublikowane”, dopóki osoba nie zaakceptuje tekstu. Nazwa pliku (adres) powstaje z imienia i nazwiska.',
      { fields: ['tytul', 'lata', 'opublikowany', 'dodano'], primary: 'tytul', sort: 'tytul' },
      [
        { name: 'tytul', label: 'Imię i nazwisko', description: 'Np. „Hugo Steinhaus”. Przy zakładaniu sylwetki powstaje z tego nazwa pliku i adres strony (późniejsza zmiana adresu nie zmienia).', type: 'string', required: true },
        opublikowane('Odznacz, żeby przygotować sylwetkę bez pokazywania jej na stronie publicznej (szkic). Sylwetka osoby żyjącej: szkic, dopóki osoba nie zaakceptuje tekstu.'),
        tresc(OPIS_TRESCI_SYLWETKI, `${KOM.uklad}\n\n${KOM.tba}\n\n${SZKIELET_SYLWETKI}`),
        trescEn('Sylwetka po angielsku, w tym samym układzie. Puste = strona angielska pokaże ramkę „Translation in preparation” z linkiem do wersji polskiej.'),
        FORMAT_TRESCI_47,
        { name: 'lata', label: 'Lata', description: 'Np. 1887–1972 albo 1956 (= ur. 1956). Inny tekst pokaże się tak, jak wpisany. Puste = bez lat.', type: 'string', default: '' },
        { name: 'podpis', label: 'Podpis (jedno zdanie)', description: 'Np. „Współtwórca wrocławskiej szkoły matematycznej”. Pod nazwiskiem w banerze i na karcie w siatce sylwetek. Puste = bez podpisu.', type: 'string', default: '' },
        { name: 'podpis_en', label: 'Podpis EN', description: 'Puste = podpis polski.', type: 'string', default: '' },
        LICZBY_SYLWETKI,
        { name: 'rocznica_urodzin', label: 'Rocznica urodzin', description: 'MM-DD, np. 01-14. Przez 7 dni przed i po tej dacie sylwetka ma pierwszeństwo na stronie głównej. Puste = bez rocznicy.', type: 'string', default: '', pattern: MMDD },
        { name: 'karta', label: 'Karta', description: 'Zajawka i portret.', type: 'object', fields: [
          ...zajawka('Pokazuje się w rzędzie „Warto wiedzieć” na stronie głównej i w opisie strony dla Google.'),
          { ...OBRAZ, description: 'Portret, tylko z prawem do publikacji. Puste = sylwetka zastępcza.' },
          { name: 'obraz_zrodlo', label: 'Źródło zdjęcia', description: 'Autor, licencja, link, np. „Fot. Jan Kowalski, CC BY-SA 4.0”. Pokazuje się drobno pod portretem. Puste = bez podpisu.', type: 'string', default: '' },
        ] },
        ...STRONA_GLOWNA,
      ]),
    kolekcja('ww_nagrody', 'Nagrody i wyróżnienia', 'nagrody',
      'Nagrody i wyróżnienia Instytutu i jego ludzi, w kolejności z pola „Kolejność” (10, 20, 30…). Laureatów dopisuj w Treści w bloku :::laureaci; licznik na liście liczy się sam.',
      { fields: ['tytul', 'kolejnosc', 'opublikowany', 'na_glownej'], primary: 'tytul', sort: 'kolejnosc' },
      [
        { name: 'tytul', label: 'Tytuł', description: 'Np. „Medal Uniwersytetu Wrocławskiego”. Przy zakładaniu wpisu powstaje z tego nazwa pliku i adres strony.', type: 'string', required: true },
        { name: 'tytul_en', label: 'Tytuł EN', description: 'Puste = tytuł polski.', type: 'string', default: '' },
        opublikowane('Odznacz, żeby przygotować wpis bez pokazywania go na stronie publicznej (szkic).'),
        tresc('Opis nagrody; laureaci z Instytutu w sekcji „## Laureaci z Instytutu {#laureaci}” w bloku :::laureaci (licznik na liście liczy się sam), dokumenty w :::pliki. Pusta Treść (albo same komentarze) = wpis bez własnej strony; karta prowadzi do linku.', `${KOM.uklad}\n\n${KOM.tekst}\n\n${SZKIELET_LAUREATOW}`),
        trescEn('Opis po angielsku, w tym samym układzie. Puste = strona angielska pokaże ramkę „Translation in preparation” z linkiem do wersji polskiej.'),
        FORMAT_TRESCI_47,
        { name: 'kolejnosc', label: 'Kolejność', description: 'Mniejsza = wyżej; zostaw odstępy 10, 20, 30, żeby wstawiać pomiędzy. Puste = na końcu (100).', type: 'number', default: 100 },
        { name: 'karta', label: 'Karta', description: 'Zajawka, zdjęcie z opisem i link z napisem na przycisku (i EN).', type: 'object', fields: [
          ...zajawka('Pokazuje się na liście nagród, na stronie wpisu (wstęp) i w rzędzie „Warto wiedzieć” na stronie głównej.'),
          ...POLA_OBRAZU_LINKU,
        ] },
        ...STRONA_GLOWNA,
        ZRODLA,
      ]),
    kolekcja('ww_historie', 'Historie', 'historie',
      'Wydarzenia i odkrycia na osi czasu na stronie Warto wiedzieć. Rok jest wymagany: stawia punkt na osi. Zajawka pokazuje się w panelu osi, więc najlepiej 1–2 zdania.',
      { fields: ['tytul', 'karta.rok', 'opublikowany', 'na_glownej'], primary: 'tytul', sort: 'karta.rok' },
      [
        { name: 'tytul', label: 'Tytuł', description: 'Np. „Pierwsze wykłady matematyki we Wrocławiu”. Przy zakładaniu wpisu powstaje z tego nazwa pliku i adres strony.', type: 'string', required: true },
        { name: 'tytul_en', label: 'Tytuł EN', description: 'Puste = tytuł polski.', type: 'string', default: '' },
        opublikowane('Odznacz, żeby przygotować wpis bez pokazywania go na stronie publicznej (szkic).'),
        tresc('Historia: zwykły tekst, sekcje ## z {#id}. Pusta Treść (albo same komentarze) = wpis bez własnej strony; panel osi prowadzi do linku.', `${KOM.uklad}\n\n${KOM.tekst}`),
        trescEn('Tekst po angielsku, w tym samym układzie. Puste = strona angielska pokaże ramkę „Translation in preparation” z linkiem do wersji polskiej.'),
        FORMAT_TRESCI_47,
        // required: Pages CMS nie sprawdza pól całkiem pustej grupy, która nie jest wymagana — bez tego historia bez roku przeszłaby zapis
        { name: 'karta', label: 'Karta', description: 'Rok (punkt na osi), zajawka, zdjęcie z opisem i link z napisem na przycisku (i EN).', type: 'object', required: true, fields: [
          { name: 'rok', label: 'Rok', description: 'Rok wydarzenia, np. 1946. Wymagany: stawia punkt na osi czasu.', type: 'string', required: true, pattern: { regex: '^\\d{4}$', message: 'Wpisz rok, np. 1946' } },
          ...zajawka('Pokazuje się w panelu osi czasu, na stronie wpisu (wstęp) i na stronie głównej; najlepiej 1–2 zdania.'),
          ...POLA_OBRAZU_LINKU,
        ] },
        { name: 'rocznica', label: 'Rocznica', description: 'MM-DD, np. 11-15. Przez 7 dni przed i po tej dacie historia ma pierwszeństwo na stronie głównej, a oś czasu startuje od niej. Puste = bez rocznicy.', type: 'string', default: '', pattern: MMDD },
        ...STRONA_GLOWNA,
        ZRODLA,
      ]),
  ],
};

// ---------- Web-Instytut (etap 1) ----------
function instytut({ pola, pole, kolejnosc, ustaw, formatTresci, formularz, komentarz, zamienFormularz, wstawZa }) {
  komentarz('Zlecenie 40: Strony i strona działu w jawnym Markdownie (ukryte format_tresci), ściągawki przy Treści, pola EN pod polskimi, szablony Treści zakładu i „Warto wiedzieć”, ukryte notatki i hasło władz.');

  // Strona działu
  const sd = pola('strona-dzialu');
  formatTresci(sd);
  kolejnosc(sd, ['tytul', 'tytul_en', 'opublikowany', 'body', 'tresc_en', 'format_tresci', 'wstep', 'wstep_en', 'haslo', 'haslo_en', 'o_instytucie_fakty', 'kontakt_godziny', 'kontakt_godziny_en']);
  ustaw(pole(sd, 'body'), 'description', `${JAWNY} To tekst sekcji „O Instytucie”; pierwszy akapit strona pokazuje większą czcionką. Zdanie nad ostatnimi sukcesami: na końcu, pod „## Ostatnie sukcesy {#sukcesy}” (bez tego nagłówka sukcesy są bez zdania).`);
  ustaw(pole(sd, 'tresc_en'), 'description', `${JAWNY} Tekst „O Instytucie” po angielsku; zdanie nad sukcesami pod „## Recent achievements {#sukcesy}”. Puste = strona angielska pokaże tekst polski.`);
  ustaw(pole(sd, 'wstep'), 'label', 'Opis strony dla Google (1–2 zdania)');
  ustaw(pole(sd, 'wstep'), 'description', 'Trafia do Google i do podglądu linku; na samej stronie się nie wyświetla. Np. „Instytut Matematyczny Uniwersytetu Wrocławskiego: badania, seminaria i studia…”. Puste = ogólny opis serwisu.');
  ustaw(pole(sd, 'wstep_en'), 'label', 'EN: opis strony dla Google');
  ustaw(pole(sd, 'haslo'), 'description', 'Np. „Wrocławska szkoła matematyczna”. Puste = hasło domyślne działu.');

  // Zakłady
  const zf = formularz('zaklady');
  ustaw(zf, 'description', 'Zakłady naukowe i Pracownia Dydaktyki i Popularyzacji Matematyki: lista w Instytut → Struktura i zakłady, każdy zakład ma własną stronę. Skład zakładu bierze się z pola „Zakład” w kartach pracowników; seminaria, granty i konferencje — z ich pola „Zakład”.');
  const z = pola('zaklady');
  kolejnosc(z, ['nazwa', 'nazwa_en', 'opublikowany', 'body', 'tresc_en', 'karta', 'kolejnosc']);
  ustaw(pole(z, 'body'), 'description', WPIS);
  ustaw(pole(z, 'body'), 'default', '<!-- TEKST: Czym zajmuje się zakład. Skład i seminaria strona dopisze sama. -->');
  kolejnosc(pole(z, 'karta').get('fields'), ['nazwa_krotka', 'nazwa_krotka_en', 'kierownik', 'telefon', 'opis', 'opis_en', 'haslo', 'haslo_en', 'obszary', 'obszary_en', 'strona', 'zdjecie', 'zdjecie_opis', 'zdjecie_opis_en']);
  ustaw(pole(z, 'kolejnosc'), 'description', 'Mniejsza liczba = wyżej na liście „Struktura i zakłady”, np. 1, 2, 3…');

  // Strony
  const sf = formularz('strony');
  const JAK_W_STUDIACH = ' Treść w jawnym Markdownie, jak w Studiach.';
  if (!sf.get('description').endsWith(JAK_W_STUDIACH)) ustaw(sf, 'description', sf.get('description') + JAK_W_STUDIACH);
  const s = pola('strony');
  formatTresci(s);
  kolejnosc(s, ['tytul', 'tytul_en', 'opublikowany', 'body', 'tresc_en', 'format_tresci', 'opis', 'opis_en', 'haslo', 'haslo_en', 'liczby', 'pasek_boczny', 'bloki']);
  ustaw(pole(s, 'body'), 'description', JAWNY);
  ustaw(pole(s, 'tresc_en'), 'description', `${JAWNY} Puste = strona angielska pokaże treść polską.`);
  ustaw(pole(s, 'opis'), 'label', 'Krótki opis (Google i podgląd linku)');
  ustaw(pole(s, 'opis'), 'description', 'Na samej stronie się nie wyświetla (baner pokazuje tytuł i hasło). Np. „Adres, telefony i e-mail Instytutu…”. Puste = ogólny opis serwisu.');
  // „Bloki wzorca”: w jawnym formacie strona ich nie czyta (układ wskazują bloki :::) — ukryte, wartości zostają w plikach.
  ustaw(pole(s, 'bloki'), 'hidden', true);

  // „Warto wiedzieć” — od zlecenia 47 grupa trzech kolekcji (sylwetki, nagrody, historie); dawny formularz zlecenia 40 zastępuje
  // WARTO_WIEDZIEC_47. Gdy grupa już jest (drugie uruchomienie albo zmiana właściciela w CMS) — bez zmian.
  if (formularz('warto_wiedziec').get('type') !== 'group') {
    komentarz(KOMENTARZ_47);
    zamienFormularz('warto_wiedziec', WARTO_WIEDZIEC_47);
  }
  // Historie: grupa „Karta” wymagana (rok obowiązkowy także wtedy, gdy redaktor nie otworzy karty) — też dla grupy już przeniesionej
  ustaw(pole(pola('ww_historie'), 'karta'), 'required', true);
  // Sylwetki (zlecenie 52): pole „Liczby” pod Podpisem EN, opis i szablon Treści bez :::w-skrocie — też dla grupy już przeniesionej
  const sy = pola('ww_sylwetki');
  wstawZa(sy, 'podpis_en', LICZBY_SYLWETKI);
  const trescSylwetki = tresc(OPIS_TRESCI_SYLWETKI, `${KOM.uklad}\n\n${KOM.tba}\n\n${SZKIELET_SYLWETKI}`);
  ustaw(pole(sy, 'body'), 'description', trescSylwetki.description);
  ustaw(pole(sy, 'body'), 'default', trescSylwetki.default);
  komentarz(KOMENTARZ_52);
  if (sf.get('description').includes(' warto-wiedziec.md (Warto wiedzieć)')) {
    ustaw(sf, 'description', sf.get('description').replace(' warto-wiedziec.md (Warto wiedzieć)', ' instytut/warto-wiedziec.md (Warto wiedzieć)'));
  }

  // Władze (decyzje 18.11: notatki i hasło bez liczb ukryte; wartości zostają w pliku)
  const wl = pola('wladze');
  ustaw(pole(wl, 'haslo'), 'hidden', true);
  ustaw(pole(wl, 'haslo_en'), 'hidden', true);
  ustaw(pole(wl, 'do_uzupelnienia'), 'hidden', true);
  const osoby = pole(wl, 'osoby').get('fields');
  ustaw(pole(osoby, 'imie_nazwisko'), 'description', 'Np. „Jan Kowalski” — dokładnie jak w Pracownikach; stamtąd strona weźmie tytuł, e-mail, pokój i zakład.');
  ustaw(pole(osoby, 'zdjecie'), 'description', 'Puste = karta bez zdjęcia.');
}

// ---------- Web-Nauka (etap 2) ----------
// Szablon Aktualności z raportu 40-0 (sekcja 4); konferencja dostaje go z dopiskiem o programie i opłatach.
export const SZABLON_AKTUALNOSCI = '<!-- TEKST: Zwykły tekst. Akapity oddziela pusta linia. Pliki: wgraj w „Media” i wklej link. -->\n<!-- Rejestracja, program, plakat: wstaw link w osobnej linii. -->';

function nauka({ pola, pole, kolejnosc, ustaw, formatTresci, formularz, komentarz }) {
  komentarz('Zlecenie 40: Strony i strona działu w jawnym Markdownie (ukryte format_tresci), ściągawki przy Treści, pola EN pod polskimi, opisy formularzy, szablony Treści konferencji i projektu; konferencja z opisem ma własną stronę.');

  // Strona działu
  const sdf = formularz('strona-dzialu');
  const opisSd = sdf.get('description');
  if (opisSd.includes('tekst pod tytułem')) ustaw(sdf, 'description', opisSd.replace('tekst pod tytułem', 'opis strony dla Google'));
  const sd = pola('strona-dzialu');
  formatTresci(sd);
  kolejnosc(sd, ['tytul', 'tytul_en', 'opublikowany', 'body', 'tresc_en', 'format_tresci', 'wstep', 'wstep_en', 'haslo', 'haslo_en', 'badania_fakty']);
  ustaw(pole(sd, 'body'), 'description', `${JAWNY} To tekst sekcji „Badania w Instytucie”; pierwszy akapit strona pokazuje większą czcionką.`);
  ustaw(pole(sd, 'tresc_en'), 'description', `${JAWNY} Tekst „Badania w Instytucie” po angielsku. Puste = strona angielska pokaże tekst polski.`);
  ustaw(pole(sd, 'wstep'), 'label', 'Opis strony dla Google (1–2 zdania)');
  ustaw(pole(sd, 'wstep'), 'description', 'Trafia do Google i do podglądu linku; na samej stronie się nie wyświetla. Np. „Badania w ośmiu zakładach naukowych Instytutu…”. Puste = ogólny opis serwisu.');
  ustaw(pole(sd, 'wstep_en'), 'label', 'EN: opis strony dla Google');
  ustaw(pole(sd, 'haslo'), 'description', 'Np. „Poznaj nasze badania na A+”. Puste = hasło domyślne działu.');

  // Strony (w tym teksty stron z listą: konferencje, granty, sukcesy, publikacje)
  const sf = formularz('strony');
  const JAK_W_STUDIACH = ' Treść w jawnym Markdownie, jak w Studiach.';
  if (!sf.get('description').endsWith(JAK_W_STUDIACH)) ustaw(sf, 'description', sf.get('description') + JAK_W_STUDIACH);
  const s = pola('strony');
  formatTresci(s);
  kolejnosc(s, ['tytul', 'tytul_en', 'opublikowany', 'body', 'tresc_en', 'format_tresci', 'opis', 'opis_en', 'haslo', 'haslo_en', 'haslo_podstron', 'haslo_podstron_en', 'liczby', 'pasek_boczny', 'bloki']);
  ustaw(pole(s, 'body'), 'description', `${JAWNY} Strona z listą (Konferencje, Projekty i granty, Sukcesy, Publikacje): tekst stoi nad listą. Na stronie Publikacje część pod „## Czasopisma redagowane w Instytucie {#czasopisma}” stoi nad listą czasopism (bez tego nagłówka czasopisma są bez tekstu).`);
  ustaw(pole(s, 'tresc_en'), 'description', `${JAWNY} Puste = strona angielska pokaże treść polską. Na stronie Publikacje tekst nad czasopismami pod nagłówkiem z {#czasopisma}.`);
  ustaw(pole(s, 'opis'), 'label', 'Krótki opis (Google i podgląd linku)');
  ustaw(pole(s, 'opis'), 'description', 'Na samej stronie się nie wyświetla (baner pokazuje tytuł i hasło). Np. „Wykazy publikacji pracowników Instytutu według roku wydania…”. Puste = opis domyślny.');
  // „Bloki wzorca”: w jawnym formacie strona ich nie czyta (układ wskazują bloki :::) — ukryte, wartości zostają w plikach.
  ustaw(pole(s, 'bloki'), 'hidden', true);

  // Konferencje (decyzja 18.11: konferencja z opisem ma własną stronę, link z listy)
  const kf = formularz('konferencje');
  ustaw(kf, 'description', 'Konferencje i warsztaty Instytutu. Lista w Nauce → Konferencje (nadchodzące i według lat). Konferencja z opisem ma własną stronę; bez opisu link prowadzi od razu na jej stronę internetową.');
  const k = pola('konferencje');
  kolejnosc(k, ['tytul', 'tytul_en', 'poczatek', 'koniec', 'miejsce', 'body', 'strona', 'organizatorzy', 'zaklad', 'zdjecie', 'odwolana']);
  ustaw(pole(k, 'body'), 'label', 'Opis (opcjonalnie; konferencja z opisem ma własną stronę)');
  ustaw(pole(k, 'body'), 'description', `${WPIS} Pusta Treść (albo sam komentarz) = konferencja bez własnej strony; link prowadzi wtedy na jej stronę internetową.`);
  ustaw(pole(k, 'body'), 'default', `${SZABLON_AKTUALNOSCI}\n<!-- Program, rejestracja, opłaty: każda informacja w osobnym akapicie. -->`);

  // Projekty i granty. Stronę ma każdy projekt (także bez opisu: same dane), więc szablon i opis mówią „bez opisu”,
  // nie „bez własnej strony” (poprawka względem raportu 40-0).
  const gf = formularz('granty');
  ustaw(gf, 'description', 'Projekty badawcze pracowników. Lista w Nauce → Projekty i granty; każdy projekt ma własną stronę z danymi, opis pokazuje się pod nimi.');
  const g = pola('granty');
  kolejnosc(g, ['tytul', 'tytul_en', 'rodzaj', 'rok_od', 'rok_do', 'body', 'kod', 'program', 'kierownik', 'wykonawcy', 'kwota', 'zaklad', 'strona']);
  ustaw(pole(g, 'body'), 'description', `${WPIS} Pusta Treść (albo sam komentarz) = strona projektu pokaże same dane.`);
  ustaw(pole(g, 'body'), 'default', '<!-- OPIS PROJEKTU: Cel i wyniki projektu. Pusta Treść = strona projektu pokaże same dane. -->');
}

// ---------- Web-Aktualnosci (etap 3) ----------
// Działa na .pages.yml sprzed zlecenia 44 i po nim (44 dodaje w Aktualnościach grupę „Termin zgłoszeń” — zgloszenia — za terminem
// wydarzenia, opis pola „Rodzaj” i stronę kariera.md w opisie Stron); każde inne pole spoza listy = błąd kolejności (STOP).
function aktualnosci({ pola, pole, kolejnosc, ustaw, formatTresci, etykietyEn, formularz, komentarz, przelacznikOpublikowane }) {
  komentarz('Zlecenie 40: Strony w jawnym Markdownie (ukryte format_tresci), ściągawki przy Treści, tytuł EN i zajawka EN pod polskimi, etykiety „… EN”, opisy formularzy Aktualności i Obron, szablony Treści aktualności i obrony.');
  komentarz('Zlecenie 48: przełącznik „Opublikowane” w Aktualnościach, zaraz pod tytułem (odznaczone = szkic, widoczny tylko na Podglądzie).');
  const ma = (seq, nazwa) => seq.items.some((i) => i.get('name') === nazwa);

  // Aktualności (decyzja 18.11, pytanie 3): tytuł, tytuł EN → data, rodzaj, terminy → Treść, Treść EN → zajawka, zajawka EN → reszta.
  // Opis z raportu 40-0 uzupełniony o oferty: od zlecenia 44 „Kariera” ma własną stronę (i stronę Studiów), nie listę Aktualności.
  ustaw(formularz('aktualnosci'), 'description', 'Ogłoszenia, wydarzenia, sukcesy i oferty pracy, staży i stypendiów. Ogłoszenia, wydarzenia i sukcesy widać w Aktualnościach i na stronie głównej; wpis z terminem trafia też do kalendarza. Oferty (rodzaj „Kariera”) są na stronie Kariera i na stronie Studiów.');
  const a = pola('aktualnosci');
  etykietyEn(a);
  // zlecenie 48: „Opublikowane” pod parą tytuł / tytuł EN, jak w zleceniu 33
  przelacznikOpublikowane(a, 'Odznacz, żeby przygotować wpis bez pokazywania go na stronie publicznej (szkic).');
  kolejnosc(a, ['tytul', 'tytul_en', 'opublikowany', 'data', 'rodzaj', 'termin', ...(ma(a, 'zgloszenia') ? ['zgloszenia'] : []), 'body', 'tresc_en', 'zajawka', 'zajawka_en', 'dla', 'zdjecie', 'zdjecie_opis', 'zdjecie_opis_en', 'galeria', 'album', 'zalaczniki', 'zaklad']);
  ustaw(pole(a, 'body'), 'description', WPIS);
  ustaw(pole(a, 'body'), 'default', SZABLON_AKTUALNOSCI);

  // Obrony doktorskie: kolejność bez zmian (kandydat, tytuł rozprawy, termin, miejsce → Treść, Treść EN → reszta)
  ustaw(formularz('obrony'), 'description', 'Publiczne obrony rozpraw doktorskich. Lista w Nauce → Obrony doktorskie. Pusta Treść = strona sama napisze zaproszenie.');
  const o = pola('obrony');
  etykietyEn(o);
  ustaw(pole(o, 'body'), 'description', `${WPIS} Pusta Treść (albo sam komentarz) = zaproszenie złożone z danych.`);
  ustaw(pole(o, 'body'), 'default', '<!-- Zostaw puste, a strona sama napisze zaproszenie. Własny tekst zastępuje zaproszenie. -->');
  // strona angielska bierze tylko Treść EN, inaczej zaproszenie z danych — nigdy polski opis (src/lib/widoki/obrona.ts)
  ustaw(pole(o, 'tresc_en'), 'description', 'Opis po angielsku, w tym samym układzie. Puste = wersja angielska pokaże zaproszenie złożone z danych (także wtedy, gdy polski opis jest wpisany).');

  // Strony (teksty stron z listą: Aktualności, Obrony doktorskie, od zlecenia 44 też Kariera)
  const sf = formularz('strony');
  const JAK_W_STUDIACH = ' Treść w jawnym Markdownie, jak w Studiach.';
  if (!sf.get('description').endsWith(JAK_W_STUDIACH)) ustaw(sf, 'description', sf.get('description') + JAK_W_STUDIACH);
  const s = pola('strony');
  formatTresci(s);
  etykietyEn(s);
  kolejnosc(s, ['tytul', 'tytul_en', 'opublikowany', 'body', 'tresc_en', 'format_tresci', 'opis', 'opis_en', 'haslo', 'haslo_en', 'haslo_podstron', 'haslo_podstron_en', 'liczby', 'pasek_boczny', 'bloki']);
  ustaw(pole(s, 'body'), 'description', `${JAWNY} Strona z listą (Aktualności, Kariera, Obrony doktorskie): tekst stoi nad listą; pusta Treść (albo sam komentarz) = sama lista.`);
  ustaw(pole(s, 'tresc_en'), 'description', `${JAWNY} Puste = strona angielska pokaże treść polską.`);
  ustaw(pole(s, 'opis'), 'label', 'Krótki opis (Google i podgląd linku)');
  ustaw(pole(s, 'opis'), 'description', 'Na samej stronie się nie wyświetla (baner pokazuje tytuł i hasło). Np. „Ogłoszenia, wydarzenia i sukcesy Instytutu Matematycznego.”. Puste = ogólny opis serwisu.');
  // „Bloki wzorca”: w jawnym formacie strona ich nie czyta (układ wskazują bloki :::) — ukryte, wartości zostają w plikach.
  ustaw(pole(s, 'bloki'), 'hidden', true);
}

// ---------- Web-Pracownicy (etap 4) ----------
function pracownicy({ pola, pole, kolejnosc, ustaw, formatTresci, formularz, komentarz }) {
  komentarz('Zlecenie 40: tekst strony Pracownicy w jawnym Markdownie (ukryte format_tresci), ściągawka przy Treści, opis formularza Pracownicy.');

  // Pracownicy: kolejność bez zmian (formularz nie ma Treści), opis „co to i gdzie widać” (raport 40-0, sekcja 3)
  ustaw(formularz('pracownicy'), 'description', 'Spis osób: pracownicy, doktoranci, administracja. Widać go w Pracownikach, na stronach zakładów i przy władzach.');

  // Strony (tylko tekst strony z listą: pracownicy.md)
  const sf = formularz('strony');
  const JAK_W_STUDIACH = ' Treść w jawnym Markdownie, jak w Studiach.';
  if (!sf.get('description').endsWith(JAK_W_STUDIACH)) ustaw(sf, 'description', sf.get('description') + JAK_W_STUDIACH);
  const s = pola('strony');
  formatTresci(s);
  kolejnosc(s, ['tytul', 'tytul_en', 'opublikowany', 'body', 'tresc_en', 'format_tresci', 'opis', 'opis_en', 'haslo', 'haslo_en', 'liczby', 'pasek_boczny', 'bloki']);
  ustaw(pole(s, 'body'), 'description', `${JAWNY} Strona Pracownicy: tekst stoi nad listą osób; pusta Treść (albo sam komentarz) = sama lista.`);
  ustaw(pole(s, 'tresc_en'), 'description', `${JAWNY} Puste = strona angielska pokaże treść polską.`);
  ustaw(pole(s, 'opis'), 'label', 'Krótki opis (Google i podgląd linku)');
  ustaw(pole(s, 'opis'), 'description', 'Na samej stronie się nie wyświetla (baner pokazuje tytuł i hasło). Np. „Dane kontaktowe pracowników, doktorantów i administracji…”. Puste = opis domyślny.');
  // „Bloki wzorca”: w jawnym formacie strona ich nie czyta (układ wskazują bloki :::) — ukryte, wartości zostają w plikach.
  ustaw(pole(s, 'bloki'), 'hidden', true);
}

// ---------- Web-Sem-* (etap 5: jeden wzór dla 9 repozytoriów seminariów) ----------
function seminaria({ pola, pole, kolejnosc, ustaw, formularz, komentarz, przelacznikOpublikowane }) {
  komentarz('Zlecenie 40: opis seminarium i streszczenie referatu zaraz pod tytułem, pola EN pod polskimi, ściągawka przy Treści, szablon streszczenia, ukryta notatka redakcyjna.');
  komentarz('Zlecenie 48: przełącznik „Opublikowane” w opisie seminarium i w referatach, zaraz pod tytułem (odznaczone = szkic, widoczny tylko na Podglądzie; seminarium-szkic ukrywa też swoje referaty).');

  // Opis seminarium (plik): Treść i Treść EN pod nazwą (dziś na 11. i 12. miejscu)
  ustaw(formularz('seminarium'), 'description', 'Opis seminarium: prowadzący, kontakt, archiwum. Widać go na stronie seminarium w Nauce → Seminaria.');
  const s = pola('seminarium');
  // zlecenie 48: „Opublikowane” pod parą nazwa / nazwa EN
  przelacznikOpublikowane(s, 'Odznacz, żeby przygotować seminarium bez pokazywania go na stronie publicznej (szkic). Razem z nim znikną wszystkie jego referaty.');
  kolejnosc(s, ['nazwa', 'nazwa_en', 'opublikowany', 'body', 'tresc_en', 'haslo', 'haslo_en', 'prowadzacy', 'kontakt', 'archiwum', 'zaklad', 'aktywne', 'do_uzupelnienia']);
  ustaw(pole(s, 'body'), 'description', `${WPIS} Wzory w $…$.`);
  // notatka dla redakcji (decyzje 18.11: ukryta, wartość zostaje w pliku)
  ustaw(pole(s, 'do_uzupelnienia'), 'hidden', true);

  // Referaty: streszczenie i jego wersja EN pod danymi referatu, pliki na końcu (dziś pliki nad streszczeniem)
  const r = pola('referaty');
  // zlecenie 48: „Opublikowane” zaraz pod tytułem (referat nie ma tytułu EN)
  przelacznikOpublikowane(r, 'Odznacz, żeby przygotować referat bez pokazywania go na stronie publicznej (szkic).');
  kolejnosc(r, ['tytul', 'opublikowany', 'jezyk', 'prelegent', 'afiliacja', 'afiliacja_en', 'termin', 'sala', 'sala_en', 'body', 'tresc_en', 'pliki']);
  ustaw(pole(r, 'body'), 'description', `${WPIS} Wzory w $…$. Pusta Treść (albo sam komentarz) = referat bez streszczenia.`);
  ustaw(pole(r, 'body'), 'default', '<!-- STRESZCZENIE: Zwykły tekst; wzory w $…$. Slajdy: dodaj w „Pliki” niżej. -->');
}

// ---------- Web-Ustawienia (etap 6) ----------
// Zdjęcia nagłówków działów: dane z bazy f145d85 (nieużywane) → zdjęcia i kadry, które nowy nagłówek miał wpisane w NaglowekZ.astro,
// więc po podłączeniu strona wygląda tak samo. Inna wartość w pliku = zmiana redaktora: STOP (nie nadpisujemy).
const NAGLOWKI_STARE = {
  instytut: ['/pliki/naglowki/instytut.jpg', 'center 45%'], nauka: ['/pliki/naglowki/nauka.jpg', 'center 40%'],
  studia: ['/pliki/naglowki/studia.jpg', 'center 35%'], aktualnosci: ['/pliki/naglowki/aktualnosci.jpg', 'center 40%'],
  popularyzacja: ['/pliki/naglowki/popularyzacja.jpg', 'center 50%'],
};
const NAGLOWKI_NOWE = {
  instytut: ['/pliki/naglowki/instytut.jpg', '50% 42%'], nauka: ['/pliki/naglowki/nauka.jpg', '50% 30%'],
  studia: ['/pliki/naglowki/studia.jpg', '50% 40%'], aktualnosci: ['/pliki/naglowki/aktualnosci-skok.jpg', '48% 52%'],
  popularyzacja: ['/pliki/naglowki/popularyzacja.jpg', '50% 40%'],
};

function ustawieniaStrony({ pola, pole, kolejnosc, ustaw, usun, odkryj, etykietyEn, daneJson, formatTresci, formularz, komentarz }) {
  komentarz('Zlecenie 40: opisy formularzy (tylko właściciel; gdzie widać), Facebook i YouTube w stopce, podłączone zdjęcia nagłówków działów, usunięte resztki starego banera i przyciski okładki, ukryte hasła bez liczb; deklaracja, prywatność i „O stronie” w jawnym Markdownie.');

  // Strona główna i kontakt
  ustaw(formularz('ustawienia'), 'description', 'Tylko właściciel. Okładka strony głównej (zdjęcie, tekst pod nazwą Instytutu, wydarzenia), sekcja „Studiuj matematykę” i menu „Studia”, zdjęcia w nagłówkach działów, kontakt i profile w stopce.');
  const u = pola('ustawienia');
  etykietyEn(u);
  const b = pole(u, 'baner');
  // decyzja 18.11 (lista 1a): resztki starego banera — nowa okładka sama dobiera rozmiary i kadr, podpisu nie pokazuje
  for (const n of ['zdjecie_male', 'zdjecie_telefon', 'podpis', 'podpis_en', 'kadr']) usun(b.get('fields'), n);
  ustaw(b, 'description', 'Zdjęcie okładki strony głównej (pierwszy ekran). Rozmiar i kadr na komputerze i telefonie strona dobiera sama.');
  ustaw(pole(b.get('fields'), 'opis'), 'description', 'Co widać na zdjęciu, jednym zdaniem; czytają je czytniki ekranu. Np. „Kampus przy placu Grunwaldzkim o zmierzchu…”.');
  // zdjęcia nagłówków działów (decyzja 18.11: podłączone; wygląd nagłówka — pole „wariant” — zostaje ukryty)
  const n = pole(u, 'naglowki_podstron');
  odkryj(n);
  ustaw(n, 'label', 'Nagłówki działów');
  ustaw(n, 'description', 'Zdjęcia w nagłówkach stron działów i ich podstron (komputer i telefon).');
  ustaw(pole(n.get('fields'), 'wariant'), 'hidden', true);
  const z = pole(n.get('fields'), 'zdjecia');
  ustaw(z, 'label', 'Zdjęcia działów');
  ustaw(z, 'description', 'Puste zdjęcie albo kadr = zdjęcie i kadr domyślne działu.');
  for (const d of z.get('fields').items) {
    const f = d.get('fields');
    ustaw(pole(f, 'zdjecie'), 'description', 'Zdjęcie poziome, co najmniej ok. 1200 px szerokości. Puste = zdjęcie domyślne działu.');
    ustaw(pole(f, 'kadr'), 'label', 'Kadr');
    ustaw(pole(f, 'kadr'), 'description', d.get('name') === 'aktualnosci'
      ? 'Który fragment zdjęcia widać, gdy strona je przycina: położenie w poziomie i w pionie w procentach, np. „48% 52%”. Puste = kadr domyślny.'
      : 'Który fragment zdjęcia widać, gdy strona je przycina: położenie w poziomie i w pionie w procentach, np. „50% 40%” (środek, trochę powyżej połowy). Działa na stronie działu; podstrony mają stały kadr. Puste = kadr domyślny.');
  }
  ustaw(pole(z.get('fields'), 'aktualnosci'), 'description', 'Nagłówki Aktualności, Kalendarza i listy „Warto wiedzieć”.');
  // decyzja 18.11 (pytanie 3): hasło strony wyszukiwania się nie pokazuje (nowy nagłówek pokazuje hasło tylko z liczbami) — ukryte
  ustaw(pole(u, 'szukaj_haslo'), 'hidden', true);
  ustaw(pole(u, 'szukaj_haslo_en'), 'hidden', true);
  // decyzja 18.11 (lista 1a): przyciski pod tekstem okładki — nowa okładka ich nie pokazuje
  usun(u, 'przyciski');
  // decyzja 18.11: Facebook i YouTube — ikony z linkami w stopce (StopkaZ.astro)
  for (const [nazwa, etykieta, przyklad] of [['facebook', 'Facebook (adres profilu)', 'https://www.facebook.com/IMUWr'], ['youtube', 'YouTube (adres kanału)', 'https://www.youtube.com/channel/…']]) {
    const p = pole(u, nazwa);
    odkryj(p);
    ustaw(p, 'label', etykieta);
    ustaw(p, 'description', `Ikona z linkiem w stopce każdej strony, polskiej i angielskiej. Np. ${przyklad}. Puste = bez ikony.`);
  }
  daneJson('src/data/ustawienia.json', (d) => {
    for (const k of ['zdjecie_male', 'zdjecie_telefon', 'podpis', 'podpis_en', 'kadr']) delete d.baner[k];
    delete d.przyciski;
    const zd = d.naglowki_podstron.zdjecia;
    for (const [dzial, [zdjecie, kadr]] of Object.entries(NAGLOWKI_NOWE)) {
      const [stZ, stK] = NAGLOWKI_STARE[dzial];
      const w = zd[dzial] ?? {};
      if (w.zdjecie === zdjecie && w.kadr === kadr) continue;
      if (w.zdjecie !== stZ || w.kadr !== stK) throw Error(`naglowki_podstron.zdjecia.${dzial}: wartość inna niż w bazie (${w.zdjecie}, ${w.kadr}) — zmiana redaktora?`);
      zd[dzial] = { ...w, zdjecie, kadr };
    }
  });

  // „Na skróty” i Menu główne
  ustaw(formularz('skroty'), 'description', 'Tylko właściciel. Pierwsze cztery kafelki widać na stronie głównej, w pasku „Szybki dostęp” pod okładką.');
  etykietyEn(pola('skroty'));
  ustaw(formularz('nawigacja'), 'description', 'Tylko właściciel. Pozycje menu na górze każdej strony i ich rozwijane listy (komputer i telefon); grupy i linki widać też w polu ze stronami na stronach działów. Kierunki w menu „Studia” są w „Strona główna i kontakt”.');
  etykietyEn(pola('nawigacja'));

  // Deklaracja dostępności, Polityka prywatności, O stronie (linki w stopce): jawny Markdown jak Strony, Treść EN pod Treścią
  for (const [nazwa, tytul] of [['deklaracja', 'Deklaracja dostępności'], ['prywatnosc', 'Polityka prywatności'], ['o-stronie', 'O stronie']]) {
    ustaw(formularz(nazwa), 'description', `Tekst strony „${tytul}” (link w stopce). Treść w jawnym Markdownie, jak w Studiach.`);
    const s = pola(nazwa);
    formatTresci(s);
    etykietyEn(s);
    kolejnosc(s, ['tytul', 'tytul_en', 'body', 'tresc_en', 'format_tresci', 'opis', 'opis_en', 'haslo', 'haslo_en', 'pasek_boczny', 'bloki']);
    ustaw(pole(s, 'body'), 'description', JAWNY);
    ustaw(pole(s, 'tresc_en'), 'description', `${JAWNY} Puste = strona angielska pokaże treść polską.`);
    ustaw(pole(s, 'opis'), 'label', 'Krótki opis (Google i podgląd linku)');
    ustaw(pole(s, 'opis'), 'description', 'Na samej stronie się nie wyświetla (baner pokazuje tytuł). Puste = ogólny opis serwisu.');
    ustaw(pole(s, 'opis_en'), 'label', 'Krótki opis EN');
    // decyzja 18.11 (pytanie 3): hasło bez liczb się nie pokazuje — ukryte, wartości zostają w plikach
    ustaw(pole(s, 'haslo'), 'hidden', true);
    ustaw(pole(s, 'haslo_en'), 'hidden', true);
    // „Bloki wzorca”: w jawnym formacie strona ich nie czyta — ukryte
    ustaw(pole(s, 'bloki'), 'hidden', true);
  }
}

// ---------- Web-Studia i Web-Popularyzacja (etap 7: format już jawny, porządek pól) ----------
const OPIS_GOOGLE = 'Trafia do Google i do podglądu linku; na samej stronie się nie wyświetla. Puste = ogólny opis serwisu.';

function studia({ pola, pole, kolejnosc, ustaw, usun, etykietyEn, naglowkiMd, komentarz }) {
  komentarz('Zlecenie 40: pola EN pod polskimi, etykiety „… EN”, usunięty krótszy podpis liczb kierunku (etykieta_krotka), opisy pól, które strona pokazuje inaczej, niż mówiła etykieta.');

  // Strona działu: wstęp trafia tylko do Google (nowy nagłówek go nie pokazuje)
  const sd = pola('strona-dzialu');
  etykietyEn(sd);
  ustaw(pole(sd, 'wstep'), 'label', 'Opis strony dla Google (1–2 zdania)');
  ustaw(pole(sd, 'wstep'), 'description', `${OPIS_GOOGLE.replace('. Puste', '. Np. „Matematyka, sztuczna inteligencja w analizie danych…”. Puste')}`);
  ustaw(pole(sd, 'wstep_en'), 'label', 'Opis strony dla Google EN');

  // Kierunki: baner — pola EN pod polskimi; liczby bez krótszego podpisu (decyzja 18.11, lista 1a: strona go nie czyta)
  const k = pola('kierunki');
  etykietyEn(k);
  const b = pole(k, 'baner').get('fields');
  kolejnosc(b, ['podtytul', 'podtytul_en', 'opis', 'opis_en', 'haslo', 'haslo_en', 'liczby']);
  ustaw(pole(b, 'podtytul'), 'description', 'Na stronie się nie wyświetla: strona liczy z niego (i z Treści) stopnie studiów na stronie „Studia”, np. „Studia I i II stopnia”.');
  ustaw(pole(b, 'podtytul_en'), 'description', 'Na stronie się nie wyświetla.');
  const l = pole(b, 'liczby').get('fields');
  usun(l, 'etykieta_krotka');
  usun(l, 'etykieta_krotka_en');
  kolejnosc(l, ['wartosc', 'wartosc_en', 'etykieta', 'etykieta_en', 'pozycja']);
  naglowkiMd('src/content/kierunki', (fm) => fm.split('\n').filter((l) => !/^[ \t]+etykieta_krotka(?:_en)?:/.test(l)).join('\n'));

  // Specjalności, Strony, Rok akademicki, Przypomnienia, Kalendarz zajęć: etykiety „… EN”, pola EN pod polskimi
  etykietyEn(pola('specjalnosci'));
  const s = pola('strony');
  etykietyEn(s);
  ustaw(pole(s, 'opis'), 'label', 'Krótki opis (Google i podgląd linku)');
  ustaw(pole(s, 'opis'), 'description', 'Na samej stronie się nie wyświetla. Puste = ogólny opis serwisu.');
  ustaw(pole(s, 'opis_en'), 'label', 'Krótki opis EN');
  // hasło strony (decyzja 18.11, pytanie 3): baner pokazuje hasło i liczby tylko razem; pola nie da się ukryć tylko na stronach bez
  // liczb (jeden formularz dla wszystkich Stron), więc opis mówi, kiedy się pokaże
  ustaw(pole(s, 'haslo'), 'label', 'Hasło na banerze (jedna linia)');
  ustaw(pole(s, 'haslo'), 'description', 'Hasło i liczby (pole „Liczby…” niżej) pokazują się na banerze tylko razem: samo hasło albo same liczby się nie wyświetlają.');
  etykietyEn(pola('rok-akademicki'));
  const p = pole(pola('przypomnienia'), 'przypomnienia').get('fields');
  etykietyEn(p);
  kolejnosc(p, ['sprawa', 'sprawa_en', 'podpis', 'podpis_en', 'data', 'co_roku', 'dni_przed', 'adres', 'uid']);
  const kd = pola('kolory-dni');
  etykietyEn(kd);
  kolejnosc(pole(kd, 'aktualnosci').get('fields'), ['wlaczone', 'dni_robocze_przed', 'tytul', 'tytul_en', 'tresc', 'tresc_en']);
}

function popularyzacja({ pola, pole, kolejnosc, ustaw, etykietyEn, komentarz }) {
  komentarz('Zlecenie 40: tytuł EN pod tytułem i Treść na górze, pola EN pod polskimi, etykiety „… EN”, opis wstępu (tylko Google).');
  // przełącznik „Opublikowane” (zlecenie 33) pod tytułem i tytułem EN, jak w Instytucie i Nauce — gdy formularz go ma
  const zOpublikowanym = (seq, [a, b, ...reszta]) => (seq.items.some((i) => i.get('name') === 'opublikowany') ? [a, b, 'opublikowany', ...reszta] : [a, b, ...reszta]);
  const sd = pola('popularyzacja');
  etykietyEn(sd);
  kolejnosc(sd, zOpublikowanym(sd, ['tytul', 'tytul_en', 'body', 'tresc_en', 'format_tresci', 'wstep', 'wstep_en', 'haslo', 'haslo_en', 'o_popularyzacji_fakty', 'tradycja', 'linki']));
  ustaw(pole(sd, 'wstep'), 'label', 'Opis strony dla Google (1–2 zdania)');
  ustaw(pole(sd, 'wstep'), 'description', OPIS_GOOGLE.replace('. Puste', '. Np. „Kółka, obozy i konkursy dla uczniów…”. Puste'));
  ustaw(pole(sd, 'wstep_en'), 'label', 'Opis strony dla Google EN');
  const s = pola('strony');
  etykietyEn(s);
  kolejnosc(s, zOpublikowanym(s, ['tytul', 'tytul_en', 'body', 'tresc_en', 'format_tresci', 'opis', 'opis_en', 'haslo', 'haslo_en', 'pasek_boczny']));
  // opis i hasło: nowy baner strony ich nie pokazuje (Strony nie mają liczb), widać je na kartach „Dla kogo” strony działu
  ustaw(pole(s, 'opis'), 'label', 'Opis (zdanie na karcie „Dla kogo”)');
  ustaw(pole(s, 'opis'), 'description', 'Zdanie na karcie tej strony na stronie Popularyzacji; trafia też do Google i do podglądu linku. Na samej stronie się nie wyświetla.');
  ustaw(pole(s, 'haslo'), 'label', 'Hasło (tytuł karty „Dla kogo”)');
  ustaw(pole(s, 'haslo'), 'description', 'Tytuł karty tej strony na stronie Popularyzacji; puste = tytuł strony. Na samej stronie się nie wyświetla.');
}

const OPISY = { 'Web-Instytut': instytut, 'Web-Nauka': nauka, 'Web-Aktualnosci': aktualnosci, 'Web-Pracownicy': pracownicy, 'Web-Ustawienia': ustawieniaStrony, 'Web-Studia': studia, 'Web-Popularyzacja': popularyzacja };
for (const r of ['Analiza-Harmoniczna', 'Dydaktyka', 'Dyskretna-Analiza-Harmoniczna', 'Geometria', 'Prawdopodobienstwo', 'Rownania-Rozniczkowe', 'Statystyka', 'Teoria-Modeli', 'Topologia']) OPISY[`Web-Sem-${r}`] = seminaria;

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const repo = path.resolve(process.argv[2] ?? '');
  const opis = OPISY[path.basename(repo)];
  if (!opis) throw Error(`Brak opisu formularzy dla ${path.basename(repo)} (są: ${Object.keys(OPISY).join(', ')})`);
  console.log((await formularze(repo, opis)) ? 'Zapisano .pages.yml' : 'Bez zmian');
}
