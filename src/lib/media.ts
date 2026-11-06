// Jedna definicja „telefonu” i „komputera” (zlecenie 23, punkt 1). Widok telefonu: szerokość do 760 px albo niski ekran dotykowy,
// czyli telefon w poziomie. Tablety (wysokość ponad 500 px) i komputery z myszą, także w niskim oknie: widok komputera.
// Skrypty i zapytania składane w .astro biorą stałe stąd. W CSS ten sam tekst dosłownie, z komentarzem przy pierwszym użyciu w pliku.
// Starsze komentarze w kodzie piszą skrótem „≤ 760 px” i „≥ 761 px”: znaczy to właśnie te dwa widoki.
export const MQ_TELEFON = '(max-width: 760px), (max-height: 500px) and (pointer: coarse)';
export const MQ_KOMPUTER = '(min-width: 761px) and (min-height: 501px), (min-width: 761px) and (pointer: fine)';

/** Warunek niskiego ekranu dotykowego w atrybucie sizes; zestawZdjecia (lib/zdjecia.ts) pomija go, licząc szerokości plików. */
export const WARUNEK_NISKI_DOTYK = '(max-height: 500px) and (pointer: coarse)';

/** Wpisy telefonu do atrybutu sizes. Przecinek rozdziela tam wpisy, a nie warunki, więc to dwa wpisy z tą samą szerokością. */
export const sizesTelefon = (szerokosc: string) => `(max-width: 760px) ${szerokosc}, ${WARUNEK_NISKI_DOTYK} ${szerokosc}`;
