// Zlecenie 33, część B: plakietka stanu budowy Podglądu (tylko PODGLAD=1; plik serwuje src/pages/podglad/[plik].ts).
// Dane: API GitHuba bez logowania (przebiegi workflow podglad.yml w Web-Podglad). Bez logowania limit to ok. 60 zapytań na godzinę
// na adres IP, a odpowiedź 304 też się do niego liczy (sprawdzone 18.11) — dlatego:
// - jeden wynik dla wszystkich kart przeglądarki (localStorage): karta pyta tylko, gdy wynik innej karty jest starszy niż odstęp;
// - przy wejściu na stronę pytanie tylko, gdy wynik jest starszy niż 30 s; potem co 120 s, w trakcie budowy co 20 s; karta w tle nie pyta;
// - ETag obsługuje przeglądarka (cache: 'no-cache' → zapytanie warunkowe bez własnych nagłówków, więc bez zapytania wstępnego CORS);
// - 403/429 albo wyczerpany limit: „Stan budowy chwilowo niedostępny”, kolejne pytanie po 10 min.
// Tryb testowy (tylko localhost, budowa lokalna): ?stan=ok | w-toku | kolejka | nowa | blad | limit — odpowiedzi z pliku.
(function () {
  'use strict';
  var el = document.getElementById('stan-budowy');
  if (!el || el.dataset.gotowe) return;
  el.dataset.gotowe = '1';
  var D = el.dataset;
  var EN = D.lang === 'en';
  var REPO = D.repo || 'IM-UWr/Web-Podglad';
  var MOJ = D.run ? Number(D.run) : 0;
  var START = D.start ? Date.parse(D.start) : 0;
  var API = 'https://api.github.com/repos/' + REPO;
  var LISTA = API + '/actions/workflows/podglad.yml/runs?per_page=10';
  var AKCJE = 'https://github.com/' + REPO + '/actions/workflows/podglad.yml';
  var K_STAN = 'im-stan-budowy';
  var K_ROG = 'im-plakietka-rog';
  var SWIEZE = 30e3, ZWYKLE = 120e3, W_BUDOWIE = 20e3, PRZERWA = 600e3;
  var szukaj = new URLSearchParams(location.search);
  var TEST = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && !MOJ ? szukaj.get('stan') : null;
  var BEZ_RUCHU = window.matchMedia('(prefers-reduced-motion: reduce)');
  var KOMPUTER = window.matchMedia('(min-width: 1024px) and (min-height: 501px), (min-width: 1024px) and (pointer: fine)');

  var T = EN ? {
    aktualna: 'Up to date', zbudowana: 'built', lokalnie: 'Local preview', budowa: 'Rebuilding…', kolejka: 'Queued for rebuild…',
    za: function (m) { return m < 1 ? 'changes will be visible in a moment' : 'changes will be visible in about ' + m + ' min'; },
    nowa: 'New version of the site ready', odswiez: 'Refresh', niedostepny: 'Build status temporarily unavailable',
    blad: 'The site failed to build, showing the version from ', bladKrotko: 'Build failed', popraw: 'Fix in the CMS', szczegoly: 'Details',
    zwin: 'Collapse', rozwin: 'Show build error', ostatnie: 'Recent builds', wszystkie: 'All builds on GitHub Actions',
    przenies: 'Move to another corner', uchwyt: 'Build status. Click for details, drag to move to another corner.',
    udana: 'succeeded', nieudana: 'failed', wToku: 'in progress', wKolejce: 'queued', brak: 'No data about builds yet.',
    wpis: 'Entry', pole: 'field', pozycja: 'item', zamknij: 'Close'
  } : {
    aktualna: 'Aktualna', zbudowana: 'zbudowana', lokalnie: 'Podgląd lokalny', budowa: 'Przebudowa…', kolejka: 'W kolejce do przebudowy…',
    za: function (m) { return m < 1 ? 'zmiany będą widoczne za chwilę' : 'zmiany będą widoczne za ok. ' + m + ' min'; },
    nowa: 'Nowa wersja strony gotowa', odswiez: 'Odśwież', niedostepny: 'Stan budowy chwilowo niedostępny',
    blad: 'Strona się nie zbudowała, pokazujemy wersję z ', bladKrotko: 'Błąd budowy', popraw: 'Popraw w CMS', szczegoly: 'Szczegóły',
    zwin: 'Zwiń', rozwin: 'Pokaż błąd budowy', ostatnie: 'Ostatnie budowy', wszystkie: 'Wszystkie budowy w GitHub Actions',
    przenies: 'Przenieś do innego rogu', uchwyt: 'Stan budowy. Kliknij, żeby zobaczyć szczegóły; przeciągnij, żeby przenieść do innego rogu.',
    udana: 'udana', nieudana: 'nieudana', wToku: 'w toku', wKolejce: 'w kolejce', brak: 'Brak danych o budowach.',
    wpis: 'Wpis', pole: 'pole', pozycja: 'pozycja', zamknij: 'Zamknij'
  };

  // ---------- pamięć (zawsze w try/catch) ----------
  function czytaj(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function zapisz(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* bez pamięci */ } }

  // ---------- czas ----------
  var czesci = new Intl.DateTimeFormat(EN ? 'en-GB' : 'pl-PL', { timeZone: 'Europe/Warsaw', day: EN ? 'numeric' : '2-digit', month: EN ? 'short' : '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function data(ms) {
    var p = {};
    czesci.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return EN ? p.day + ' ' + p.month + ', ' + p.hour + ':' + p.minute : p.day + '.' + p.month + ', ' + p.hour + ':' + p.minute;
  }
  var ms = function (s) { return s ? Date.parse(s) : 0; };

  // ---------- elementy ----------
  function E(tag, klasa, tekst) { var x = document.createElement(tag); if (klasa) x.className = klasa; if (tekst != null) x.textContent = tekst; return x; }
  var szkic = el.querySelector('.sb-szkic');
  var plakietka = el.querySelector('.sb-plakietka');
  var kropka = plakietka.querySelector('.sb-kropka');
  var tekst = plakietka.querySelector('.sb-tekst');
  var pasekPostepu = E('span', 'sb-postep'); pasekPostepu.hidden = true; pasekPostepu.appendChild(E('span'));
  plakietka.appendChild(pasekPostepu);
  plakietka.setAttribute('aria-label', T.uchwyt);
  var szczegoly = E('div', 'sb-szczegoly'); szczegoly.id = 'sb-szczegoly'; szczegoly.hidden = true;
  var dymek = E('div', 'sb-dymek'); dymek.hidden = true;
  var komunikat = E('p', 'sb-sr'); komunikat.setAttribute('role', 'status'); komunikat.setAttribute('aria-live', 'polite');
  // kolejność w DOM: od rogu ku środkowi ekranu (plakietka, wiersz szkicu, dymek, szczegóły; kierunek ustala CSS według rogu)
  el.insertBefore(dymek, (szkic || plakietka).nextSibling);
  el.insertBefore(szczegoly, dymek.nextSibling);
  el.appendChild(komunikat);
  var bladPasek = null, bladZwiniety = false;

  // ---------- róg (B3) ----------
  var ROGI_K = ['ld', 'lg', 'pg', 'pd'], ROGI_T = ['ld', 'pd'];
  function dozwolony(r) { var lista = KOMPUTER.matches ? ROGI_K : ROGI_T; if (lista.indexOf(r) >= 0) return r; return r && r[0] === 'p' ? 'pd' : 'ld'; }
  var wybrany = czytaj(K_ROG);
  function ustawRog(r, animuj) {
    var nowy = dozwolony(r);
    var przed = animuj && !BEZ_RUCHU.matches ? el.getBoundingClientRect() : null;
    el.dataset.rog = nowy;
    if (przed) {
      var po = el.getBoundingClientRect();
      el.style.transition = 'none';
      el.style.transform = 'translate(' + (przed.left - po.left) + 'px,' + (przed.top - po.top) + 'px)';
      el.getBoundingClientRect();
      el.style.transition = '';
      el.style.transform = '';
    } else {
      el.style.transform = '';
    }
  }
  ustawRog(wybrany, false);
  KOMPUTER.addEventListener('change', function () { ustawRog(wybrany, false); });

  var ruch = null, poPrzeciagnieciu = false;
  plakietka.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    poPrzeciagnieciu = false;
    ruch = { x: e.clientX, y: e.clientY, id: e.pointerId, ciagnie: false };
    // przechwycenie od razu: szybki ruch wychodzi poza małą plakietkę już w pierwszym kroku
    try { plakietka.setPointerCapture(e.pointerId); } catch (x) { /* bez przechwycenia */ }
  });
  plakietka.addEventListener('pointermove', function (e) {
    if (!ruch || e.pointerId !== ruch.id) return;
    var dx = e.clientX - ruch.x, dy = e.clientY - ruch.y;
    if (!ruch.ciagnie && Math.abs(dx) + Math.abs(dy) < 6) return;
    if (!ruch.ciagnie) { ruch.ciagnie = true; el.classList.add('sb-ciagniete'); }
    el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  });
  function koniec(e) {
    if (!ruch || e.pointerId !== ruch.id) return;
    var r = ruch; ruch = null;
    if (!r.ciagnie) return;
    el.classList.remove('sb-ciagniete');
    poPrzeciagnieciu = true;
    var p = plakietka.getBoundingClientRect();
    var sx = p.left + p.width / 2, sy = p.top + p.height / 2;
    var lewy = sx < window.innerWidth / 2, gorny = sy < window.innerHeight / 2;
    wybrany = dozwolony((lewy ? 'l' : 'p') + (gorny ? 'g' : 'd'));
    zapisz(K_ROG, wybrany);
    ustawRog(wybrany, true);
  }
  plakietka.addEventListener('pointerup', koniec);
  plakietka.addEventListener('pointercancel', function (e) { if (ruch && e.pointerId === ruch.id) { ruch = null; el.classList.remove('sb-ciagniete'); el.style.transform = ''; } });

  plakietka.addEventListener('click', function (e) {
    if (poPrzeciagnieciu) { poPrzeciagnieciu = false; e.preventDefault(); return; }
    if (stanTeraz && stanTeraz.blad && bladZwiniety) { bladZwiniety = false; rysuj(); return; }
    var otworz = szczegoly.hidden;
    szczegoly.hidden = !otworz;
    plakietka.setAttribute('aria-expanded', String(otworz));
    if (otworz) rysujSzczegoly();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !szczegoly.hidden) { szczegoly.hidden = true; plakietka.setAttribute('aria-expanded', 'false'); plakietka.focus(); }
  });

  // ---------- dane ----------
  var stanTeraz = null;
  function przytnij(r) {
    return { id: r.id, status: r.status, conclusion: r.conclusion, event: r.event, run_started_at: r.run_started_at, updated_at: r.updated_at, html_url: r.html_url };
  }
  function mediana(a) { if (!a.length) return 0; a = a.slice().sort(function (x, y) { return x - y; }); var m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }
  function policz(dane) {
    if (!dane) return null;
    if (dane.niedostepny) return { niedostepny: true };
    var runs = dane.runs || [];
    var udane = runs.filter(function (r) { return r.conclusion === 'success'; });
    var aktywna = null;
    for (var i = 0; i < runs.length; i++) if (runs[i].status !== 'completed') { aktywna = runs[i]; break; }
    var ostatnia = null;
    for (var j = 0; j < runs.length; j++) {
      var r = runs[j];
      if (r.status === 'completed' && r.conclusion !== 'cancelled' && r.conclusion !== 'skipped' && r.conclusion !== 'neutral') { ostatnia = r; break; }
    }
    var moj = null;
    for (var k = 0; k < runs.length; k++) if (runs[k].id === MOJ) moj = runs[k];
    var czasy = udane.slice(0, 5).map(function (x) { return ms(x.updated_at) - ms(x.run_started_at); }).filter(function (x) { return x > 0; });
    return {
      runs: runs,
      aktywna: aktywna,
      kolejka: aktywna && aktywna.status !== 'in_progress',
      blad: ostatnia && ostatnia.conclusion !== 'success' ? ostatnia : null,
      nowa: MOJ && udane[0] && udane[0].id > MOJ ? udane[0] : null,
      zbudowana: moj && moj.conclusion === 'success' ? ms(moj.updated_at) : START || (udane[0] ? ms(udane[0].updated_at) : 0),
      mediana: mediana(czasy) || 90e3,
      bledy: dane.bledy && ostatnia && dane.bledy.id === ostatnia.id ? dane.bledy.lista : null
    };
  }

  function pobierzListe() {
    if (TEST) return fetch(document.querySelector('link[href*="stan-budowy.css"]').href.replace(/stan-budowy\.css.*$/, 'stan-budowy-test.json'))
      .then(function (o) { return o.json(); }).then(testowe);
    return fetch(LISTA, { cache: 'no-cache', headers: { Accept: 'application/vnd.github+json' } }).then(function (o) {
      var zostalo = Number(o.headers.get('x-ratelimit-remaining'));
      var reset = Number(o.headers.get('x-ratelimit-reset')) * 1000;
      if (o.status === 403 || o.status === 429) return { t: Date.now(), niedostepny: true, do: Date.now() + PRZERWA };
      if (!o.ok) throw new Error('HTTP ' + o.status);
      return o.json().then(function (j) {
        var w = { t: Date.now(), runs: (j.workflow_runs || []).map(przytnij) };
        if (!isNaN(zostalo) && zostalo < 5) w.do = Math.min(Date.now() + PRZERWA, reset > Date.now() ? reset : Date.now() + PRZERWA);
        var stary = czytaj(K_STAN);
        if (stary && stary.bledy) w.bledy = stary.bledy;
        return w;
      });
    });
  }
  // błędy z adnotacji nieudanego przebiegu (jedno zapytanie o zadania i jedno o adnotacje, raz na przebieg)
  function pobierzBledy(run) {
    if (TEST) return Promise.resolve();
    return fetch(API + '/actions/runs/' + run.id + '/jobs', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (o) { if (!o.ok) throw 0; return o.json(); })
      .then(function (j) {
        var zad = (j.jobs || []).filter(function (x) { return x.conclusion === 'failure'; })[0];
        if (!zad) return [];
        return fetch(API + '/check-runs/' + zad.id + '/annotations', { headers: { Accept: 'application/vnd.github+json' } })
          .then(function (o) { if (!o.ok) throw 0; return o.json(); })
          .then(function (a) { return a.filter(function (x) { return x.annotation_level === 'failure' && /^Błąd /.test(x.title || ''); }).map(function (x) { return { tytul: x.title, tresc: x.message }; }); });
      })
      .then(function (lista) { var c = czytaj(K_STAN) || {}; c.bledy = { id: run.id, lista: lista }; zapisz(K_STAN, c); return c; })
      .catch(function () { var c = czytaj(K_STAN) || {}; c.bledy = { id: run.id, lista: [] }; zapisz(K_STAN, c); return c; });
  }

  // ---------- tryb testowy: przebiegi z pliku, czasy względem teraz ----------
  function testowe(plik) {
    var s = plik[TEST] || plik.ok;
    var teraz = Date.now();
    var iso = function (sek) { return new Date(teraz + sek * 1000).toISOString(); };
    var runs = s.runs.map(function (r) {
      return { id: r.id, status: r.status, conclusion: r.conclusion || null, event: 'repository_dispatch', run_started_at: iso(r.start), updated_at: iso(r.koniec != null ? r.koniec : 0), html_url: AKCJE };
    });
    if (s.moj) { MOJ = s.moj; }
    return { t: teraz, runs: runs, niedostepny: !!s.niedostepny, bledy: s.bledy ? { id: runs.filter(function (r) { return r.status === 'completed' && r.conclusion !== 'cancelled'; })[0].id, lista: s.bledy } : null };
  }

  // ---------- rysowanie ----------
  // czytnik ekranu słyszy tylko zmiany stanu, nie stan przy każdym wejściu na stronę
  var ostatniKomunikat = '', pierwszyRaz = true;
  function powiedz(t) { if (t !== ostatniKomunikat) { ostatniKomunikat = t; if (!pierwszyRaz) komunikat.textContent = t; } }

  function rysuj() {
    var s = stanTeraz;
    el.classList.remove('sb-ok', 'sb-buduje', 'sb-blad', 'sb-niedostepny');
    pasekPostepu.hidden = true;
    if (!s) return;
    if (s.niedostepny) {
      el.classList.add('sb-niedostepny');
      kropka.textContent = '○';
      tekst.textContent = T.niedostepny;
      powiedz(T.niedostepny);
      rysujBlad(null);
      dymek.hidden = true;
      return;
    }
    var zbud = s.zbudowana ? T.zbudowana + ' ' + data(s.zbudowana) : '';
    if (s.aktywna) {
      el.classList.add('sb-buduje');
      var start = ms(s.aktywna.run_started_at);
      var minelo = s.kolejka ? 0 : Math.max(0, Date.now() - start);
      var zostalo = Math.max(0, s.mediana - minelo) + (s.kolejka ? 15e3 : 0);
      kropka.textContent = s.kolejka ? '◔' : '◐';
      tekst.textContent = (s.kolejka ? T.kolejka : T.budowa) + ' ' + T.za(Math.ceil(zostalo / 60e3 - 0.25));
      pasekPostepu.hidden = false;
      pasekPostepu.firstChild.style.width = (s.kolejka ? 3 : Math.min(95, Math.round(100 * minelo / s.mediana))) + '%';
      powiedz(s.kolejka ? T.kolejka : T.budowa);
    } else if (s.blad) {
      el.classList.add('sb-blad');
      kropka.textContent = '●';
      tekst.textContent = T.bladKrotko;
      powiedz(T.bladKrotko);
    } else {
      el.classList.add('sb-ok');
      kropka.textContent = '●';
      tekst.textContent = (MOJ || TEST ? T.aktualna : T.lokalnie) + (zbud ? ' · ' + zbud : '');
      powiedz(tekst.textContent);
    }
    // dymek „nowa wersja”
    if (s.nowa && !s.aktywna) {
      if (dymek.hidden) {
        dymek.textContent = '';
        dymek.appendChild(E('span', null, T.nowa + ' — '));
        var b = E('button', 'sb-przycisk', T.odswiez); b.type = 'button';
        b.addEventListener('click', function () { location.reload(); });
        dymek.appendChild(b);
        dymek.hidden = false;
        powiedz(T.nowa);
      }
    } else dymek.hidden = true;
    rysujBlad(s.blad);
    if (!szczegoly.hidden) rysujSzczegoly();
    pierwszyRaz = false;
  }

  function rysujSzczegoly() {
    var s = stanTeraz;
    szczegoly.textContent = '';
    szczegoly.appendChild(E('p', 'sb-naglowek', T.ostatnie));
    var lista = E('ul', 'sb-lista');
    var runs = s && s.runs ? s.runs.filter(function (r) { return r.conclusion !== 'cancelled' && r.conclusion !== 'skipped'; }).slice(0, 3) : [];
    if (!runs.length) lista.appendChild(E('li', null, T.brak));
    runs.forEach(function (r) {
      var li = E('li');
      var opis = r.status !== 'completed' ? (r.status === 'in_progress' ? T.wToku : T.wKolejce) : r.conclusion === 'success' ? T.udana : T.nieudana;
      var czas = r.status === 'completed' ? data(ms(r.updated_at)) : data(ms(r.run_started_at));
      li.appendChild(E('span', 'sb-znak sb-znak-' + (r.status !== 'completed' ? 'toku' : r.conclusion === 'success' ? 'ok' : 'blad'), r.status !== 'completed' ? '◐' : r.conclusion === 'success' ? '✓' : '✕'));
      var a = E('a', null, czas + ' — ' + opis); a.href = r.html_url || AKCJE; a.target = '_blank'; a.rel = 'noopener';
      if (r.id === MOJ) a.appendChild(E('span', 'sb-ta', EN ? ' (this page)' : ' (ta strona)'));
      li.appendChild(a);
      lista.appendChild(li);
    });
    szczegoly.appendChild(lista);
    var stopka = E('p', 'sb-stopka');
    var w = E('a', null, T.wszystkie); w.href = AKCJE; w.target = '_blank'; w.rel = 'noopener';
    stopka.appendChild(w);
    szczegoly.appendChild(stopka);
    var przenies = E('button', 'sb-przycisk sb-przenies', T.przenies); przenies.type = 'button';
    przenies.addEventListener('click', function () {
      var lista = KOMPUTER.matches ? ROGI_K : ROGI_T;
      wybrany = lista[(lista.indexOf(dozwolony(wybrany)) + 1) % lista.length];
      zapisz(K_ROG, wybrany);
      ustawRog(wybrany, true);
      przenies.focus();
    });
    szczegoly.appendChild(przenies);
  }

  // komunikat błędu z adnotacji: „Repo › formularz › plik › pole: komunikat › adres CMS” (skrypty/bledy_budowy.py)
  var TYPY = EN ? null : { string: 'tekst', number: 'liczba', boolean: 'tak/nie', date: 'data', array: 'lista', object: 'grupa pól', undefined: 'brak wartości', null: 'pusta wartość', nan: 'nie-liczba' };
  function poPolsku(m) {
    if (EN) return m;
    var r;
    if (/^Required$/i.test(m)) return 'brak wymaganego pola';
    if (/^Invalid date$/i.test(m)) return 'niepoprawna data';
    if (/^Invalid url$/i.test(m)) return 'niepoprawny adres internetowy';
    if (/^Invalid email$/i.test(m)) return 'niepoprawny adres e-mail';
    if ((r = /^Expected (?:type )?[`"]*(\w+)[`"]*, received [`"]*(\w+)[`"]*$/i.exec(m))) return 'zły rodzaj wartości: powinna być ' + (TYPY[r[1].toLowerCase()] || r[1]) + ', jest ' + (TYPY[r[2].toLowerCase()] || r[2]);
    if ((r = /^String must contain at least (\d+) character/i.exec(m))) return 'za krótki tekst (co najmniej ' + r[1] + ' zn.)';
    if ((r = /^String must contain at most (\d+) character/i.exec(m))) return 'za długi tekst (najwyżej ' + r[1] + ' zn.)';
    if ((r = /^Invalid enum value\. Expected (.+), received '(.*)'$/i.exec(m))) return 'niedozwolona wartość „' + r[2] + '” (dozwolone: ' + r[1].replace(/'/g, '').replace(/ \| /g, ', ') + ')';
    if ((r = /^Number must be greater than or equal to (\S+)$/i.exec(m))) return 'liczba mniejsza niż ' + r[1];
    if ((r = /^Number must be less than or equal to (\S+)$/i.exec(m))) return 'liczba większa niż ' + r[1];
    if (/^Invalid input$/i.test(m)) return 'niepoprawna wartość';
    if (/^Expected array/i.test(m)) return 'powinna być lista';
    return m;
  }
  function pole(p) {
    return p.split('.').map(function (x) { return /^\d+$/.test(x) ? T.pozycja + ' ' + (Number(x) + 1) : x; }).join(' › ');
  }
  function rysujBlad(run) {
    if (!run) { if (bladPasek) { bladPasek.remove(); bladPasek = null; } return; }
    if (stanTeraz.bledy == null && !rysujBlad.pyta) {
      rysujBlad.pyta = true;
      pobierzBledy(run).then(function (c) { rysujBlad.pyta = false; if (c) { stanTeraz = policz(c); rysuj(); } });
    }
    if (!bladPasek) {
      bladPasek = E('div', 'sb-blad-pasek');
      bladPasek.setAttribute('role', 'alert');
      bladPasek.dataset.lang = D.lang;
      document.body.appendChild(bladPasek);
    }
    bladPasek.hidden = bladZwiniety;
    el.classList.toggle('sb-blad-zwiniety', bladZwiniety);
    var klucz = run.id + ':' + JSON.stringify(stanTeraz.bledy);
    if (bladPasek.dataset.klucz === klucz) return;
    bladPasek.dataset.klucz = klucz;
    bladPasek.textContent = '';
    var wnetrze = E('div', 'sb-blad-wnetrze');
    var wersja = stanTeraz.zbudowana ? data(stanTeraz.zbudowana) : '—';
    wnetrze.appendChild(E('p', 'sb-blad-tytul', T.blad + wersja));
    var lista = E('ul', 'sb-blad-lista');
    (stanTeraz.bledy || []).slice(0, 5).forEach(function (b) {
      var li = E('li');
      var cz = (b.tresc || '').split(' › ');
      if (b.tytul === 'Błąd treści' && cz.length >= 4) {
        var plik = cz[2], reszta = cz.slice(3);
        var adres = /^https:\/\/app\.pagescms\.org\//.test(reszta[reszta.length - 1]) ? reszta.pop() : '';
        var opis = reszta.join(' › ');
        var dw = opis.indexOf(': ');
        var nazwa = plik.split('/').pop().replace(/\.(md|json|ya?ml)$/, '');
        li.appendChild(E('span', null, T.wpis + ' „' + nazwa + '” (' + cz[1] + ')' + (dw > 0 ? ', ' + T.pole + ' ' + pole(opis.slice(0, dw)) + ': ' + poPolsku(opis.slice(dw + 2)) : ': ' + poPolsku(opis))));
        if (adres) { li.appendChild(document.createTextNode(' ')); var a = E('a', 'sb-blad-cms', T.popraw); a.href = adres; a.target = '_blank'; a.rel = 'noopener'; li.appendChild(a); }
      } else li.appendChild(E('span', null, b.tresc));
      lista.appendChild(li);
    });
    if (lista.childNodes.length) wnetrze.appendChild(lista);
    var akcje = E('p', 'sb-blad-akcje');
    var sz = E('a', null, T.szczegoly); sz.href = run.html_url || AKCJE; sz.target = '_blank'; sz.rel = 'noopener';
    akcje.appendChild(sz);
    var zw = E('button', 'sb-przycisk', T.zwin); zw.type = 'button';
    zw.addEventListener('click', function () { bladZwiniety = true; rysuj(); plakietka.focus(); });
    akcje.appendChild(zw);
    wnetrze.appendChild(akcje);
    bladPasek.appendChild(wnetrze);
  }

  // ---------- odpytywanie ----------
  var zegar = 0, odswiezanie = 0;
  function odstep(c) { var s = policz(c); return s && s.aktywna ? W_BUDOWIE : ZWYKLE; }
  function planuj(ile) { clearTimeout(zegar); if (!document.hidden) zegar = setTimeout(cykl, Math.max(1e3, ile)); }
  function pokaz(c) {
    stanTeraz = policz(c);
    rysuj();
    clearInterval(odswiezanie);
    if (stanTeraz && stanTeraz.aktywna) odswiezanie = setInterval(rysuj, 5e3);
  }
  function cykl(wejscie) {
    var c = czytaj(K_STAN), teraz = Date.now();
    if (TEST) c = null;
    if (c && c.do && teraz < c.do) { pokaz(c); planuj(c.do - teraz); return; }
    var prog = wejscie ? SWIEZE : odstep(c) - 2e3;
    if (c && c.t && teraz - c.t < prog) { pokaz(c); planuj(odstep(c) - (teraz - c.t)); return; }
    pobierzListe().then(function (w) {
      if (!TEST) zapisz(K_STAN, w);
      pokaz(w);
      planuj(w.do ? w.do - Date.now() : odstep(w));
    }).catch(function () {
      if (c) pokaz(c);
      planuj(ZWYKLE);
    });
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(zegar); else cykl(false); });
  window.addEventListener('storage', function (e) { if (e.key === K_STAN && e.newValue) { var c = czytaj(K_STAN); pokaz(c); planuj(odstep(c)); } });
  if (szkic) szkic.hidden = false;
  cykl(true);
})();
