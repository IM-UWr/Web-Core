// Dane strony działu „Instytut”: liczby, kafelki z menu, „O Instytucie”, ostatnie sukcesy i kontakt.
import dzial from '../../data/dzialy/instytut.json';
import ustawienia from '../../data/ustawienia.json';
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import { menuGlowne } from '../menu';
import { zaklady, pracownicy, aktualnosci } from '../tresci';

// Ramka „W skrócie” obok tekstu (komputer): lista {wartosc, opis, opis_en} z CMS; pozycje bez wartości pomijamy.
// wartosc_en — etykieta w wersji angielskiej (puste = jak po polsku, np. liczby i lata)
type Fakt = { wartosc?: string; wartosc_en?: string; opis?: string; opis_en?: string };

export async function daneDzialuInstytut(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);

  // Odmiana po liczebniku: 1 / 2–4 (bez 12–14) / 5+ ; po angielsku: 1 / reszta.
  const odm = (n: number, pl: [string, string, string], en: [string, string]) => {
    if (lang === 'en') return n === 1 ? en[0] : en[1];
    if (n === 1) return pl[0];
    const j = n % 10, d = n % 100;
    return j >= 2 && j <= 4 && (d < 12 || d > 14) ? pl[1] : pl[2];
  };

  const listaZakladow = await zaklady();
  const osoby = await pracownicy();
  const ileNauczycieli = osoby.filter((o) => o.data.grupa === 'nauczyciel').length;
  const ileDoktorantow = osoby.filter((o) => o.data.grupa === 'doktorant').length;
  const liczby = [
    { n: ileNauczycieli, l: odm(ileNauczycieli, ['nauczyciel akademicki', 'nauczycieli akademickich', 'nauczycieli akademickich'], ['academic staff member', 'academic staff']) },
    { n: ileDoktorantow, l: odm(ileDoktorantow, ['doktorant', 'doktorantów', 'doktorantów'], ['PhD student', 'PhD students']) },
    { n: listaZakladow.length, l: odm(listaZakladow.length, ['zakład lub pracownia', 'zakłady i pracownie', 'zakładów i pracowni'], ['department or unit', 'departments and units']) },
  ].filter((x) => x.n > 0);

  // Kafelki: grupy i linki z menu „Instytut” (nowy link w menu sam pojawi się tutaj).
  const pozycja = (await menuGlowne()).find((m) => m.etykieta === 'Instytut' || m.etykieta_en === 'Institute');
  const grupy = (pozycja?.grupy ?? []).filter((g) => g.linki.length > 0);

  const sukcesy = (await aktualnosci()).filter((a) => a.data.rodzaj === 'sukces').slice(0, 3);

  const k = ustawienia.kontakt;
  const godziny = wybierz(dzial, 'kontakt_godziny', lang);
  const mapa = k.adres ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Instytut Matematyczny Uniwersytetu Wrocławskiego, ${k.adres}`)}` : undefined;
  // Mapa Google osadzana dopiero po kliknięciu (bez cookies Google do czasu zgody — patrz Polityka prywatności)
  const mapaEmbed = k.adres ? `https://www.google.com/maps?q=${encodeURIComponent(`Instytut Matematyczny Uniwersytetu Wrocławskiego, ${k.adres}`)}&output=embed&hl=${lang}` : undefined;

  const naglowek = T('Instytut', 'Institute');
  const lead = wybierz(dzial, 'wstep', lang);
  // Hasło na telefonie zamiast opisu (NaglowekStrony.astro; decyzja 31.10.2026). Opis zostaje na komputerze i w <meta description>.
  const haslo = wybierz(dzial, 'haslo', lang);
  const oInstytucie = ((wybierz(dzial, 'o_instytucie', lang) as string) || '').split(/\n\s*\n/).map((a) => a.trim()).filter(Boolean);
  const fakty = (((dzial as any).o_instytucie_fakty ?? []) as Fakt[])
    .filter((f) => f?.wartosc?.trim())
    .map((f) => ({ w: ((lang === 'en' && f.wartosc_en?.trim()) || f.wartosc!).trim(), o: (lang === 'en' && f.opis_en) || f.opis || '' }));
  const sukcesyOpis = wybierz(dzial, 'sukcesy_opis', lang);

  return { naglowek, lead, haslo, liczby, grupy, oInstytucie, fakty, sukcesy, sukcesyOpis, k, godziny, mapa, mapaEmbed };
}
