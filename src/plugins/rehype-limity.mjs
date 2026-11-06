// Pozycje z limitem linii w treści z Markdownu (zlecenie 25, punkt 1): krótkie komórki tabel oraz nazwiska i e-maile w kontaktach (.kontakty, dl.para).
// E-mail dostaje też <wbr> przed „@” i części bez łamania. Znacznik data-limit-linii czyta pomiar w zal/Podstrona.astro.
import { czesciMaila, ZNAKOW_KOMORKI } from '../lib/limity.mjs';

const klasy = (n) => [].concat(n.properties?.className ?? []);
const tekstW = (n) => (n.type === 'text' ? n.value : (n.children ?? []).map(tekstW).join(''));
const maWzor = (n) => klasy(n).includes('katex') || (n.children ?? []).some(maWzor);
const czesc = (value) => ({ type: 'element', tagName: 'span', properties: { className: ['mail-cz'] }, children: [{ type: 'text', value }] });

const oznacz = (n) => { n.properties = { ...n.properties, dataLimitLinii: '2' }; };

const naMail = (a) => {
  if (a.children?.length !== 1 || a.children[0].type !== 'text') return;
  const [x, y] = czesciMaila(a.children[0].value);
  if (!y) return;
  a.children = [czesc(x), { type: 'element', tagName: 'wbr', properties: {}, children: [] }, czesc(y)];
  oznacz(a);
};

const przejdz = (n, wKontaktach) => {
  for (const d of n.children ?? []) {
    if (d.type !== 'element') continue;
    if ((d.tagName === 'td' || d.tagName === 'th') && tekstW(d).trim().length <= ZNAKOW_KOMORKI && !maWzor(d)) oznacz(d);
    if (d.tagName === 'b' && klasy(n).length === 0 && wKontaktach) oznacz(d);
    if (d.tagName === 'a' && wKontaktach && String(d.properties?.href ?? '').startsWith('mailto:')) naMail(d);
    przejdz(d, wKontaktach || klasy(d).includes('kontakty') || klasy(d).includes('para'));
  }
};

export default function rehypeLimity() {
  return (tree) => przejdz(tree, false);
}
