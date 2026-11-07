// Kafelek „Dziś: dzień …” w pasku „Szybki dostęp” (DrugiEkran.astro): kolor dnia liczony w przeglądarce, żeby strona
// zbudowana wcześniej pokazywała dzisiejszy dzień (dane: src/data/kolory-dni.json, logika: src/lib/kolory-dni.ts).
// Elementy: [data-kd-kafelek] z [data-kd-litera], [data-kd-tytul], [data-kd-opis].
import { tekstDnia } from '../../lib/kolory-dni';
import { today } from '../../lib/daty';

const lang = document.documentElement.lang === 'en' ? 'en' : 'pl';
const t = tekstDnia(today(), lang);
document.querySelectorAll<HTMLElement>('[data-kd-kafelek]').forEach((el) => {
  const brak = !t.kolor && !t.nastepny;
  el.dataset.kolor = t.kolor ?? 'brak';
  el.dataset.zamiana = t.zamiana ? String(t.zamiana) : '';
  el.dataset.nastepny = t.nastepnyKolor ?? '';
  const ust = (sel: string, txt: string, ukryj = true) => {
    const x = el.querySelector<HTMLElement>(sel);
    if (x) { x.textContent = txt; if (ukryj) x.hidden = !txt; }
  };
  ust('[data-kd-litera]', t.litera, false);
  ust('[data-kd-tytul]', brak ? el.dataset.etykieta || t.tytul : t.tytul);
  ust('[data-kd-opis]', t.opis);
});
