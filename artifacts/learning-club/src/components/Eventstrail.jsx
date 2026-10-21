import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import './EventsTrail.css';

// Which Firestore collection the trail reads (the admin page saves to "events")
const EVENTS_COLLECTION = 'events';
// Descriptions longer than this get a "Read more" button
const LONG_TEXT = 180;

/* Fixed cards shown after the real events.
   soon: true -> dashed "coming soon" card     end: true -> last card (flag pin) */
const tail = [
  {
    id: 'tail-soon',
    month: 'SOON',
    title: 'Something new is brewing',
    kind: 'Coming soon',
    summary: 'Another gathering is being planned. Check back to see it appear on the trail.',
    soon: true,
  },
  {
    id: 'tail-end',
    month: 'YOUR TURN',
    title: 'Help us add the next stop',
    summary: "Have an idea, or want to host a day? Say hello and we'll put it on the map.",
    soon: true,
    end: true,
    cta: { label: 'Say hello', href: '/contact' },
  },
];

const toParagraphs = (content) => {
  if (Array.isArray(content)) return content.map((p) => String(p).trim()).filter(Boolean);
  if (typeof content === 'string') return content.split('\n').map((p) => p.trim()).filter(Boolean);
  return [];
};

// One Firestore document -> one stop on the trail
function toStop(snapshot) {
  const data = snapshot.data();
  const iso = typeof data.eventDateISO === 'string' ? data.eventDateISO : '';
  const eventDate = iso ? new Date(`${iso}T00:00:00`) : null;
  const month = eventDate
    ? `${eventDate.toLocaleString('en-IN', { month: 'long' }).toUpperCase()} ${eventDate.getFullYear()}`
    : String(data.Eventdate ?? 'EVENT').toUpperCase();

  return {
    id: snapshot.id,
    iso,
    timestamp: Number(data.timestamp) || 0,
    month,
    title: String(data.title ?? data.Title ?? snapshot.id),
    meta: [data.Eventdate, data.Venue].filter(Boolean).join(' \u2022 '),
    summary: String(data.description ?? data.Desc ?? '').trim(),
    paragraphs: toParagraphs(data.content),
  };
}

// oldest first; events without a date go last
const byDate = (a, b) => (a.iso || '9999').localeCompare(b.iso || '9999') || a.timestamp - b.timestamp;

