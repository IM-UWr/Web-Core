# Ściągawka edytora: kierunki, specjalności, strony działów i strony

Strona kierunku (np. `/studia/matematyka`) to jeden tekst: pole **Treść** w Pages CMS (Web-Studia → Kierunki → Treść), po angielsku pole **Treść EN**. Ten sam tekst jest w opisie pola „Treść” w formularzu (zlecenie 28). Tak samo strona specjalności (Web-Spec-* → „Specjalność: …” → Treść) i tekst „O popularyzacji” (Web-Popularyzacja → Strona działu Popularyzacja) — zlecenie 29; różnice niżej.

> Piszesz jak w zwykłym edytorze. Kilka układów strona rozpoznaje sama:
> • Nagłówek 2 = nowa sekcja (pojawi się w spisie „Na tej stronie”).
> • Punkt listy zaczynający się pogrubieniem = kafelek (np. „Dlaczego warto”).
> • Lista numerowana z pogrubionym początkiem = oś kroków. W pogrubieniu tekst przed dwukropkiem to mała etykieta: „Semestry 1–2: Podstawy”.
> • W punkcie linia „Termin: …” albo „Formularz: …” = para; sam link w linii = przycisk. Kolejną linię w tym samym punkcie dodasz Shift+Enter (zwykły Enter też zadziała).
> • Nagłówek 3 zakończony znakiem „?” = rozwijane pytanie.
> • Lista samych linków = lista plików (PDF / strona).
> • Punkt z rolą kursywą i nazwiskiem pogrubionym = kontakt.
> • Pod nagłówkiem „Specjalności” strona sama wstawi kafelki specjalności; pod „Program studiów” nagłówki 3 stają się zakładkami.
> • Plik PDF: wgraj w „Media” i wklej link.
> • Akapit zaczynający się od dwuliterowego skrótu z kropką („Np.”, „Dr.”, „No.”) edytor zapisze jako listę numerowaną „1.” — zacznij akapit inaczej albo pogrub skrót.

Ostatni punkt to cecha edytora Pages CMS (TipTap 3: „Np. ” na początku akapitu bierze za punkt listy „a.”, „b.”), a nie strony; po zapisie słowa nie da się odtworzyć. W środku akapitu i w nowej linii po Shift+Enter skróty są bezpieczne.

**Specjalność** — w opisie pola „Treść” zamiast punktu o „Specjalnościach” i „Programie studiów”:

