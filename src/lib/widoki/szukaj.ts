// Dane wyszukiwarki: hasło banera, adres paczki Pagefind i teksty interfejsu Pagefind UI.
import { u } from '../url';
import type { Lang } from '../daty';
import ustawienia from '../../data/ustawienia.json';

export async function daneWyszukiwarki(lang: Lang) {
  // po angielsku tylko pole _en (bez polskich resztek)
  const haslo = ((lang === 'en' ? (ustawienia as any).szukaj_haslo_en : (ustawienia as any).szukaj_haslo) as string | undefined) || undefined;
  const bundle = u('/pagefind/');
  const teksty = lang === 'en'
    ? { placeholder: 'Search the website', zero_results: 'No results for [SEARCH_TERM]', load_more: 'More results', clear_search: 'Clear' }
    : { placeholder: 'Szukaj na stronie', zero_results: 'Brak wyników dla [SEARCH_TERM]', load_more: 'Więcej wyników', clear_search: 'Wyczyść', many_results: '[COUNT] wyników dla [SEARCH_TERM]', one_result: '1 wynik dla [SEARCH_TERM]' };

  return { haslo, bundle, teksty };
}
