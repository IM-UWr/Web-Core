// Specjalności (zlecenie 29): treść (kolekcja specjalnosci: nazwa i jeden Markdown PL/EN) i „Baner i kafelek” (kolekcja
// specjalnosci_baner, ten sam id: kierunek, poziom, zdanie pod nazwą, hasło, skrót, zakład, opiekunowie, seminaria, kafelek
// na stronie kierunku, kolejność…). Jedno miejsce, z którego czytają strona specjalności, kafelki na stronie kierunku,
// strona „Studia”, ścieżki stron i mapa strony. Specjalność bez pliku banera dostaje wartości domyślne (jak puste pola).
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
  const banery = new Map((await getCollection('specjalnosci_baner')).map((b) => [b.id, b.data]));
  return (await getCollection('specjalnosci')).map((t) => ({ id: t.id, tresc: t, data: { ...DOMYSLNY, ...(banery.get(t.id) ?? {}), ...t.data } }));
}

export async function specjalnosc(id: string): Promise<Specjalnosc | undefined> {
  return (await specjalnosci()).find((s) => s.id === id);
}
