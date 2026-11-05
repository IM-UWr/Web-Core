// Spis pracowników z wyszukiwarką i filtrem zakładu — kierunek „Założyciele”, szablon podstrony (Pracownicy.astro,
// blok .z-prac; style w widoku). Komponent renderuje się już na serwerze, więc bez JavaScriptu pokazuje pełną, pogrupowaną
// listę (pasek filtrów jest wtedy schowany, bo bez skryptu nie działa).
// Jedna wersja HTML na każdą szerokość: pasek — pole szukania i lista zakładów (filtry można łączyć; bez wyboru grupy —
// zlecenie 11, zalecenie 4: grupy są sekcjami i są w spisie „Na tej stronie”); pod nim
// licznik („Liczba osób: N”, po przefiltrowaniu „Znaleziono N osób”, aria-live). Grupy to sekcje z nagłówkiem h2 (id
// „zp-<grupa>” — do nich prowadzi spis „Na tej stronie”; po filtrowaniu spis dostaje zdarzenie `z-spis` i chowa puste).
// Każda osoba to wiersz listy: gdy ma stronę domową, link na imieniu i nazwisku obejmuje cały wiersz (e-mail i zakład
// to osobne linki nad nim). Kolumna „Telefon” pojawia się tylko w sekcjach, w których ktoś ma numer (w praktyce:
// administracja). Doktoranci są podzieleni według roku studiów (Rok 1, Rok 2, …; bez roku — na końcu).
// Komputer: wiersz w kolumnach z nagłówkiem nad listą (jak tabela wzorca treści); telefon (≤ 760 px): wiersz w jednej kolumnie.
import { zTytulem } from '../lib/osoby';
import { isExternal } from '../lib/url';
import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface Osoba {
  id: string;
  imie_nazwisko: string;
  stopien?: string;
  grupa: string;
  funkcja?: string;
  zaklad?: string;
  rok_studiow?: number;
  email?: string;
  telefon?: string;
  pokoj?: string;
  strona?: string;
}

interface Props {
  osoby: Osoba[];
  // krotko: krótsza nazwa grupy (dane: src/lib/widoki/pracownicy.ts) — używa jej spis „Na tej stronie” w widoku
  grupy: { id: string; nazwa: string; krotko?: string }[];
  zaklady: { id: string; nazwa: string; href: string }[];
  napisy: Record<string, string>;
}

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');

const nazwisko = (s: string) => s.trim().split(/\s+/).pop() ?? s;
const poNazwisku = (a: Osoba, b: Osoba) =>
  nazwisko(a.imie_nazwisko).localeCompare(nazwisko(b.imie_nazwisko), 'pl') || a.imie_nazwisko.localeCompare(b.imie_nazwisko, 'pl');
const maRok = (o: Osoba) => typeof o.rok_studiow === 'number' && Number.isFinite(o.rok_studiow);
// Forma rzeczownika po liczebniku (jak odmiana() w i18n.ts — tu bez importu słowników do skryptu strony):
// 1 · 2–4 (bez 12–14) · 5 i więcej; po angielsku napisy dają dwie ostatnie formy takie same.
const forma = (n: number, f1: string, f2: string, f5: string) => {
  if (n === 1) return f1;
  const j = n % 10, d = n % 100;
  return j >= 2 && j <= 4 && (d < 12 || d > 14) ? f2 : f5;
};
// Ikony jak w Ikona.astro („szukaj”, „dol”) — ozdobne
const ikona = (sciezki: ReactNode, rozmiar = 18) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" width={rozmiar} height={rozmiar}>
    {sciezki}
  </svg>
);

interface Podsekcja { klucz: string; tytul?: string; osoby: Osoba[] }

// Doktoranci: rok 1, 2, 3, … (w roku alfabetycznie po nazwisku), osoby bez roku na końcu.
function wedlugRoku(osoby: Osoba[], napisy: Record<string, string>): Podsekcja[] {
  const lata = [...new Set(osoby.filter(maRok).map((o) => o.rok_studiow as number))].sort((a, b) => a - b);
  const wynik: Podsekcja[] = lata.map((r) => ({
    klucz: `rok-${r}`,
    tytul: `${napisy.rok} ${r}`,
    osoby: osoby.filter((o) => o.rok_studiow === r).sort(poNazwisku),
  }));
  const bezRoku = osoby.filter((o) => !maRok(o)).sort(poNazwisku);
  if (bezRoku.length) wynik.push({ klucz: 'rok-brak', tytul: napisy.rokBrak, osoby: bezRoku });
  return wynik;
}

