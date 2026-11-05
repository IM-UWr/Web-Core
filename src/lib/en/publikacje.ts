// Wykazy publikacji na /en (/en/nauka/publikacje/<rok>): polskie konwencje opisu bibliograficznego z bibliografii UWr
// i starej strony (src/data/publikacje/*.json) tłumaczone przy wyświetlaniu. Danych nie zmieniamy. Tytuły prac, nazwy
// czasopism, wydawnictw i miejsc zostają w oryginale (to cytaty — zlecenie 11, zalecenie 12; dok/en/RAPORT-EN.md, D2).
// Lista zwrotów do akceptacji: dok/en/TLUMACZENIA.md, sekcja „Publikacje”.
import type { Praca } from '../widoki/publikacje';

type Regula = [RegExp, string | ((...a: string[]) => string)];
const zastosuj = (s: string | undefined, reguly: Regula[]) => (s ? reguly.reduce((t, [re, na]) => t.replace(re, na as any), s) : s);
const AFILIACJE: Regula[] = [
  [/Instytut Matematyczny, Uniwersytet W[Rr]ocławski/g, 'Mathematical Institute, University of Wrocław'],
  [/Uniwersytet W[Rr]ocławski/g, 'University of Wrocław'],
  [/WMiI UWr/g, 'Faculty of Mathematics and Computer Science, University of Wrocław'],
];

// Uwagi („jęz. angielski, wydawnictwo zagraniczne, praca recenzowana, JCR IF=1.394, afiliacja UWr”): słownik części.
const UWAGI: Record<string, string> = {
  'jęz. angielski': 'in English', 'język angielski': 'in English', 'jęz. polski': 'in Polish', 'język polski': 'in Polish',
  'wydawnictwo zagraniczne': 'foreign publisher', 'wydawnictwo krajowe': 'Polish publisher', 'wydawnictwo własne': 'in-house publisher',
  'praca recenzowana': 'peer-reviewed',
  'afiliacja UWr': 'University of Wrocław affiliation', 'inna afiliacja': 'other affiliation',
  'afiliacja wielokrotna': 'multiple affiliations', 'brak informacji o afiliacji': 'no affiliation information',
  'w druku': 'in press',
};
export const uwagiEn = (s?: string) => s && s.split(/,\s*/).map((c) => UWAGI[c.trim()] ?? c).join(', ');

// Źródło i opis pracy (kolejność ma znaczenie: dłuższe zwroty przed krótszymi).
const ZRODLO: Regula[] = [
  [/Przy nazwisku (.+?) (podwójna afiliacja|dwie afiliacje|potrójna afiliacja) ?: (.+?)\.?(?= Przy nazwisku| Oświadczenie|$)/g,
    (_, kto, ile, reszta) => `${kto} has a ${ile.startsWith('potrójna') ? 'triple' : 'dual'} affiliation: ${reszta.replace(/ oraz /g, ' and ')}.`],
  [/Oświadczenie o afiliowaniu na (.+?)\./, (_, x) => `Affiliation declared with ${x}.`],
  ...AFILIACJE,
  [/Materiały (?:z )?sympozjum "([^"]+)", poświęconego książce ([^"]+?) "([^"]+)", Wrocław, grudzień (\d{4})\./,
    (_, s, kto, k, r) => `Proceedings of the symposium "${s}" devoted to the book "${k}" by ${kto.replace(/^Andrzeja Kisielewicza$/, 'Andrzej Kisielewicz')}, Wrocław, December ${r}.`],
  [/\(tom, mimo daty (\d{4})r\., ukazał się dopiero w roku (\d{4}), praca nie była sprawozdawana w (\d{4})r\.\)/,
    (_, a, b, c) => `(the volume, although dated ${a}, appeared only in ${b}; the paper was not reported in ${c})`],
  [/Bibliografia na stronach (\d+)-(\d+)/, 'Bibliography on pp. $1–$2'],
  [/Bibliogr\./g, 'Bibliography.'],
  [/Streszcz\. w jęz\. ang\./g, 'Abstract in English.'],
  [/Dost[eę]p do abstraktu:/g, 'Abstract:'],
  [/Dostęp do spisu treści:/g, 'Table of contents:'],
  [/Dostęp do początku artykułu:/g, 'Beginning of the article:'],
  [/Dostęp:? (?=https?:)/g, 'Available at: '],
  [/Zasób elektroniczny:/g, 'Electronic resource:'],
  [/link zweryfikowany/g, 'link verified'],
  [/Numer artykułu: ?/g, 'article no. '],
  [/\bnr art\. /g, 'art. no. '],
  [/\bT\. (\d+), z\. (\d+)/g, 'Vol. $1, issue $2'],
  [/\bTom (\d+), Numer (\d+)/g, 'Vol. $1, No. $2'],
  [/\b[Nn]r (?=\d)/g, 'no. '],
  [/\b[sS]\. ?(\d+) ?[-–] ?(\d+)/g, 'pp. $1–$2'],
  [/\bs\.(\d+)\b/g, 'p. $1'],
  [/\b(\d+) s\./g, '$1 pp.'],
  [/\bss\. ?(\d+)/g, '$1 pp.'],
  [/ : il\./g, ' : ill.'],
  [/\[wyd\. (\d{4})\]/g, '[published $1]'],
  [/(^|\. |\. - )W: /g, '$1In: '],
  [/\bw tomie:? ?/g, 'in the volume '],
  [/\bw książce:? ?/g, 'in the book '],
  [/Praca zbiorowa pod redakcją Witolda Więsława/g, 'collective work edited by Witold Więsław'],
  [/\/ red\. nauk\. /g, '/ ed. by '],
  [/\/ pod redakcją /g, '/ ed. by '],
  [/\/ redakcja /g, '/ ed. by '],
  [/\/ ?red\. ?/g, '/ ed. by '],
  [/\(red\.\)/g, '(ed.)'],
  [/, tom (\d+)/g, ', vol. $1'],
  [/\[i in\.\]/g, '[et al.]'],
];
const AUTORZY: Regula[] = [
  [/\[i in\.\]/g, '[et al.]'],
  [/, współautorów oraz (\d+) innych/, (_, n) => ` and ${n} other co-authors`],
  [/\(red\.\)/g, '(eds.)'],
];

// Praca na /en: autorzy, źródło, opis i uwagi z tłumaczeniem zwrotów; tytuł bez zmian.
export const pracaEn = (p: Praca): Praca => ({
  ...p,
  autorzy: zastosuj(p.autorzy, AUTORZY),
  zrodlo: zastosuj(p.zrodlo, ZRODLO),
  opis: zastosuj(p.opis, ZRODLO),
  uwagi: uwagiEn(p.uwagi),
});
