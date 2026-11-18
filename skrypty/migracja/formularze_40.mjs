// Zlecenie 40 (decyzje właściciela 18.11): formularze Pages CMS „jak w Studiach” — kolejność pól (tytuł, tytuł EN → Treść,
// Treść EN → reszta; pola EN tuż pod polskimi), ściągawki przy Treści, ukryte pole format_tresci (jawny Markdown Stron i strony
// działu), szablony Treści nowych wpisów (default), ukrycia z etapu 0. Zmienia tylko .pages.yml (Document API biblioteki yaml:
// komentarze, cudzysłowy i bloki | zostają; nieruszone fragmenty pliku bez zmian).
// Uruchomienie z katalogu Web-Core:  node skrypty/migracja/formularze_40.mjs <checkout repozytorium treści>
// Repozytorium rozpoznaje po nazwie katalogu (Web-Instytut…); każdy etap zlecenia dopisuje tu swój opis formularzy.
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

export const JAWNY = 'Jawny Markdown: ## rozpoczyna sekcję i pozycję spisu; {#id} zachowuje adres sekcji. Zwykły tekst jest prozą domyślnie; nie wymaga otaczających znaczników. Specjalne układy wymagają znaczników, np. :::kafelki, :::etapy, :::zakladki. Komentarze <!-- … --> objaśniają bloki; na stronie ich nie widać. Zachowaj pasujące końcowe dwukropki. Plik PDF: wgraj w „Media” i wklej link. Wygląd sprawdzaj po przebudowaniu strony (Podgląd).';
export const WPIS = 'Zwykły Markdown: akapity oddziela pusta linia; **pogrubienie**, *kursywa*, [tekst linku](https://…); lista: „- ” na początku linii; ## = nagłówek sekcji. Plik PDF: wgraj w „Media” i wklej link. Komentarze <!-- … --> to podpowiedzi; na stronie ich nie widać.';
const FORMAT_TRESCI = { name: 'format_tresci', label: 'Format treści', type: 'string', hidden: true, default: 'jawne' };

export async function formularze(repo, opis) {
  const plik = path.join(repo, '.pages.yml');
  const zrodlo = await fs.readFile(plik, 'utf8');
  const doc = YAML.parseDocument(zrodlo);
  const wezel = (o) => doc.createNode(o);
  const formularz = (nazwa) => {
    const f = doc.get('content').items.find((i) => i.get('name') === nazwa);
    if (!f) throw Error(`Brak formularza ${nazwa}`);
    return f;
  };
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
  };
  const komentarze = [];
  opis(api);
  let wynik = doc.toString({ indentSeq: false, lineWidth: 0 });
  const linie = wynik.split('\n');
  const nowe = komentarze.filter((k) => !linie.includes(k));
  if (nowe.length) {
    const i = linie.findIndex((l) => !l.startsWith('#'));
    linie.splice(i, 0, ...nowe);
    wynik = linie.join('\n');
  }
  await fs.writeFile(plik, wynik);
  return wynik !== zrodlo;
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

const OPISY = { 'Web-Instytut': instytut };

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const repo = path.resolve(process.argv[2] ?? '');
  const opis = OPISY[path.basename(repo)];
  if (!opis) throw Error(`Brak opisu formularzy dla ${path.basename(repo)} (są: ${Object.keys(OPISY).join(', ')})`);
  console.log((await formularze(repo, opis)) ? 'Zapisano .pages.yml' : 'Bez zmian');
}