export default function TabelaPracownikow({ osoby, grupy, zaklady, napisy }: Props) {
  const [q, setQ] = useState('');
  const [zaklad, setZaklad] = useState('');
  const nazwyZakladow = useMemo(() => Object.fromEntries(zaklady.map((z) => [z.id, z.nazwa])), [zaklady]);
  const linkiZakladow = useMemo(() => Object.fromEntries(zaklady.map((z) => [z.id, z.href])), [zaklady]);

  const widoczne = useMemo(() => {
    const nq = norm(q.trim());
    return osoby.filter(
      (o) =>
        (!zaklad || o.zaklad === zaklad) &&
        (!nq || norm([o.imie_nazwisko, o.stopien, o.funkcja, o.zaklad && nazwyZakladow[o.zaklad], o.email, o.pokoj].filter(Boolean).join(' ')).includes(nq))
    );
  }, [osoby, q, zaklad, nazwyZakladow]);

  // spis „Na tej stronie” (zal/SpisStrony.astro) chowa grupy, których po filtrowaniu nie ma na stronie
  useEffect(() => {
    document.dispatchEvent(new Event('z-spis'));
  }, [q, zaklad]);

  const sekcje = grupy
    .map((g) => {
      const os = widoczne.filter((o) => o.grupa === g.id);
      const podsekcje: Podsekcja[] = g.id === 'doktorant' ? wedlugRoku(os, napisy) : [{ klucz: 'wszyscy', osoby: os }];
      return { ...g, osoby: os, podsekcje, maTel: os.some((o) => !!o.telefon) };
    })
    .filter((g) => g.osoby.length > 0);

  const wiersz = (o: Osoba, maTel: boolean) => {
    const nazwa = zTytulem(o.stopien, o.imie_nazwisko);
    const linkZakladu = o.zaklad ? linkiZakladow[o.zaklad] : undefined;
    return (
      <li key={o.id} className={o.strona ? 'zp-w zp-klik' : 'zp-w'}>
        <div className="zp-n">
          {o.strona ? (isExternal(o.strona)
            ? <a className="zp-imie zew" href={o.strona}>{nazwa}<span className="sr-only">{napisy.zewn}</span></a>
            : <a className="zp-imie" href={o.strona}>{nazwa}</a>) : <span className="zp-imie">{nazwa}</span>}
          {(o.funkcja || linkZakladu) && (
            <small>
              {o.funkcja}
              {/* „·” z niełamliwymi spacjami: nigdy na początku linii (decyzja 31.10.2026) */}
              {o.funkcja && linkZakladu && ' · '}
              {linkZakladu && <a href={linkZakladu}>{nazwyZakladow[o.zaklad as string]}</a>}
            </small>
          )}
        </div>
        <div className="zp-c zp-mail">
          {o.email && (
            <>
              <span className="zp-lbl">{napisy.email}: </span>
              <a href={`mailto:${o.email}`}>{o.email}</a>
            </>
          )}
        </div>
        {maTel && (
          <div className="zp-c zp-tel">
            {o.telefon && (
              <>
                <span className="zp-lbl">{napisy.telefon}: </span>
                <a href={`tel:+48${o.telefon.replace(/\s/g, '')}`}>{o.telefon}</a>
              </>
            )}
          </div>
        )}
        <div className="zp-c zp-pok">
          {o.pokoj && (
            <>
              <span className="zp-lbl">{napisy.pokoj}: </span>
              {o.pokoj}
            </>
          )}
        </div>
        <div className="zp-c zp-www" aria-hidden="true">
          {o.strona && (
            <span className={isExternal(o.strona) ? 'zp-www-l zew' : 'zp-www-l'}>{napisy.link}</span>
          )}
        </div>
      </li>
    );
  };

  const przefiltrowane = !!(q.trim() || zaklad);
  const n = widoczne.length;
  const licznik = !przefiltrowane
    ? `${napisy.osob}: ${n}`
    : n === 0 ? napisy.brak : `${napisy.znaleziono} ${n} ${forma(n, napisy.osoba1, napisy.osoba2, napisy.osoba5)}`;
  const strzalka = ikona(<path d="M6 9l6 6 6-6" />, 16);

  return (
    <div className="zp-spis-osob">
      <div className="zp-narz" data-pagefind-ignore>
        <label className="zp-szukaj">
          {ikona(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></>)}
          <span className="sr-only">{napisy.szukaj}</span>
          <input type="search" value={q} placeholder={napisy.szukaj} autoComplete="off" onChange={(e) => setQ(e.target.value)} />
        </label>
        {/* bez wyboru grupy (zlecenie 11, zalecenie 4): grupy są sekcjami listy, prowadzi do nich spis „Na tej stronie” */}
        {zaklady.length > 0 && (
          <label className="zp-wybor">
            <span className="sr-only">{napisy.zaklad}</span>
            <select value={zaklad} autoComplete="off" onChange={(e) => setZaklad(e.target.value)}>
              <option value="">{napisy.wszystkieZaklady}</option>
              {zaklady.map((z) => (
                <option key={z.id} value={z.id}>{z.nazwa}</option>
              ))}
            </select>
            {strzalka}
          </label>
        )}
      </div>
      {/* licznik zawsze w drzewie — region aria-live musi istnieć przed zmianą */}
      <p className="zp-ile" aria-live="polite" data-pagefind-ignore>{licznik}</p>

      {sekcje.map((g) => (
        <section key={g.id} id={`zp-${g.id}`} className={g.maTel ? 'zp-sek zp-z-tel' : 'zp-sek'} aria-labelledby={`zp-h-${g.id}`}>
          <h2 id={`zp-h-${g.id}`}>{g.nazwa}</h2>
          {g.podsekcje.map((p) => (
            <Fragment key={p.klucz}>
              {p.tytul && <h3 className="zp-rok">{p.tytul}</h3>}
              {/* nagłówek kolumn (komputer) nad każdą listą — jak nagłówek tabeli we wzorcu treści */}
              <div className="zp-nagl" aria-hidden="true">
                <span>{napisy.imie}</span>
                <span>{napisy.email}</span>
                {g.maTel && <span>{napisy.telefon}</span>}
                <span>{napisy.pokoj}</span>
                <span>{napisy.strona}</span>
              </div>
              <ul className="zp-lista" role="list">
                {p.osoby.map((o) => wiersz(o, g.maTel))}
              </ul>
            </Fragment>
          ))}
        </section>
      ))}
    </div>
  );
}
