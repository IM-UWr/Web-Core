// Dane listy konferencji (src/views/ListaKonferencji.astro): nadchodzące, minione według lat, teksty i liczby w banerze.
import { today, type Lang } from '../daty';
import { konferencje, trwaLubBedzie, type Konferencja } from '../tresci';
import { stronaListy } from '../tekstyStron';

export async function daneListyKonferencji(lang: Lang) {
  const wszystkie = await konferencje();
  const przyszle = wszystkie.filter((k) => trwaLubBedzie({ poczatek: k.data.poczatek, koniec: k.data.koniec })).reverse();
  const minione = wszystkie.filter((k) => !przyszle.includes(k));
  const lata: { rok: string; lista: Konferencja[] }[] = [];
  for (const k of minione) {
    const r = k.data.poczatek.slice(0, 4);
    const ost = lata[lata.length - 1];
    if (ost && ost.rok === r) ost.lista.push(k);
    else lata.push({ rok: r, lista: [k] });
  }
  const odwolana = lang === 'en' ? 'cancelled' : 'odwołana';
  // tytuł, opis, hasło i tekst nad listą: Web-Nauka → Strony → Konferencje (src/content/strony/nauka/konferencje.md; zlecenie 30)
  const { tytul: naglowek, opis: lead, haslo, html } = await stronaListy('nauka/konferencje', lang, { wst: true });
  // Telefon (≤ 1023 px; zlecenie 01, decyzja 31.10.2026): hasło zamiast opisu (pole Hasło strony) i trzy liczby pod kreską — konferencje bez odwołanych: w bieżącym roku (dzień budowania) ·
  // wszystkie od pierwszego roku w danych · we Wrocławiu (miejsce zawiera „Wrocław”). Etykieta bez rzeczownika
  // („w 2026 roku”), więc ta sama dla każdej liczby.
  const odbywane = wszystkie.filter((k) => !k.data.odwolana);
  const rokTeraz = today().slice(0, 4);
  const pierwszyRok = odbywane.map((k) => k.data.poczatek.slice(0, 4)).sort()[0] ?? rokTeraz;
  const stala = (pl: string, en: string) => ({ pl: [pl, pl, pl] as [string, string, string], en: [en, en] as [string, string] });
  const liczby = [
    { n: odbywane.filter((k) => k.data.poczatek.startsWith(rokTeraz)).length, ...stala(`w ${rokTeraz} roku`, `in ${rokTeraz}`) },
    { n: odbywane.length, ...stala(`od ${pierwszyRok} roku`, `since ${pierwszyRok}`) },
    { n: odbywane.filter((k) => /Wrocław/.test(k.data.miejsce ?? '')).length, ...stala('we Wrocławiu', 'in Wrocław') },
  ];

  return { przyszle, lata, odwolana, naglowek, lead, haslo, html, liczby };
}
