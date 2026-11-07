// Strony prawne (Deklaracja dostępności, Polityka prywatności): wspólna kratka stron ogólnych (prototyp
// animacje-ogolne.html, motyw „kratka”, ustawienia telefonu; zlecenie 05). Sam papier w kratkę: oczka 16 px przyczepione
// do prawego dolnego rogu pola, cienkie linie (krycie 0,06), zanikające przy tekście jak inne rysunki (maska silnika).
// Rysunek statyczny: rysuje się raz po każdym pomiarze banera, potem zero klatek (krok nie prosi o nic, zegar śpi).
// Tę samą kratkę (funkcja `kratka`) rysuje pod pajęczyną Banacha strona Szukaj (banach.ts, wariant „kratka”).
// Pole (zlecenie 07): dolna linia 12 px nad połową hasła (tam, gdzie maska już nie wygasza rysunku; w prototypie na dole
// starego pola, 12 px nad dołem banera — przy 390 × 844 o 31–32 px wyżej), górna — najwyższa, która mieści się co najmniej
// 2 px pod górą pola; pionowe linie od górnej do dolnej. Wielkość oczek bez zmian (skala 100%).
import type { Fabryka, Pole, Ustawienia } from '../typy';

export const ustawienia: Ustawienia = { granica: 12, przejscie: 60 };

const OKO = 16, NAD = 12, KRYCIE = 0.06;

/** wspólna kratka stron ogólnych w polu G z kryciem a */
export function kratka(c: CanvasRenderingContext2D, G: Pole, a: number) {
  const xP = G.x1, yD = G.y1 - NAD;
  const kx = Math.max(0, Math.floor((xP - G.x0) / OKO)), ky = Math.max(0, Math.floor((yD - G.y0 - 2) / OKO));
  const xL = xP - kx * OKO, yG = yD - ky * OKO;
  c.lineWidth = 1;
  c.beginPath();
  for (let i = 0; i <= kx; i++) { const x = xP - i * OKO; c.moveTo(x, yG); c.lineTo(x, yD); }
  for (let j = 0; j <= ky; j++) { const y = yD - j * OKO; c.moveTo(xL, y); c.lineTo(xP, y); }
  c.strokeStyle = G.rgba(a); c.stroke();
}

const motyw: Fabryka = (G) => {
  // silnik rysuje warstwę zaraz po utworzeniu motywu; potem krok już nic nie zmienia
  return {
    krok: () => ({ a: false, za: 5 }),
    rysuj(c) { kratka(c, G, KRYCIE); },
    gotowy() {},
  };
};

export default motyw;
