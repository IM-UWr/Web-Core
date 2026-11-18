// Zlecenie 33, część B: test plakietki stanu budowy w przeglądarce (Playwright + Edge z systemu) i zrzuty do raportu.
// Strona: lokalna budowa Podglądu (PODGLAD=1 bez PODGLAD_RUN_ID, więc działa tryb testowy ?stan=…) z wpisami testowymi-szkicami:
// kierunki/isim, strony/instytut/kontakt, strony/instytut/infrastruktura-informatyczna (podstrony = szkice pośrednio),
// specjalnosci/matematyka-stosowana, data/nauka (strona działu), zaklady/geometria, warto_wiedziec/historie/wyklad-terencea-tao (decyzja 18.11; od zlecenia 47 w historie/).
// Zlecenie 48: aktualnosci/2026-11-18-wyklad-popularnonaukowy-z-cyklu-misiu, seminaria/prawdopodobienstwo (opis seminarium: formularz pliku)
// i referat testowy referaty/statystyka/test-2026-11-25-referat-testowy (wiersz na plakietce strony opublikowanego seminarium).
//
// Uruchomienie:  node skrypty/test-stanu-budowy.mjs <adres strony, np. http://localhost:4321/Web-Core> <katalog zrzutów>
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const [baza, katalog] = process.argv.slice(2);
if (!baza || !katalog) { console.error('Użycie: node skrypty/test-stanu-budowy.mjs <adres> <katalog zrzutów>'); process.exit(2); }
fs.mkdirSync(katalog, { recursive: true });
let problemy = 0;
const sprawdz = (w, opis) => { console.log(`  ${w ? 'OK ' : 'ŹLE'} ${opis}`); if (!w) problemy++; };
const bledyKonsoli = [];

const EKRANY = {
  komputer: { viewport: { width: 1440, height: 900 } },
  telefon: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};
const SZKIC = '/instytut/kontakt/';
const POSREDNIO = '/instytut/infrastruktura-informatyczna/siec-studencka/';
const OPUBLIKOWANA = '/instytut/struktura/';

const przegladarka = await chromium.launch({ channel: 'msedge' });
async function strona(ekran, motyw = 'light') {
  const kontekst = await przegladarka.newContext({ ...EKRANY[ekran], locale: 'pl-PL', timezoneId: 'Europe/Warsaw', reducedMotion: 'reduce' });
  await kontekst.addInitScript((m) => { try { if (!sessionStorage.getItem('test-start')) { localStorage.clear(); sessionStorage.setItem('test-start', '1'); } localStorage.setItem('motyw', m); } catch (e) {} }, motyw);
  const p = await kontekst.newPage();
  p.on('console', (m) => { if (m.type() === 'error') bledyKonsoli.push(`${ekran}/${motyw}: ${m.text()}`); });
  p.on('pageerror', (e) => bledyKonsoli.push(`${ekran}/${motyw}: ${e.message}`));
  return p;
}
const idz = async (p, adres, stan) => {
  await p.goto(`${baza}${adres}${stan ? `?stan=${stan}` : ''}`);
  await p.waitForFunction(() => /sb-(ok|buduje|blad|niedostepny)/.test(document.getElementById('stan-budowy')?.className || ''));
  // „nowa”: dymek po porównaniu skrótu strony z /podglad/skroty.json (zapytanie do strony)
  if (stan === 'nowa') await p.waitForSelector('.sb-dymek:not([hidden])', { timeout: 5000 }).catch(() => {});
};
const rog = (p) => p.$eval('#stan-budowy', (e) => e.dataset.rog);
const zapamietany = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('im-plakietka-rog')));
const zrzut = (p, nazwa) => p.screenshot({ path: path.join(katalog, `z33-${nazwa}.png`) });

