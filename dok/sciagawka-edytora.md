# Ściągawka edytora: treść kierunku

Strona kierunku (np. `/studia/matematyka`) to jeden tekst: pole **Treść** w Pages CMS (Web-Studia → Kierunki → Treść), po angielsku pole **Treść EN**. Ten sam tekst jest w opisie pola „Treść” w formularzu (zlecenie 28).

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
| Kafelki specjalności | Web-Studia → Specjalności (strona kierunku buduje je sama) |

Nazwy sekcji, które dostają stałe kotwice w adresie (np. `#terminy` w linkach przypomnień), są w `src/plugins/kotwice.mjs`. Inny nagłówek 2 też jest sekcją, z kotwicą z jego tekstu.
