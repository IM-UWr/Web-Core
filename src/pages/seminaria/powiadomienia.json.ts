// Kanał dla automatu powiadomień e-mail o referatach (Google Apps Script — skrypty/powiadomienia/Code.gs).
// Automat co kilka minut pobiera ten plik i wysyła wiadomość do zapisanych na listę danego seminarium,
// gdy pojawi się nowy (opublikowany, przyszły) referat. Adres: /seminaria/powiadomienia.json
import type { APIRoute } from 'astro';
import { referaty, seminaria, seminariumReferatu, slugOf, sala } from '../../lib/tresci';
import { absolute } from '../../lib/url';
import { addDays, today } from '../../lib/daty';

// Streszczenie jako zwykły tekst (wzory $...$ zostają bez zmian).
const tekst = (md: string | undefined, max = 900) => {
  const t = (md ?? '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(^|\W)[*_](\S[^*_]*?)[*_](?=\W|$)/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, '') + '…' : t;
};

export const GET: APIRoute = async ({ site }) => {
  const [ref, sem] = await Promise.all([referaty(), seminaria()]);
  const od = addDays(today(), -60);
  const seminariaJson = sem.map((s) => ({
    id: s.id,
    nazwa: s.data.nazwa,
    nazwa_en: s.data.nazwa_en || s.data.nazwa,
    adres: absolute(`/en/seminaria/${s.id}`, site),
  }));
  const znane = new Set(sem.map((s) => s.id));
  const referatyJson = ref
    .filter((r) => znane.has(seminariumReferatu(r)) && r.data.termin.slice(0, 10) >= od)
    .map((r) => {
      const semId = seminariumReferatu(r);
      return {
        id: r.id.replace(/\.(md|ya?ml)$/, ''),
        seminarium: semId,
        tytul: r.data.tytul,
        prelegent: r.data.prelegent,
        afiliacja: r.data.afiliacja ?? '',
        termin: r.data.termin, // czas lokalny Warszawy: RRRR-MM-DD lub RRRR-MM-DDTGG:MM
        sala: sala(r.data.sala, 'en') ?? '',
        streszczenie: tekst(r.body),
        adres: absolute(`/en/seminaria/${semId}`, site) + '#' + slugOf(r.id),
      };
    });
  const body = JSON.stringify({ wygenerowano: new Date().toISOString(), seminaria: seminariaJson, referaty: referatyJson }, null, 1);
  return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