async function przeciagnij(p, x, y) {
  const b = await p.$eval('.sb-plakietka', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.mouse.move(b.x, b.y);
  await p.mouse.down();
  for (let i = 1; i <= 12; i++) await p.mouse.move(b.x + ((x - b.x) * i) / 12, b.y + ((y - b.y) * i) / 12);
  await p.mouse.up();
  await p.waitForTimeout(150);
}

// ---------- 1. stany: komputer i telefon, jasny i ciemny ----------
console.log('1. Stany plakietki (tryb testowy ?stan=…)');
for (const ekran of ['komputer', 'telefon']) {
  for (const motyw of ['light', 'dark']) {
    const p = await strona(ekran, motyw);
    const m = motyw === 'light' ? 'jasny' : 'ciemny';
    for (const stan of ['ok', 'w-toku', 'kolejka', 'nowa', 'blad', 'limit']) {
      await idz(p, SZKIC, stan);
      const tekst = await p.$eval('.sb-tekst', (e) => e.textContent);
      const oczekiwane = { ok: /^Aktualna · zbudowana \d\d\.\d\d, \d\d:\d\d$/, 'w-toku': /^Przebudowa… zmiany będą widoczne za ok\. \d+ min$/, kolejka: /^W kolejce do przebudowy… zmiany będą widoczne za ok\. \d+ min$/,
        nowa: /^Aktualna · zbudowana/, blad: /^Błąd budowy$/, limit: /^Stan budowy chwilowo niedostępny$/ }[stan];
      if (ekran === 'komputer' && motyw === 'light') sprawdz(oczekiwane.test(tekst), `${stan}: „${tekst}”`);
      if (stan === 'nowa' && ekran === 'komputer' && motyw === 'light') sprawdz(await p.isVisible('.sb-dymek'), 'nowa: dymek „Nowa wersja strony gotowa — Odśwież”');
      if (stan === 'blad' && ekran === 'komputer' && motyw === 'light') {
        const bar = await p.$eval('.sb-blad-pasek', (e) => ({ rola: e.getAttribute('role'), tekst: e.innerText, cms: [...e.querySelectorAll('a.sb-blad-cms')].map((a) => a.href) }));
        sprawdz(bar.rola === 'alert' && /^Strona się nie zbudowała, pokazujemy wersję z \d\d\.\d\d, \d\d:\d\d/.test(bar.tekst), 'blad: czerwony pasek role="alert" z datą wersji');
        sprawdz(/Wpis „2026-11-16-” \(aktualnosci\), pole zalaczniki › pozycja 1 › plik: brak wymaganego pola/.test(bar.tekst), 'blad: komunikat po polsku z nazwą wpisu i polem');
        sprawdz(bar.cms[0] === 'https://app.pagescms.org/im-uwr/web-aktualnosci/main/collection/aktualnosci/edit/src%2Fcontent%2Faktualnosci%2F2026-11-16-.md', 'blad: „Popraw w CMS” do formularza wpisu');
      }
      await zrzut(p, `${ekran}-${m}-${stan}`);
      if (stan === 'blad') {
        await p.click('.sb-blad-pasek button');
        await zrzut(p, `${ekran}-${m}-blad-zwiniety`);
        if (ekran === 'komputer' && motyw === 'light') {
          sprawdz(await p.isHidden('.sb-blad-pasek'), 'blad: pasek zwinięty do czerwonej plakietki');
          await idz(p, OPUBLIKOWANA, 'blad');
          sprawdz(await p.isVisible('.sb-blad-pasek'), 'blad: na kolejnej podstronie pasek wraca');
        }
      }
      if (stan === 'ok') {
        await p.click('.sb-plakietka');
        await zrzut(p, `${ekran}-${m}-szczegoly`);
        if (ekran === 'komputer' && motyw === 'light') {
          sprawdz((await p.$$('.sb-lista li')).length === 3, 'ok: szczegóły — 3 ostatnie budowy (bez przerwanych) i link do GitHub Actions');
          sprawdz(await p.isVisible('.sb-przenies'), 'ok: przycisk „Przenieś do innego rogu”');
        }
        await p.click('.sb-plakietka');
      }
    }
    await p.context().close();
  }
}

// ---------- 2. B3: przeciąganie i rogi ----------
console.log('2. Przeciąganie do rogów (B3)');
{
  const p = await strona('komputer');
  await idz(p, OPUBLIKOWANA, 'ok');
  sprawdz((await rog(p)) === 'ld', 'domyślnie lewy dolny róg');
  for (const [x, y, cel] of [[1300, 820, 'pd'], [1300, 150, 'pg'], [120, 160, 'lg'], [140, 800, 'ld'], [680, 300, 'lg'], [760, 300, 'pg']]) {
    await przeciagnij(p, x, y);
    sprawdz((await rog(p)) === cel && (await zapamietany(p)) === cel, `przeciągnięcie do (${x}, ${y}) → róg ${cel}, zapamiętany`);
    sprawdz((await p.getAttribute('.sb-plakietka', 'aria-expanded')) === 'false', '  po przeciągnięciu szczegóły się nie rozwinęły');
  }
  for (const cel of ['pd', 'pg', 'lg', 'ld']) {
    await p.evaluate((r) => localStorage.setItem('im-plakietka-rog', JSON.stringify(r)), cel);
    await idz(p, SZKIC, 'nowa');
    await p.click('.sb-plakietka');
    await zrzut(p, `komputer-rog-${cel}`);
    const ok = await p.evaluate(() => { const r = [...document.querySelectorAll('#stan-budowy > :not(.sb-sr)')].filter((e) => !e.hidden).map((e) => e.getBoundingClientRect()); return r.every((x) => x.left >= 0 && x.top >= 0 && x.right <= innerWidth && x.bottom <= innerHeight); });
    sprawdz(ok, `róg ${cel}: rozwinięta plakietka, wiersz szkicu i dymek mieszczą się w oknie`);
  }
  const pasek = await p.evaluate(() => document.querySelector('.z-pasek')?.getBoundingClientRect().bottom ?? 0);
  await p.evaluate(() => localStorage.setItem('im-plakietka-rog', '"pg"'));
  await idz(p, OPUBLIKOWANA, 'ok');
  const gora = await p.$eval('#stan-budowy', (e) => e.getBoundingClientRect().top);
  sprawdz(gora >= pasek && gora - pasek <= 20, `górny róg pod paskiem menu (pasek do ${Math.round(pasek)} px, plakietka od ${Math.round(gora)} px)`);
  await idz(p, '/nauka/', 'ok');
  sprawdz((await rog(p)) === 'pg', 'róg zapamiętany po przejściu na inną podstronę');
  await p.reload();
  await p.waitForSelector('#stan-budowy.sb-ok');
  sprawdz((await rog(p)) === 'pg', 'róg zapamiętany po odświeżeniu');
  // kliknięcie z przesunięciem poniżej progu (4 px) = kliknięcie
  const b = await p.$eval('.sb-plakietka', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + 20, y: r.top + r.height / 2 }; });
  await p.mouse.move(b.x, b.y); await p.mouse.down(); await p.mouse.move(b.x + 3, b.y + 1); await p.mouse.up();
  sprawdz((await p.getAttribute('.sb-plakietka', 'aria-expanded')) === 'true' && (await rog(p)) === 'pg', 'kliknięcie z przesunięciem 3 px rozwija szczegóły (bez przenoszenia)');
  // klawiatura: Escape zwija, Enter rozwija, „Przenieś do innego rogu” po kolei
  await p.keyboard.press('Escape');
  sprawdz((await p.getAttribute('.sb-plakietka', 'aria-expanded')) === 'false', 'Escape zwija szczegóły');
  await p.focus('.sb-plakietka');
  await p.keyboard.press('Enter');
  sprawdz((await p.getAttribute('.sb-plakietka', 'aria-expanded')) === 'true', 'Enter na plakietce rozwija szczegóły');
  const kolejne = [];
  for (let i = 0; i < 4; i++) { await p.focus('.sb-przenies'); await p.keyboard.press('Enter'); await p.waitForTimeout(50); kolejne.push(await rog(p)); }
  sprawdz(kolejne.join(' ') === 'pd ld lg pg', `„Przenieś do innego rogu” z klawiatury: pg → ${kolejne.join(' → ')}`);
  sprawdz((await p.evaluate(() => document.activeElement?.className)).includes('sb-przenies'), 'fokus zostaje na przycisku po przeniesieniu');
  sprawdz(!!(await p.getAttribute('.sb-plakietka', 'aria-label')), 'uchwyt ma aria-label');
  sprawdz((await p.$eval('.sb-plakietka', (e) => getComputedStyle(e).touchAction)) === 'none' && (await p.evaluate(() => getComputedStyle(document.body).touchAction)) !== 'none', 'touch-action: none tylko na plakietce');
  await p.context().close();
}
{
  const p = await strona('telefon');
  await p.goto(`${baza}${OPUBLIKOWANA}?stan=ok`);
  await p.evaluate(() => localStorage.setItem('im-plakietka-rog', '"pg"'));
  await idz(p, OPUBLIKOWANA, 'ok');
  sprawdz((await rog(p)) === 'pd', 'telefon: zapamiętany górny prawy róg (z komputera) → prawy dolny');
  await przeciagnij(p, 60, 100);
  sprawdz((await rog(p)) === 'ld', 'telefon: przeciągnięcie w lewy górny róg → lewy dolny (tylko dolne rogi)');
  await przeciagnij(p, 340, 780);
  sprawdz((await rog(p)) === 'pd', 'telefon: przeciągnięcie w prawy dolny róg');
  for (const cel of ['ld', 'pd']) {
    await p.evaluate((r) => localStorage.setItem('im-plakietka-rog', JSON.stringify(r)), cel);
    await idz(p, SZKIC, 'nowa');
    await p.click('.sb-plakietka');
    await zrzut(p, `telefon-rog-${cel}`);
  }
  await p.context().close();
}

