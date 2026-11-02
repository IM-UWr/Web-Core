// Dane listy sukcesów (src/views/ListaSukcesow.astro): wpisy „sukces” pogrupowane według lat, teksty i liczby w banerze.
import { today, type Lang } from '../daty';
import { aktualnosci, type Aktualnosc } from '../tresci';
import dzial from '../../data/dzialy/nauka.json';

export async function daneListySukcesow(lang: Lang) {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);

  const sukcesy = (await aktualnosci()).filter((a) => a.data.rodzaj === 'sukces');
  const lata: { rok: string; lista: Aktualnosc[] }[] = [];
  for (const a of sukcesy) {
    const r = a.data.data.slice(0, 4);
    const ost = lata[lata.length - 1];
    if (ost && ost.rok === r) ost.lista.push(a);
    else lata.push({ rok: r, lista: [a] });
  }

  const naglowek = T('Sukcesy', 'Achievements');
  const lead = T(
    'Nagrody, wyróżnienia, granty i stypendia pracowników, doktorantów, studentów i absolwentów Instytutu Matematycznego.',
    'Prizes, distinctions, grants and scholarships awarded to staff, PhD students, students and graduates of the Mathematical Institute.',
  );
  const najstarszy = lata.length ? lata[lata.length - 1].rok : '';
  const najnowszy = lata.length ? lata[0].rok : '';
  const archiwumStarejStrony = 'https://www.math.uni.wroc.pl/sukcesy';
  // Liczby na komputerze (w banerze, .pt-liczby.tylko-komputer).
  const liczby = sukcesy.length > 0 ? [
    { n: String(sukcesy.length), l: T('wpisów o sukcesach', 'achievement posts') },
    { n: najstarszy === najnowszy ? najnowszy : `${najstarszy}–${najnowszy}`, l: T('lata', 'years') },
  ] : [];
  // Telefon: hasło z danych działu (po angielsku tylko pole _en — bez polskich resztek) i trzy liczby w banerze.
  // Bieżący rok z daty budowy (today()); lata w archiwum — od roku najstarszego wpisu do bieżącego włącznie.
  const haslo = ((dzial as any)[lang === 'en' ? 'sukcesy_haslo_en' : 'sukcesy_haslo'] as string | undefined) || undefined;
  const rok = today().slice(0, 4);
  const wTymRoku = lata.find((g) => g.rok === rok)?.lista.length ?? 0;
  const lat = najstarszy ? Number(rok) - Number(najstarszy) + 1 : 0;
  const liczbyTelefon: { n: number; pl: [string, string, string]; en: [string, string] }[] = [
    { n: sukcesy.length, pl: ['wpis o sukcesach', 'wpisy o sukcesach', 'wpisów o sukcesach'], en: ['achievement post', 'achievement posts'] },
    { n: wTymRoku, pl: [`w ${rok} roku`, `w ${rok} roku`, `w ${rok} roku`], en: [`in ${rok}`, `in ${rok}`] },
    { n: lat, pl: [`rok w archiwum, od ${najstarszy}`, `lata w archiwum, od ${najstarszy}`, `lat w archiwum, od ${najstarszy}`], en: [`year archived, since ${najstarszy}`, `years archived, since ${najstarszy}`] },
  ];

  return { sukcesy, lata, naglowek, lead, archiwumStarejStrony, liczby, haslo, liczbyTelefon };
}
