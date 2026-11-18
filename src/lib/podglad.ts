// Zlecenie 33, część B: dane Podglądu (Web-Podglad) wpisane przy budowie i adresy formularzy Pages CMS.
// PODGLAD=1, PODGLAD_RUN_ID, PODGLAD_START i PODGLAD_REPO ustawia workflow podglad.yml (Web-Podglad); bez nich (Core, przyszła
// strona publiczna, zwykła budowa lokalna) plakietki stanu budowy nie ma, a src/pages/podglad/[plik].ts nie tworzy żadnego pliku.
// .tresci/pochodzenie.json (plik → repozytorium treści) też zapisuje podglad.yml; bez niego wiersz szkicu jest bez linku do CMS.
import fs from 'node:fs';
import path from 'node:path';
import tresci from '../../tresci.json';

export const PODGLAD = process.env.PODGLAD === '1';
export const PODGLAD_RUN_ID = /^\d+$/.test(process.env.PODGLAD_RUN_ID ?? '') ? process.env.PODGLAD_RUN_ID! : '';
export const PODGLAD_START = process.env.PODGLAD_START ?? '';
export const PODGLAD_REPO = /^[\w.-]+\/[\w.-]+$/.test(process.env.PODGLAD_REPO ?? '') ? process.env.PODGLAD_REPO! : 'IM-UWr/Web-Podglad';

let pochodzenie: Record<string, string> | undefined;
function repozytoriumPliku(plik: string): string | undefined {
  if (!pochodzenie) {
    try {
      pochodzenie = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.tresci', 'pochodzenie.json'), 'utf8'));
    } catch {
      pochodzenie = {};
    }
  }
  return pochodzenie![plik.replaceAll('\\', '/')];
}

// Formularze z przełącznikiem „Opublikowane” (zlecenie 33, A2.3; zakłady i „Warto wiedzieć” — decyzja właściciela 18.11):
// nazwa formularza w .pages.yml = nazwa kolekcji. Strony działów (strona-dzialu, popularyzacja) to formularze jednego pliku
// (adres …/main/file/<nazwa>); ich strona zostaje i przy fladze, a wiersz szkicu mówi tylko o tekście z pliku.
const KOLEKCJE = new Set(['strony', 'kierunki', 'specjalnosci', 'zaklady', 'warto_wiedziec']);
const PLIKI = new Set(['strona-dzialu', 'popularyzacja']);

/** Adres formularza wpisu w Pages CMS albo undefined, gdy nie da się go ustalić (brak pochodzenia albo formularz bez przełącznika). */
export function formularzWCms(kolekcja: string, plik?: string): string | undefined {
  if (!plik || !(KOLEKCJE.has(kolekcja) || PLIKI.has(kolekcja))) return undefined;
  const repo = repozytoriumPliku(plik);
  if (!repo) return undefined;
  const r = `https://app.pagescms.org/${tresci.organizacja.toLowerCase()}/${repo.toLowerCase()}/main`;
  return PLIKI.has(kolekcja) ? `${r}/file/${kolekcja}` : `${r}/collection/${kolekcja}/edit/${encodeURIComponent(plik)}`;
}
