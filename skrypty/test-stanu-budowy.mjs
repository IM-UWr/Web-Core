// Zlecenie 33, część B: test plakietki stanu budowy w przeglądarce (Playwright + Edge z systemu) i zrzuty do raportu.
// Strona: lokalna budowa Podglądu (PODGLAD=1 bez PODGLAD_RUN_ID, więc działa tryb testowy ?stan=…) z wpisami testowymi-szkicami:
// kierunki/isim, strony/instytut/kontakt, strony/instytut/infrastruktura-informatyczna (podstrony = szkice pośrednio),
// specjalnosci/matematyka-stosowana, data/nauka (strona działu).
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
const idz = async (p, adres, stan) => { await p.goto(`${baza}${adres}${stan ? `?stan=${stan}` : ''}`); await p.waitForFunction(() => /sb-(ok|buduje|blad|niedostepny)/.test(document.getElementById('stan-budowy')?.className || '')); };
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
  const W = 1440, H = 900;
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
  for (const adres of [OPUBLIKOWANA, '/nauka/', '/']) {
    await idz(p, adres, 'ok');
    sprawdz(!(await p.$('.sb-szkic')), `${adres}: bez wiersza szkicu${adres === '/nauka/' ? ' (strona działu-szkic zostaje w budowie publicznej)' : ''}`);
  }
  await zrzut(p, 'komputer-opublikowana');
  await p.context().close();
}

console.log(`\nBłędy w konsoli: ${bledyKonsoli.length}`);
for (const b of bledyKonsoli) console.log('  ' + b);
if (bledyKonsoli.length) problemy++;
console.log(`Problemów: ${problemy}`);
await przegladarka.close();
process.exit(problemy ? 1 : 0);
