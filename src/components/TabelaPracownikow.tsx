// Spis pracowników z wyszukiwarką i filtrami (grupa, zakład). Komponent renderuje się już na serwerze,
// więc bez JavaScriptu pokazuje pełną, pogrupowaną listę (filtry działają po wczytaniu skryptu).
// Każda osoba to jedno „pole” (wiersz siatki): gdy ma stronę domową, link na imieniu i nazwisku
// obejmuje całe pole (klasy .os-link / .os-a w global.css), a e-mail i zakład są osobnymi linkami.
// Kolumna „Telefon” pojawia się tylko w sekcjach, w których ktoś ma numer (w praktyce: administracja).
// Doktoranci są podzieleni według roku studiów (Rok 1, Rok 2, …; bez roku — na końcu).
// Filtry: na komputerze pole szukania, lista zakładów i przyciski grup (.staff-tools); na telefonie (≤ 760 px; zlecenie 01,
// decyzja 31.10.2026) jeden wiersz jak w Aktualnościach (klasy .filters-lewo / .fl-rodzaj / .fl-szukaj z telefon.css):
// lista „Wszyscy ▾” z grupami „Kto” i „Zakład” (wybór działa jak przycisk grupy albo lista zakładów — jedno albo drugie)
// i pole „Szukaj”. Stan wspólny dla obu układów. Na telefonie zamiast „Liczba osób: N” — po przefiltrowaniu
// „Znaleziono N osób” (aria-live).
import { zTytulem } from '../lib/osoby';
import { Fragment, useMemo, useState, type ReactNode } from 'react';

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
  // krotko: nazwa w liście rozwijanej na telefonie (bez niej — nazwa)
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
// Ikony jak w Ikona.astro („szukaj”, „dol”)
const ikona = (sciezki: ReactNode) => (
  <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 18, height: 18 }}>
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
  const [grupa, setGrupa] = useState('');
  const [zaklad, setZaklad] = useState('');
  const nazwyZakladow = useMemo(() => Object.fromEntries(zaklady.map((z) => [z.id, z.nazwa])), [zaklady]);
  const linkiZakladow = useMemo(() => Object.fromEntries(zaklady.map((z) => [z.id, z.href])), [zaklady]);

  const widoczne = useMemo(() => {
    const nq = norm(q.trim());
    return osoby.filter(
      (o) =>
        (!grupa || o.grupa === grupa) &&
        (!zaklad || o.zaklad === zaklad) &&
        (!nq || norm([o.imie_nazwisko, o.stopien, o.funkcja, o.zaklad && nazwyZakladow[o.zaklad], o.email, o.pokoj].filter(Boolean).join(' ')).includes(nq))
    );
  }, [osoby, q, grupa, zaklad, nazwyZakladow]);

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
      <li key={o.id} className={o.strona ? 'staff-row os-link' : 'staff-row'}>
        <div className="c n">
          {o.strona ? <a className="os-a" href={o.strona}>{nazwa}</a> : <span>{nazwa}</span>}
          {(o.funkcja || linkZakladu) && (
            <small>
              {o.funkcja}
              {/* „·” z niełamliwymi spacjami: nigdy na początku linii (decyzja 31.10.2026) */}
              {o.funkcja && linkZakladu && '\u00a0·\u00a0'}
              {linkZakladu && <a href={linkZakladu}>{nazwyZakladow[o.zaklad as string]}</a>}
            </small>
          )}
        </div>
        <div className="c">
          {o.email && (
            <>
              <span className="lbl">{napisy.email}: </span>
              <a href={`mailto:${o.email}`}>{o.email}</a>
            </>
          )}
        </div>
        {maTel && (
          <div className="c">
            {o.telefon && (
              <>
                <span className="lbl">{napisy.telefon}: </span>
                <a href={`tel:+48${o.telefon.replace(/\s/g, '')}`}>{o.telefon}</a>
              </>
            )}
          </div>
        )}
        <div className="c">
          {o.pokoj && (
            <>
              <span className="lbl">{napisy.pokoj}: </span>
              {o.pokoj}
            </>
          )}
        </div>
        <div className="c www" aria-hidden="true">
          {o.strona && (
            <>
              {napisy.link}
              <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                <path d="M14 4h6v6M20 4l-9 9" />
                <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </svg>
            </>
          )}
        </div>
      </li>
    );
  };

  // Telefon: jedna lista zamiast przycisków grup i listy zakładów — wartość „g:<grupa>” albo „z:<zakład>”;
  // wybór jednego zeruje drugie (na komputerze oba filtry można łączyć — lista pokazuje wtedy zakład).
  const wybor = zaklad ? `z:${zaklad}` : grupa ? `g:${grupa}` : '';
  const wybierz = (v: string) => {
    setGrupa(v.startsWith('g:') ? v.slice(2) : '');
    setZaklad(v.startsWith('z:') ? v.slice(2) : '');
  };
  const przefiltrowane = !!(q.trim() || grupa || zaklad);
  const n = widoczne.length;
  const znaleziono = !przefiltrowane ? '' : n === 0 ? napisy.brak : `${napisy.znaleziono} ${n} ${forma(n, napisy.osoba1, napisy.osoba2, napisy.osoba5)}`;

  return (
    <div>
      {/* telefon (≤ 760 px): jeden wiersz filtrów — lista „Wszyscy ▾” i pole „Szukaj” (style: telefon.css, „Wiersz filtrów list”) */}
      <div className="filters filters-lewo tylko-telefon" data-pagefind-ignore>
        <label className="fl-rodzaj">
          <span className="sr-only">{napisy.filtr}</span>
          <select value={wybor} autoComplete="off" onChange={(e) => wybierz(e.target.value)}>
            <option value="">{napisy.wszyscy}</option>
            <optgroup label={napisy.kto}>
              {grupy.map((g) => (
                <option key={g.id} value={`g:${g.id}`}>{g.krotko || g.nazwa}</option>
              ))}
            </optgroup>
            {zaklady.length > 0 && (
              <optgroup label={napisy.zaklad}>
                {zaklady.map((z) => (
                  <option key={z.id} value={`z:${z.id}`}>{z.nazwa}</option>
                ))}
              </optgroup>
            )}
          </select>
          {ikona(<path d="M6 9l6 6 6-6" />)}
        </label>
        <div className="fl-szukaj" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <label className="search">
            {ikona(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></>)}
            <span className="sr-only">{napisy.szukaj}</span>
            <input type="search" value={q} placeholder={napisy.szukajKrotko} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
      </div>
      {/* telefon: licznik tylko po przefiltrowaniu (zawsze w drzewie — region aria-live musi istnieć przed zmianą) */}
      <p className="staff-znaleziono tylko-telefon" aria-live="polite">{znaleziono}</p>

      <div className="staff-tools tylko-komputer">
        <label className="search">
          <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ width: 18, height: 18 }}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.6-3.6" />
          </svg>
          <span className="sr-only">{napisy.szukaj}</span>
          <input type="search" value={q} placeholder={napisy.szukaj} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label className="search" style={{ minWidth: 0 }}>
          <span className="sr-only">{napisy.zaklad}</span>
          <select value={zaklad} onChange={(e) => setZaklad(e.target.value)} style={{ border: 0, background: 'transparent', font: 'inherit', fontSize: 15, color: 'var(--ink)', outline: 'none', maxWidth: 260 }}>
            <option value="">{napisy.wszystkieZaklady}</option>
            {zaklady.map((z) => (
              <option key={z.id} value={z.id}>{z.nazwa}</option>
            ))}
          </select>
        </label>
        <div className="chips" role="group" aria-label={napisy.grupa}>
          <button type="button" className="chip" aria-pressed={grupa === ''} onClick={() => setGrupa('')}>
            {napisy.wszyscy}
          </button>
          {grupy.map((g) => (
            <button key={g.id} type="button" className="chip" aria-pressed={grupa === g.id} onClick={() => setGrupa(g.id)}>
              {g.nazwa}
            </button>
          ))}
        </div>
      </div>

      <p className="count staff-count tylko-komputer" aria-live="polite">
        {napisy.osob}: {widoczne.length}
      </p>

      {sekcje.map((g) => (
        <section key={g.id} className={g.maTel ? 'staff-dir z-tel' : 'staff-dir'}>
          <h2 className="staff-h">{g.nazwa}</h2>
          <div className="staff-head" aria-hidden="true">
            <span>{napisy.imie}</span>
            <span>{napisy.email}</span>
            {g.maTel && <span>{napisy.telefon}</span>}
            <span>{napisy.pokoj}</span>
            <span>{napisy.strona}</span>
          </div>
          {g.podsekcje.map((p) => (
            <Fragment key={p.klucz}>
              {p.tytul && (
                <h3 className="subhead staff-sub">
                  {p.tytul}
                </h3>
              )}
              <ul className="staff-list" role="list">
                {p.osoby.map((o) => wiersz(o, g.maTel))}
              </ul>
            </Fragment>
          ))}
        </section>
      ))}
      {/* telefon: ten napis jest w liczniku „Znaleziono…” nad listą */}
      {widoczne.length === 0 && <p className="tylko-komputer" style={{ color: 'var(--muted)' }}>{napisy.brak}</p>}
    </div>
  );
}
