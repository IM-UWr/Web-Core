# Wstawia ciekawostki patronów do prototypu (widok „Ciekawostki”). Uruchamiać ponownie po aktualizacji wyników agentów.
import json, os, re, sys
SRC = sys.argv[1] if len(sys.argv) > 1 else 'proto/zalozyciele.src.html'  # uruchamiać z katalogu głównego gałęzi kopii
CK = sys.argv[2] if len(sys.argv) > 2 else 'ciekawostki'
s = open(SRC, encoding='utf-8').read()
POLA = ['id', 'nazwa', 'rok', 'zdanie', 'notka', 'rodzaj', 'pewnosc', 'zrodla', 'podstrona', 'dlaczego_tu', 'przypiecie', 'sciezki']
dane = {}
for dz, kat in [('instytut', 'marczewski'), ('nauka', 'slebodzinski'), ('studia', 'knaster'), ('popularyzacja', 'steinhaus')]:
    p = f'{CK}/{kat}/ciekawostki.json'
    dane[dz] = [{k: x[k] for k in POLA if k in x} for x in json.load(open(p, encoding='utf-8'))] if os.path.exists(p) else []
js = json.dumps(dane, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
blok = f'/* CIEK-DANE-START */ const CIEK = {js}; /* CIEK-DANE-KONIEC */'
if 'CIEK-DANE-START' in s:
    s = re.sub(r'/\* CIEK-DANE-START \*/.*?/\* CIEK-DANE-KONIEC \*/', lambda m: blok, s, flags=re.S)
else:
    # 1. przycisk widoku
    a = '      <button type="button" id="w-przyciski" class="ustalone" data-v="przyciski" aria-pressed="false">Przyciski</button>\n'
    assert a in s; s = s.replace(a, a + '      <button type="button" id="w-ciekawostki" data-v="ciekawostki" aria-pressed="false">Ciekawostki</button>\n')
    # 2. kontener widoku
    a = '      <!-- ============ PRZYCISKI: dziś (okrągłe) i po zmianie (styl z Planu zajęć) ============ -->'
    assert a in s; s = s.replace(a, '      <!-- ============ CIEKAWOSTKI PATRONÓW (5.11): galeria + nagłówek podstrony ============ -->\n      <div class="widok" id="v-ciekawostki" hidden></div>\n\n' + a)
    # 3. CSS
    css = '''/* ciekawostki patronów (5.11): galeria i podgląd w nagłówku podstrony */
#v-ciekawostki .in-strona { min-height: 100%; }
.ck-gora { padding: 40px var(--marg) 26px; }
.ck-gora h2 { margin: 0 0 6px; font-family: var(--f-display); font-weight: 500; font-size: 40px; line-height: 1.15; color: var(--m-ink); }
.ck-gora p { margin: 0 0 18px; max-width: 900px; font-size: 16px; line-height: 1.6; color: var(--m-muted); }
.ck-gora .pk-seg button small { margin-left: 6px; font-weight: 500; opacity: .75; }
.ck-baner-op { padding: 14px var(--marg) 0; font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: var(--d-a); }
.ck-siatka { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; padding: 30px var(--marg) 90px; }
.ck-k { display: grid; grid-template-columns: 118px minmax(0, 1fr); gap: 16px; padding: 16px; border: 1px solid var(--m-line); background: var(--m-bg); cursor: pointer; transition: border-color .15s, box-shadow .15s; }
.ck-k:hover { border-color: var(--d-a); }
.ck-k.wybrana { border-color: var(--d-a); box-shadow: inset 0 0 0 1px var(--d-a); }
.ck-k svg { width: 118px; height: 142px; background: color-mix(in srgb, var(--d-t) 60%, var(--m-bg)); }
.ck-k svg path { fill: none; stroke: color-mix(in srgb, var(--d-a) 55%, transparent); stroke-width: 1.2; vector-effect: non-scaling-stroke; stroke-linecap: round; stroke-linejoin: round; }
.ck-k svg path.gruba { stroke: var(--d-a); stroke-width: 2; }
.ck-k .ck-m { margin: 0 0 4px; font-size: 12px; font-weight: 600; color: var(--m-muted); }
.ck-k .ck-m .nr { display: inline-block; min-width: 20px; margin-right: 6px; padding: 0 5px; background: var(--d-a); color: #fff; text-align: center; }
.ck-k .ck-m .spr { color: #b06a00; }
.ck-k h3 { margin: 0 0 6px; font-family: var(--f-display); font-weight: 500; font-size: 21px; line-height: 1.25; color: var(--m-ink); }
.ck-k h3 small { font-family: var(--f-text); font-size: 13px; font-weight: 600; color: var(--m-muted); }
.ck-k .ck-zd { margin: 0 0 8px; font-size: 15px; line-height: 1.5; color: var(--m-ink); }
.ck-k .ck-pod { margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: var(--m-muted); }
.ck-k .ck-pod b { color: var(--d-a); }
.ck-k details summary { cursor: pointer; font-size: 13px; font-weight: 600; color: var(--d-a); }
.ck-k details p { margin: 8px 0; font-size: 14px; line-height: 1.55; color: var(--m-text, var(--m-ink)); }
.ck-k details ul { margin: 0; padding-left: 18px; font-size: 12.5px; line-height: 1.5; }
.ck-k details a { color: var(--d-a); word-break: break-all; }
.ck-brak { padding: 30px var(--marg); font-size: 17px; color: var(--m-muted); }

'''
    a = '/* overflow: clip zamiast hidden na ramce podglądu'
    assert a in s; s = s.replace(a, css + a, 1)
    # 4. nagłówek podstrony z nadpisaniem (tytuł + znak z ciekawostki)
    a = "    const P = podstrona(dz), f = IN_FOTO[dz], z = znakPod(dz), L = !!(P.liczby && P.liczby.length);"
    assert a in s; s = s.replace(a, "    const P0 = podstrona(dz), P = pdNadpis ? { ...P0, tytul: pdNadpis.tytul, liczby: [] } : P0, f = IN_FOTO[dz], z = pdNadpis ? pdNadpis.z : znakPod(dz), L = !!(P.liczby && P.liczby.length);")
    a = "  function htmlBanerPod(dz) {"
    s = s.replace(a, "  let pdNadpis = null;\n" + a, 1)
    # 5. widok
    funkcje = r'''
  /* ---------- ciekawostki patronów (5.11) ---------- */
  ''' + blok + r'''
  const CK_PAT = [['instytut', 'Marczewski'], ['nauka', 'Ślebodziński'], ['studia', 'Knaster'], ['popularyzacja', 'Steinhaus']];
  let ckDz = 'instytut', ckNr = 0;
  const ckEsc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ckSvg = (c) => c.sciezki.map((p) => `<path d="${p.d}"${p.gruba ? ' class="gruba"' : ''}/>`).join('');
  const ckTytul = (c) => !c.podstrona || /^zapas/i.test(c.podstrona) ? 'Podstrona (zapas)' : c.podstrona.replace(/\s*\(.*?\)\s*$/, '');
  function ckBaner() {
    const c = (CIEK[ckDz] || [])[ckNr];
    if (!c) return '<p class="ck-brak">Agent od tego patrona jeszcze pracuje. Ciekawostki pojawią się tu po jego zakończeniu.</p>';
    pdNadpis = { tytul: ckEsc(ckTytul(c)), z: { ps: c.sciezki, n: ckEsc(c.nazwa + (c.rok ? ', ' + c.rok : '')), f: ckEsc(c.zdanie) } };
    const h = htmlBanerPod(ckDz).replace(/ data-strona="dzial"/g, '');
    pdNadpis = null;
    return `<p class="ck-baner-op">W nagłówku podstrony: ${ckEsc(ckTytul(c))}</p><div id="ck-baner">${h}</div>`;
  }
  function rysujCiekawostki() {
    const L = CIEK[ckDz] || [];
    $('#v-ciekawostki').innerHTML = `<div class="in-strona" data-dzial="${ckDz}">
      <div class="ck-gora"><h2>Ciekawostki patronów i ich symbole</h2>
        <p>Wyniki agentów (5.11, w nocy): ciekawostka matematyczna albo historyczna z rysunkiem dla każdej podstrony działu, plus zapas. Kliknij kartę, żeby zobaczyć ją w nagłówku podstrony (pod spodem ten sam nagłówek co w widoku „Strona działu”). „Więcej i źródła” rozwija notkę i linki.</p>
        <div class="pk-seg ck-pat">${CK_PAT.map(([d, n]) => `<button type="button" data-ck-dz="${d}" aria-pressed="${d === ckDz}">${n}<small>${(CIEK[d] || []).length || 'w toku'}</small></button>`).join('')}</div></div>
      <div id="ck-gora-baner">${ckBaner()}</div>
      <div class="ck-siatka">${L.map((c, i) => `<article class="ck-k${i === ckNr ? ' wybrana' : ''}" data-ck="${i}">
        <svg viewBox="0 0 200 240" aria-hidden="true">${ckSvg(c)}</svg>
        <div><p class="ck-m"><span class="nr">${i + 1}</span>${ckEsc(c.rodzaj)}${c.pewnosc && c.pewnosc !== 'pewne' ? ` · <span class="spr">${ckEsc(c.pewnosc)}</span>` : ''}</p>
          <h3>${ckEsc(c.nazwa)} <small>${ckEsc(c.rok)}</small></h3>
          <p class="ck-zd">${ckEsc(c.zdanie)}</p>
          <p class="ck-pod">Podstrona: <b>${ckEsc(c.podstrona)}</b>${c.dlaczego_tu ? ` — ${ckEsc(c.dlaczego_tu)}` : ''}</p>
          <details><summary>Więcej i źródła</summary><p>${ckEsc(c.notka)}</p><ul>${(c.zrodla || []).map((u) => `<li><a href="${ckEsc(u)}" target="_blank" rel="noopener">${ckEsc(u)}</a></li>`).join('')}</ul></details></div></article>`).join('')}</div></div>`;
  }
  document.addEventListener('click', (e) => {
    const p = e.target.closest('[data-ck-dz]');
    if (p) { ckDz = p.dataset.ckDz; ckNr = 0; rysujCiekawostki(); skaluj(); return; }
    const k = e.target.closest('.ck-k');
    if (!k || e.target.closest('a, summary, details')) return;
    ckNr = Number(k.dataset.ck);
    document.querySelectorAll('.ck-k').forEach((x) => x.classList.toggle('wybrana', x === k));
    $('#ck-gora-baner').innerHTML = ckBaner();
    $('#ck-gora-baner').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

'''
    a = "  /* ---------- przełączniki ---------- */"
    assert a in s; s = s.replace(a, funkcje + a, 1)
    # 6. pokaz()
    a = "['okladka', 'instytut', 'glowna', 'dzial', 'telefon', 'przyciski'].forEach((v) => { $('#v-' + v).hidden = v !== widok; });"
    assert a in s; s = s.replace(a, "['okladka', 'instytut', 'glowna', 'dzial', 'telefon', 'przyciski', 'ciekawostki'].forEach((v) => { $('#v-' + v).hidden = v !== widok; });")
    a = "$('#scena').style.width = widok === 'okladka' || widok === 'instytut' ? ekran[0] + 'px' : '';"
    assert a in s; s = s.replace(a, "$('#scena').style.width = widok === 'okladka' || widok === 'instytut' || widok === 'ciekawostki' ? ekran[0] + 'px' : '';")
    for nm in ['wybor-dzialu', 'wybor-przejscia']:
        a = f"$('#{nm}').hidden = widok === 'glowna' || widok === 'okladka' || widok === 'przyciski';"
        assert a in s; s = s.replace(a, f"$('#{nm}').hidden = widok === 'glowna' || widok === 'okladka' || widok === 'przyciski' || widok === 'ciekawostki';")
    a = "    if (widok === 'przyciski') { rysujPrzyciski();"
    assert a in s; s = s.replace(a, "    if (widok === 'ciekawostki') { rysujCiekawostki(); $('#podpowiedz').textContent = 'Wybierz patrona, kliknij kartę: ciekawostka pojawi się w nagłówku podstrony nad galerią.'; }\n" + a)
open(SRC, 'w', encoding='utf-8').write(s)
print('ok', {k: len(v) for k, v in dane.items()})
