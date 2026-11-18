// Zlecenie 33, część B: skrypt i styl plakietki stanu budowy — tylko w budowie Podglądu (PODGLAD=1). W innych budowach (Core,
// przyszła strona publiczna) getStaticPaths jest puste, więc w dist nie ma żadnego z tych plików.
// Odpowiedzi testowe (?stan=…) tylko w budowie lokalnej (bez PODGLAD_RUN_ID); na Podglądzie na GitHubie ich nie ma.
import type { APIRoute, GetStaticPaths } from 'astro';
import { PODGLAD, PODGLAD_RUN_ID } from '../../lib/podglad';
import skrypt from '../../lib/stanBudowy/klient.js?raw';
import styl from '../../lib/stanBudowy/styl.css?raw';
import testowe from '../../lib/stanBudowy/test-stany.json?raw';

const PLIKI: Record<string, [string, string]> = {
  'stan-budowy.js': [skrypt, 'text/javascript; charset=utf-8'],
  'stan-budowy.css': [styl, 'text/css; charset=utf-8'],
  ...(PODGLAD_RUN_ID ? {} : { 'stan-budowy-test.json': [testowe, 'application/json; charset=utf-8'] as [string, string] }),
};

export const getStaticPaths: GetStaticPaths = () => (PODGLAD ? Object.keys(PLIKI).map((plik) => ({ params: { plik } })) : []);

export const GET: APIRoute = ({ params }) => {
  const [tresc, typ] = PLIKI[params.plik!];
  return new Response(tresc, { headers: { 'Content-Type': typ } });
};
