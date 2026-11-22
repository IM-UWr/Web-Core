"""Testy krótkich adresów plików (skrypty/adresy_plikow.py).  Uruchomienie:  python skrypty/test_adresy_plikow.py"""
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from adresy_plikow import Adresy, foldery_media  # noqa: E402

MEDIA = {
    'Web-Sem-Rownania-Rozniczkowe': [('seminarium', 'seminaria/rownania-rozniczkowe')],
    'Web-Nauka': [('nauka', 'nauka'), ('konferencje', 'konferencje')],
    'Web-Studia': [('studia', 'studia'), ('szkola-doktorska', 'szkola-doktorska')],
}
PLIKI = {
    'public/pliki/seminaria/rownania-rozniczkowe/nadzieja-seminarium.pdf',
    'public/pliki/seminaria/rownania-rozniczkowe/slajdy/wyklad-1.pdf',
    'public/pliki/nauka/publikacje/publikacje_2024.pdf',
    'public/pliki/szkola-doktorska/programy/program.pdf',
    'public/pliki/studia/regulamin.pdf',
}
A = Adresy(MEDIA, PLIKI)
ROWNANIA = 'Web-Sem-Rownania-Rozniczkowe'


class Pelny(unittest.TestCase):
    def test_wlasne_media(self):
        for adres in ('nadzieja-seminarium.pdf', '/nadzieja-seminarium.pdf'):
            self.assertEqual(A.pelny(adres, ROWNANIA), '/pliki/seminaria/rownania-rozniczkowe/nadzieja-seminarium.pdf')
        self.assertEqual(A.pelny('slajdy/wyklad-1.pdf', ROWNANIA), '/pliki/seminaria/rownania-rozniczkowe/slajdy/wyklad-1.pdf')
        # przepisany z opisu pola folder seminarium też działa
        self.assertEqual(A.pelny('seminaria/rownania-rozniczkowe/a.pdf', ROWNANIA), '/pliki/seminaria/rownania-rozniczkowe/a.pdf')

    def test_inne_repozytorium(self):
        for adres in ('Web-Nauka/publikacje/publikacje_2024.pdf', '/web-nauka/nauka/publikacje/publikacje_2024.pdf'):
            self.assertEqual(A.pelny(adres, ROWNANIA), '/pliki/nauka/publikacje/publikacje_2024.pdf')
        self.assertEqual(A.pelny('Web-Sem-Rownania-Rozniczkowe/nadzieja-seminarium.pdf', 'Web-Nauka'),
                         '/pliki/seminaria/rownania-rozniczkowe/nadzieja-seminarium.pdf')

    def test_kilka_folderow_media(self):
        self.assertEqual(A.pelny('regulamin.pdf', 'Web-Studia'), '/pliki/studia/regulamin.pdf')
        self.assertEqual(A.pelny('szkola-doktorska/programy/program.pdf', 'Web-Studia'), '/pliki/szkola-doktorska/programy/program.pdf')
        self.assertEqual(A.pelny('konferencje/plakat.jpg', 'Web-Nauka'), '/pliki/konferencje/plakat.jpg')

    def test_kotwica_i_zapytanie_zostaja(self):
        self.assertEqual(A.pelny('nadzieja-seminarium.pdf#page=3', ROWNANIA), '/pliki/seminaria/rownania-rozniczkowe/nadzieja-seminarium.pdf#page=3')

    def test_bez_zmian(self):
        for adres in ('/pliki/studia/regulamin.pdf', '/grafiki/logo.svg', '/kalendarz/wszystko.ics', '/studia/matematyka',
                      'https://example.org/a.pdf', 'mailto:a@b.pl', '#sekcja', '//cdn.example.org/a.js', 'link', '/en/a.pdf'):
            self.assertIsNone(A.pelny(adres, ROWNANIA), adres)

    def test_pliki_bez_ukosnika(self):
        self.assertEqual(A.pelny('pliki/studia/regulamin.pdf', ROWNANIA), '/pliki/studia/regulamin.pdf')


class Przepisz(unittest.TestCase):
    def test_tekst(self):
        tekst = ('Z [artykułu *„Pół wieku”*](nadzieja-seminarium.pdf), ![wykres](slajdy/wyklad-1.pdf), '
                 '[strona](/studia/matematyka), [lista](<Web-Nauka/publikacje/publikacje_2024.pdf>), [brak](brak.pdf).\n'
                 'Przykład w kodzie: `[Plik](nazwa.pdf)` zostaje.')
        nowy, zmiany = A.przepisz(tekst, ROWNANIA)
        self.assertIn('](/pliki/seminaria/rownania-rozniczkowe/nadzieja-seminarium.pdf)', nowy)
        self.assertIn('![wykres](/pliki/seminaria/rownania-rozniczkowe/slajdy/wyklad-1.pdf)', nowy)
        self.assertIn('[strona](/studia/matematyka)', nowy)
        self.assertIn('[lista](</pliki/nauka/publikacje/publikacje_2024.pdf>)', nowy)
        self.assertIn('`[Plik](nazwa.pdf)`', nowy)
        self.assertEqual([z[2] for z in zmiany], [True, True, True, False])  # brak.pdf: nie ma takiego pliku

    def test_yaml_i_json_bez_uszkodzen(self):
        yaml = 'tresc_en: >-\n  See the [article](nadzieja-seminarium.pdf)\n  for details.\n'
        self.assertEqual(A.przepisz(yaml, ROWNANIA)[0], yaml.replace('(nadzieja', '(/pliki/seminaria/rownania-rozniczkowe/nadzieja'))
        json = '{"opis": "Zobacz [plik](regulamin.pdf)."}'
        self.assertEqual(A.przepisz(json, 'Web-Studia')[0], '{"opis": "Zobacz [plik](/pliki/studia/regulamin.pdf)."}')


class FolderyMedia(unittest.TestCase):
    def test_lista_i_stary_zapis(self):
        with tempfile.TemporaryDirectory() as kat:
            with open(os.path.join(kat, '.pages.yml'), 'w', encoding='utf-8') as f:
                f.write("# komentarz\nmedia:\n- name: studia\n  label: 'Media: studia'\n  input: public/pliki/studia\n"
                        "  output: /pliki/studia\n  rename: safe\n- name: szkola-doktorska\n  input: public/pliki/szkola-doktorska\n"
                        "  output: /pliki/szkola-doktorska\nsettings:\n  commit:\n    identity: user\n")
            self.assertEqual(foldery_media(kat), [('studia', 'studia'), ('szkola-doktorska', 'szkola-doktorska')])
            with open(os.path.join(kat, '.pages.yml'), 'w', encoding='utf-8') as f:
                f.write('media:\n  input: public/pliki\n  output: /pliki\nsettings:\n')
            self.assertEqual(foldery_media(kat), [])


if __name__ == '__main__':
    unittest.main()
