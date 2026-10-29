/**
 * Powiadomienia e-mail o referatach seminariów — Instytut Matematyczny UWr
 * =========================================================================
 * Google Apps Script (projekt na script.google.com). Instrukcja instalacji: README.md → „Powiadomienia e-mail”.
 *
 * Jak to działa:
 *  1. Na stronie każdego seminarium jest formularz „Powiadomienia e-mail”. Wysyła on adres do tego skryptu
 *     (doPost, akcja „zapisz”). Skrypt zapisuje adres w arkuszu Google i wysyła link potwierdzający
 *     (podwójne potwierdzenie — nikt nie zapisze cudzego adresu).
 *  2. Link z wiadomości prowadzi na stronę Instytutu /powiadomienia?a=potwierdz&t=…, która przekazuje
 *     potwierdzenie do skryptu. Tak samo działa wypisanie (/powiadomienia?a=wypisz&t=…).
 *  3. Co 10 minut skrypt pobiera ze strony plik /seminaria/powiadomienia.json. Gdy pojawi się nowy
 *     (przyszły) referat, wysyła do zapisanych na listę tego seminarium elegancki e-mail po angielsku
 *     z linkiem do wypisania się.
 *  4. Ten sam adres zapisany kilka razy (np. Jan.Kowalski@gmail.com i jankowalski@gmail.com) dostaje
 *     wiadomość tylko raz — patrz funkcja klucz().
 *
 * Dane: arkusz „Powiadomienia seminaria IM UWr” na Dysku konta, które uruchamia skrypt
 * (zakładki Subskrypcje, Referaty, Wyslane). Arkusz tworzy funkcja ustaw().
 */

// ------------------------------------------------------------------ USTAWIENIA
var KONFIG = {
  // Plik z danymi seminariów generowany przez stronę (zmienić po przeniesieniu strony na domenę UWr):
  KANAL: 'https://im-uwr.github.io/Web-Core/seminaria/powiadomienia.json',
  // Nazwa nadawcy widoczna w skrzynce:
  NADAWCA: 'Mathematical Institute, University of Wrocław',
  // Adres do odpowiedzi (np. sekretariat albo opiekun seminariów); puste = adres konta uruchamiającego skrypt:
  ODPOWIEDZ_DO: '',
  // Adres pocztowy w stopce wiadomości:
  ADRES_POCZTOWY: 'Mathematical Institute, University of Wrocław · pl. Grunwaldzki 2, 50-384 Wrocław, Poland',
  // Podwójne potwierdzenie zapisu (zalecane): true = adres trafia na listę dopiero po kliknięciu linku.
  POTWIERDZENIE: true,
  // Referaty starsze niż „teraz” nie są ogłaszane (np. dopisane po fakcie).
  // Ile minut przed wysyłką musi minąć od wykrycia referatu (czas na poprawki literówek po publikacji):
  ZWLOKA_MIN: 15,
  // Ochrona przed nadużyciem formularza: maks. zgłoszeń na godzinę (wszystkie adresy razem):
  LIMIT_ZGLOSZEN_NA_GODZINE: 120,
};

var ARKUSZ_NAZWA = 'Powiadomienia seminaria IM UWr';
var NAGLOWKI = {
  Subskrypcje: ['email', 'klucz', 'seminarium', 'status', 'token', 'zapisano', 'potwierdzono', 'wypisano', 'jezyk'],
  Referaty: ['referat', 'seminarium', 'termin', 'tytul', 'wykryto', 'status'],
  Wyslane: ['referat', 'klucz', 'email', 'wyslano'],
};

// ------------------------------------------------------------------ USTAWIENIE (uruchomić raz ręcznie)
/** Tworzy arkusz, zapamiętuje obecne referaty jako już ogłoszone i włącza sprawdzanie co 10 minut. */
function ustaw() {
  var arkusz = arkuszDanych_();
  var dane = pobierzKanal_();
  var ref = arkusz.getSheetByName('Referaty');
  var znane = wartosciKolumny_(ref, 1);
  var teraz = new Date();
  dane.referaty.forEach(function (r) {
    if (znane.indexOf(r.id) < 0) ref.appendRow([r.id, r.seminarium, r.termin, r.tytul, teraz, 'pominiety']);
  });
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sprawdzNoweReferaty') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sprawdzNoweReferaty').timeBased().everyMinutes(10).create();
  Logger.log('Gotowe. Arkusz: ' + arkusz.getUrl());
  Logger.log('Seminaria w kanale: ' + dane.seminaria.map(function (s) { return s.id; }).join(', '));
  Logger.log('Dzienny limit wysyłki tego konta (pozostało dziś): ' + MailApp.getRemainingDailyQuota());
}

