// Dane listy „Warto wiedzieć” (/instytut/warto-wiedziec; zlecenie 47, punkt 4): tytuł, wstęp (pole Opis), hasło i liczby banera,
// wpisy trzech grup. Tekst strony: Web-Instytut → Strony → Warto wiedzieć (src/content/strony/instytut/warto-wiedziec.md; src/lib/tekstyStron.ts).
// Liczby banera liczą się przy budowie:
// - lata od pierwszego wykładu (15.11.1945; dziś w Warszawie) — 18.11.2026 → 81;
// - sylwetki widoczne (widoczny(): przy fladze bez szkiców) z Treścią, bez TBA — na Podglądzie 17, w budowie publicznej 11;
// - „4 rektorów UWr” — stała (Marczewski, Urbanik, Łukaszewicz, Duda), bez pola w CMS.
import type { Lang } from '../daty';
import { stronaListy } from '../tekstyStron';
import { dzisWarszawa } from '../ww.mjs';
import { widoczneWW, type WW } from '../wartoWiedziec';

/** Pełne lata od pierwszego wykładu (15 listopada 1945) do dnia „RRRR-MM-DD”. */
export function lataOdWykladu(dzis: string): number {
  const [r, m, d] = dzis.split('-').map(Number);
  return r - 1945 - (m > 11 || (m === 11 && d >= 15) ? 0 : 1);
}

export async function daneListyWartoWiedziec(lang: Lang) {
  const { tytul, opis, opisPl, haslo } = await stronaListy('instytut/warto-wiedziec', lang);
  const wpisy = await widoczneWW();
  const grupa = (g: WW['grupa']) => wpisy.filter((w) => w.grupa === g);
  const sylwetki = grupa('sylwetki');
  const liczby = [
    { n: lataOdWykladu(dzisWarszawa()), pl: ['rok od pierwszego wykładu', 'lata od pierwszego wykładu', 'lat od pierwszego wykładu'] as [string, string, string], en: ['year since the first lecture', 'years since the first lecture'] as [string, string] },
    { n: sylwetki.filter((w) => !w.tba).length, pl: ['sylwetka', 'sylwetki', 'sylwetek'] as [string, string, string], en: ['profile', 'profiles'] as [string, string] },
    { n: '4', pl: 'rektorów UWr', en: 'University rectors' },
  ];
  return { tytul, opis, opisPl, haslo, liczby, sylwetki, nagrody: grupa('nagrody'), historie: grupa('historie') };
}
