// Skrypty w linii „Warto wiedzieć” (zlecenie 47; wzory: OS_JS, GLOWNA_JS, inne_sylwetki i źródła w prototypie build.py).
// Logika (rozsuwanie punktów, rocznice, „Nowe”, wybór na stronę główną) jest w czystych funkcjach src/lib/ww.mjs (testy:
// src/plugins/ww.test.mjs); tu trafia do przeglądarki przez Function.prototype.toString() — funkcje są samowystarczalne.
// Każdy skrypt stoi w HTML zaraz za swoim elementem (document.currentScript), działa przed narysowaniem strony i nie wymaga
// niczego więcej. Bez JS: oś czasu to lista wydarzeń, rząd na stronie głównej i „Inne sylwetki” — wybór z budowy, bez „Nowe”.
import { rozsun, startOsi, rocznicaBlisko, dzisWarszawa, nowe, wybierzNaGlowna, napisNaGlowna } from './ww.mjs';
import { MQ_KOMPUTER } from './media';
import type { Lang } from './daty';

const f = (fn: (...a: any[]) => unknown) => `(${fn.toString()})`;

/** Oś czasu historii: rozsuwanie punktów (30 px, na wąskim torze 24 px), panel z jedną kartą, mysz / dotyk / klawiatura, start od rocznicy. */
export const OS_JS = `(function(o,rozsun,startOsi,rocznicaBlisko,dzis){if(!o)return;o.classList.add('js');` +
  `var tor=o.querySelector('.ww2-ol-tor'),P=[].slice.call(o.querySelectorAll('.ww2-ol-pkt')),K=[].slice.call(o.querySelectorAll('.ww2-ol-karta')),` +
  `L=o.querySelector('[data-ww2-ol-licz]'),cur=-1,typ='mouse',przed=-1;if(!P.length)return;` +
  `var od=+o.dataset.od,dok=+o.dataset.do;` +
  `function uloz(){var W=tor.clientWidth,pad=Math.max(15,W*0.03),gap=W<560?24:30;` +
  `var x=P.map(function(p){return pad+(+p.dataset.rok-od)/(dok-od)*(W-2*pad)});x=rozsun(x,gap,15,W-15);` +
  `P.forEach(function(p,i){p.style.left=x[i]+'px'})}` +
  `function pokaz(i){if(i<0)i=P.length-1;if(i>=P.length)i=0;cur=i;P.forEach(function(p,j){p.classList.toggle('on',j===i);if(j===i)p.setAttribute('aria-current','true');else p.removeAttribute('aria-current')});` +
  `K.forEach(function(k,j){k.classList.toggle('on',j===i)});if(L)L.textContent=(i+1)+' / '+P.length}` +
  `P.forEach(function(p,i){p.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')pokaz(i)});` +
  // dotyk/pióro: pierwsze stuknięcie pokazuje kartę, drugie (w ten sam, już pokazany punkt) przechodzi do strony; „przed” = punkt
  // pokazany w chwili dotknięcia, bo fokus (między pointerdown a click) sam przełącza kartę — porównanie z „cur” zawsze by przepuszczało
  `p.addEventListener('pointerdown',function(e){typ=e.pointerType;przed=cur});p.addEventListener('focus',function(){pokaz(i)});` +
  `p.addEventListener('click',function(e){if(typ!=='mouse'&&przed!==i){e.preventDefault();pokaz(i)}typ='mouse'});` +
  `p.addEventListener('keydown',function(e){var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();P[(i+d+P.length)%P.length].focus()}})});` +
  `o.querySelectorAll('[data-ww2-ol-kier]').forEach(function(b){b.addEventListener('click',function(){pokaz(cur+(+b.dataset.ww2OlKier))})});` +
  `uloz();pokaz(startOsi(P.map(function(p){return p.dataset.rocznica||''}),dzis(),rocznicaBlisko));` +
  `var sz=tor.clientWidth;addEventListener('resize',function(){if(tor.clientWidth!==sz){sz=tor.clientWidth;uloz()}})` +
  `})(document.currentScript.previousElementSibling,${f(rozsun)},${f(startOsi)},${f(rocznicaBlisko)},${f(dzisWarszawa)});`;

