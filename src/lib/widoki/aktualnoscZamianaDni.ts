// Dane automatycznego ogłoszenia o zamianie dni (AktualnoscZamianaDni.astro): tekst z szablonu, dzień zamiany i link.
import { u } from '../url';
import { wJezyku } from '../i18n';
import { today, type Lang } from '../daty';
import { renderMarkdown } from '../markdown';
import { aktualnoscZamiany } from '../kolory-dni';

export async function daneAktualnosciZamianyDni(data: string, lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const dzis = today();
  const a = aktualnoscZamiany(data, lang, dzis)!;
  const d = a.dzien;
  const html = await renderMarkdown(a.tresc, lang);
  const minela = dzis > a.data;
  const dla = ['studenci', 'pracownicy'];
  const kalendarz = u(wJezyku('/studia/rok-akademicki', lang)) + `#${T('zamiany-dni', 'day-swaps')}`;

  return { a, d, html, minela, dla, kalendarz };
}
