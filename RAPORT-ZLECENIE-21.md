# Raport: zlecenie 21 — uwagi z oglądania, część 5 (6.11.2026)

Gałąź: `wyglad/zlecenie-16`. Zrobiony jedyny punkt GOTOWE. Zlecenie mówi „bez pushowania”, ale właściciel kazał wysłać całość („Po tym zlecenie 21 i push”), więc gałąź jest wysłana, a podgląd przebudowany. `main` wszystkich 22 repozytoriów bez zmian, repozytoria treści nietknięte.

| Punkt | Co | Commit |
| --- | --- | --- |
| 1 | Lista Seminaria: podtytuł na karcie kursywą, bez zieleni | `5b30aa4c` |

## Odbiór

| Warunek | Wynik |
| --- | --- |
| Krój, kursywa, 16 px, grubość 400, `--muted` | Zgodne na każdym podtytule: 9 kart PL i 9 kart EN, jasny i ciemny motyw, 1536 i 390 px. Na opublikowanym podglądzie przy 1536 px też |
| Kursywa prawdziwa, także dla polskich znaków | Przeglądarka rysuje każdy podtytuł krojem `Brygada-1918-Italic`, z pliku strony, bez kroju zapasowego. Dotyczy też „Od danych do wniosków” i „Jak uczyć matematyki i o niej mówić”. Po polsku ładuje się plik kursywy ze znakami rozszerzonymi, w którym jest „ś” |
| Przesunięcie elementów pod podtytułem | Najwyżej 1,0 px w karcie (0,9 px różnicy linii i zaokrąglenie pomiaru). Linia 20,8 px. Każdy podtytuł ma jedną linię, przed i po |
| Kontrast na tle karty, co najmniej 4,5:1 | 5,34 w jasnym, 6,14 w ciemnym, tyle samo co w artefakcie. Po najechaniu na kartę (tło `--d-t`): 5,37 i 5,01 |
| `git diff` tylko wskazana reguła | Tak, 1 wiersz w `src/styles/zal-tresc.css` |
| `astro check` | 6 błędów, tyle samo co przed zleceniem, żaden nowy |
| `npm run build` | Przeszedł w przebiegu Web-Podglad 42209881498, krok „Budowanie strony”. Lokalnie nie uruchamiałem, bo przy działających serwerach dev psuje on wyspy React (tabela na `/pracownicy`) |
| Zrzuty przed i po | `raport-zrzuty/z21-seminaria-*`: PL 1536 i 390 px w obu motywach, EN 1536 px w jasnym |

Reszta karty bez zmian: krój, rozmiar, kolor, grubość i styl nazwy zakładu, tytułu, „Brak zapowiedzianych referatów” i „Prowadzą” są takie same przed i po. Kolor tytułu po najechaniu też.

**Opublikowany podgląd** (nowa wersja od 12:29:57): 14 adresów, w tym `/seminaria/` i `/en/seminaria/`, przy 390, 360 i 1536 px, bez błędów JS i HTTP, bez przewijania w poziomie.

## Do wiadomości, nic nie zmieniałem

1. **Przesunięcia sumują się w dół strony.** W karcie to 0,9 px, ale każdy kolejny rząd kart jest o tyle wyżej. Lista jest krótsza o 3 px na komputerze i o 8 px na telefonie. Nie widać tego i mieści się w odbiorze, który mówi o elementach pod podtytułem.
2. **Dwie kursywy obok siebie.** Tuż pod podtytułem stoi „Brak zapowiedzianych referatów”, też kursywą, ale innym krojem. Lokalnie jest tak na wszystkich 9 kartach. Manrope nie ma w projekcie pliku kursywy, więc tę linię pochyla przeglądarka. Artefakt uprzedzał o tym sąsiedztwie, a zlecenie każe tej linii nie ruszać. Gdy pojawią się zapowiedziane referaty, sąsiedztwo zniknie na ich kartach.
