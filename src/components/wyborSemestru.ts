// Który semestr pokazać domyślnie (przełącznik semestrów: Rok akademicki, Plan zajęć).
// Trwający; jeśli dziś przerwa — najbliższy następny; jeśli brak — ten, który kończy się najpóźniej.
// Bez dat w danych — `zapas` (np. semestr wybrany podczas budowania).
export interface OkresSemestru { od?: string | null; do?: string | null }

const data = (s?: string | null) => (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : '');

export function wybierzSemestr(lista: OkresSemestru[], dzis: string, zapas = 0): number {
  let trwa = -1, nast = -1, ost = -1;
  lista.forEach((s, i) => {
    const od = data(s.od), d = data(s.do);
    if (!od || !d) return;
    if (trwa < 0 && od <= dzis && dzis <= d) trwa = i;
    if (od > dzis && (nast < 0 || od < data(lista[nast].od))) nast = i;
    if (ost < 0 || d > data(lista[ost].do)) ost = i;
  });
  if (trwa >= 0) return trwa;
  if (nast >= 0) return nast;
  if (ost >= 0) return ost;
  return Math.max(0, Math.min(zapas, lista.length - 1));
}