/* ---------- one card, with Read more ---------- */
function StopCard({ stop }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const summary = stop.summary ?? '';
  const paragraphs = stop.paragraphs ?? [];
  const canExpand = summary.length > LONG_TEXT || paragraphs.length > 0;

  return (
    <article className="et-card">
      <span className="et-month">{stop.month}</span>
      <h2>{stop.title}</h2>
      {stop.kind && <p className="et-kind">{stop.kind}</p>}
      {stop.meta && <p className="et-meta">{stop.meta}</p>}

      {summary && (
        <p id={bodyId} className={`et-text${canExpand && !open ? ' clamp' : ''}`}>{summary}</p>
      )}
      {open && paragraphs.length > 0 && (
        <div className="et-full">
          {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
      )}

      {canExpand && (
        <button type="button" className="et-more" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpen((v) => !v)}>
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
      {stop.cta && <Link href={stop.cta.href} className="et-btn">{stop.cta.label}</Link>}
    </article>
  );
}

export default function EventsTrail() {
  const trailRef = useRef(null);
  const svgRef = useRef(null);
  const baseRef = useRef(null);
  const doneRef = useRef(null);
  const walkerRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  // ---- load the events from Firestore ----
  useEffect(() => {
    let cancelled = false;
    getDocs(collection(firestore, EVENTS_COLLECTION))
      .then((snap) => {
        if (cancelled) return;
        const list = snap.docs.map(toStop).sort(byDate);
        const today = new Date().toISOString().slice(0, 10);
        const next = list.findIndex((item) => item.iso && item.iso >= today);
        if (next >= 0) {
          list[next].live = true;                                    // pulsing pin on the next upcoming event
          list[next].cta = { label: 'Ask about joining', href: '/contact' };
        }
        setEvents(list);
        setStatus('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Could not load events:', error);
        setStatus('error');
      });
    return () => { cancelled = true; };
  }, []);

  const stops = useMemo(() => (status === 'loading' ? null : [...events, ...tail]), [events, status]);

  // ---- the walking trail (re-built whenever the list of stops changes) ----
  useEffect(() => {
    const trail = trailRef.current;
    const svg = svgRef.current;
    const base = baseRef.current;
    const done = doneRef.current;
    const walker = walkerRef.current;
    if (!trail || !svg || !base || !done || !walker) return undefined;

    const stopEls = Array.from(trail.querySelectorAll('.et-stop'));
    const pins = stopEls.map((s) => s.querySelector('.et-pin'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let L = 0;
    let pinLen = [];
    let cur = 0;
    let visible = true;
    let raf = 0;
    let alive = true;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    function draw(len) {
      const pt = base.getPointAtLength(len);
      walker.style.transform = `translate(${pt.x}px,${pt.y}px)`;
      done.setAttribute('stroke-dasharray', `${len} ${L * 2}`);
      pins.forEach((p, i) => {
        p.classList.toggle('on', pinLen[i] <= len + 2 && !stopEls[i].classList.contains('et-soon'));
      });
    }

    function layout() {
      const w = trail.clientWidth;
      const h = trail.clientHeight;
      const tr = trail.getBoundingClientRect();
      const narrow = w < 700;
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      const P = [{ x: 0, y: 0 }];
      pins.forEach((p) => {
        const r = p.getBoundingClientRect();
        P.push({ x: r.left - tr.left + r.width / 2, y: r.top - tr.top + r.height / 2 });
      });
      P[0].x = P[1].x;
      P[0].y = 4;

      const bulge = narrow ? 16 : 70;
      let d = `M${P[0].x} ${P[0].y}`;
      for (let i = 1; i < P.length; i += 1) {
        const a = P[i - 1];
        const b = P[i];
        const dir = (i % 2 ? 1 : -1) * bulge;
        const dy = b.y - a.y;
        d += ` C${a.x + dir} ${a.y + dy * 0.3} ${b.x - dir} ${a.y + dy * 0.7} ${b.x} ${b.y}`;
      }
      base.setAttribute('d', d);
      done.setAttribute('d', d);
      L = base.getTotalLength();

      pinLen = P.slice(1).map((p) => {
        let best = 0;
        let bd = 1e9;
        for (let s = 0; s <= L; s += 3) {
          const q = base.getPointAtLength(s);
          const dd = Math.abs(q.y - p.y) + Math.abs(q.x - p.x);
          if (dd < bd) {
            bd = dd;
            best = s;
          }
        }
        return best;
      });
      draw(cur);
    }

    function target() {
      const tr = trail.getBoundingClientRect();
      const h = trail.offsetHeight;
      const p = clamp((window.innerHeight * 0.55 - tr.top) / h, 0, 1);
      return p * L;
    }

    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '200px' });
      io.observe(trail);
    }

    let last = performance.now();
    function frame(now) {
      if (!alive) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (visible && L) {
        const t = target();
        cur = reduce ? t : cur + (t - cur) * (1 - Math.exp(-dt * 6));
        if (Math.abs(t - cur) < 0.3) cur = t;
        draw(cur);
      }
      raf = requestAnimationFrame(frame);
    }

    // a card growing or shrinking (Read more) changes the trail height, so the path is redrawn
    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(layout);
      ro.observe(trail);
    } else {
      window.addEventListener('resize', layout);
    }

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    fontsReady.then(() => {
      if (!alive) return;
      layout();
      raf = requestAnimationFrame(frame);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro?.disconnect();
      window.removeEventListener('resize', layout);
    };
  }, [stops]);

  if (!stops) {
    return <section className="et" aria-label="Events trail" aria-busy="true"><p className="et-status">Loading events…</p></section>;
  }

  return (
    <section className="et" aria-label="Events trail">
      {status === 'error' && <p className="et-status" role="alert">We couldn’t load the events right now. Please try again later.</p>}

      <div className="et-legend">
        <span><i /> Happening</span>
        <span><i className="soon" /> Coming soon</span>
      </div>

      <div className="et-trail" ref={trailRef}>
        <svg className="et-trailsvg" ref={svgRef} aria-hidden="true">
          <path className="et-base" ref={baseRef} />
          <path className="et-done" ref={doneRef} />
        </svg>

        <div className="et-walker" ref={walkerRef} aria-hidden="true">
          <div className="et-fig">
            <svg viewBox="0 0 24 24">
              <circle cx="9" cy="10" r="1.6" fill="#183a30" />
              <circle cx="15" cy="10" r="1.6" fill="#183a30" />
              <path d="M7 14 q5 5 10 0" fill="none" stroke="#183a30" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <ol className="et-stops">
          {stops.map((s, i) => (
            <li
              key={s.id}
              className={`et-stop${s.soon ? ' et-soon' : ''}${s.end ? ' et-end' : ''}`}
              data-live={s.live ? '' : undefined}
            >
              <StopCard stop={s} />
              <div className="et-pin" aria-hidden="true">
                {s.end ? '\u2691' : s.soon ? '?' : i + 1}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
