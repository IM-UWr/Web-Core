// Zdjęcia z public/pliki (treści z repozytoriów Web-*) w astro:assets (zlecenie 13, punkty 5 i 6): wymiary do width/height
// (miejsce zarezerwowane, bez skoków), <Picture> z AVIF/WebP i srcset oraz malutka rozmyta wersja w linii (ok. 1 KB) pod
// pełnym zdjęciem. Pliki zostają w public/ (tak je kładzie skrypt treści), tu tylko odczyt przy budowaniu; zdjęcia spoza
// public/pliki albo zewnętrzne — bez zmian (zwykły <img>).
import fs from 'node:fs/promises';
import path from 'node:path';
import { WARUNEK_NISKI_DOTYK, sizesTelefon } from './media';

// leniwe wczytanie: metadane (wymiary, format) tylko tych plików, które strona naprawdę pokazuje
const PLIKI = import.meta.glob<{ default: ImageMetadata }>('/public/pliki/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}');

const klucz = (adres: string) => '/public' + decodeURI(adres.split(/[?#]/)[0]);

/** Metadane zdjęcia z public/pliki (adres jak w treściach: „/pliki/…”); brak pliku albo adres zewnętrzny — undefined. */
export async function zdjecie(adres?: string | null): Promise<ImageMetadata | undefined> {
  if (!adres || !adres.startsWith('/pliki/')) return undefined;
  const f = PLIKI[klucz(adres)];
  return f ? (await f()).default : undefined;
}

/** Zestaw plików zdjęcia: metadane, gotowe sizes i szerokości do srcset. Wspólne dla <Picture> w ZdjecieZ i dla wczytywania z wyprzedzeniem
 *  (ZdjeciePreload.astro, zlecenie 21, punkt 10): różne dane to dwa różne pliki i podwójne pobranie.
 *  rozmiar — sizes albo funkcja proporcji zdjęcia (szerokość / wysokość); szer — szerokości w srcset, domyślnie jak w opisie ZdjecieZ. */
export async function zestawZdjecia(adres: string, rozmiar: string | ((proporcje: number) => string), szer?: number[]) {
  const meta = await zdjecie(adres);
  const sizes = typeof rozmiar === 'function' ? rozmiar(meta ? meta.width / meta.height : 1.5) : rozmiar;
  const piks = /\d(vw|vh|svh|%|em|rem)/.test(sizes) ? [] : [...sizes.replaceAll(WARUNEK_NISKI_DOTYK, '').matchAll(/(\d+(?:\.\d+)?)px/g)].map((m) => +m[1]);
  const szerokosci = szer ?? (piks.length ? piks.flatMap((x) => [1, 2, 3].map((k) => Math.ceil(x * k))) : [400, 640, 960, 1280, 1600, 1920, 2560, 3200]);
  // szerokości rosnąco, bez prawie powtórzonych (różnica poniżej 10% — np. 240 i 243 z dwóch pól miniatury); sam plik na końcu
  // tylko wtedy, gdy któraś szerokość go przekracza (miniatura nie potrzebuje pełnego zdjęcia)
  const mniejsze = meta ? szerokosci.filter((w) => w < meta.width).sort((a, b) => a - b) : [];
  const widths = meta
    ? [...mniejsze, ...(mniejsze.length < szerokosci.length || !mniejsze.length ? [meta.width] : [])]
        .filter((w, i, t) => i === t.length - 1 || !t.slice(i + 1).some((v) => v <= w * 1.1))
    : [];
  return { meta, sizes, widths };
}

// Okładka strony głównej. Szerokość zdjęcia na ekranie (sizes; zlecenie 13, punkt 6; zlecenie 18, punkt 13): na komputerze ok. 1,09 · (100vw − foto-x),
// czyli nieco ponad szerokość okna, a przy niskim oknie 77% wysokości okładki (max(600px, 100svh)) razy proporcje zdjęcia (p); na telefonie
// 62% wysokości okładki razy p (zal-telefon.css)
export const rozmiarOkl = (p: number) =>
  `${sizesTelefon(`max(100vw, ${Math.ceil(62 * p)}vh)`)}, max(103vw, ${Math.ceil(462 * p)}px, ${Math.ceil(77 * p)}vh)`;

const zastepcze = new Map<string, Promise<string | undefined>>();
/** Malutka rozmyta wersja zdjęcia jako data: URI (WebP, 32 px szerokości, ok. 0,5–1 KB) — pod pełnym zdjęciem, zanim się
 *  wczyta. Robi ją sharp, którego Astro i tak używa do zdjęć (bez nowej zależności); bez sharp — undefined (zostaje kolor). */
export function zastepczy(adres?: string | null): Promise<string | undefined> {
  if (!adres || !PLIKI[klucz(adres)]) return Promise.resolve(undefined);
  let p = zastepcze.get(adres);
  if (!p) {
    p = (async () => {
      try {
        const sharp = (await import('sharp')).default;
        const plik = await fs.readFile(path.join(process.cwd(), 'public', decodeURI(adres.split(/[?#]/)[0])));
        const buf = await sharp(plik).resize({ width: 32 }).blur(0.6).webp({ quality: 45 }).toBuffer();
        return `data:image/webp;base64,${buf.toString('base64')}`;
      } catch {
        return undefined;
      }
    })();
    zastepcze.set(adres, p);
  }
  return p;
}

/** Atrybut sizes dla zdjęcia kadrowanego przez object-fit: cover w polu o stałym rozmiarze (miniatury): pola
 *  [warunek, szerokość, wysokość] w px, ostatnie bez warunku. Potrzebna szerokość to max(szerokość pola, wysokość pola ×
 *  proporcje zdjęcia) — wąskie pole z szerokim zdjęciem wymaga szerszego pliku. Do ZdjecieZ jako sizes (funkcja proporcji). */
export const rozmiarPola = (...pola: ['telefon' | null, number, number][]) => (p: number) =>
  pola.map(([w, s, h]) => { const szer = `${Math.ceil(Math.max(s, h * p))}px`; return w ? sizesTelefon(szer) : szer; }).join(', ');
