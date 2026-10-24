import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { firestore } from '@/lib/firebase';
import './gallery-swing.css';

// Each event that has photos becomes one hanging album.
// The photos come from Firestore (collection "photos"), saved by the admin Upload page.
const PALETTE = ['#d2dfd0', '#eadcb8', '#dfcdd7', '#c8dce0', '#e8d3c0', '#d5dfbd'];

// Cloudinary can resize on the fly: we add the size right after /upload/
const cdn = (url, transform) => (url.includes('/upload/') ? url.replace('/upload/', `/upload/${transform}/`) : url);
const coverUrl = (url) => cdn(url, 'c_fill,w_700,h_525,q_auto,f_auto');
const thumbUrl = (url) => cdn(url, 'c_fill,w_160,h_120,q_auto,f_auto');
const fullUrl = (url) => cdn(url, 'c_limit,w_1800,q_auto,f_auto');

const initials = (title) =>
  title.replace(/\(.*?\)/g, '').trim().split(/\s+/).map((word) => word[0]).join('').slice(0, 3).toUpperCase() || '\u2605';

// photos (newest first) -> albums, newest event first, photos oldest first inside each album
function groupByEvent(photos) {
  const map = new Map();
  photos.forEach((photo) => {
    if (!photo.event || !photo.url) return;
    if (!map.has(photo.event)) map.set(photo.event, []);
    map.get(photo.event).push({ id: photo.id, url: photo.url });
  });
  return [...map.entries()].map(([title, list], index) => ({
    title,
    color: PALETTE[index % PALETTE.length],
    symbol: initials(title),
    photos: list.reverse(),
  }));
}

const SWING = [
  { len: 52, dur: 7, delay: 0, amp: 2.6, tilt: -2 },
  { len: 88, dur: 8.5, delay: 2, amp: 3.2, tilt: 1.5 },
  { len: 66, dur: 6.5, delay: 4, amp: 2.2, tilt: -1 },
  { len: 100, dur: 9, delay: 1, amp: 3.4, tilt: 2 },
  { len: 58, dur: 7.5, delay: 3, amp: 2.8, tilt: -1.5 },
  { len: 80, dur: 8, delay: 5, amp: 3, tilt: 1 },
];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Pic({ url, album, className = '', alt }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);

  if (failed) {
    return (
      <div className={`gl-fallback ${className}`} style={{ '--c': album.color }} role="img" aria-label={alt}>
        <span>{album.symbol}</span>
      </div>
    );
  }
  return <img className={className} src={url} alt={alt} draggable="false" loading="lazy" onError={() => setFailed(true)} />;
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
              <Pic url={coverUrl(album.photos[0].url)} album={album} alt="" />
            </div>
            <figcaption className="gl-cap">
              {album.title}
              <small>{album.photos.length} {album.photos.length === 1 ? 'photo' : 'photos'}</small>
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
      image.src = fullUrl(album.photos[(n + total) % total].url);
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
        <Pic key={album.photos[index].id} className="gl-lb-img" url={fullUrl(album.photos[index].url)} album={album} alt={`${album.title}, photo ${index + 1} of ${total}`} />
      </div>

      {total > 1 && (
        <button type="button" className="gl-lb-nav next" aria-label="Next photo" onClick={() => go(1)}>
          <ChevronRight size={34} aria-hidden="true" />
        </button>
      )}

      <div className="gl-lb-strip" ref={stripRef}>
        {album.photos.map((photo, i) => (
          <button
            type="button"
            key={photo.id}
            className={`gl-thumb${i === index ? ' is-active' : ''}`}
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => setIndex(i)}
          >
            <Pic url={thumbUrl(photo.url)} album={album} alt="" />
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
}

export default function SwingGallery() {
  const [albums, setAlbums] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [openIndex, setOpenIndex] = useState(null);
  const [breeze, setBreeze] = useState(0);
  const close = useCallback(() => setOpenIndex(null), []);

  // load the photos that the admin uploaded
  useEffect(() => {
    let cancelled = false;
    getDocs(query(collection(firestore, 'photos'), orderBy('createdAt', 'desc'), limit(500)))
      .then((snap) => {
        if (cancelled) return;
        setAlbums(groupByEvent(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
        setStatus('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Could not load gallery photos:', error);
        setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <header className="subpage-head">
        <p className="eyebrow">MEMORIES FROM THE NOOK</p>
        <h1 className="page-heading">A little scrapbook<br />of trying things.</h1>
        <p className="page-intro">Our best moments aren’t always big. Sometimes they’re a new word, a solved puzzle, or someone finding their place at the table.</p>
      </header>

      <section className="content-section">
        <h2 className="section-heading">A few things we love to do</h2>

        {status === 'loading' && <p className="gallery-footnote" role="status">Loading photos…</p>}
        {status === 'error' && <p className="gallery-footnote" role="alert">We couldn’t load the photos right now. Please try again later.</p>}
        {status === 'ready' && albums.length === 0 && <p className="gallery-footnote">Photos from our events will appear here soon.</p>}

        {albums.length > 0 && (
          <>
            <div className="gl-tools">
              <button type="button" className="gl-breeze" onClick={() => setBreeze((n) => n + 1)}>Blow a gentle breeze</button>
            </div>
            <div className="gl-wall">
              {albums.map((album, index) => (
                <HangingAlbum key={album.title} album={album} index={index} breeze={breeze} onOpen={setOpenIndex} />
              ))}
            </div>
            <p className="gallery-footnote">Tap a photo to open the album.</p>
          </>
        )}
      </section>

      <section className="content-section two-col">
        <div>
          <h2 className="section-heading">Every child’s story is their own</h2>
          <p className="chalk-copy">We believe children should be able to learn and grow without feeling watched or put on display. Any real photos shared here should be chosen with care and permission.</p>
        </div>
        <div className="quote-card"><blockquote>“Look what I figured out!”</blockquote><p>That’s the kind of moment worth keeping close.</p></div>
      </section>

      {openIndex !== null && albums[openIndex] && <Lightbox album={albums[openIndex]} onClose={close} />}
    </>
  );
}
