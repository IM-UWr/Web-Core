// Dane strony działu „Nauka” (src/views/DzialNauka.astro): liczby w banerze, kafelki z menu, projekty, konferencje, teksty z CMS.
import dzial from '../../data/dzialy/nauka.json';
import { wybierz } from '../i18n';
import { today, addDays, type Lang } from '../daty';
import { menuGlowne } from '../menu';
import { konferencje, granty, obrony, trwaLubBedzie, type Grant, type Konferencja, type Obrona } from '../tresci';

// Konferencja trwająca albo nadchodząca (używane też w szablonie — wygląd daty).
export const konfTrwa = (k: Konferencja) => trwaLubBedzie({ poczatek: k.data.poczatek, koniec: k.data.koniec });

export async function daneDzialuNauka(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);

  // Odmiana po liczebniku: 1 / 2–4 (bez 12–14) / 5+ ; po angielsku: 1 / reszta.
  const odm = (n: number, pl: [string, string, string], en: [string, string]) => {
    if (lang === 'en') return n === 1 ? en[0] : en[1];
    if (n === 1) return pl[0];
    const j = n % 10, d = n % 100;
    return j >= 2 && j <= 4 && (d < 12 || d > 14) ? pl[1] : pl[2];
  };

  const [listaKonferencji, listaGrantow, listaObron] = await Promise.all([
    konferencje(), granty(), obrony(),
  ]);
  const dzis = today();
  const rok = Number(dzis.slice(0, 4));

  // Projekty realizowane — tak samo jak na /nauka/granty: rok zakończenia ≥ bieżący rok.
  const realizowane = listaGrantow.filter((g) => (g.data.rok_do ?? 0) >= rok);
  const maOpis = (g: Grant) => !!g.body?.trim();
  // Przykłady: najpierw projekty z opisem, potem najnowsze (każdy ma własną podstronę).
  const przyklady = [...realizowane.filter(maOpis), ...realizowane.filter((g) => !maOpis(g))].slice(0, 4);

  // Konferencje: nadchodzące i trwające (najbliższe najpierw); gdy brak — trzy ostatnie.
  const nadchodzaceKonf = listaKonferencji.filter(konfTrwa).reverse().slice(0, 3);
  const pokazKonf = nadchodzaceKonf.length ? nadchodzaceKonf : listaKonferencji.filter((k) => !konfTrwa(k)).slice(0, 3);
  const konfWRoku = listaKonferencji.filter((k) => k.data.poczatek.slice(0, 4) === String(rok) && !k.data.odwolana);

  // Obrony: najbliższe, a po nich ostatnio odbyte — razem trzy.
  const obronaBedzie = (o: Obrona) => trwaLubBedzie({ poczatek: o.data.termin });
  const odbyteObrony = listaObron.filter((o) => !obronaBedzie(o));
  const rokTemu = addDays(dzis, -365);
  const obronyRok = odbyteObrony.filter((o) => o.data.termin.slice(0, 10) >= rokTemu);

  // Pasek liczb (pozycje z zerem pomijamy).
  const liczby = [
    { n: realizowane.length, l: odm(realizowane.length, ['realizowany projekt', 'realizowane projekty', 'realizowanych projektów'], ['ongoing project', 'ongoing projects']) },
    { n: konfWRoku.length, l: `${odm(konfWRoku.length, ['konferencja', 'konferencje', 'konferencji'], ['conference', 'conferences'])} ${T(`w ${rok} roku`, `in ${rok}`)}` },
    { n: obronyRok.length, l: `${odm(obronyRok.length, ['doktorat', 'doktoraty', 'doktoratów'], ['PhD', 'PhDs'])} ${T('w ostatnim roku', 'in the past year')}` },
  ].filter((x) => x.n > 0);

  // Kafelki: grupy i linki z menu „Nauka” (nowy link w menu sam pojawi się tutaj).
  const pozycja = (await menuGlowne()).find((m) => m.etykieta === 'Nauka' || m.etykieta_en === 'Research');
  const grupy = (pozycja?.grupy ?? []).filter((g) => g.linki.length > 0);

  const naglowek = T('Nauka', 'Research');
  const lead = wybierz(dzial, 'wstep', lang);
  // Hasło na telefonie zamiast opisu (NaglowekStrony.astro; decyzja 31.10.2026). Opis zostaje na komputerze i w <meta description>.
  const haslo = wybierz(dzial, 'haslo', lang);
  // „Badania w Instytucie”: akapity z CMS (pole badania_tekst / badania_tekst_en; akapity oddzielone pustą linią).
  const badania = ((wybierz(dzial, 'badania_tekst', lang) as string) || '').split(/\n\s*\n/).map((a) => a.trim()).filter(Boolean);
  // Ramka „W skrócie” obok tekstu (komputer): lista {wartosc, opis, opis_en} z CMS; pozycje bez wartości pomijamy.
  // wartosc_en — etykieta w wersji angielskiej (puste = jak po polsku, np. liczby i lata)
  type Fakt = { wartosc?: string; wartosc_en?: string; opis?: string; opis_en?: string };
  const fakty = (((dzial as any).badania_fakty ?? []) as Fakt[])
    .filter((f) => f?.wartosc?.trim())
    .map((f) => ({ w: ((lang === 'en' && f.wartosc_en?.trim()) || f.wartosc!).trim(), o: (lang === 'en' && f.opis_en) || f.opis || '' }));

  return { realizowane, przyklady, nadchodzaceKonf, pokazKonf, liczby, grupy, naglowek, lead, haslo, badania, fakty };
}
