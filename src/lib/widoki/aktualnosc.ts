// Dane pojedynczej aktualności (Aktualnosc.astro): tytuł, treść, blok wydarzenia i najbliższe wydarzenia w pasku.
import { render } from 'astro:content';
import { wybierz } from '../i18n';
import { now, today, hasTime, plusMinutes, type Lang } from '../daty';
import { aktualnosci, miejsce, slugOf, wydarzeniaNaGlowna, trwaLubBedzie, type Aktualnosc, type Wydarzenie } from '../tresci';
import { dzialWydarzenia } from '../patroni';
import ustawienia from '../../data/ustawienia.json';
import { renderMarkdown } from '../markdown';

export async function daneAktualnosci(wpis: Aktualnosc, lang: Lang) {
  const d = wpis.data;
  const slug = slugOf(wpis.id);
  const tytul = (lang === 'en' && d.tytul_en) || d.tytul;
  const zajawka = (lang === 'en' && d.zajawka_en) || d.zajawka;
  // podpis zdjęcia i nazwy załączników: wersja angielska (pola *_en), a gdy pusta — po polsku
  const opisZdjecia = wybierz(d, 'zdjecie_opis', lang);

  const { Content } = await render(wpis);
  const htmlEn = lang === 'en' && d.tresc_en ? await renderMarkdown(d.tresc_en, lang) : '';
  const tylkoPolski = lang === 'en' && !d.tresc_en;

  const wydarzenie: Wydarzenie | undefined = d.wydarzenie_poczatek
    ? {
        rodzaj: 'wydarzenie', tytul, poczatek: d.wydarzenie_poczatek, koniec: d.wydarzenie_koniec,
        koniecIcs: d.wydarzenie_koniec || (hasTime(d.wydarzenie_poczatek) ? plusMinutes(d.wydarzenie_poczatek, 120) : undefined), miejsce: miejsce(d.wydarzenie_miejsce, lang),
        href: `/aktualnosci/${slug}`, uid: `akt-${slug}`, opis: zajawka,
      }
    : undefined;
  const minelo = wydarzenie ? !trwaLubBedzie(wydarzenie) : false;
  const trwa = wydarzenie && !minelo && (hasTime(wydarzenie.poczatek) ? wydarzenie.poczatek <= now() : wydarzenie.poczatek <= today());
  // Najbliższe wydarzenia jak na stronie głównej (tylko gdy są blisko); gdy brak — bez prawego paska, treść szersza.
  const najblizsze = (await wydarzeniaNaGlowna(4, lang, Number((ustawienia as any).wydarzenia_dni_robocze ?? 5) || 5)).filter((w) => w.href !== `/aktualnosci/${slug}`).slice(0, 3);

  // Tylko wpis o wydarzeniu: każdy wiersz w kolorze własnego działu (zlecenie 21, punkt 6). Inne wpisy bez koloru działu, jak dotąd.
  const wpisy = d.rodzaj === 'wydarzenie' && najblizsze.length > 0 ? new Map((await aktualnosci()).map((a) => [`/aktualnosci/${slugOf(a.id)}`, a.data])) : undefined;
  const dzialWiersza = (w: Wydarzenie) => (wpisy ? dzialWydarzenia(w, w.href ? wpisy.get(w.href) : undefined) : undefined);

  return { tytul, zajawka, opisZdjecia, Content, htmlEn, tylkoPolski, wydarzenie, minelo, trwa, najblizsze, dzialWiersza };
}
