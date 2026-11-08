import test from 'node:test';
import assert from 'node:assert/strict';
import { widoczneMenu, kafelkiMenu, pozycjaRekrutacji } from './nawigacja.mjs';

test('Ręczna kolejność, grupy i linki; brak wpisów domyślnych', () => {
  const menu = [
    { etykieta: 'Drugi', adres: '/drugi', grupy: [
      { nazwa: 'B', linki: [{ adres: '/b' }, { adres: '/ukryty', w_menu: false }, { adres: '/a' }] },
      { nazwa: 'Ukryta', w_menu: false, linki: [{ adres: '/c' }] },
    ] },
    { etykieta: 'Ukryty', adres: '/ukryty', w_menu: false },
    { etykieta: 'Pierwszy', adres: '/pierwszy' },
  ];
  const before = structuredClone(menu);
  const result = widoczneMenu(menu);
  assert.deepEqual(result.map((m) => m.adres), ['/drugi', '/pierwszy']);
  assert.deepEqual(result[0].grupy.map((g) => g.nazwa), ['B']);
  assert.deepEqual(result[0].grupy[0].linki.map((l) => l.adres), ['/b', '/a']);
  assert.deepEqual(menu, before);
  assert.deepEqual(widoczneMenu([]), []);
});

test('Kafelek może istnieć bez menu; nic nie jest dopisywane z kolekcji', () => {
  const menu = [{ adres: '/studia', grupy: [{ linki: [
    { adres: '/b', etykieta: 'B', w_menu: false, na_stronie_glownej: true, kafelek_nazwa: 'Kafel B', kafelek_nazwa_en: 'Card B' },
    { adres: '/a', etykieta: 'A' },
    { adres: '/c', etykieta: 'C', etykieta_en: 'C EN', opis: 'Opis', opis_en: 'Description', na_stronie_glownej: true },
  ] }] }];
  assert.deepEqual(kafelkiMenu(menu).map((k) => k.adres), ['/b', '/c']);
  assert.equal(kafelkiMenu(menu)[0].nazwa_en, 'Card B');
  assert.equal(kafelkiMenu(menu)[1].opis_en, 'Description');
  assert.deepEqual(kafelkiMenu([]), []);
});

test('Usunięty adres rekrutacji nie wraca jako automatyczna pozycja', () => {
  assert.equal(pozycjaRekrutacji([]), undefined);
  const link = { etykieta: 'Dla kandydatów', adres: 'https://example.org', rekrutacja: true };
  assert.equal(pozycjaRekrutacji([link]), link);
});
