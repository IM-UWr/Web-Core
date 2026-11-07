// Zlecenie 28, etap 6a: symulacja zapisu treści kierunku w Pages CMS. Pole „Treść” / „Treść EN” (rich-text, format markdown)
// edytuje TipTap z @tiptap/markdown 3.x (StarterKit, Underline, Link, Image, Table, TableRow, TableHeader, TableCell).
// Każdy plik kierunku: wczytanie Markdownu do edytora i zapis bez zmian (getMarkdown), body i tresc_en. Wynik — pliki
// w katalogu wyjściowym (do zbudowania strony i porównania z wersją sprzed zapisu) i lista zmian w samym Markdownie.
//
// Uruchomienie (zależności tylko w tym katalogu: npm install):
//   node symulacja.mjs <katalog z plikami kierunków> <katalog wyjściowy>
// Bez argumentów: tylko próba wzoru $\ell^2$ i kilku zapisów edytora (Enter w punkcie, Shift+Enter).
import { Window } from 'happy-dom';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const okno = new Window();
for (const k of ['window', 'document', 'navigator', 'Node', 'HTMLElement', 'Element', 'DocumentFragment', 'getComputedStyle', 'MutationObserver', 'DOMParser', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  if (!(k in globalThis) || k === 'window' || k === 'document') globalThis[k] = k === 'window' ? okno : okno[k];
}

const { Editor } = await import('@tiptap/core');
const { default: StarterKit } = await import('@tiptap/starter-kit');
const { default: Underline } = await import('@tiptap/extension-underline');
const { default: Link } = await import('@tiptap/extension-link');
const { default: Image } = await import('@tiptap/extension-image');
const { Table, TableRow, TableHeader, TableCell } = await import('@tiptap/extension-table');
const { Markdown } = await import('@tiptap/markdown');

const editor = new Editor({
  element: document.createElement('div'),
  extensions: [StarterKit.configure({ underline: false, link: false }), Underline, Link.configure({ openOnClick: false }), Image, Table, TableRow, TableHeader, TableCell, Markdown],
});
const zapisz = (md) => {
  editor.commands.setContent(md ?? '', { contentType: 'markdown' });
  return editor.getMarkdown();
};

const [, , wej, wyj] = process.argv;
if (!wej) {
  const proby = [
    'Przestrzeń $\\ell^2$ w tekście.',
    'Wzory: $a_1 + b_2$, $x^*$, $\\{x\\}$, $\\|f\\|_{L^2}$, $a \\\\ b$ i $$\\sum_{i=1}^n i$$.',
    '- **Tytuł**  \n  Opis.  \n  Termin: do 30 czerwca',
    '1. **A: B** — opis\n2. Termin: x',
  ];
  for (const md of proby) {
    console.log(JSON.stringify(md), '\n→', JSON.stringify(zapisz(md)), '\n');
  }
  process.exit(0);
}

fs.mkdirSync(wyj, { recursive: true });
let zmian = 0;
for (const f of fs.readdirSync(wej).filter((f) => f.endsWith('.md'))) {
  const tekst = fs.readFileSync(path.join(wej, f), 'utf8').replace(/\r\n/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(tekst);
  const front = YAML.parse(m[1]);
  const body = zapisz(m[2]);
  if (front.tresc_en) front.tresc_en = zapisz(front.tresc_en);
  const nowy = `---\n${YAML.stringify(front, { lineWidth: 0 })}---\n${body}\n`;
  fs.writeFileSync(path.join(wyj, f), nowy);
  // zmiany w Markdownie (linie), osobno PL i EN
  for (const [jez, a, b] of [['PL', m[2].trim(), body.trim()], ['EN', (YAML.parse(m[1]).tresc_en ?? '').trim(), (front.tresc_en ?? '').trim()]]) {
    const A = a.split('\n'), B = b.split('\n');
    const rozne = B.filter((l) => !A.includes(l));
    zmian += rozne.length;
    console.log(`${f} ${jez}: ${A.length} → ${B.length} linii, ${rozne.length} linii zmienionych`);
    for (const l of rozne.slice(0, 8)) console.log('   +', JSON.stringify(l).slice(0, 180));
  }
}
console.log(`Razem linii zmienionych przez zapis: ${zmian}`);
