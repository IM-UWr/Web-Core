// Grafik dyżurów na żywo (zlecenie 45: Tutornia): ramka „Teraz”, stan siatki planu i podpis kafelka w Szybkim dostępie.
// Czas: Europe/Warsaw, odświeżanie co minutę (i po powrocie na kartę). Dni zajęć, wolne i zamiany: src/lib/kolory-dni.ts,
// logika stanów: src/lib/grafik.mjs (ta sama dla ramki i kafelka). Układ się nie zmienia: skrypt tylko przełącza klasy
// i dopisuje linię „teraz” oraz znacznik trwającego dyżuru.
// Elementy: [data-tu-grafik] (plan, dane w data-tu-dane), [data-tu-teraz] (ramka), a[data-tu-kafelek] (kafelek, własne dane).
import { infoDnia } from '../lib/kolory-dni';
import { stanGrafiku, minal, zDanych, hm } from '../lib/grafik.mjs';

type Now = { data: string; min: number };
type Stan = ReturnType<typeof stanGrafiku>;

function teraz(): Now {
  const c: Record<string, string> = {};
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date()).forEach((p) => { c[p.type] = p.value; });
  return { data: `${c.year}-${c.month}-${c.day}`, min: Number(c.hour) * 60 + Number(c.minute) };
}
const info = (s: string) => infoDnia(s);
const langEl = (el: HTMLElement) => ((el.closest('[data-lang]') as HTMLElement | null)?.dataset.lang ?? document.documentElement.lang) === 'en' ? 'en' : 'pl';

function dane(el: HTMLElement) {
  try { return zDanych(JSON.parse(el.dataset.tuDane || '{}')); } catch { return zDanych({}); }
}
function stanDla(el: HTMLElement, now: Now) {
  const g = dane(el);
  const kal = { sala: g.sala, od: g.od, do: g.do, info };
  return { g, st: stanGrafiku(g.dyzury, kal, now, langEl(el)) as Stan };
}
const ustaw = (el: Element | null, txt: string) => { if (el && el.textContent !== txt) el.textContent = txt; };

function ramka(el: HTMLElement, st: Stan) {
  el.dataset.stan = st.typ;
  const k = el.querySelector<HTMLElement>('[data-tu-kolko]');
  if (k) { ustaw(k, st.kolko); k.classList.toggle('tu-kolko-pelne', st.pelne); }
  const e = el.querySelector<HTMLElement>('[data-tu-etyk]');
  if (e) { ustaw(e, st.etykieta); e.hidden = false; }
  ustaw(el.querySelector('[data-tu-tytul]'), st.tytul);
  const o = el.querySelector<HTMLElement>('[data-tu-opis]');
  if (o) { ustaw(o, st.opis); o.hidden = !st.opis; }
}

function plan(box: HTMLElement, st: Stan, now: Now, en: boolean) {
  const s = box.querySelector<HTMLElement>('.tu-siatka');
  if (!s) return;
  const p = Number(s.dataset.p), k = Number(s.dataset.k), dzis = st.dzisPlan;
  s.querySelectorAll<HTMLElement>('.tu-tlo').forEach((t) => t.classList.toggle('tu-tlo-dzis', Number(t.dataset.dz) === dzis));
  s.querySelectorAll<HTMLElement>('section.tu-dzien').forEach((sec) => {
    const jest = Number(sec.dataset.dz) === dzis;
    sec.classList.toggle('tu-dzien-dzis', jest);
    const h = sec.querySelector('h3');
    let sm = h?.querySelector('small');
    if (jest && h && !sm) { sm = document.createElement('small'); sm.textContent = en ? 'today' : 'dziś'; h.append(sm); }
    if (!jest && sm) sm.remove();
  });
  s.querySelectorAll<HTMLElement>('li.tu-dyz').forEach((li) => {
    const x = { dz: Number(li.dataset.dz), od: Number(li.dataset.od), do: Number(li.dataset.do) };
    const tz = x.dz === dzis && x.od <= now.min && now.min < x.do;
    li.classList.toggle('tu-teraz-dyz', tz);
    li.classList.toggle('tu-minal', minal(x, st.inf, now));
    let zn = li.querySelector('.tu-zn');
    if (tz && !zn) { zn = document.createElement('span'); zn.className = 'tu-zn'; zn.textContent = en ? 'now' : 'teraz'; li.append(zn); }
    if (!tz && zn) zn.remove();
  });
  // linia „teraz” w kolumnie dzisiejszego dnia; na osi godzina zamiast etykiety bliższej niż 12 min
  const linia = dzis >= 0 && now.min >= p && now.min <= k;
  s.querySelectorAll<HTMLElement>('.tu-czas').forEach((c) => { c.hidden = linia && Math.abs(Number(c.dataset.m) - now.min) < 12; });
  let l = s.querySelector<HTMLElement>('.tu-linia'), lc = s.querySelector<HTMLElement>('.tu-linia-czas');
  if (!linia) { l?.remove(); lc?.remove(); return; }
  if (!l) { l = document.createElement('span'); l.className = 'tu-linia'; l.setAttribute('aria-hidden', 'true'); s.append(l); }
  if (!lc) { lc = document.createElement('span'); lc.className = 'tu-linia-czas'; lc.setAttribute('aria-hidden', 'true'); s.append(lc); }
  const top = `calc(var(--tu-h) + var(--tu-r) * ${(now.min - p) / 5})`;
  l.style.gridColumn = `${dzis + 2} / ${dzis + 3}`;
  l.style.top = top;
  lc.style.top = top;
  ustaw(lc, hm(now.min));
}

function kafelek(a: HTMLElement, st: Stan) {
  ustaw(a.querySelector('[data-tu-krotko]'), st.krotko);
  a.dataset.tuKropka = st.kropka ? '1' : '';
}

function odswiez() {
  const now = teraz();
  const box = document.querySelector<HTMLElement>('[data-tu-grafik]');
  if (box) {
    const { st } = stanDla(box, now);
    plan(box, st, now, langEl(box) === 'en');
    const r = document.querySelector<HTMLElement>('[data-tu-teraz]');
    if (r) ramka(r, st);
  }
  document.querySelectorAll<HTMLElement>('a[data-tu-kafelek]').forEach((a) => kafelek(a, stanDla(a, now).st));
}

odswiez();
setTimeout(() => { odswiez(); setInterval(odswiez, 60000); }, 60000 - (Date.now() % 60000) + 50);
document.addEventListener('visibilitychange', () => { if (!document.hidden) odswiez(); });
