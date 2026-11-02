// Dane listy konferencji (src/views/ListaKonferencji.astro): nadchodzące, minione według lat, teksty i liczby w banerze.
import dzial from '../../data/dzialy/nauka.json';
import { today, type Lang } from '../daty';
import { konferencje, trwaLubBedzie, type Konferencja } from '../tresci';

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
  const naglowek = lang === 'en' ? 'Conferences' : 'Konferencje';
  const lead = lang === 'en'
    ? 'Conferences and workshops organised or co-organised by members of the Mathematical Institute.'
    : 'Konferencje i warsztaty organizowane lub współorganizowane przez pracowników Instytutu Matematycznego.';
  // Telefon (≤ 760 px; zlecenie 01, decyzja 31.10.2026): hasło zamiast opisu (src/data/dzialy/nauka.json,
  // konferencje_haslo / _en) i trzy liczby pod kreską — konferencje bez odwołanych: w bieżącym roku (dzień budowania) ·
  // wszystkie od pierwszego roku w danych · we Wrocławiu (miejsce zawiera „Wrocław”). Etykieta bez rzeczownika
  // („w 2026 roku”), więc ta sama dla każdej liczby.
  const haslo = ((dzial as Record<string, any>)[lang === 'en' ? 'konferencje_haslo_en' : 'konferencje_haslo'] as string | undefined) || undefined;
  const odbywane = wszystkie.filter((k) => !k.data.odwolana);
  const rokTeraz = today().slice(0, 4);
  const pierwszyRok = odbywane.map((k) => k.data.poczatek.slice(0, 4)).sort()[0] ?? rokTeraz;
  const stala = (pl: string, en: string) => ({ pl: [pl, pl, pl] as [string, string, string], en: [en, en] as [string, string] });
  const liczby = [
    { n: odbywane.filter((k) => k.data.poczatek.startsWith(rokTeraz)).length, ...stala(`w ${rokTeraz} roku`, `in ${rokTeraz}`) },
    { n: odbywane.length, ...stala(`od ${pierwszyRok} roku`, `since ${pierwszyRok}`) },
    { n: odbywane.filter((k) => /Wrocław/.test(k.data.miejsce ?? '')).length, ...stala('we Wrocławiu', 'in Wrocław') },
  ];

  return { przyszle, lata, odwolana, naglowek, lead, haslo, liczby };
}
