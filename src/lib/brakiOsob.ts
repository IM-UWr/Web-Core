// Zlecenie 42: funkcje bez osoby na danej stronie — dla plakietki stanu budowy na Podglądzie (StanBudowy.astro, wiersz z linkiem
// „Popraw w CMS”). Liczy je od nowa z danych tymi samymi funkcjami co widoki (osobySpisu.ts), raz na budowę, więc wynik nie zależy
// od tego, czy plakietka renderuje się przed treścią strony, czy po niej.
import { zaklady, seminaria, widoczny } from './tresci';
import { specjalnosci } from './specjalnosci';
import { wszyscyPracownicy, kierownikZakladu, koordynatorzySeminarium, zebraneBraki, wszystkieBraki, type BrakOsoby } from './osobySpisu';
import { daneWladz } from './widoki/wladze';
import { daneSpecjalnosci } from './widoki/specjalnosc';

let policzone: Promise<void> | undefined;
async function policz() {
  const wszyscy = await wszyscyPracownicy();
  for (const z of await zaklady()) kierownikZakladu(z, wszyscy);
  for (const s of await seminaria()) koordynatorzySeminarium(s, wszyscy, 'pl');
  await daneWladz('pl');
  for (const s of await specjalnosci()) if (widoczny(s) && !s.data.bez_podstrony && s.data.opiekunowie.some((o) => o.osoba)) await daneSpecjalnosci(s, 'pl');
}

/** Braki osób na stronie o adresie `adres` (bez /en i bazy). Lista zakładów i lista seminariów pokazują braki swoich podstron. */
export async function brakiNaStronie(adres: string): Promise<BrakOsoby[]> {
  policzone ??= policz();
  await policzone;
  const listy: Record<string, string> = { '/instytut/zaklady': '/instytut/zaklady/', '/seminaria': '/seminaria/' };
  const pod = listy[adres];
  return pod ? [...zebraneBraki(adres), ...zebranePodstron(pod)] : zebraneBraki(adres);
}

function zebranePodstron(przedrostek: string): BrakOsoby[] {
  return wszystkieBraki().filter((b) => b.adres.startsWith(przedrostek));
}