// ------------------------------------------------------------------ STRONA → SKRYPT
function doGet() {
  return json_({ ok: true, serwis: 'powiadomienia IM UWr' });
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.akcja === 'zapisz') return json_(zapisz_(p));
    if (p.akcja === 'potwierdz') return json_(zmienStatus_(p.t, 'aktywny'));
    if (p.akcja === 'wypisz') return json_(zmienStatus_(p.t, 'wypisany'));
    return json_({ ok: false, blad: 'akcja' });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, blad: 'serwer' });
  }
}

function zapisz_(p) {
  // pułapka na boty: ukryte pole „www” musi być puste
  if (p.www) return { ok: true };
  var email = String(p.email || '').trim();
  if (!poprawnyEmail(email)) return { ok: false, blad: 'email' };
  var sem = seminariumZKanalu_(String(p.seminarium || ''));
  if (!sem) return { ok: false, blad: 'seminarium' };
  var k = klucz(email);
  var cache = CacheService.getScriptCache();
  // to samo zgłoszenie w ciągu 10 minut — nie wysyłamy kolejnej wiadomości
  var cKey = 'z:' + sem.id + ':' + Utilities.base64EncodeWebSafe(k).slice(0, 200);
  if (cache.get(cKey)) return { ok: true };
  var licznik = Number(cache.get('z:godzina') || 0);
  if (licznik >= KONFIG.LIMIT_ZGLOSZEN_NA_GODZINE) return { ok: false, blad: 'limit' };
  cache.put('z:godzina', String(licznik + 1), 3600);
  cache.put(cKey, '1', 600);

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = arkuszDanych_().getSheetByName('Subskrypcje');
    var w = sh.getDataRange().getValues();
    var teraz = new Date();
    var wiersz = -1;
    for (var i = 1; i < w.length; i++) {
      if (w[i][1] === k && w[i][2] === sem.id) { wiersz = i; break; }
    }
    if (wiersz >= 0 && w[wiersz][3] === 'aktywny') return { ok: true }; // już na liście — nic nie wysyłamy
    var nowyStatus = KONFIG.POTWIERDZENIE ? 'oczekuje' : 'aktywny';
    var token = wiersz >= 0 && w[wiersz][3] === 'oczekuje' ? String(w[wiersz][4]) : Utilities.getUuid();
    var jezyk = p.jezyk === 'pl' ? 'pl' : 'en';
    if (wiersz >= 0) {
      sh.getRange(wiersz + 1, 1, 1, 9).setValues([[email, k, sem.id, nowyStatus, token, teraz, nowyStatus === 'aktywny' ? teraz : '', '', jezyk]]);
    } else {
      sh.appendRow([email, k, sem.id, nowyStatus, token, teraz, nowyStatus === 'aktywny' ? teraz : '', '', jezyk]);
    }
    var kanal = pobierzKanal_();
    if (KONFIG.POTWIERDZENIE) wyslijPotwierdzenie_(email, sem, token, kanal.strona);
    else wyslijPowitanie_(email, sem, token, kanal.strona);
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

function zmienStatus_(token, status) {
  token = String(token || '');
  if (!/^[0-9a-f-]{36}$/i.test(token)) return { ok: false, blad: 'token' };
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = arkuszDanych_().getSheetByName('Subskrypcje');
    var w = sh.getDataRange().getValues();
    for (var i = 1; i < w.length; i++) {
      if (String(w[i][4]) !== token) continue;
      var sem = seminariumZKanalu_(w[i][2]);
      var nazwa = sem ? sem.nazwa_en : w[i][2];
      if (status === 'aktywny') {
        if (w[i][3] === 'wypisany') return { ok: false, blad: 'wypisany', seminarium: nazwa };
        sh.getRange(i + 1, 4).setValue('aktywny');
        if (!w[i][6]) sh.getRange(i + 1, 7).setValue(new Date());
      } else {
        sh.getRange(i + 1, 4).setValue('wypisany');
        sh.getRange(i + 1, 8).setValue(new Date());
      }
      return { ok: true, seminarium: nazwa, adres: sem ? sem.adres : '' };
    }
    return { ok: false, blad: 'token' };
  } finally {
    lock.releaseLock();
  }
}

