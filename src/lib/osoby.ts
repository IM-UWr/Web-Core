// Imię i nazwisko z tytułem w polskiej kolejności:
// („dr hab., prof. UWr”, „Jan Dymara”) → „dr hab. Jan Dymara, prof. UWr”; („prof. dr hab.”, „Anna Nowak”) → „prof. dr hab. Anna Nowak”.
export function zTytulem(stopien: string | undefined | null, imie: string): string {
  const n = imie.trim();
  if (!stopien) return n;
  const [przed, ...po] = stopien.split(',').map((s) => s.trim()).filter(Boolean);
  const dopisek = po.join(', ').replace(/\bprof UWr\b/, 'prof. UWr');
  return `${przed ? `${przed} ` : ''}${n}${dopisek ? `, ${dopisek}` : ''}`;
}
