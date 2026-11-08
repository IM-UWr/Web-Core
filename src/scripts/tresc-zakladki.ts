// Każdy jawny blok zakładek działa niezależnie. Bez JS wszystkie panele pozostają widoczne.
for (const group of document.querySelectorAll<HTMLElement>('.tresc .tresc-taby[role="tablist"]')) {
  const tabs = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  // Inne przełączniki (np. semestrów kalendarza) mają własną obsługę.
  if (!tabs[0]?.id.startsWith('blok-') && !group.closest('[data-kierunek], [data-specjalnosc]')) continue;
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls') ?? ''));
  const pokaz = (i: number) => {
    tabs.forEach((tab, j) => {
      tab.setAttribute('aria-selected', String(i === j));
      tab.tabIndex = i === j ? 0 : -1;
      if (panels[j]) panels[j]!.hidden = i !== j;
    });
  };
  pokaz(0);
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => pokaz(i));
    tab.addEventListener('keydown', (event) => {
      let j: number;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') j = (i + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      else if (event.key === 'Home') j = 0;
      else if (event.key === 'End') j = tabs.length - 1;
      else return;
      event.preventDefault();
      pokaz(j);
      tabs[j].focus();
    });
  });
}
