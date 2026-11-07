import type { Lang } from './daty';

// Tytuł w formie angielskiej (decyzja D1, zlecenie 16): prof. dr hab. i dr hab., prof. UWr → Prof.; dr hab. → Dr hab.;
// dr, dr inż. → Dr; mgr, mgr inż. → bez tytułu. Bez stanowisk w stylu amerykańskim. „dr, prof. UWr” → Dr: to stopień doktora.
const stopienEn = (stopien: string): string => {
  const s = stopien.toLowerCase();
  if (s.includes('hab')) return s.includes('prof') ? 'Prof.' : 'Dr hab.';
  if (s.trimStart().startsWith('prof')) return 'Prof.';
  return /(^|[\s,])dr\b/.test(s) ? 'Dr' : '';
};

// Imię i nazwisko z tytułem w polskiej kolejności:
// („dr hab., prof. UWr”, „Jan Dymara”) → „dr hab. Jan Dymara, prof. UWr”; („prof. dr hab.”, „Anna Nowak”) → „prof. dr hab. Anna Nowak”.
// Po angielsku: „Prof. Jan Dymara”, „Prof. Anna Nowak”.
export function zTytulem(stopien: string | undefined | null, imie: string, lang: Lang = 'pl'): string {
  const n = imie.trim();
  if (!stopien) return n;
  if (lang === 'en') {
    const t = stopienEn(stopien);
    return t ? `${t} ${n}` : n;
  }
  const [przed, ...po] = stopien.split(',').map((s) => s.trim()).filter(Boolean);
  const dopisek = po.join(', ').replace(/\bprof UWr\b/, 'prof. UWr');
  return `${przed ? `${przed} ` : ''}${n}${dopisek ? `, ${dopisek}` : ''}`;
}

// Ta sama zamiana w polach tekstowych z tytułem wpisanym przy nazwisku (kierownik, wykonawcy, recenzent, promotorzy):
// „prof. M. Bożejko, mgr M. Hinz, dr hab. W. Młotkowski” → „Prof. M. Bożejko, M. Hinz, Dr hab. W. Młotkowski”.
export function tytulyEn(tekst: string): string {
  const przed = '(^|[\\s,;(])';
  return tekst
    .replace(/(?:prof\.\s*)?dr\s+hab\.(?:\s*inż\.)?\s+([^,;]+?),\s*prof\.\s*UWr/gi, 'Prof. $1')
    .replace(/dr\s+hab\.(?:\s*inż\.)?,\s*prof\.\s*UWr\s+/gi, 'Prof. ')
    .replace(/prof\.\s*dr\s+hab\.(?:\s*inż\.)?/gi, 'Prof.')
    .replace(/,\s*prof\.\s*UWr/gi, '')
    .replace(new RegExp(`${przed}prof\\.\\s+`, 'gi'), '$1Prof. ')
    .replace(/dr\s+hab\.(?:\s*inż\.)?/gi, 'Dr hab.')
    .replace(new RegExp(`${przed}dr\\.?\\s+inż\\.\\s+`, 'gi'), '$1Dr ')
    .replace(new RegExp(`${przed}dr\\.?\\s+`, 'gi'), '$1Dr ')
    .replace(new RegExp(`${przed}mgr\\.?(?:\\s+inż\\.)?\\s+`, 'gi'), '$1')
    .replace(new RegExp(`${przed}inż\\.\\s+`, 'gi'), '$1');
}

export const tytulyWJezyku = (tekst: string, lang: Lang): string => (lang === 'en' ? tytulyEn(tekst) : tekst);
