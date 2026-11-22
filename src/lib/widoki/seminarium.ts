// Dane strony seminarium (src/views/Seminarium.astro): opis, nadchodzące i minione referaty (także według lat akademickich),
// koordynatorzy, zakłady.
import { render } from 'astro:content';
import { rokAkademicki, type Lang } from '../daty';
import { referaty, seminariumReferatu, zaklady, type Seminarium } from '../tresci';
import { wPrzyszlosci } from '../liczbyTerminow';
import { wszyscyPracownicy, koordynatorzySeminarium } from '../osobySpisu';
import { renderMarkdown } from '../markdown';
import ustawienia from '../../data/ustawienia.json';

export async function daneSeminarium(seminarium: Seminarium, lang: Lang) {
  const d = seminarium.data;
  const nazwa = (lang === 'en' && d.nazwa_en) || d.nazwa;
  const { Content } = await render(seminarium);
  // opis seminarium po angielsku (pole tresc_en); puste = wersja angielska pokazuje opis po polsku
  const htmlEn = lang === 'en' && d.tresc_en ? await renderMarkdown(d.tresc_en, lang) : '';
  const wszystkie = (await referaty()).filter((r) => seminariumReferatu(r) === seminarium.id);
  // „Nadchodzące” = referaty z terminem w przyszłości — ta sama definicja co „zapowiedziane referaty” w banerach (liczbyTerminow.ts)
  const przyszle = (r: (typeof wszystkie)[number]) => wPrzyszlosci(r.data.termin);
  // streszczenie: na /en pole tresc_en (en — HTML), a gdy puste — treść wpisu (C)
  const zTresc = async (r: (typeof wszystkie)[number]) => ({
    r, C: (await render(r)).Content, en: lang === 'en' && r.data.tresc_en?.trim() ? await renderMarkdown(r.data.tresc_en, lang) : '',
  });
  const nadchodzace = await Promise.all(wszystkie.filter(przyszle).map(zTresc));
  const minione = await Promise.all(wszystkie.filter((r) => !przyszle(r)).reverse().map(zTresc));
  // minione według lat akademickich (od 1.10; zlecenie 68, jak daneListyKonferencji): lata od najnowszego, w roku od najnowszego
  // referatu; lata wyliczone z danych. Kotwica roku: #rok-RRRR-RR (np. rok-2025-26).
  const lataMinionych: { rok: string; id: string; lista: typeof minione }[] = [];
  for (const m of minione) {
    const rok = rokAkademicki(m.r.data.termin);
    const ost = lataMinionych[lataMinionych.length - 1];
    if (ost && ost.rok === rok) ost.lista.push(m);
    else lataMinionych.push({ rok, id: `rok-${rok.replace('/', '-')}`, lista: [m] });
  }
  // zakład(y), do których należy seminarium — link zamiast listy uczestników (skład jest na stronie zakładu)
  const zakladySem = (await zaklady()).filter((z) => d.zaklad.includes(z.id));
  // Koordynator(zy): ze spisu (nazwisko z tytułem, link do strony domowej, jeśli jest), potem spoza spisu (jak wpisani);
  // stare pole „prowadzący” — jak dotąd (src/lib/osobySpisu.ts, zlecenie 42). Brak koordynatora: znacznik na Podglądzie.
  // Termin i sala nie są stałe — każdy referat ma własne.
  const { lista: koordynatorzy, brak: brakKoordynatora } = koordynatorzySeminarium(seminarium, await wszyscyPracownicy(), lang);
  // Adres automatu listy mailingowej (Google Apps Script, patrz README → „Powiadomienia e-mail”); pusty = zapisy wyłączone.
  const adresListy = ((ustawienia as any).powiadomienia?.adres ?? '') as string;
  const maKoord = koordynatorzy.length > 0 || brakKoordynatora || zakladySem.length > 0 || !!d.kontakt;

  return { nazwa, Content, htmlEn, nadchodzace, minione, lataMinionych, zakladySem, koordynatorzy, brakKoordynatora, adresListy, maKoord };
}
