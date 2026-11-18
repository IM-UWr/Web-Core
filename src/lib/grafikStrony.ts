// Grafik dyżurów na stronie (zlecenie 45: Tutornia) przy budowaniu: okres z kalendarza zajęć, linia pod tytułem planu, liczby banera
// i dane dla skryptu przeglądarki (src/scripts/grafik.ts). Parser i stany: src/lib/grafik.mjs; blok: src/plugins/rehype-bloki.mjs.
import { semestrDnia, nazwaSemestru } from './kolory-dni';
import { daneDoSkryptu, dataSlownie, grafikZMarkdown, liczbyGrafiku } from './grafik.mjs';
import { getCollection } from 'astro:content';
import { TYLKO_OPUBLIKOWANE, widoczny } from './tresci';
import type { Lang } from './daty';
import type { WynikGrafiku } from './markdown';

export interface GrafikStrony {
  wynik: WynikGrafiku;
  lang: Lang;
  sala: string;
  od: string;
  do: string; // wpisane „Do” albo koniec zajęć semestru, w którym leży „Od” (kolory-dni); puste = bez końca
  meta: string; // „Semestr zimowy 2026/27 · od 19 października 2026 · sala 202”
  dane: string; // JSON dla skryptu (data-tu-dane)
  bledy: WynikGrafiku['bledy']; // tylko na Podglądzie (budowa bez TYLKO_OPUBLIKOWANE); na stronie publicznej pusto
}

export function grafikStrony(wynik: WynikGrafiku, lang: Lang): GrafikStrony {
  const T = (pl: string, en: string) => (lang === 'en' ? en : pl);
  const sala = wynik.pola.sala ?? '';
  const od = wynik.pola.od ?? '';
  const sem = od ? semestrDnia(od) : null;
  const doo = wynik.pola.do ?? sem?.koniec ?? '';
  const okres = od
    ? T(`od ${dataSlownie(od, 'pl', true)}`, `from ${dataSlownie(od, 'en', true)}`) + (wynik.pola.do ? T(` do ${dataSlownie(wynik.pola.do, 'pl', true)}`, ` to ${dataSlownie(wynik.pola.do, 'en', true)}`) : '')
    : '';
  const meta = [sem ? nazwaSemestru(sem, lang) : '', okres, sala ? T(`sala ${sala}`, `room ${sala}`) : ''].filter(Boolean).join(' · ');
  return {
    wynik, lang, sala, od, do: doo, meta,
    dane: JSON.stringify(daneDoSkryptu(wynik.dyzury, { sala, od, do: doo })),
    bledy: TYLKO_OPUBLIKOWANE ? [] : wynik.bledy,
  };
}

/** Grafik strony w danym języku: z wyniku renderowania treści; pusty blok w treści angielskiej bierze grafik z treści polskiej. */
export function wybierzGrafik(wynik: WynikGrafiku | undefined, zrodloPl: string | undefined, lang: Lang): GrafikStrony | undefined {
  if (!wynik) return undefined;
  let w = wynik;
  if (w.pusty && lang === 'en') {
    const pl = grafikZMarkdown(zrodloPl ?? '') as WynikGrafiku | undefined;
    if (pl) w = { ...pl, bledy: [...pl.bledy, ...w.bledy] };
  }
  return grafikStrony(w, lang);
}

/** Liczby banera z bloku (gdy pole „Liczby” strony jest puste): tutorzy, dyżury w tygodniu i sala (krótka, np. „202”). */
export function liczbyBaneraGrafiku(g: GrafikStrony) {
  const { tutorzy, dyzury } = liczbyGrafiku(g.wynik.dyzury);
  return [
    { n: tutorzy, pl: ['tutor', 'tutorów', 'tutorów'] as [string, string, string], en: ['tutor', 'tutors'] as [string, string] },
    { n: dyzury, pl: ['dyżur w tygodniu', 'dyżury w tygodniu', 'dyżurów w tygodniu'] as [string, string, string], en: ['session a week', 'sessions a week'] as [string, string] },
    ...(/^[\w.\-]{1,6}$/.test(g.sala) ? [{ n: g.sala, pl: 'sala tutorni', en: 'tutoring room' }] : []),
  ];
}

/** Grafik strony pod adresem (np. /studia/tutornia) — dla kafelka Szybkiego dostępu (DrugiEkran.astro); undefined, gdy strona nie ma bloku :::grafik. */
export async function grafikDlaAdresu(adres: string, lang: Lang): Promise<GrafikStrony | undefined> {
  const id = adres.replace(/^\/+|\/+$/g, '');
  const s = (await getCollection('strony')).find((e) => e.id === id && widoczny(e));
  if (!s || s.data.format_tresci !== 'jawne') return undefined;
  const w = grafikZMarkdown((lang === 'en' && s.data.tresc_en) || s.body || '') as WynikGrafiku | undefined;
  return wybierzGrafik(w, s.body, lang);
}
