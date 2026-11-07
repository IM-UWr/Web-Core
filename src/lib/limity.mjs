// Pozycje z limitem linii (zlecenie 25, punkt 1). Znacznik data-limit-linii="N" czyta pomiar w zal/Podstrona.astro. Plik .mjs, bo korzysta z niego też wtyczka Markdownu.

// Adres e-mail łamie się tylko przed „@”: dwie części bez łamania (.mail-cz w global.css), między nimi <wbr>.
export const czesciMaila = (adres) => {
  const i = adres.lastIndexOf('@');
  return i > 0 ? [adres.slice(0, i), adres.slice(i)] : [adres, ''];
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** @param {string} adres */
export const mailHtml = (adres) => {
  const [a, b] = czesciMaila(adres);
  return b ? `<span class="mail-cz">${esc(a)}</span><wbr><span class="mail-cz">${esc(b)}</span>` : esc(a);
};

// Limit 2 linii tylko dla krótkich komórek tabeli. Dłuższy tekst ma 3 linie już przy 1920 px (np. warunki na „Pierwszym roku”, 143 znaki), więc limit
// przełączałby takie strony na widok telefonu przy każdym oknie. Żadna komórka do 30 znaków nie ma dziś ponad 2 linii od 1368 px wzwyż (poza wzorami).
export const ZNAKOW_KOMORKI = 30;
/** @param {string | undefined | null} tekst */
export const limitKomorki = (tekst) => (tekst && tekst.trim().length <= ZNAKOW_KOMORKI ? '2' : undefined);