/**
 * Rząd na stronie głównej: komputer 4 miejsca, telefon 3 (ta sama lista i ta sama funkcja wyboru), napis nad tytułem
 * („140. urodziny · 14 stycznia”, „Nowa sylwetka”). Pozycje w HTML: data-rocznica, data-rok, data-urodziny, data-sylwetka,
 * data-zawsze, data-dodano, data-waga.
 */
export const glownaJs = (lang: Lang) => `(function(box,wybierz,napis,pom,dzis){if(!box)return;` +
  `var el=[].slice.call(box.children),n=matchMedia('${MQ_KOMPUTER}').matches?+box.dataset.losuj:3;` +
  `var poz=el.map(function(e){var d=e.dataset;return{rocznica:d.rocznica||'',rok:+d.rok||0,zawsze:e.hasAttribute('data-zawsze'),dodano:d.dodano||'',waga:+d.waga||1}});` +
  `var w=wybierz(poz,dzis(),n,pom,Math.random);` +
  `el.forEach(function(e){e.hidden=true;var o=e.querySelector('.ww2-ozn');if(o)o.remove()});` +
  `w.forEach(function(x){var e=el[x.i],t=napis(x.napis,e.hasAttribute('data-urodziny'),e.hasAttribute('data-sylwetka'),'${lang}');e.hidden=false;` +
  `if(t){var i=document.createElement('i');i.className='ww2-ozn';i.textContent=t;e.querySelector('.t').prepend(i)}box.appendChild(e)})` +
  `})(document.currentScript.previousElementSibling,${f(wybierzNaGlowna)},${f(napisNaGlowna)},{rocznicaBlisko:${f(rocznicaBlisko)},nowe:${f(nowe)}},${f(dzisWarszawa)});`;

/** „Inne sylwetki”: przy każdym wejściu 4 losowe z pełnej listy (bez JS: 4 wybrane stałym ziarnem przy budowie). */
export const INNE_JS = `(function(u){if(!u)return;var l=[].slice.call(u.children),n=+u.dataset.ww2Losuj;` +
  `for(var i=l.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),x=l[i];l[i]=l[j];l[j]=x}` +
  `l.forEach(function(e,k){e.hidden=k>=n;if(k<n)u.appendChild(e)})})(document.currentScript.previousElementSibling);`;

/** Znaczek „Nowe” na kartach sylwetek: 30 dni od „Dodano” (Europe/Warsaw), znika sam, bez przebudowy. */
export const NOWE_JS = `(function(r,nowe,dzis){if(!r)return;var d=dzis();` +
  `r.querySelectorAll('[data-dodano]').forEach(function(e){e.hidden=!nowe(e.getAttribute('data-dodano'),d)})` +
  `})(document.currentScript.previousElementSibling,${f(nowe)},${f(dzisWarszawa)});`;

/** „Źródła” zwinięte: link „Źródła” w spisie i adres #zrodla je rozwijają; napis „rozwiń” / „zwiń” w nagłówku. */
export const zrodlaJs = (lang: Lang) => {
  const [r, z] = lang === 'en' ? ['show', 'hide'] : ['rozwiń', 'zwiń'];
  return `(function(d){if(!d)return;function o(){if(location.hash==='#zrodla')d.open=true}o();addEventListener('hashchange',o);` +
    `document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href$="#zrodla"]');if(a)d.open=true});` +
    `var s=d.querySelector('[data-ww2-zrodla-stan]');d.addEventListener('toggle',function(){if(s)s.textContent=d.open?'${z}':'${r}'})` +
    `})(document.currentScript.previousElementSibling);`;
};
