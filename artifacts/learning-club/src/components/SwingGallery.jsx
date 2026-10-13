import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import './gallery-swing.css';

const BASE = import.meta.env.BASE_URL;
// Place these images in public/gallery; the first photo is each album's cover.
const ALBUMS = [
  { title: 'A story shared aloud', color: '#d2dfd0', symbol: 'READ', photos: ['story-1.jpg', 'story-2.jpg', 'story-3.jpg'] },
  { title: 'Number games & big ideas', color: '#eadcb8', symbol: '1 + 1', photos: ['numbers-1.jpg', 'numbers-2.jpg', 'numbers-3.jpg', 'numbers-4.jpg'] },
  { title: 'Making something new', color: '#dfcdd7', symbol: 'MAKE', photos: ['make-1.jpg', 'make-2.jpg', 'make-3.jpg'] },
  { title: 'A question worth chasing', color: '#c8dce0', symbol: '?', photos: ['question-1.jpg', 'question-2.jpg'] },
  { title: 'Learning side by side', color: '#e8d3c0', symbol: 'TOGETHER', photos: ['together-1.jpg', 'together-2.jpg', 'together-3.jpg', 'together-4.jpg', 'together-5.jpg'] },
  { title: 'A proud little moment', color: '#d5dfbd', symbol: 'I DID IT', photos: ['proud-1.jpg', 'proud-2.jpg', 'proud-3.jpg'] },
];
const src = (file) => `${BASE}gallery/${file}`;

const SWING = [
  { len: 52, dur: 7, delay: 0, amp: 2.6, tilt: -2 },
  { len: 88, dur: 8.5, delay: 2, amp: 3.2, tilt: 1.5 },
  { len: 66, dur: 6.5, delay: 4, amp: 2.2, tilt: -1 },
  { len: 100, dur: 9, delay: 1, amp: 3.4, tilt: 2 },
  { len: 58, dur: 7.5, delay: 3, amp: 2.8, tilt: -1.5 },
  { len: 80, dur: 8, delay: 5, amp: 3, tilt: 1 },
];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Pic({ file, album, className = '', alt }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [file]);

  if (failed) {
    return (
      <div className={`gl-fallback ${className}`} style={{ '--c': album.color }} role="img" aria-label={alt}>
        <span>{album.symbol}</span>
      </div>
    );
  }
  return <img className={className} src={src(file)} alt={alt} draggable="false" onError={() => setFailed(true)} />;
}

