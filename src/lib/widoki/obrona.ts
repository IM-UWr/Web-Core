// Dane strony pojedynczej obrony doktorskiej (src/views/Obrona.astro): tytuł, treść, dokumenty, hasło i liczby w banerze.
import { render } from 'astro:content';
import dzial from '../../data/dzialy/nauka.json';
import { t, wybierz } from '../i18n';
import { renderMarkdown } from '../markdown';
import { tytulyEn, tytulyWJezyku } from '../osoby';
import { long, longWithDay, dayNum, monthShort, time, plusMinutes, type Lang } from '../daty';
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
    ...d.recenzje.map((r) => ({ nazwa: `${t(lang, 'recenzja')}: ${tytulyWJezyku(r.recenzent, lang)}`, plik: r.plik })),
  ].filter(Boolean) as { nazwa: string; plik: string }[];
  // Telefon (≤ 1023 px; zlecenie 01, decyzja 31.10.2026): baner jak w działach — „← Obrony doktorskie”, imię i nazwisko,
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

  // Treść: na /en pole tresc_en, po polsku treść wpisu (Markdown). Gdy puste, tekst złożony z danych obrony, który sam
  // dobiera czas: przed terminem zaproszenie, po terminie informacja, że obrona się odbyła (zlecenie 11, zalecenie 12;
  // dok/en/RAPORT-EN.md, K4; zlecenie 16, decyzja właściciela 5.11). undefined = treść wpisu (<Content />).
  const html = lang === 'en'
    ? d.tresc_en?.trim() ? await renderMarkdown(d.tresc_en, lang) : zaproszenieEn(obrona, przyszla)
    : obrona.body?.trim() ? undefined : zaproszeniePl(obrona, przyszla);

  return { Content, html, tytul, przyszla, opisZdjecia, dokumenty, haslo, liczby };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const lista = (x: string[]) => (x.length < 2 ? x.join('') : `${x.slice(0, -1).join(', ')} and ${x[x.length - 1]}`);

// „You are cordially invited to the public defence of the doctoral dissertation of Malwina Mrowińska, entitled
// <em>…</em>, on Tuesday, 27 October 2026, 13:15, in room WS, Mathematical Institute, University of Wrocław.” (po terminie:
// „The public defence … took place on …”), „Supervisor: …”, „The dissertation, abstracts and reviews are available below.”
function zaproszenieEn(obrona: Obrona, przyszla: boolean): string {
  const d = obrona.data;
  const kto = `the doctoral dissertation of ${esc(d.kandydat)}, MSc, entitled <em>${esc(d.tytul_rozprawy)}</em>`;
  const gdzie = miejsce(d.miejsce, 'en');
  const kiedy = `on ${esc(longWithDay(d.termin, 'en'))}${gdzie ? `, in ${esc(gdzie)}` : ''}`;
  const akapity = [przyszla ? `You are cordially invited to the public defence of ${kto}, ${kiedy}.` : `The public defence of ${kto}, took place ${kiedy}.`];
  if (d.promotorzy.length) akapity[0] += ` ${d.promotorzy.length > 1 ? 'Supervisors' : 'Supervisor'}: ${esc(d.promotorzy.map(tytulyEn).join(', '))}.`;
  const dok = [d.rozprawa && 'dissertation', (d.streszczenie_pl || d.streszczenie_en) && (d.streszczenie_pl && d.streszczenie_en ? 'abstracts' : 'abstract'), d.recenzje.length && (d.recenzje.length > 1 ? 'reviews' : 'review')]
    .filter(Boolean) as string[];
  if (dok.length) akapity.push(`The ${lista(dok)} ${dok.length > 1 || /s$/.test(dok[0]) ? 'are' : 'is'} available below.`);
  return akapity.map((a) => `<p>${a}</p>`).join('\n');
}

// „Zapraszamy na publiczną obronę rozprawy doktorskiej pt. <em>…</em>.” (po terminie: „Publiczna obrona rozprawy doktorskiej
// pt. <em>…</em> odbyła się 18 czerwca 2026 r.”), „Rozprawa doktorska, streszczenia oraz recenzje są dostępne poniżej.”
// Bez nazwiska w zdaniu, bo stoi w nagłówku tuż wyżej: odmiany nazwiska i „mgr” nie da się złożyć z danych. Termin i miejsce
// są w parach Kiedy / Gdzie nad tekstem. Tytuł z lang="en", jak w banerze.
function zaproszeniePl(obrona: Obrona, przyszla: boolean): string {
  const d = obrona.data;
  const praca = `rozprawy doktorskiej pt. <em lang="en">${esc(d.tytul_rozprawy)}</em>`;
  const akapity = [przyszla ? `Zapraszamy na publiczną obronę ${praca}.` : `Publiczna obrona ${praca} odbyła się ${long(d.termin, 'pl', false)} r.`];
  const dwaStreszczenia = d.streszczenie_pl && d.streszczenie_en;
  const dok = [
    d.rozprawa && ['rozprawa doktorska', 'jest dostępna'],
    (d.streszczenie_pl || d.streszczenie_en) && (dwaStreszczenia ? ['streszczenia', 'są dostępne'] : ['streszczenie', 'jest dostępne']),
    d.recenzje.length > 0 && (d.recenzje.length > 1 ? ['recenzje', 'są dostępne'] : ['recenzja', 'jest dostępna']),
  ].filter(Boolean) as [string, string][];
  if (dok.length) {
    const nazwy = dok.map(([n]) => n);
    const wyliczenie = nazwy.length > 1 ? `${nazwy.slice(0, -1).join(', ')} oraz ${nazwy[nazwy.length - 1]}` : nazwy[0];
    akapity.push(`${wyliczenie[0].toUpperCase()}${wyliczenie.slice(1)} ${dok.length > 1 ? 'są dostępne' : dok[0][1]} poniżej.`);
  }
  return akapity.map((a) => `<p>${a}</p>`).join('\n');
}
