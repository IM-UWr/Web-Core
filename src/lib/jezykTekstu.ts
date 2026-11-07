// Czy tekst z CMS wygląda na polski (decyzja D14, zlecenie 16). Puste pole _en nie wystarczy: w polach „polskich” wielu
// konferencji, grantów i referatów stoi oryginał po angielsku, a czytnik ekranu nie powinien czytać go polskim głosem.
// Sygnały: polskie słowo funkcyjne między wyrazami, typowa polska końcówka wyrazu, litera z ogonkiem poza imieniem i nazwiskiem
// (nazwiska i miasta w tekście angielskim to zwykle wyrazy od wielkiej litery). Wątpliwości rozstrzyga brak sygnału: bez lang.
const SLOWO_FUNKCYJNE = /(?:^|[\s(„])(?:i|w|z|ze|na|do|od|dla|oraz|jest|są|się|nie|przez|przy|lub|który|która|które)\s/;
const KONCOWKA = /\p{L}{3}(?:owe|owy|owej|owych|owym|ymi|ych|ość|ości|enia|enie|anie|cji|cja|ego|ska|skie|skiej)(?![\p{L}\p{N}])/u;
const OGONEK_W_MALYM_WYRAZIE = /(?:^|[\s(„-])\p{Ll}*[ąćęłńóśźż]\p{Ll}*/u;

export function wygladaNaPolski(tekst: string | undefined | null): boolean {
  if (!tekst) return false;
  return SLOWO_FUNKCYJNE.test(tekst) || KONCOWKA.test(tekst) || OGONEK_W_MALYM_WYRAZIE.test(tekst);
}
