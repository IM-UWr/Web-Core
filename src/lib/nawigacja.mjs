// Ręczne dane, bez kolekcji kierunków i bez dopisywania pozycji.
export function widoczneMenu(menu) {
  return menu.filter((m) => m.w_menu !== false).map((m) => ({
    ...m,
    ...(m.grupy ? { grupy: m.grupy.filter((g) => g.w_menu !== false).map((g) => ({
      ...g, linki: (g.linki ?? []).filter((l) => l.w_menu !== false),
    })).filter((g) => g.linki.length > 0) } : {}),
  }));
}

/** Jawnie wybrane kafelki, niezależne od widoczności pozycji w menu. */
export function kafelkiMenu(menu) {
  return menu.flatMap((m) => (m.grupy ?? []).flatMap((g) => g.linki ?? []))
    .filter((l) => l.na_stronie_glownej === true)
    .map((l) => ({
      adres: l.adres,
      nazwa: l.kafelek_nazwa || l.etykieta,
      nazwa_en: l.kafelek_nazwa_en || l.etykieta_en || l.kafelek_nazwa || l.etykieta,
      poziom: l.kafelek_poziom || '',
      poziom_en: l.kafelek_poziom_en || l.kafelek_poziom || '',
      opis: l.kafelek_opis || l.opis || '',
      opis_en: l.kafelek_opis_en || l.opis_en || l.kafelek_opis || l.opis || '',
    }));
}

export const pozycjaRekrutacji = (menu) => menu.find((m) => m.rekrutacja === true && m.adres);
