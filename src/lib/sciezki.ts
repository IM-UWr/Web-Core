// Listy adresów do wygenerowania (getStaticPaths) — wspólne dla wersji PL i EN.
import { getCollection } from 'astro:content';
import { aktualnosci, obrony, seminaria, konferencje, granty, zaklady, slugOf, widoczny, maTresc } from './tresci';
import { specjalnosci } from './specjalnosci';
import { jestTekstemListy } from './tekstyStron';
import { powstaje } from './szkice';

// Strony tylko widocznych wpisów (zlecenie 33: przy TYLKO_OPUBLIKOWANE=1 szkic nie ma strony); nowszy i starszy z tej samej listy.
export async function sciezkiAktualnosci() {
  const lista = await aktualnosci();
  return lista.map((wpis, i) => ({
    params: { slug: slugOf(wpis.id) },
    props: { wpis, nowszy: i > 0 ? lista[i - 1] : undefined, starszy: i < lista.length - 1 ? lista[i + 1] : undefined },
  }));
}

// bez tekstów stron z listą (np. strony/nauka/konferencje.md): wyświetla je sama lista (src/lib/tekstyStron.ts, zlecenie 30)
export async function sciezkiStron() {
  const strony = [];
  for (const s of await getCollection('strony')) if (widoczny(s) && !jestTekstemListy(s.id) && (await powstaje(`/${s.id}`))) strony.push(s);
  return strony.map((strona) => ({ params: { slug: strona.id }, props: { strona } }));
}

export async function sciezkiSeminariow() {
  const sem = await seminaria();
  return sem.map((s) => ({ params: { slug: s.id }, props: { seminarium: s } }));
}

export async function sciezkiObron() {
  const ob = await obrony();
  return ob.map((o) => ({ params: { slug: slugOf(o.id) }, props: { obrona: o } }));
}

// Strona tylko dla konferencji z opisem (zlecenie 40, decyzja 18.11; adresKonferencji w tresci.ts).
export async function sciezkiKonferencji() {
  const k = (await konferencje()).filter((x) => maTresc(x.body));
  return k.map((konferencja) => ({ params: { slug: slugOf(konferencja.id) }, props: { konferencja } }));
}

// Strona dla każdego projektu — także bez opisu (wtedy same metadane z karty projektu).
export async function sciezkiGrantow() {
  const g = await granty();
  return g.map((grant) => ({ params: { slug: slugOf(grant.id) }, props: { grant } }));
}

export async function sciezkiZakladow() {
  const z = await zaklady();
  return z.map((zaklad) => ({ params: { slug: zaklad.id }, props: { zaklad } }));
}

export async function sciezkiKierunkow() {
  const k = (await getCollection('kierunki')).filter(widoczny);
  return k.map((kierunek) => ({ params: { kierunek: kierunek.id }, props: { kierunek } }));
}

// specjalność z polami banera (src/lib/specjalnosci.ts): kierunek i „bez podstrony” są w formularzu „Baner i kafelek”
export async function sciezkiSpecjalnosci() {
  const s = [];
  for (const x of await specjalnosci()) if (widoczny(x) && !x.data.bez_podstrony && (await powstaje(`/studia/${x.data.kierunek}/${x.id}`))) s.push(x);
  return s.map((specjalnosc) => ({ params: { kierunek: specjalnosc.data.kierunek, specjalnosc: specjalnosc.id }, props: { specjalnosc } }));
}