// ------------------------------------------------------------------ WYSYŁKA (wyzwalacz co 10 minut)
function sprawdzNoweReferaty() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // poprzednie uruchomienie jeszcze trwa
  try {
    var start = Date.now();
    var kanal = pobierzKanal_();
    var arkusz = arkuszDanych_();
    var shRef = arkusz.getSheetByName('Referaty');
    var shWys = arkusz.getSheetByName('Wyslane');
    var teraz = new Date();
    var terazLokalnie = Utilities.formatDate(teraz, 'Europe/Warsaw', "yyyy-MM-dd'T'HH:mm");

    // 1. nowe referaty z kanału
    var wRef = shRef.getDataRange().getValues();
    var indeks = {};
    for (var i = 1; i < wRef.length; i++) indeks[wRef[i][0]] = i;
    kanal.referaty.forEach(function (r) {
      if (indeks[r.id] !== undefined) return;
      var status = porownajTermin(r.termin, terazLokalnie) > 0 ? 'do wyslania' : 'pominiety';
      shRef.appendRow([r.id, r.seminarium, r.termin, r.tytul, teraz, status]);
    });

    // 2. wysyłka dla referatów „do wyslania”
    wRef = shRef.getDataRange().getValues();
    var poId = {};
    kanal.referaty.forEach(function (r) { poId[r.id] = r; });
    var semPoId = {};
    kanal.seminaria.forEach(function (s) { semPoId[s.id] = s; });
    var subskrypcje = arkusz.getSheetByName('Subskrypcje').getDataRange().getValues().slice(1);
    var wyslane = shWys.getDataRange().getValues().slice(1);

    for (var j = 1; j < wRef.length; j++) {
      if (wRef[j][5] !== 'do wyslania') continue;
      var r = poId[wRef[j][0]];
      if (!r) { shRef.getRange(j + 1, 6).setValue('wycofany'); continue; } // zniknął ze strony
      if (porownajTermin(r.termin, terazLokalnie) <= 0) { shRef.getRange(j + 1, 6).setValue('pominiety'); continue; }
      if (teraz - new Date(wRef[j][4]) < KONFIG.ZWLOKA_MIN * 60000) continue; // chwila na poprawki
      var sem = semPoId[r.seminarium];
      var juz = {};
      wyslane.forEach(function (x) { if (x[0] === r.id) juz[x[1]] = true; });
      var odbiorcy = odbiorcyListy(subskrypcje, r.seminarium).filter(function (o) { return !juz[o.klucz]; });
      var dokonczono = true;
      for (var n = 0; n < odbiorcy.length; n++) {
        if (MailApp.getRemainingDailyQuota() < 1 || Date.now() - start > 4.5 * 60000) { dokonczono = false; break; }
        var o = odbiorcy[n];
        var tresc = wiadomoscOReferacie(r, sem, o.token, kanal.strona, KONFIG);
        MailApp.sendEmail({ to: o.email, subject: tresc.temat, body: tresc.tekst, htmlBody: tresc.html, name: KONFIG.NADAWCA, replyTo: KONFIG.ODPOWIEDZ_DO || undefined });
        shWys.appendRow([r.id, o.klucz, o.email, new Date()]);
      }
      if (dokonczono) shRef.getRange(j + 1, 6).setValue('wyslany');
      else break; // limit dzienny albo czas — dokończy następne uruchomienie
    }
  } finally {
    lock.releaseLock();
  }
}

/** Podgląd: wysyła na podany adres wiadomość o najbliższym referacie (do sprawdzenia wyglądu). */
function wyslijTest() {
  var adres = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  var kanal = pobierzKanal_();
  var r = kanal.referaty[kanal.referaty.length - 1];
  if (!r) { Logger.log('Brak referatów w kanale.'); return; }
  var sem = kanal.seminaria.filter(function (s) { return s.id === r.seminarium; })[0];
  var tresc = wiadomoscOReferacie(r, sem, '00000000-0000-0000-0000-000000000000', kanal.strona, KONFIG);
  MailApp.sendEmail({ to: adres, subject: '[TEST] ' + tresc.temat, body: tresc.tekst, htmlBody: tresc.html, name: KONFIG.NADAWCA });
  Logger.log('Wysłano podgląd na ' + adres);
}

