// Dane podstrony pozycji „Warto wiedzieć”: tytuł, zajawka, treść, dział, hasło banera i link.
import { render, type CollectionEntry } from 'astro:content';
import { isExternal } from '../url';
import { wybierz } from '../i18n';
import { renderMarkdown } from '../markdown';
import type { Lang } from '../daty';

const DZIALY = {
  nauka: { pl: 'Nauka', en: 'Research', adres: '/nauka' },
  studia: { pl: 'Studia', en: 'Study', adres: '/studia' },
  instytut: { pl: 'Instytut', en: 'Institute', adres: '/instytut' },
} as const;

export async function daneWpisuWartoWiedziec(wpis: CollectionEntry<'warto_wiedziec'>, lang: Lang) {
  const d = wpis.data;
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const tytul = wybierz(d, 'tytul', lang);
  const zajawka = wybierz(d, 'zajawka', lang);
  const { Content } = await render(wpis);
  const htmlEn = lang === 'en' && d.tresc_en ? await renderMarkdown(d.tresc_en) : '';
  const tylkoPolski = lang === 'en' && !d.tresc_en;
  const dzial = DZIALY[d.dzial];
  // hasło na telefonie: „rok · dział” (EN: „2017 · Research”), bez roku — sam dział
  const haslo = [d.rok?.trim(), dzial[lang]].filter(Boolean).join(' · ');
  const zewnetrzny = !!d.link && isExternal(d.link);
  const etykietaLinku = wybierz(d, 'link_etykieta', lang) || (zewnetrzny ? T('Strona zewnętrzna', 'External website') : T('Więcej', 'More'));
  const opisObrazu = wybierz(d, 'obraz_opis', lang);
  const wszystkie = T('Warto wiedzieć', 'Highlights');

  return { d, tytul, zajawka, Content, htmlEn, tylkoPolski, dzial, haslo, zewnetrzny, etykietaLinku, opisObrazu, wszystkie };
}
