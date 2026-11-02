// Dane strony przekierowania: adres docelowy w wybranej wersji językowej.
import { u } from '../url';
import { wJezyku } from '../i18n';
import type { Lang } from '../daty';

export async function danePrzekierowania(cel: string, lang: Lang) {
  const adres = u(wJezyku(cel, lang));
  const en = lang === 'en';

  return { adres, en };
}