/** Liczba aktywnych subskrybentów na seminarium (do dziennika). */
function podsumowanie() {
  var w = arkuszDanych_().getSheetByName('Subskrypcje').getDataRange().getValues().slice(1);
  var ile = {};
  w.forEach(function (x) { if (x[3] === 'aktywny') ile[x[2]] = (ile[x[2]] || 0) + 1; });
  Logger.log(JSON.stringify(ile, null, 1));
  Logger.log('Pozostały dzienny limit wysyłki: ' + MailApp.getRemainingDailyQuota());
}

// ------------------------------------------------------------------ LOGIKA (czyste funkcje, testowalne)
/**
 * Klucz do wykrywania duplikatów. Wielkość liter: wszystkie popularne skrzynki jej nie rozróżniają,
 * więc porównujemy małymi literami. Kropki i dopiski „+coś” ignoruje tylko Gmail (gmail.com /
 * googlemail.com) — w innych domenach (np. uwr.edu.pl, outlook.com) jan.kowalski i jankowalski to
 * mogą być różne skrzynki, więc tam kropek nie usuwamy.
 */
function klucz(email) {
  var s = String(email || '').trim().toLowerCase();
  var at = s.lastIndexOf('@');
  if (at < 1) return s;
  var lokalna = s.slice(0, at);
  var domena = s.slice(at + 1);
  if (domena === 'googlemail.com') domena = 'gmail.com';
  if (domena === 'gmail.com') lokalna = lokalna.split('+')[0].replace(/\./g, '');
  return lokalna + '@' + domena;
}

function poprawnyEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i.test(email);
}

/** Aktywni subskrybenci seminarium, każdy klucz (adres po normalizacji) tylko raz — pierwszy zapisany. */
function odbiorcyListy(wiersze, seminarium) {
  var widziane = {};
  var wynik = [];
  wiersze.forEach(function (x) {
    if (x[2] !== seminarium || x[3] !== 'aktywny') return;
    var k = x[1] || klucz(x[0]);
    if (widziane[k]) return;
    widziane[k] = true;
    wynik.push({ email: String(x[0]), klucz: k, token: String(x[4]) });
  });
  return wynik;
}

/** Porównanie terminów „RRRR-MM-DD[THH:MM]” (czas lokalny Warszawy); data bez godziny = koniec dnia. */
function porownajTermin(a, b) {
  var na = a.length === 10 ? a + 'T23:59' : a.slice(0, 16);
  var nb = b.length === 10 ? b + 'T23:59' : b.slice(0, 16);
  return na < nb ? -1 : na > nb ? 1 : 0;
}

