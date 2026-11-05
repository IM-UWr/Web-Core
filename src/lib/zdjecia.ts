// Zdjęcia z public/pliki (treści z repozytoriów Web-*) w astro:assets (zlecenie 13, punkty 5 i 6): wymiary do width/height
// (miejsce zarezerwowane, bez skoków), <Picture> z AVIF/WebP i srcset oraz malutka rozmyta wersja w linii (ok. 1 KB) pod
// pełnym zdjęciem. Pliki zostają w public/ (tak je kładzie skrypt treści), tu tylko odczyt przy budowaniu; zdjęcia spoza
// public/pliki albo zewnętrzne — bez zmian (zwykły <img>).
import fs from 'node:fs/promises';
import path from 'node:path';

// leniwe wczytanie: metadane (wymiary, format) tylko tych plików, które strona naprawdę pokazuje
const PLIKI = import.meta.glob<{ default: ImageMetadata }>('/public/pliki/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}');

const klucz = (adres: string) => '/public' + decodeURI(adres.split(/[?#]/)[0]);

/** Metadane zdjęcia z public/pliki (adres jak w treściach: „/pliki/…”); brak pliku albo adres zewnętrzny — undefined. */
export async function zdjecie(adres?: string | null): Promise<ImageMetadata | undefined> {
  if (!adres || !adres.startsWith('/pliki/')) return undefined;
  const f = PLIKI[klucz(adres)];
  return f ? (await f()).default : undefined;
}

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
export const rozmiarPola = (...pola: [string | null, number, number][]) => (p: number) =>
  pola.map(([w, s, h]) => `${w ? w + ' ' : ''}${Math.ceil(Math.max(s, h * p))}px`).join(', ');
