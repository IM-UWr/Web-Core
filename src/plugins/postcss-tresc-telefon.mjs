// Widok telefonu tylko dla treści podstrony (zlecenie 25, punkt 1). Gdy nawet po zwinięciu pola „Na tej stronie” pozycje z limitem linii się nie mieszczą,
// skrypt w zal/Podstrona.astro stawia na .z-pd atrybut data-tresc="telefon". Nagłówek, pasek i stopka zostają wtedy w widoku komputera, a w treści obowiązują
// reguły telefonu. Żeby nie przepisywać ich ręcznie, ta wtyczka przy budowaniu robi z każdego arkusza dwie rzeczy (zapytań w CSS nie da się włączyć atrybutem):
// - każdą regułę z @media telefonu powtarza w @media komputera, zawężoną do poddrzewa z atrybutem;
// - z reguł w @media komputera (także węższych, np. od 1180 px) wyłącza to poddrzewo.
// Dodatki są w :where(), więc nie zmieniają mocy selektorów, a kolejność reguł zostaje, bo kopia stoi tuż za oryginałem.
// Reguły nie dotyczą niczego poza .z-pd: na przykład :root albo .z-nast nie pasują do poddrzewa i zostają jak na komputerze.
// Własna wtyczka PostCSS bez nowej zależności: PostCSS przychodzi z Vite, a tu używane jest tylko API węzłów.
// Zapytania: ten sam tekst co MQ_TELEFON i MQ_KOMPUTER w src/lib/media.ts.
const MQ_TELEFON = '(max-width: 1023px), (max-height: 500px) and (pointer: coarse)';
const MQ_KOMPUTER = '(min-width: 1024px) and (min-height: 501px), (min-width: 1024px) and (pointer: fine)';

const ZNACZNIK = '[data-tresc=telefon]';
const W_TRESCI = `:where(${ZNACZNIK},${ZNACZNIK} *)`;
const POZA_TRESCIA = `:where(:not(${ZNACZNIK},${ZNACZNIK} *))`;

const zwykly = (s) => s.replace(/\s+/g, ' ').trim();
// Pseudoelement musi zostać na końcu selektora, więc dodatek idzie przed nim.
const dopisz = (selektor, dodatek) => {
  const m = selektor.match(/::[\w-]+(\([^)]*\))?\s*$/);
  return m ? selektor.slice(0, m.index) + dodatek + m[0] : selektor + dodatek;
};
const wKlatkach = (rule) => {
  for (let p = rule.parent; p; p = p.parent) if (p.type === 'atrule' && /keyframes$/i.test(p.name)) return true;
  return false;
};
const zawez = (wezel, dodatek) => wezel.walkRules((rule) => {
  if (!wKlatkach(rule)) rule.selectors = rule.selectors.map((s) => dopisz(s, dodatek));
});
const komputerowe = (params) => [...params.matchAll(/min-width:\s*(\d+)px/g)].some((m) => Number(m[1]) >= 1024);

export default function trescTelefon() {
  return {
    postcssPlugin: 'tresc-telefon',
    Once(root) {
      // Style z plików .astro przechodzą przez PostCSS dwa razy (Astro, potem Vite): drugi raz nic nie dodajemy. Ręczne reguły nie używają :where() z tym atrybutem.
      if (/:where\(\s*(:not\(\s*)?\[data-tresc/.test(root.toString())) return;
      const telefonu = [];
      const komputera = [];
      root.walkAtRules('media', (at) => {
        const params = zwykly(at.params);
        if (params === MQ_TELEFON) telefonu.push(at);
        else if (komputerowe(params)) komputera.push(at);
      });
      komputera.forEach((at) => {
        // blok zagnieżdżony w innym bloku komputera jest już zawężony przez zewnętrzny
        for (let p = at.parent; p; p = p.parent) if (komputera.includes(p)) return;
        zawez(at, POZA_TRESCIA);
      });
      telefonu.forEach((at) => {
        const kopia = at.clone({ params: MQ_KOMPUTER });
        zawez(kopia, W_TRESCI);
        at.after(kopia);
      });
    },
  };
}
trescTelefon.postcss = true;
