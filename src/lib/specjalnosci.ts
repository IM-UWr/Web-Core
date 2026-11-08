// Web-Studia: tekst, baner, kafelek i powiązania każdej specjalności w jednym Markdownie.
import { getCollection, type CollectionEntry } from 'astro:content';

export type TrescSpecjalnosci = CollectionEntry<'specjalnosci'>;
export type Specjalnosc = { id: string; tresc: TrescSpecjalnosci; data: TrescSpecjalnosci['data'] };

/** Wszystkie specjalności (także nieopublikowane) z polami banera. */
export async function specjalnosci(): Promise<Specjalnosc[]> {
  return (await getCollection('specjalnosci')).map((t) => ({ id: t.id, tresc: t, data: t.data }));
}

export async function specjalnosc(id: string): Promise<Specjalnosc | undefined> {
  return (await specjalnosci()).find((s) => s.id === id);
}
