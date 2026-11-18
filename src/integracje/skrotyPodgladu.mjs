// Zlecenie 33, decyzja właściciela 18.11: dymek „Nowa wersja strony gotowa” na Podglądzie tylko wtedy, gdy zmieniła się otwarta strona.
// Po budowie Podglądu (PODGLAD=1; w innych budowach nic) liczy skrót każdej strony HTML z plakietką stanu budowy, bez danych samej
// budowy (numer przebiegu, czas budowy, napis plakietki), więc dwie budowy tych samych danych dają te same skróty. Skrót i ścieżkę
// pliku wpisuje do plakietki (data-skrot, data-plik), a wszystkie skróty zapisuje w dist/podglad/skroty.json: { run, strony }.
// Plakietka (src/lib/stanBudowy/klient.js) po nowej udanej budowie pobiera skroty.json nowej wersji i porównuje skrót tej strony.
// Wiersz szkicu na plakietce zostaje w skrócie: włączenie albo wyłączenie „Opublikowane” to zmiana strony.
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ZNACZNIK = 'data-skrot=""';
const ZMIENNE = [
  [/(stan-budowy\.(?:css|js))\?v=[^"']*/g, '$1'],
  [/ data-run="[^"]*"/g, ''],
  [/ data-start="[^"]*"/g, ''],
  [/(<span class="sb-tekst">)[^<]*(<\/span>)/g, '$1$2'],
];

async function* strony(katalog) {
  for (const e of await fs.readdir(katalog, { withFileTypes: true })) {
    const p = path.join(katalog, e.name);
    if (e.isDirectory()) yield* strony(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

export default function skrotyPodgladu() {
  return {
    name: 'skroty-podgladu',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (process.env.PODGLAD !== '1') return;
        const korzen = fileURLToPath(dir);
        const skroty = {};
        for await (const p of strony(korzen)) {
          const t = await fs.readFile(p, 'utf8');
          if (!t.includes(ZNACZNIK)) continue;
          const bez = ZMIENNE.reduce((s, [r, z]) => s.replace(r, z), t);
          const skrot = crypto.createHash('sha256').update(bez).digest('base64url').slice(0, 16);
          const plik = path.relative(korzen, p).split(path.sep).join('/');
          skroty[plik] = skrot;
          await fs.writeFile(p, t.replace(ZNACZNIK, `data-skrot="${skrot}" data-plik="${plik}"`));
        }
        await fs.mkdir(path.join(korzen, 'podglad'), { recursive: true });
        await fs.writeFile(path.join(korzen, 'podglad', 'skroty.json'), JSON.stringify({ run: process.env.PODGLAD_RUN_ID || 'lokalnie', strony: skroty }));
        logger.info(`skróty stron Podglądu: ${Object.keys(skroty).length}`);
      },
    },
  };
}
