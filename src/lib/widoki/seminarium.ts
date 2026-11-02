// Dane strony seminarium (src/views/Seminarium.astro): opis, nadchodzące i minione referaty, koordynatorzy, zakłady, hasło i liczby w banerze.
import { render } from 'astro:content';
import { wybierz } from '../i18n';
import type { Lang } from '../daty';
import { referaty, seminariumReferatu, zaklady, pracownicy, type Seminarium } from '../tresci';
import { wPrzyszlosci, ETYKIETY } from '../liczbyTerminow';
import { zTytulem } from '../osoby';
import { renderMarkdown } from '../markdown';
import ustawienia from '../../data/ustawienia.json';

export async function daneSeminarium(seminarium: Seminarium, lang: Lang) {
  const d = seminarium.data;
  const nazwa = (lang === 'en' && d.nazwa_en) || d.nazwa;
  const { Content } = await render(seminarium);
  // opis seminarium po angielsku (pole tresc_en); puste = wersja angielska pokazuje opis po polsku
  const htmlEn = lang === 'en' && d.tresc_en ? await renderMarkdown(d.tresc_en) : '';
  const wszystkie = (await referaty()).filter((r) => seminariumReferatu(r) === seminarium.id);
  // „Nadchodzące” = referaty z terminem w przyszłości — ta sama definicja co „zapowiedziane referaty” w banerach (liczbyTerminow.ts)
  const przyszle = (r: (typeof wszystkie)[number]) => wPrzyszlosci(r.data.termin);
  const nadchodzace = await Promise.all(wszystkie.filter(przyszle).map(async (r) => ({ r, C: (await render(r)).Content })));
  const minione = await Promise.all(wszystkie.filter((r) => !przyszle(r)).reverse().map(async (r) => ({ r, C: (await render(r)).Content })));
  // zakład(y), do których należy seminarium — link zamiast listy uczestników (skład jest na stronie zakładu)
  const zakladySem = (await zaklady()).filter((z) => d.zaklad.includes(z.id));
  // Koordynator(zy) = pole „prowadzący”: nazwisko z tytułem ze spisu pracowników, link do strony domowej, jeśli jest.
  // Termin i sala nie są stałe — każdy referat ma własne.
  const osoby = await pracownicy();
  const koordynatorzy = d.prowadzacy.map((imie) => {
    const kand = osoby.filter((p) => p.data.imie_nazwisko === imie.trim());
    const o = kand.find((p) => p.data.grupa === 'nauczyciel') ?? kand.find((p) => p.data.grupa !== 'administracja') ?? kand[0];
    return { nazwa: zTytulem(o?.data.stopien, imie), strona: o?.data.strona as string | undefined };
  });
  // Adres automatu listy mailingowej (Google Apps Script, patrz README → „Powiadomienia e-mail”); pusty = zapisy wyłączone.
  const adresListy = ((ustawienia as any).powiadomienia?.adres ?? '') as string;
  // Telefon (≤ 760 px; zlecenie 01, decyzja 31.10.2026): baner jak w działach — „← Seminaria”, tytuł, hasło o tematyce
  // seminarium, kreska i liczby. Hasło: pole `haslo` / `haslo_en` seminarium (CMS); puste — nazwa zakładu w języku strony
  // (bez zakładu — bez hasła, jak dotąd). Koordynatorzy, e-mail i zakład — w zwartym bloku pod banerem (.sm-koord);
  // w banerze zostają tylko na komputerze (.sem-koord.tylko-komputer).
  const haslo = (lang === 'en' ? d.haslo_en : d.haslo)?.trim() || (zakladySem[0] ? wybierz(zakladySem[0].data, 'nazwa', lang) : undefined);
  const liczby = [
    { n: nadchodzace.length, ...ETYKIETY.referaty },
    { n: minione.length, ...ETYKIETY.archiwum },
    { n: koordynatorzy.length, pl: ['koordynator', 'koordynatorów', 'koordynatorów'] as [string, string, string], en: ['coordinator', 'coordinators'] as [string, string] },
  ];
  const maKoord = koordynatorzy.length > 0 || zakladySem.length > 0 || !!d.kontakt;

  return { nazwa, Content, htmlEn, nadchodzace, minione, zakladySem, koordynatorzy, adresListy, haslo, liczby, maKoord };
}
