// Kanały kalendarza: /kalendarz/wszystko.ics, /kalendarz/wydarzenia.ics,
// /kalendarz/seminarium-<id>.ics oraz pliki pojedynczych wydarzeń (/kalendarz/<uid>.ics).
import type { APIRoute } from 'astro';
import { wszystkieWydarzenia, seminaria, type Wydarzenie } from '../../lib/tresci';
import { plikIcs } from '../../lib/kalendarz';

export async function getStaticPaths() {
  const [wyd, sem] = await Promise.all([wszystkieWydarzenia(), seminaria()]);
  const kanaly: { params: { plik: string }; props: { nazwa: string; wydarzenia: Wydarzenie[] } }[] = [
    { params: { plik: 'wszystko' }, props: { nazwa: 'Instytut Matematyczny UWr', wydarzenia: wyd } },
    { params: { plik: 'wydarzenia' }, props: { nazwa: 'IM UWr — wydarzenia', wydarzenia: wyd.filter((w) => w.rodzaj !== 'referat') } },
  ];
  for (const s of sem) {
    kanaly.push({
      params: { plik: `seminarium-${s.id}` },
      props: { nazwa: `Seminarium: ${s.data.nazwa}`, wydarzenia: wyd.filter((w) => w.uid.startsWith(`ref-${s.id}-`)) },
    });
  }
  for (const w of wyd) kanaly.push({ params: { plik: w.uid }, props: { nazwa: w.tytul, wydarzenia: [w] } });
  return kanaly;
}

export const GET: APIRoute = ({ props, site }) => {
  const { nazwa, wydarzenia } = props as { nazwa: string; wydarzenia: Wydarzenie[] };
  return new Response(plikIcs(wydarzenia, nazwa, site), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};