var DNI = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var MIESIACE = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** „2026-10-30T10:15” → „Friday, 30 October 2026, 10:15” (czas lokalny bez przeliczania stref). */
function terminPoAngielsku(termin) {
  var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(termin || '');
  if (!m) return termin;
  var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  var s = DNI[d.getUTCDay()] + ', ' + (+m[3]) + ' ' + MIESIACE[+m[2] - 1] + ' ' + m[1];
  return m[4] ? s + ', ' + m[4] + ':' + m[5] : s;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function linkWypisania(strona, token) {
  return String(strona || '').replace(/\/$/, '') + '/powiadomienia/?a=wypisz&t=' + encodeURIComponent(token);
}

function linkPotwierdzenia(strona, token) {
  return String(strona || '').replace(/\/$/, '') + '/powiadomienia/?a=potwierdz&t=' + encodeURIComponent(token);
}

/** Wspólny szablon HTML wiadomości (tabele i style w linii — działa w Gmailu, Outlooku i Apple Mail). */
function szablon_(o, konfig) {
  var granat = '#1b2d52', bursztyn = '#f2a33a', tekst = '#1f2937', szary = '#6b7280';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(o.tytulStrony) + '</title></head>' +
    '<body style="margin:0;padding:0;background:#f1f3f7;">' +
    '<div style="display:none;max-height:0;overflow:hidden;">' + esc(o.zajawka || '') + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f3f7;"><tr><td align="center" style="padding:24px 12px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:' + tekst + ';">' +
    '<tr><td style="background:' + granat + ';padding:20px 28px;border-bottom:4px solid ' + bursztyn + ';">' +
    '<div style="font-size:17px;font-weight:700;color:#ffffff;">Mathematical Institute</div>' +
    '<div style="font-size:13px;color:#c9d3e6;margin-top:2px;">University of Wrocław</div></td></tr>' +
    '<tr><td style="padding:28px 28px 8px 28px;">' + o.tresc + '</td></tr>' +
    '<tr><td style="padding:8px 28px 28px 28px;font-size:12px;line-height:1.6;color:' + szary + ';border-top:1px solid #e5e7eb;">' + o.stopka +
    '<br>' + esc(konfig.ADRES_POCZTOWY) + '</td></tr>' +
    '</table></td></tr></table></body></html>';
}

/** Treść powiadomienia o referacie: { temat, html, tekst }. */
function wiadomoscOReferacie(r, sem, token, strona, konfig) {
  var granat = '#1b2d52', bursztyn = '#f2a33a', szary = '#6b7280';
  var nazwaSem = (sem && sem.nazwa_en) || r.seminarium;
  var kiedy = terminPoAngielsku(r.termin);
  var gdzie = r.sala ? r.sala.charAt(0).toUpperCase() + r.sala.slice(1) : '';
  var prelegent = r.prelegent + (r.afiliacja ? ' (' + r.afiliacja + ')' : '');
  var wypisz = linkWypisania(strona, token);
  var temat = nazwaSem + ': ' + r.prelegent + ' — ' + r.tytul;
  var streszczenie = r.streszczenie ? esc(r.streszczenie).replace(/\n{2,}/g, '</p><p style="margin:0 0 12px 0;">').replace(/\n/g, '<br>') : '';
  var tresc =
    '<div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:' + szary + ';">Seminar · ' + esc(nazwaSem) + '</div>' +
    '<h1 style="margin:8px 0 6px 0;font-size:24px;line-height:1.25;color:' + granat + ';">' + esc(r.tytul) + '</h1>' +
    '<div style="font-size:17px;font-weight:700;margin-bottom:18px;">' + esc(prelegent) + '</div>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#e8edf5;border-left:4px solid ' + bursztyn + ';border-radius:8px;margin-bottom:20px;"><tr><td style="padding:14px 16px;font-size:15px;line-height:1.6;color:' + granat + ';">' +
    '<strong>When:</strong> ' + esc(kiedy) + (gdzie ? '<br><strong>Where:</strong> ' + esc(gdzie) + ', Mathematical Institute, pl. Grunwaldzki 2' : '') +
    '</td></tr></table>' +
    (streszczenie ? '<div style="font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:' + szary + ';margin-bottom:6px;">Abstract</div><p style="margin:0 0 12px 0;font-size:15px;line-height:1.65;">' + streszczenie + '</p>' : '') +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 18px 0;"><tr><td style="background:' + granat + ';border-radius:999px;">' +
    '<a href="' + esc(r.adres) + '" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Talk details on the website →</a></td></tr></table>' +
    '<p style="margin:0 0 4px 0;font-size:14px;color:' + szary + ';">Everyone is welcome.</p>';
  var stopka = 'You are receiving this email because you subscribed to notifications about the <strong>' + esc(nazwaSem) + '</strong> seminar. ' +
    '<a href="' + esc(wypisz) + '" style="color:' + granat + ';font-weight:700;">Unsubscribe</a>';
  var html = szablon_({ tytulStrony: temat, zajawka: kiedy + ' — ' + prelegent, tresc: tresc, stopka: stopka }, konfig);
  var tekst = 'SEMINAR · ' + nazwaSem + '\n\n' + r.tytul + '\n' + prelegent + '\n\nWhen: ' + kiedy + (gdzie ? '\nWhere: ' + gdzie + ', Mathematical Institute, pl. Grunwaldzki 2' : '') +
    (r.streszczenie ? '\n\nAbstract:\n' + r.streszczenie : '') + '\n\nDetails: ' + r.adres + '\n\nEveryone is welcome.\n\n— \nYou are receiving this email because you subscribed to notifications about the ' + nazwaSem +
    ' seminar.\nUnsubscribe: ' + wypisz + '\n' + konfig.ADRES_POCZTOWY;
  return { temat: temat, html: html, tekst: tekst };
}

/** Wiadomość z linkiem potwierdzającym zapis: { temat, html, tekst }. */
function wiadomoscPotwierdzajaca(sem, token, strona, konfig) {
  var granat = '#1b2d52';
  var link = linkPotwierdzenia(strona, token);
  var temat = 'Please confirm: ' + sem.nazwa_en + ' seminar notifications';
  var tresc = '<h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:' + granat + ';">Confirm your subscription</h1>' +
    '<p style="margin:0 0 12px 0;font-size:15px;line-height:1.65;">Someone (hopefully you) asked to receive an email about every new talk in the <strong>' + esc(sem.nazwa_en) + '</strong> seminar at the Mathematical Institute, University of Wrocław.</p>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr><td style="background:' + granat + ';border-radius:999px;">' +
    '<a href="' + esc(link) + '" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">Yes, subscribe me</a></td></tr></table>' +
    '<p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">If you did not ask for this, simply ignore this message — you will not be added to the list.</p>';
  var html = szablon_({ tytulStrony: temat, zajawka: 'One click to confirm your subscription.', tresc: tresc, stopka: 'This is a one-time message.' }, konfig);
  var tekst = 'Confirm your subscription\n\nSomeone (hopefully you) asked to receive an email about every new talk in the ' + sem.nazwa_en +
    ' seminar at the Mathematical Institute, University of Wrocław.\n\nConfirm: ' + link + '\n\nIf you did not ask for this, simply ignore this message.\n\n' + konfig.ADRES_POCZTOWY;
  return { temat: temat, html: html, tekst: tekst };
}

// ------------------------------------------------------------------ POMOCNICZE (Google)
function wyslijPotwierdzenie_(email, sem, token, strona) {
  var t = wiadomoscPotwierdzajaca(sem, token, strona, KONFIG);
  MailApp.sendEmail({ to: email, subject: t.temat, body: t.tekst, htmlBody: t.html, name: KONFIG.NADAWCA, replyTo: KONFIG.ODPOWIEDZ_DO || undefined });
}

function wyslijPowitanie_(email, sem, token, strona) {
  // przy wyłączonym potwierdzaniu: krótka informacja z linkiem do wypisania
  var link = linkWypisania(strona, token);
  MailApp.sendEmail({
    to: email, name: KONFIG.NADAWCA, replyTo: KONFIG.ODPOWIEDZ_DO || undefined,
    subject: 'Subscribed: ' + sem.nazwa_en + ' seminar notifications',
    body: 'You will now receive an email about every new talk in the ' + sem.nazwa_en + ' seminar.\nUnsubscribe: ' + link,
  });
}

function arkuszDanych_() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('ARKUSZ');
  var ss = null;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create(ARKUSZ_NAZWA);
    props.setProperty('ARKUSZ', ss.getId());
  }
  Object.keys(NAGLOWKI).forEach(function (nazwa) {
    var sh = ss.getSheetByName(nazwa) || ss.insertSheet(nazwa);
    if (sh.getLastRow() === 0) { sh.appendRow(NAGLOWKI[nazwa]); sh.setFrozenRows(1); }
  });
  var domyslny = ss.getSheetByName('Arkusz1') || ss.getSheetByName('Sheet1');
  if (domyslny && ss.getSheets().length > 1) ss.deleteSheet(domyslny);
  return ss;
}

function pobierzKanal_() {
  var odp = UrlFetchApp.fetch(KONFIG.KANAL + '?t=' + Date.now(), { muteHttpExceptions: true });
  if (odp.getResponseCode() !== 200) throw new Error('Nie udało się pobrać ' + KONFIG.KANAL + ': HTTP ' + odp.getResponseCode());
  var dane = JSON.parse(odp.getContentText());
  if (!dane.strona) dane.strona = KONFIG.KANAL.replace(/\/seminaria\/powiadomienia\.json.*$/, '');
  return dane;
}

function seminariumZKanalu_(id) {
  var cache = CacheService.getScriptCache();
  var lista = cache.get('seminaria');
  if (!lista) {
    lista = JSON.stringify(pobierzKanal_().seminaria);
    cache.put('seminaria', lista, 600);
  }
  return JSON.parse(lista).filter(function (s) { return s.id === id; })[0] || null;
}

function wartosciKolumny_(sh, kol) {
  var n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, kol, n - 1, 1).getValues().map(function (x) { return x[0]; });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
