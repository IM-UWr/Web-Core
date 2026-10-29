// Listy adresów do wygenerowania (getStaticPaths) — wspólne dla wersji PL i EN.
import { getCollection } from 'astro:content';
import { aktualnosci, obrony, seminaria, konferencje, granty, zaklady, slugOf, opublikowane } from './tresci';

export async function sciezkiAktualnosci() {
  const wszystkie = await aktualnosci(true);
  const pub = wszystkie.filter(opublikowane);
  return wszystkie.map((wpis) => {
    const i = pub.indexOf(wpis);
    return {
      params: { slug: slugOf(wpis.id) },
      props: { wpis, nowszy: i > 0 ? pub[i - 1] : undefined, starszy: i >= 0 && i < pub.length - 1 ? pub[i + 1] : undefined },
    };
  });
}

export async function sciezkiStron() {
  const strony = await getCollection('strony');
  return strony.map((strona) => ({ params: { slug: strona.id }, props: { strona } }));
}

export async function sciezkiSeminariow() {
  const sem = await seminaria(true);
  return sem.map((s) => ({ params: { slug: s.id }, props: { seminarium: s } }));
}

export async function sciezkiObron() {
  const ob = await obrony(true);
  return ob.map((o) => ({ params: { slug: slugOf(o.id) }, props: { obrona: o } }));
}

export async function sciezkiKonferencji() {
  const k = await konferencje(true);
  return k.map((konferencja) => ({ params: { slug: slugOf(konferencja.id) }, props: { konferencja } }));
}

// Strona dla każdego projektu — także bez opisu (wtedy same metadane z karty projektu).
export async function sciezkiGrantow() {
  const g = await granty(true);
  return g.map((grant) => ({ params: { slug: slugOf(grant.id) }, props: { grant } }));
}

export async function sciezkiZakladow() {
  const z = await zaklady(true);
  return z.map((zaklad) => ({ params: { slug: zaklad.id }, props: { zaklad } }));
}

export async function sciezkiKierunkow() {
  const k = await getCollection('kierunki');
  return k.map((kierunek) => ({ params: { kierunek: kierunek.id }, props: { kierunek } }));
}

export async function sciezkiSpecjalnosci() {
  const s = await getCollection('specjalnosci');
  return s.filter((x) => !x.data.bez_podstrony).map((specjalnosc) => ({ params: { kierunek: specjalnosc.data.kierunek, specjalnosc: specjalnosc.id }, props: { specjalnosc } }));
}
