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
  const zrodlo = await fs.readFile(plik, 'utf8');
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
    /** Pokazuje pole w CMS (usuwa hidden). */
    odkryj(wezelPola) { wezelPola.delete('hidden'); },
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

// ---------- Web-Instytut (etap 1) ----------
function instytut({ pola, pole, kolejnosc, ustaw, formatTresci, formularz, komentarz }) {
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

  // „Warto wiedzieć”
  const wf = formularz('warto_wiedziec');
  ustaw(wf, 'description', 'Wyjątkowe, trwałe osiągnięcia Instytutu (np. Annals of Mathematics, wykład T. Tao): lista „Warto wiedzieć”, karty na stronie głównej i w dziale z pola „Gdzie pokazać”; pozycja z opisem ma własną podstronę. Bieżące nagrody i granty → Aktualności, rodzaj „sukces”.');
  const w = pola('warto_wiedziec');
  kolejnosc(w, ['tytul', 'tytul_en', 'opublikowany', 'body', 'tresc_en', 'karta', 'dzial', 'na_glownej', 'zawsze', 'kolejnosc', 'zrodla']);
  ustaw(pole(w, 'body'), 'description', `${WPIS} Pusta Treść (albo sam komentarz) = karta bez własnej podstrony, prowadzi do linku.`);
  ustaw(pole(w, 'body'), 'default', '<!-- TEKST: Pusta Treść = sama zajawka bez własnej strony. -->');

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
function seminaria({ pola, pole, kolejnosc, ustaw, formularz, komentarz }) {
  komentarz('Zlecenie 40: opis seminarium i streszczenie referatu zaraz pod tytułem, pola EN pod polskimi, ściągawka przy Treści, szablon streszczenia, ukryta notatka redakcyjna.');

  // Opis seminarium (plik): Treść i Treść EN pod nazwą (dziś na 11. i 12. miejscu)
  ustaw(formularz('seminarium'), 'description', 'Opis seminarium: prowadzący, kontakt, archiwum. Widać go na stronie seminarium w Nauce → Seminaria.');
  const s = pola('seminarium');
  kolejnosc(s, ['nazwa', 'nazwa_en', 'body', 'tresc_en', 'haslo', 'haslo_en', 'prowadzacy', 'kontakt', 'archiwum', 'zaklad', 'aktywne', 'do_uzupelnienia']);
  ustaw(pole(s, 'body'), 'description', `${WPIS} Wzory w $…$.`);
  // notatka dla redakcji (decyzje 18.11: ukryta, wartość zostaje w pliku)
  ustaw(pole(s, 'do_uzupelnienia'), 'hidden', true);

  // Referaty: streszczenie i jego wersja EN pod danymi referatu, pliki na końcu (dziś pliki nad streszczeniem)
  const r = pola('referaty');
  kolejnosc(r, ['tytul', 'jezyk', 'prelegent', 'afiliacja', 'afiliacja_en', 'termin', 'sala', 'sala_en', 'body', 'tresc_en', 'pliki']);
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
  const sd = pola('popularyzacja');
  etykietyEn(sd);
  kolejnosc(sd, ['tytul', 'tytul_en', 'body', 'tresc_en', 'format_tresci', 'wstep', 'wstep_en', 'haslo', 'haslo_en', 'o_popularyzacji_fakty', 'tradycja', 'linki']);
  ustaw(pole(sd, 'wstep'), 'label', 'Opis strony dla Google (1–2 zdania)');
  ustaw(pole(sd, 'wstep'), 'description', OPIS_GOOGLE.replace('. Puste', '. Np. „Kółka, obozy i konkursy dla uczniów…”. Puste'));
  ustaw(pole(sd, 'wstep_en'), 'label', 'Opis strony dla Google EN');
  const s = pola('strony');
  etykietyEn(s);
  kolejnosc(s, ['tytul', 'tytul_en', 'body', 'tresc_en', 'format_tresci', 'opis', 'opis_en', 'haslo', 'haslo_en', 'pasek_boczny']);
  // opis i hasło: nowy baner strony ich nie pokazuje (Strony nie mają liczb), widać je na kartach „Dla kogo” strony działu
  ustaw(pole(s, 'opis'), 'label', 'Opis (zdanie na karcie „Dla kogo”)');
  ustaw(pole(s, 'opis'), 'description', 'Zdanie na karcie tej strony na stronie Popularyzacji; trafia też do Google i do podglądu linku. Na samej stronie się nie wyświetla.');
  ustaw(pole(s, 'haslo'), 'label', 'Hasło (tytuł karty „Dla kogo”)');
  ustaw(pole(s, 'haslo'), 'description', 'Tytuł karty tej strony na stronie Popularyzacji; puste = tytuł strony. Na samej stronie się nie wyświetla.');
}

const OPISY = { 'Web-Instytut': instytut, 'Web-Nauka': nauka, 'Web-Pracownicy': pracownicy, 'Web-Ustawienia': ustawieniaStrony, 'Web-Studia': studia, 'Web-Popularyzacja': popularyzacja };
for (const r of ['Analiza-Harmoniczna', 'Dydaktyka', 'Dyskretna-Analiza-Harmoniczna', 'Geometria', 'Prawdopodobienstwo', 'Rownania-Rozniczkowe', 'Statystyka', 'Teoria-Modeli', 'Topologia']) OPISY[`Web-Sem-${r}`] = seminaria;

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const repo = path.resolve(process.argv[2] ?? '');
  const opis = OPISY[path.basename(repo)];
  if (!opis) throw Error(`Brak opisu formularzy dla ${path.basename(repo)} (są: ${Object.keys(OPISY).join(', ')})`);
  console.log((await formularze(repo, opis)) ? 'Zapisano .pages.yml' : 'Bez zmian');
}
