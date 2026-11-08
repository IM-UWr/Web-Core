// Specjalności: nowy format łączy Markdown, relacje i zagnieżdżony baner w jednym wpisie.
// Stare pliki specjalnosci_baner są obsługiwane wyłącznie jako format zgodności.
// Kafelki nowych kierunków należą do Markdownu kierunku.
import { getCollection, type CollectionEntry } from 'astro:content';

export type TrescSpecjalnosci = CollectionEntry<'specjalnosci'>;
export type BanerSpecjalnosci = CollectionEntry<'specjalnosci_baner'>['data'];
// data — pola treści i banera razem (nazwa, nazwa_en, tresc_en, opublikowany + pola banera)
export type Specjalnosc = { id: string; tresc: TrescSpecjalnosci; data: TrescSpecjalnosci['data'] & BanerSpecjalnosci };

const DOMYSLNY: BanerSpecjalnosci = {
  kierunek: 'matematyka', kolejnosc: 99, na_stronie_kierunku: true, bez_podstrony: false, wygaszana: false,
  opiekunowie: [], seminaria: [], zrodla: [], do_uzupelnienia: [],
};

/** Wszystkie specjalności (także nieopublikowane) z polami banera. */
export async function specjalnosci(): Promise<Specjalnosc[]> {
  const items = await getCollection('specjalnosci');
  const legacy = items.some((t) => t.data.format_tresci !== 'jawne');
  const banery = new Map((legacy ? await getCollection('specjalnosci_baner') : []).map((b) => [b.id, b.data]));
  return items.map((t) => ({ id: t.id, tresc: t, data: {
    ...DOMYSLNY, ...t.data,
    // W dawnym formacie relacje i baner mieszkały w JSON-ie. Domyślne pola
    // nowego schematu treści nie mogą ich przesłonić pustymi wartościami.
    ...(t.data.format_tresci === 'jawne' ? {} : banery.get(t.id)),
    ...t.data.baner,
  } }));
}

export async function specjalnosc(id: string): Promise<Specjalnosc | undefined> {
  return (await specjalnosci()).find((s) => s.id === id);
}
