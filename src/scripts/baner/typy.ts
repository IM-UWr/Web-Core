// Wspólne typy silnika animacji banerów (silnik.ts) i motywów (motywy/*.ts).
// Współrzędne zawsze w pikselach CSS banera (.ph): x od lewej krawędzi, y od górnej.

export type Pudlo = [number, number, number, number]; // x0, y0, x1, y1

/** Linia tekstu w banerze (Range.getClientRects, sklejone w wiersze). */
export interface Linia { t: number; b: number; r: number }

/** Geometria banera, policzona z prawdziwych elementów (.wstecz, .eyebrow, h1, .ph-haslo, .pt-liczby). */
export interface Pole {
  W: number; H: number;
  /** poziome brzegi treści (16 px od krawędzi) */
  x0: number; x1: number;
  /** pole rysunku w pionie: od linku „←” do kreski nad liczbami (12 px odstępu); bez liczb — do dołu banera minus 12 px */
  y0: number; y1: number;
  /** dół paska menu, gdy menu leży na banerze (przezroczysty nagłówek), inaczej 0 */
  menu: number;
  tytul: Linia[];
  haslo: Linia | null;
  /** krycie maski „obrys linii” w punkcie (0 pod tekstem, 1 tam, gdzie rysunek widać w pełni) */
  widac(x: number, y: number): number;
  /** granica zanikania (x, od którego zaczyna się przejście) na wysokości y */
  granica(y: number): number;
  /** kolor rysunku z tokenu CSS --ph-rysunek z zadanym kryciem */
  rgba(a: number): string;
}

/** Wynik kroku motywu: które warstwy przerysować i za ile sekund obudzić pętlę. */
export interface Krok { a: boolean; b?: boolean; za: number }

export interface Motyw {
  /** przesuwa stan do chwili t (s, czas silnika); zwraca, co przerysować, i czas do następnego kroku */
  krok(t: number): Krok;
  /** warstwa stała (A): rysowana tylko, gdy krok zwróci a: true */
  rysuj(c: CanvasRenderingContext2D, t: number): void;
  /** warstwa ruchoma (B, opcjonalna); może zwrócić pudło, w którym rysowała — wtedy silnik czyści i maskuje tylko je */
  rysujB?(c: CanvasRenderingContext2D, t: number): Pudlo | null | void;
  /** gotowy, nieruchomy rysunek (prefers-reduced-motion) */
  gotowy(): void;
}

/** Parametry maski, które motyw podaje silnikowi przed pomiarem. */
export interface Ustawienia {
  /** odstęp granicy zanikania od końca linii tytułu (px) */
  granica?: number;
  /** o ile maska może zachodzić w lewo pod hasło, licząc od granicy przy tytule (px) */
  podHaslem?: number;
  /** szerokość łagodnego przejścia (px) */
  przejscie?: number;
}

/** t0 — czas silnika w chwili utworzenia motywu (0 przy pierwszym, > 0 po zmianie układu). */
export type Fabryka = (G: Pole, t0: number) => Motyw;

export interface Modul { default: Fabryka; ustawienia?: Ustawienia }
