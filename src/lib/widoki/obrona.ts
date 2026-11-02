// Dane strony pojedynczej obrony doktorskiej (src/views/Obrona.astro): tytuł, treść, dokumenty, hasło i liczby w banerze.
import { render } from 'astro:content';
import dzial from '../../data/dzialy/nauka.json';
import { t, wybierz } from '../i18n';
import { longWithDay, dayNum, monthShort, time, plusMinutes, type Lang } from '../daty';
import { miejsce, slugOf, trwaLubBedzie, type Obrona, type Wydarzenie } from '../tresci';

export async function daneObrony(obrona: Obrona, lang: Lang) {
  const d = obrona.data;
  const slug = slugOf(obrona.id);
  const { Content } = await render(obrona);
  const tytul = `${lang === 'en' ? 'PhD defence' : 'Obrona doktoratu'}: ${d.kandydat}`;
  const w: Wydarzenie = {
    rodzaj: 'obrona', tytul, podtytul: d.tytul_rozprawy, poczatek: d.termin, koniecIcs: plusMinutes(d.termin, 120), miejsce: miejsce(d.miejsce, lang),
    href: `/obrony-doktorskie/${slug}`, uid: `obr-${slug}`,
  };
  const przyszla = trwaLubBedzie(w);
  const opisZdjecia = wybierz(d, 'zdjecie_opis', lang);
  const dokumenty = [
    d.zawiadomienie && { nazwa: t(lang, 'zawiadomienie'), plik: d.zawiadomienie },
    d.rozprawa && { nazwa: t(lang, 'rozprawa'), plik: d.rozprawa },
    d.streszczenie_pl && { nazwa: t(lang, 'streszczeniePl'), plik: d.streszczenie_pl },
    d.streszczenie_en && { nazwa: t(lang, 'streszczenieEn'), plik: d.streszczenie_en },
    ...d.recenzje.map((r) => ({ nazwa: `${t(lang, 'recenzja')}: ${r.recenzent}`, plik: r.plik })),
  ].filter(Boolean) as { nazwa: string; plik: string }[];
  // Telefon (≤ 760 px; zlecenie 01, decyzja 31.10.2026): baner jak w działach — „← Obrony doktorskie”, imię i nazwisko,
  // hasło (src/data/dzialy/nauka.json, obrona_haslo / _en), kreska i trzy pozycje: data („20 paź”, pod nią dzień tygodnia
  // i rok) · godzina (pod nią sala — pierwszy człon miejsca, gdy to sala; inaczej „godzina”) · liczba recenzji.
  // Tytuł rozprawy na telefonie pod banerem (.ob-rozprawa), w banerze tylko na komputerze.
  const haslo = ((dzial as Record<string, any>)[lang === 'en' ? 'obrona_haslo_en' : 'obrona_haslo'] as string | undefined) || undefined;
  const salaObrony = miejsce(d.miejsce, lang)?.split(',')[0].trim();
  // (napisy i ich etykiety są już w języku strony — LiczbyBanera bierze `pl`, gdy nie ma `en`)
  const liczby = [
    { n: `${dayNum(d.termin)} ${monthShort(d.termin, lang)}`, pl: `${longWithDay(d.termin, lang).split(',')[0]}, ${d.termin.slice(0, 4)}` },
    { n: time(d.termin), pl: salaObrony && /^(sala|sale|room|rooms)\s/i.test(salaObrony) ? salaObrony : lang === 'en' ? 'time' : 'godzina' },
    { n: d.recenzje.length, pl: ['recenzja', 'recenzje', 'recenzji'] as [string, string, string], en: ['review', 'reviews'] as [string, string] },
  ];

  return { Content, tytul, przyszla, opisZdjecia, dokumenty, haslo, liczby };
}
