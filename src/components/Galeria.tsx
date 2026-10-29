// Galeria zdjęć z podglądem na pełnym ekranie (strzałki, Esc, przesuwanie palcem).
import { useCallback, useEffect, useRef, useState } from 'react';

interface Zdjecie { src: string; podpis?: string }
interface Props { zdjecia: Zdjecie[]; etykieta: string; zamknij: string; poprzednie: string; nastepne: string }

export default function Galeria({ zdjecia, etykieta, zamknij, poprzednie, nastepne }: Props) {
  const [otwarte, setOtwarte] = useState<number | null>(null);
  const ostatniPrzycisk = useRef<HTMLButtonElement | null>(null);
  const zamknijRef = useRef<HTMLButtonElement | null>(null);
  const dotyk = useRef<number | null>(null);

  const idz = useCallback(
    (krok: number) => setOtwarte((i) => (i === null ? i : (i + krok + zdjecia.length) % zdjecia.length)),
    [zdjecia.length]
  );
  const zamknijPodglad = useCallback(() => {
    setOtwarte(null);
    ostatniPrzycisk.current?.focus();
  }, []);

  useEffect(() => {
    if (otwarte === null) return;
    zamknijRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') zamknijPodglad();
      if (e.key === 'ArrowRight') idz(1);
      if (e.key === 'ArrowLeft') idz(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [otwarte, idz, zamknijPodglad]);

  const z = otwarte !== null ? zdjecia[otwarte] : null;

  return (
    <>
      <div className="gallery" role="list" aria-label={etykieta}>
        {zdjecia.map((zd, i) => (
          <button
            key={zd.src}
            type="button"
            role="listitem"
            aria-label={zd.podpis || `${etykieta} ${i + 1}`}
            onClick={(e) => {
              ostatniPrzycisk.current = e.currentTarget;
              setOtwarte(i);
            }}
          >
            <img src={zd.src} alt={zd.podpis ?? ''} loading="lazy" />
          </button>
        ))}
      </div>
      {z && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={etykieta}
          onClick={(e) => e.target === e.currentTarget && zamknijPodglad()}
          onTouchStart={(e) => (dotyk.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (dotyk.current === null) return;
            const dx = e.changedTouches[0].clientX - dotyk.current;
            if (Math.abs(dx) > 40) idz(dx < 0 ? 1 : -1);
            dotyk.current = null;
          }}
        >
          <figure>
            <img src={z.src} alt={z.podpis ?? ''} />
            <figcaption>
              {z.podpis ? `${z.podpis} · ` : ''}
              {otwarte! + 1} / {zdjecia.length}
            </figcaption>
          </figure>
          <button ref={zamknijRef} type="button" className="lb-btn lb-close" aria-label={zamknij} onClick={zamknijPodglad}>
            ×
          </button>
          {zdjecia.length > 1 && (
            <>
              <button type="button" className="lb-btn lb-prev" aria-label={poprzednie} onClick={() => idz(-1)}>
                ‹
              </button>
              <button type="button" className="lb-btn lb-next" aria-label={nastepne} onClick={() => idz(1)}>
                ›
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