function HangingAlbum({ album, index, breeze, onOpen }) {
  const slotRef = useRef(null);
  const animRef = useRef(null);
  const swing = SWING[index % SWING.length];

  const kick = useCallback((power = 1, force = false) => {
    const el = slotRef.current?.querySelector('.gl-kick');
    if (!el || reducedMotion()) return;
    if (animRef.current?.playState === 'running' && !force) return;
    animRef.current?.cancel();
    const direction = (Math.random() < 0.5 ? -1 : 1) * power;
    const frame = (n) => ({ transform: `rotate(${(n * direction).toFixed(2)}deg)` });
    animRef.current = el.animate(
      [frame(0), frame(9), frame(-7), frame(5), frame(-3), frame(1.5), frame(0)],
      { duration: 3400, easing: 'ease-in-out' },
    );
  }, []);

  useEffect(() => {
    const el = slotRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      timer = window.setTimeout(() => kick(0.9, true), (index % 4) * 220);
    }, { threshold: 0.35 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [index, kick]);

  useEffect(() => {
    if (!breeze) return undefined;
    const timer = window.setTimeout(() => kick(0.8 + Math.random() * 0.8, true), index * 180);
    return () => window.clearTimeout(timer);
  }, [breeze, index, kick]);

  useEffect(() => () => animRef.current?.cancel(), []);

  const open = () => {
    kick(1.2, true);
    onOpen(index);
  };

  return (
    <div
      className="gl-slot"
      ref={slotRef}
      role="button"
      tabIndex={0}
      aria-label={`${album.title}, ${album.photos.length} photos. Open gallery`}
      style={{
        '--len': `${swing.len}px`,
        '--dur': `${swing.dur}s`,
        '--delay': `-${swing.delay}s`,
        '--amp': `${swing.amp}deg`,
        '--tilt': `${swing.tilt}deg`,
      }}
      onPointerEnter={() => kick(0.7)}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      }}
    >
      <div className="gl-kick">
        <div className="gl-hang">
          <svg className="gl-strings" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d="M50 0L2 100M50 0L98 100" />
          </svg>
          <figure className="gl-frame">
            <span className="gl-tape" />
            <div className="gl-cover">
              <Pic file={album.photos[0]} album={album} alt="" />
            </div>
            <figcaption className="gl-cap">
              {album.title}
              <small>{album.photos.length} photos</small>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ album, onClose }) {
  const [index, setIndex] = useState(0);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const stripRef = useRef(null);
  const touchStart = useRef(null);
  const total = album.photos.length;

  const go = useCallback((step) => setIndex((n) => (n + step + total) % total), [total]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowLeft') go(-1);
      else if (event.key === 'ArrowRight') go(1);
      else if (event.key === 'Tab') {
        const items = Array.from(dialogRef.current?.querySelectorAll('button') ?? []);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [go, onClose]);

  useEffect(() => {
    stripRef.current?.children[index]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    [index + 1, index - 1].forEach((n) => {
      const image = new Image();
      image.src = src(album.photos[(n + total) % total]);
    });
  }, [index, album, total]);

  const onTouchEnd = (event) => {
    if (touchStart.current == null) return;
    const dx = event.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(dx) > 50) go(dx > 0 ? -1 : 1);
  };

  return createPortal(
    <div
      className="gl-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={album.title}
      ref={dialogRef}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div className="gl-lb-top">
        <div>
          <h2>{album.title}</h2>
          <p>{index + 1} / {total}</p>
        </div>
        <button type="button" className="gl-lb-close" ref={closeRef} aria-label="Close gallery" onClick={onClose}>
          <X size={30} aria-hidden="true" />
        </button>
      </div>

      {total > 1 && (
        <button type="button" className="gl-lb-nav prev" aria-label="Previous photo" onClick={() => go(-1)}>
          <ChevronLeft size={34} aria-hidden="true" />
        </button>
      )}

      <div
        className="gl-lb-stage"
        onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
        onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
        onTouchEnd={onTouchEnd}
      >
        <Pic key={index} className="gl-lb-img" file={album.photos[index]} album={album} alt={`${album.title}, photo ${index + 1} of ${total}`} />
      </div>

      {total > 1 && (
        <button type="button" className="gl-lb-nav next" aria-label="Next photo" onClick={() => go(1)}>
          <ChevronRight size={34} aria-hidden="true" />
        </button>
      )}

      <div className="gl-lb-strip" ref={stripRef}>
        {album.photos.map((file, i) => (
          <button
            type="button"
            key={file}
            className={`gl-thumb${i === index ? ' is-active' : ''}`}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => setIndex(i)}
          >
            <Pic file={file} album={album} alt="" />
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}

export default function SwingGallery() {
  const [openIndex, setOpenIndex] = useState(null);
  const [breeze, setBreeze] = useState(0);
  const close = useCallback(() => setOpenIndex(null), []);

  return (
    <>
      <header className="subpage-head">
        <p className="eyebrow">MEMORIES FROM THE NOOK</p>
        <h1 className="page-heading">A little scrapbook<br />of trying things.</h1>
        <p className="page-intro">Our best moments aren’t always big. Sometimes they’re a new word, a solved puzzle, or someone finding their place at the table.</p>
      </header>

      <section className="content-section">
        <h2 className="section-heading">A few things we love to do</h2>
        <div className="gl-tools">
          <button type="button" className="gl-breeze" onClick={() => setBreeze((n) => n + 1)}>Blow a gentle breeze</button>
        </div>
        <div className="gl-wall">
          {ALBUMS.map((album, index) => (
            <HangingAlbum key={album.title} album={album} index={index} breeze={breeze} onOpen={setOpenIndex} />
          ))}
        </div>
        <p className="gallery-footnote">Tap a photo to open the album.</p>
      </section>

      <section className="content-section two-col">
        <div>
          <h2 className="section-heading">Every child’s story is their own</h2>
          <p className="chalk-copy">We believe children should be able to learn and grow without feeling watched or put on display. Any real photos shared here should be chosen with care and permission.</p>
        </div>
        <div className="quote-card"><blockquote>“Look what I figured out!”</blockquote><p>That’s the kind of moment worth keeping close.</p></div>
      </section>

      {openIndex !== null && <Lightbox album={ALBUMS[openIndex]} onClose={close} />}
    </>
  );
}
