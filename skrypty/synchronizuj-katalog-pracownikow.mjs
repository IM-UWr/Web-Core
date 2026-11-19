// Zlecenie 42: katalog wyboru osób w CMS (kolekcja „Katalog pracowników (tylko odczyt)”, pliki _cms/pracownicy/<id>.yml)
// w każdym repozytorium treści z polami „… ze spisu”. Zastępuje synchronizuj-katalog-opiekunow.mjs (tylko Web-Studia).
//
//   node skrypty/synchronizuj-katalog-pracownikow.mjs <Web-Pracownicy> <repo> [<repo> …] [--na-sucho]
//   np. node skrypty/synchronizuj-katalog-pracownikow.mjs ../tresci/Web-Pracownicy ../tresci/Web-Instytut ../tresci/Web-Nauka
//
// Repozytoria z polami osób: Web-Instytut, Web-Nauka, 9 × Web-Sem-*, Web-Studia (Web-Aktualnosci nie: jego pola zostają tekstem).
// Automat: .github/workflows/katalog-pracownikow.yml w Web-Pracownicy (po zmianie spisu, raz na dobę i ręcznie) uruchamia ten
// skrypt i commituje tylko pliki _cms/pracownicy/. Bez kluczy aplikacji skrypt uruchamia się ręcznie, potem zwykły commit w repo.
//
// Plik katalogu: imie_nazwisko, id, etykieta, pracuje. Dane kontaktowe nie są kopiowane (strona bierze je z żywego spisu).
// Etykieta (to, co redaktor widzi na liście wyboru): imię i nazwisko; przy kilku osobach o tym samym imieniu i nazwisku — z grupą;
// osoba z „Pracuje w Instytucie” odznaczonym — z dopiskiem „(były pracownik)”. Kolejności listy wyboru Pages CMS nie pozwala ustawić.
// Osób NIE usuwa: plik znika tylko wtedy, gdy osoby nie ma już w spisie i żaden plik danego repozytorium się do niej nie odwołuje
// (szukana ścieżka _cms/pracownicy/<id>.yml); każde usunięcie i każde zatrzymane usunięcie trafia do logu.
// --na-sucho: tylko wypisuje, co by zmienił (kod wyjścia 0; „zmian: N” w ostatniej linii każdego repozytorium).
import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const argumenty = process.argv.slice(2);
const naSucho = argumenty.includes('--na-sucho');
const [spisRepo, ...repozytoria] = argumenty.filter((a) => a !== '--na-sucho');
if (!spisRepo || !repozytoria.length) {
  console.error('Użycie: node skrypty/synchronizuj-katalog-pracownikow.mjs <Web-Pracownicy> <repo> [<repo> …] [--na-sucho]');
  process.exit(2);
}

const GRUPY = { nauczyciel: 'nauczyciel akademicki', administracja: 'administracja', doktorant: 'doktorant', emeryt: 'emeryt' };
const KATALOG = '_cms/pracownicy';
const bezKonca = (t) => t.replace(/\r\n/g, '\n');

// Spis: wszystkie pliki (także szkice i osoby, które odeszły — odwołania do nich mają działać dalej)
const katalogSpisu = path.join(spisRepo, 'src/content/pracownicy');
const osoby = [];
for (const plik of (await fs.readdir(katalogSpisu)).filter((f) => /\.ya?ml$/.test(f)).sort()) {
  const dane = YAML.parse(await fs.readFile(path.join(katalogSpisu, plik), 'utf8')) ?? {};
  if (!dane.imie_nazwisko) { console.warn(`! ${plik}: brak imienia i nazwiska — pominięty`); continue; }
  osoby.push({ id: plik.replace(/\.ya?ml$/, ''), dane });
}
const wpisy = osoby.map(({ id, dane }) => {
  const imie = String(dane.imie_nazwisko).trim();
  const duplikat = osoby.filter((o) => String(o.dane.imie_nazwisko).trim() === imie).length > 1;
  const pracuje = dane.pracuje !== false;
  const etykieta = imie + (duplikat ? ` (${GRUPY[dane.grupa] ?? dane.grupa ?? id})` : '') + (pracuje ? '' : ' (były pracownik)');
  return { id, tresc: YAML.stringify({ imie_nazwisko: imie, id, etykieta, pracuje }) };
});

/** Wszystkie pliki tekstowe repozytorium poza .git, node_modules i samym katalogiem — do szukania odwołań. */
async function* pliki(katalog, wzgl = '') {
  for (const e of await fs.readdir(katalog, { withFileTypes: true })) {
    const r = wzgl ? `${wzgl}/${e.name}` : e.name;
    if (['.git', 'node_modules', KATALOG].includes(r)) continue;
    if (e.isDirectory()) yield* pliki(path.join(katalog, e.name), r);
    else if (/\.(md|ya?ml|json)$/.test(e.name)) yield path.join(katalog, e.name);
  }
}

for (const repo of repozytoria) {
  const nazwa = path.basename(path.resolve(repo));
  const dir = path.join(repo, KATALOG);
  const istniejace = new Set((await fs.readdir(dir).catch(() => [])).filter((f) => /\.ya?ml$/.test(f)));
  let zmian = 0;
  if (!naSucho) await fs.mkdir(dir, { recursive: true });
  for (const { id, tresc } of wpisy) {
    const plik = `${id}.yml`;
    const stara = istniejace.has(plik) ? bezKonca(await fs.readFile(path.join(dir, plik), 'utf8')) : null;
    istniejace.delete(plik);
    if (stara === tresc) continue;
    zmian++;
    console.log(`${stara === null ? '+' : '~'} ${nazwa}/${KATALOG}/${plik}`);
    if (!naSucho) await fs.writeFile(path.join(dir, plik), tresc);
  }
  // pliki osób, których nie ma już w spisie: usuwane tylko bez odwołań w tym repozytorium
  if (istniejace.size) {
    const odwolania = new Set();
    for await (const p of pliki(repo)) {
      const t = await fs.readFile(p, 'utf8');
      for (const f of istniejace) if (t.includes(`${KATALOG}/${f}`)) odwolania.add(f);
    }
    for (const f of [...istniejace].sort()) {
      if (odwolania.has(f)) { console.log(`= ${nazwa}/${KATALOG}/${f}: osoby nie ma w spisie, ale są do niej odwołania — plik zostaje`); continue; }
      zmian++;
      console.log(`- ${nazwa}/${KATALOG}/${f}: osoby nie ma w spisie i nie ma do niej odwołań — usunięty`);
      if (!naSucho) await fs.unlink(path.join(dir, f));
    }
  }
  console.log(`${nazwa}: katalog ${wpisy.length} osób, zmian: ${zmian}${naSucho ? ' (na sucho, nic nie zapisano)' : ''}`);
}
