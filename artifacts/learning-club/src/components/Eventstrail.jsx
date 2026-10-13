import { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import './EventsTrail.css';

/* ---------- EDIT YOUR EVENTS HERE ----------
   live: true  -> filled yellow pin + pulsing ring
   soon: true  -> dashed "coming soon" card
   end:  true  -> last card (flag pin)
   icon: 'diya' | 'star' | undefined
*/
const stops = [
  {
    month: 'OCTOBER',
    title: 'Dussehra celebration',
    kind: 'Community',
    text: 'A day to celebrate the victory of good over evil, together as one club. Date and place will be shared here.',
    icon: 'diya',
    live: true,
    cta: { label: 'Ask about joining', href: '/contact' },
  },
  {
    month: 'JANUARY',
    title: 'JOY Fest',
    kind: 'Festival',
    text: 'A festival built around joy, play and smiles. More details will be added as the day gets closer.',
    icon: 'star',
    cta: { label: 'Ask about joining', href: '/contact' },
  },
  {
    month: 'SOON',
    title: 'Something new is brewing',
    kind: 'Coming soon',
    text: 'Another gathering is being planned. Check back to see it appear on the trail.',
    soon: true,
  },
  {
    month: 'SOON',
    title: 'A story yet to be written',
    kind: 'Coming soon',
    text: 'This stop is waiting for its first chapter.',
    soon: true,
  },
  {
    month: 'YOUR TURN',
    title: 'Help us add the next stop',
    text: "Have an idea, or want to host a day? Say hello and we'll put it on the map.",
    soon: true,
    end: true,
    cta: { label: 'Say hello', href: '/contact' },
  },
];

function StopIcon({ type }) {
  if (type === 'diya') {
    return (
      <svg className="et-ico" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M8 38 q24 28 48 0 z" fill="#f2d76f" />
        <path d="M32 8 q-12 12 0 24 q12 -12 0 -24z" fill="#e5a2b3" />
        <path d="M32 18 q-5 6 0 12 q5 -6 0 -12z" fill="#f2eedc" />
      </svg>
    );
  }
  if (type === 'star') {
    return (
      <svg className="et-ico" viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 6 l6 18 l18 2 l-14 12 l5 18 l-15 -10 l-15 10 l5 -18 l-14 -12 l18 -2z"
          fill="none"
          stroke="#9ed3df"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
}

export default function EventsTrail() {
  const trailRef = useRef(null);
  const svgRef = useRef(null);
  const baseRef = useRef(null);
  const doneRef = useRef(null);
  const walkerRef = useRef(null);

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
  }, []);

  return (
    <section className="et" aria-label="Events trail">
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
              key={s.title}
              className={`et-stop${s.soon ? ' et-soon' : ''}${s.end ? ' et-end' : ''}`}
              data-live={s.live ? '' : undefined}
            >
              <article className="et-card">
                <StopIcon type={s.icon} />
                <span className="et-month">{s.month}</span>
                <h2>{s.title}</h2>
                {s.kind && <p className="et-kind">{s.kind}</p>}
                <p>{s.text}</p>
                {s.cta && <Link href={s.cta.href} className="et-btn">{s.cta.label}</Link>}
              </article>
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