> • Lista samych linków = lista plików (PDF / strona); w sekcji „Przydatne strony” — zwykłe linki.
> • Cytat zaczynający się pogrubionym „Dla kogo” = ramka. Zwykła lista w „Co będziesz umieć” i „Przykładowe tematy prac” = lista z kreskami; w temacie „Tytuł — dopisek” dopisek jest szary.
> • Pod nagłówkami „Seminaria” i „Opiekun specjalności” (albo „Opiekunowie specjalności”) strona sama wstawi seminaria i opiekunów z formularza „Baner i kafelek”, a ramkę „Wybór specjalności” — na końcu „Jak przebiega specjalność” (albo pod nagłówkiem „Wybór specjalności”). Bez takiego nagłówka wstawi je w zwykłym miejscu.
> • Stały adres (kotwicę, np. #seminaria) mają sekcje o nagłówkach: O specjalności, Przydatne strony, Dlaczego warto, Jak przebiega specjalność, Wybór specjalności, Czego się uczysz, Co będziesz umieć, Po studiach, Przykładowe tematy prac, Seminaria, Dokumenty, Pytania i odpowiedzi, Opiekun specjalności.

Po angielsku nagłówki: About, Useful pages, Why choose it, How the specialisation works, What you will learn, Skills, Careers, Sample thesis topics, Seminars, Documents, FAQ, Coordinator; ramka — cytat z pogrubionym „Who is it for”.

**Popularyzacja** — tekst „O popularyzacji” to jedna sekcja bez kotwic (nagłówki nie są potrzebne); pierwszy akapit strona pokazuje większą czcionką. Działają kafelki i listy plików.

**Strony działów i strony z listą** (zlecenie 30) — strona działu Instytut, Nauka i Studia (Web-Instytut / Web-Nauka / Web-Studia → „Strona działu …”) to jeden tekst jak „O popularyzacji”: bloki działają zawsze, pierwszy akapit jest większy. Tytuł, opis, hasło i tekst nad listą stron Seminaria, Konferencje, Projekty i granty, Sukcesy, Publikacje, Obrony doktorskie, Aktualności, Pracownicy, Struktura i zakłady, Warto wiedzieć i Plan zajęć to zwykłe strony w kolekcji „Strony” repozytorium, z którego pochodzi lista, pod adresem strony z listą (np. `nauka/konferencje.md` → `/nauka/konferencje`). Brak takiej strony nic nie psuje: lista ma domyślny tytuł i hasło, bez tekstu. Na zwykłych stronach bloki działają, gdy włączone jest pole „Bloki” („Kafelki, oś i kontakty z list”).

Zasada **tekstu nad listą: lista stoi pod całym tekstem, chyba że jest kotwica** — sekcja pod nagłówkiem 2 o nazwie kotwicy idzie na miejsce swojej listy. Kotwice: „Ostatnie sukcesy” („Recent achievements”) na stronie działu Instytut — zdanie nad ostatnimi sukcesami; „Czasopisma redagowane w Instytucie” („Journals edited at the Institute”) na stronie Publikacje — tekst nad listą czasopism (nagłówek sekcji na stronie = nagłówek z tekstu).

Krótka ściągawka w opisie pola „Treść” stron i stron działów:

> Piszesz jak w zwykłym edytorze; akapity oddziela Enter. Nagłówek 2 = nowa sekcja (pojawi się w spisie „Na tej stronie”).
> Gdy włączone jest pole „Bloki” (niżej), kilka układów strona rozpoznaje sama (strona działu: zawsze):
> • Punkt listy zaczynający się pogrubieniem = kafelek.
> • Lista numerowana z pogrubionym początkiem = oś kroków.
> • Punkt z rolą kursywą i nazwiskiem pogrubionym = kontakt.
> • Lista samych linków = lista plików (PDF / strona).
> • Nagłówek 3 zakończony znakiem „?” = rozwijane pytanie.
> • Tekst nad listą (Seminaria, Konferencje, Aktualności…): lista stoi pod całym tekstem, chyba że jest kotwica — np. na stronie Publikacje tekst pod nagłówkiem 2 „Czasopisma redagowane w Instytucie” stoi nad listą czasopism.
> • Plik PDF: wgraj w „Media” i wklej link.
> • Akapit zaczynający się od dwuliterowego skrótu z kropką („Np.”, „Dr.”, „No.”) edytor zapisze jako listę numerowaną „1.” — zacznij akapit inaczej albo pogrub skrót.

## Przykłady (tak wygląda tekst w Markdownie)

Kolejne linie jednego punktu kończą się dwiema spacjami: tak edytor zapisuje Shift+Enter (w edytorze ich nie widać). Linia bez nich w pliku Markdown sklei się z poprzednią.

Kafelki:

```markdown
## Dlaczego warto

- **Kategoria A+** — Najwyższa ocena naukowa dyscypliny w Polsce.
- **Pomoc na starcie** — Kurs wyrównawczy i tutornia.
```

Oś kroków z parą i przyciskiem (kolejne linie punktu: Shift+Enter):

```markdown
1. **Semestry 3–4: Wybór specjalności** — Pod koniec 4. semestru wybierasz specjalność.  
   Termin: do 30 czerwca  
   [Formularz C2](https://forms.cloud.microsoft/e/SWEQQ1YF5L)
```

Pytanie:

```markdown
### Kiedy wybieram specjalność?

Pod koniec 4. semestru (formularz C2, do 30 czerwca).
```

Kontakt:

```markdown
- *Sekretariat dydaktyczny*  
  **Justyna Jędrzejewska-Idczak**  
  e-mail: [Justyna.Jedrzejewska-Idczak@uwr.edu.pl](mailto:Justyna.Jedrzejewska-Idczak@uwr.edu.pl)  
  tel.: 71 375 7436  
  pokój: 315
```

Ramka „Dla kogo” (specjalność):

```markdown
> **Dla kogo**
>
> Dla osób, które lubią równania różniczkowe i chcą łączyć matematykę z programowaniem.
```

Lista plików (opis po myślniku jest opcjonalny):

```markdown
- [Regulamin studiów](/pliki/studia/regulamin.pdf)
- [Harmonogram wygaszania](/pliki/studia/zmiany2026.pdf) — Część przedmiotów jest wygaszana.
```

## Gdzie co jest

| Co | Gdzie w Pages CMS |
|---|---|
| Treść strony kierunku (PL i EN) | Web-Studia → Kierunki → Treść |
| Nadtytuł, zdanie pod nazwą, hasło, liczby w nagłówku | Web-Studia → Kierunki → Baner (nazwa pliku = nazwa pliku kierunku, np. `matematyka`; bez banera nagłówek ma samą nazwę) |
| Przypomnienia na stronie głównej (np. deklaracja specjalności) | Web-Studia → Przypomnienia o terminach |
| Kolejność i napisy w menu „Studia” i na kafelkach strony głównej | Web-Ustawienia → Ustawienia strony → Sekcja „Studiuj matematykę” → Kierunki w menu… (kierunek spoza listy pojawi się sam na końcu) |
| Treść strony specjalności (PL i EN) | Web-Spec-* → Specjalność: … → Treść (wygaszana Matematyka w ekonomii: Web-Studia) |
| Kafelek specjalności na stronie kierunku, skrót, poziom, hasło, zakład, opiekunowie, seminaria | Web-Spec-* → Specjalność: … → Baner i kafelek (strona kierunku buduje kafelki sama) |
| Tekst „O popularyzacji”, tytuł, „W skrócie”, lata tradycji | Web-Popularyzacja → Strona działu Popularyzacja |
| Tekst „O Instytucie” / „Badania w Instytucie” / „O studiach”, tytuł, wstęp, hasło, „W skrócie” (Instytut: też godziny sekretariatu) | Web-Instytut / Web-Nauka / Web-Studia → Strona działu … |
| Tytuł, opis, hasło i tekst nad listą: Seminaria, Konferencje, Projekty i granty, Sukcesy, Publikacje (też hasło rocznika) | Web-Nauka → Strony → `seminaria`, `nauka/konferencje`, `nauka/granty`, `nauka/sukcesy`, `nauka/publikacje` |
| To samo: Struktura i zakłady, Warto wiedzieć | Web-Instytut → Strony → `instytut/struktura`, `warto-wiedziec` |
| To samo: Aktualności, Obrony doktorskie (też hasło strony obrony) | Web-Aktualnosci → Strony → `aktualnosci`, `obrony-doktorskie` |
| To samo: Pracownicy; Plan zajęć | Web-Pracownicy → Strony → `pracownicy`; Web-Studia → Strony → `studia/plan-zajec` |

Nazwy sekcji, które dostają stałe kotwice w adresie (np. `#terminy` w linkach przypomnień), są w `src/plugins/kotwice.mjs` (kotwice kierunku i specjalności osobno, pole `typ`; kotwice stron działów i stron z listą — typ `strona` z adresem strony; na zwykłych stronach — typ `naglowek`, np. „Konsultacje” / „Office hours” → `#konsultacje`, link w stopce). Inny nagłówek 2 też jest sekcją, z kotwicą z jego tekstu. Kotwicy w HTML (`<a id="…">`) w treści nie wpisuj — edytor z przyciskami usuwa ją przy zapisie; stała kotwica idzie do `kotwice.mjs`.