// ---------- 3. B4: wiersz szkicu ----------
console.log('3. Strona tylko na Podglądzie (B4)');
{
  const p = await strona('komputer');
  const przypadki = [
    [SZKIC, 'https://app.pagescms.org/im-uwr/web-instytut/main/collection/strony/edit/src%2Fcontent%2Fstrony%2Finstytut%2Fkontakt.md', false],
    [POSREDNIO, 'https://app.pagescms.org/im-uwr/web-instytut/main/collection/strony/edit/src%2Fcontent%2Fstrony%2Finstytut%2Finfrastruktura-informatyczna.md', true],
    ['/studia/isim/', 'https://app.pagescms.org/im-uwr/web-studia/main/collection/kierunki/edit/src%2Fcontent%2Fkierunki%2Fisim.md', false],
    ['/studia/matematyka/matematyka-stosowana/', 'https://app.pagescms.org/im-uwr/web-studia/main/collection/specjalnosci/edit/src%2Fcontent%2Fspecjalnosci%2Fmatematyka-stosowana.md', false],
    ['/en/instytut/kontakt/', 'https://app.pagescms.org/im-uwr/web-instytut/main/collection/strony/edit/src%2Fcontent%2Fstrony%2Finstytut%2Fkontakt.md', false],
    ['/instytut/zaklady/geometria/', 'https://app.pagescms.org/im-uwr/web-instytut/main/collection/zaklady/edit/src%2Fcontent%2Fzaklady%2Fgeometria.md', false],
    ['/instytut/warto-wiedziec/wyklad-terencea-tao/', 'https://app.pagescms.org/im-uwr/web-instytut/main/collection/ww_historie/edit/src%2Fcontent%2Fwarto_wiedziec%2Fhistorie%2Fwyklad-terencea-tao.md', false],
    // zlecenie 48: aktualność (kolekcja) i opis seminarium (formularz jednego pliku w repozytorium seminarium)
    ['/aktualnosci/2026-11-18-wyklad-popularnonaukowy-z-cyklu-misiu/', 'https://app.pagescms.org/im-uwr/web-aktualnosci/main/collection/aktualnosci/edit/src%2Fcontent%2Faktualnosci%2F2026-11-18-wyklad-popularnonaukowy-z-cyklu-misiu.md', false],
    ['/seminaria/prawdopodobienstwo/', 'https://app.pagescms.org/im-uwr/web-sem-prawdopodobienstwo/main/file/seminarium', false],
    ['/en/seminaria/prawdopodobienstwo/', 'https://app.pagescms.org/im-uwr/web-sem-prawdopodobienstwo/main/file/seminarium', false],
  ];
  for (const [adres, cms, posr] of przypadki) {
    await idz(p, adres, 'ok');
    const w = await p.$eval('.sb-szkic', (e) => ({ tekst: e.innerText, href: e.querySelector('a')?.href }));
    sprawdz(w.href === cms && (adres.startsWith('/en/') ? /^Draft: this page won't be on the public site/ : /^Szkic: tej strony nie będzie na stronie publicznej/).test(w.tekst)
      && (posr === /strona nadrzędna/.test(w.tekst)), `${adres}: żółty wiersz${posr ? ' (pośrednio)' : ''} z linkiem do formularza`);
    sprawdz(await p.isVisible('.notice-warn') !== posr, `${adres}: żółty pasek na górze ${posr ? 'nie (strona sama jest opublikowana)' : 'zostaje'}`);
    if (adres === POSREDNIO) await zrzut(p, 'komputer-szkic-posrednio');
    if (adres === SZKIC) await zrzut(p, 'komputer-szkic');
  }
  // strona działu-szkic (decyzja 18.11): wiersz o tekście z pliku, link do formularza pliku „Strona działu”
  for (const [adres, wzor] of [['/nauka/', /^Szkic: tekstu tej strony nie będzie na stronie publicznej \(strona zostanie, bez tekstu\)/], ['/en/nauka/', /^Draft: the text of this page won’t be on the public site/]]) {
    await idz(p, adres, 'ok');
    const w = await p.$eval('.sb-szkic', (e) => ({ tekst: e.innerText, href: e.querySelector('a')?.href })).catch(() => ({}));
    sprawdz(w.href === 'https://app.pagescms.org/im-uwr/web-nauka/main/file/strona-dzialu' && wzor.test(w.tekst || ''), `${adres}: wiersz szkicu strony działu z linkiem do formularza pliku`);
  }
  // zlecenie 48: referat-szkic na stronie opublikowanego seminarium — wiersz o referacie z linkiem do formularza „Referaty”, bez paska na górze
  for (const [adres, wzor] of [['/seminaria/statystyka/', /^Szkic: referatu „Referat testowy \(zlecenie 48\)” nie będzie na stronie publicznej\./], ['/en/seminaria/statystyka/', /^Draft: the talk “Referat testowy \(zlecenie 48\)” won't be on the public site\./]]) {
    await idz(p, adres, 'ok');
    const w = await p.$$eval('.sb-szkic', (l) => l.map((e) => ({ tekst: e.innerText, href: e.querySelector('a')?.href })));
    sprawdz(w.length === 1 && w[0].href === 'https://app.pagescms.org/im-uwr/web-sem-statystyka/main/collection/referaty/edit/src%2Fcontent%2Freferaty%2Fstatystyka%2Ftest-2026-11-25-referat-testowy.md' && wzor.test(w[0].tekst),
      `${adres}: wiersz referatu-szkicu z linkiem do formularza „Referaty”`);
    sprawdz(!(await p.isVisible('.notice-warn')), `${adres}: bez żółtego paska (strona seminarium jest opublikowana)`);
    sprawdz(await p.$$eval('#test-2026-11-25-referat-testowy h3 .szkic-etykieta', (l) => l.length) === 1, `${adres}: etykieta przy tytule referatu`);
    if (adres === '/seminaria/statystyka/') await zrzut(p, 'komputer-referat-szkic');
  }
  for (const adres of [OPUBLIKOWANA, '/']) {
    await idz(p, adres, 'ok');
    sprawdz(!(await p.$('.sb-szkic')), `${adres}: bez wiersza szkicu`);
  }
  await zrzut(p, 'komputer-opublikowana');
  await p.context().close();
}

// ---------- 4. żółty pasek szkicu pod paskiem menu (decyzja 18.11) ----------
console.log('4. Żółty pasek szkicu');
for (const ekran of ['komputer', 'telefon']) {
  const p = await strona(ekran);
  for (const y of [0, 600]) {
    await idz(p, SZKIC, 'ok');
    await p.evaluate((v) => scrollTo(0, v), y);
    await p.waitForTimeout(300);
    const w = await p.evaluate(() => {
      const pasek = document.querySelector('.szkic-pasek');
      const b = pasek.getBoundingClientRect();
      // co leży nad paskiem: element w środku paska i tuż nad nim (menu)
      const nad = document.elementFromPoint(innerWidth / 2, b.top + b.height / 2);
      const wyzej = document.elementFromPoint(innerWidth / 2, Math.max(0, b.top - 2));
      return { gora: b.top, wys: b.height, widoczny: !!nad?.closest('.szkic-pasek'), wyzej: wyzej ? (wyzej.closest('header, nav, [class*="pasek"], [class*="naglowek"]')?.className || wyzej.tagName) : '' };
    });
    sprawdz(w.widoczny && w.gora > 0 && w.wys < 80, `${ekran}, przewinięcie ${y} px: pasek widoczny, od ${Math.round(w.gora)} px (nad nim: ${String(w.wyzej).slice(0, 40)})`);
    if (y === 0) await zrzut(p, `${ekran}-pasek-szkicu`);
  }
  await p.context().close();
}

// ---------- 5. dymek tylko przy zmianie tej strony (decyzja 18.11) ----------
console.log('5. Dymek „Nowa wersja gotowa” a skrót strony');
{
  const p = await strona('komputer');
  await idz(p, OPUBLIKOWANA, 'ok');
  const d = await p.$eval('#stan-budowy', (e) => ({ skrot: e.dataset.skrot, plik: e.dataset.plik }));
  const json = await p.evaluate(async (u) => (await fetch(u)).json(), `${baza}/podglad/skroty.json`);
  sprawdz(/^[\w-]{16}$/.test(d.skrot || '') && d.plik === 'instytut/struktura/index.html' && json.strony[d.plik] === d.skrot, `skrót strony w plakietce = skrót w skroty.json (${d.plik} ${d.skrot})`);
  await idz(p, OPUBLIKOWANA, 'nowa');
  sprawdz(await p.isVisible('.sb-dymek'), 'nowa budowa zmieniła stronę: dymek widoczny');
  await idz(p, OPUBLIKOWANA, 'nowa&skrot=bez-zmian');
  await p.waitForTimeout(1500);
  sprawdz(!(await p.isVisible('.sb-dymek')) && /^Aktualna/.test(await p.innerText('.sb-tekst')), 'nowa budowa bez zmian tej strony: bez dymka, „Aktualna”');
  await p.context().close();
}

console.log(`\nBłędy w konsoli: ${bledyKonsoli.length}`);
for (const b of bledyKonsoli) console.log('  ' + b);
if (bledyKonsoli.length) problemy++;
console.log(`Problemów: ${problemy}`);
await przegladarka.close();
process.exit(problemy ? 1 : 0);
