import { useEffect, useMemo, useRef, useState } from 'react';
import '../Team//Team.css';

/*
  Pass your members however you already load them:
    <MeetTheTeam members={members} />
  Each member: { name, post, bio, photo, instagram, linkedin, email, accent }
  Only name is needed. Missing photo shows a silhouette, missing links hide that icon,
  missing accent cycles through a built-in palette. instagram / linkedin can be a handle or a full URL.
  If your field names differ (e.g. image, role), change the single `normalize` function below.
*/
const ACCENTS = ['#c62839', '#1f5f8b', '#2e7d52', '#b7791f', '#7a3b8f', '#0f766e'];
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const url = (v, base) => { const s = str(v); if (!s) return ''; return /^https?:\/\//i.test(s) ? s : base + s.replace(/^[@/]+/, ''); };
const normalize = (m, i) => ({
  id: m.id ?? `${m.name}-${i}`,
  name: str(m.name) || 'Member',
  post: str(m.post),
  bio: str(m.bio),
  photo: str(m.photo),
  accent: /^#[0-9a-f]{6}$/i.test(str(m.accent)) ? str(m.accent) : ACCENTS[i % ACCENTS.length],
  links: {
    instagram: url(m.instagram, 'https://instagram.com/'),
    linkedin: url(m.linkedin, 'https://www.linkedin.com/in/'),
    email: str(m.email) ? `mailto:${str(m.email)}` : '',
  },
});

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, u) => {
  const A = hex(a); const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * u)).join(',')})`;
};

function Silhouette() {
  return (
    <svg viewBox="0 0 300 380" aria-hidden="true">
      <path d="M8 380C8 286 70 254 150 254C230 254 292 286 292 380Z" fill="#cfd4d2" />
      <rect x="127" y="214" width="46" height="52" rx="16" fill="#e1e5e3" />
      <ellipse cx="150" cy="150" rx="62" ry="72" fill="#e1e5e3" />
    </svg>
  );
}

const ICONS = {
  instagram: (
    <svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" /></svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24"><path fill="currentColor" d="M4.5 9h3.8v11H4.5zM6.4 3.5a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4ZM10.5 9h3.6v1.6c.6-1 1.9-1.9 3.8-1.9 3.6 0 4.3 2.4 4.3 5.4V20h-3.8v-5.2c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V20h-4z" /></svg>
  ),
  email: (
    <svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M4 8l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
};
const LABELS = { instagram: 'Instagram', linkedin: 'LinkedIn', email: 'Email' };

export default function MeetTheTeam({
  members: rawMembers = [],
  watermark = 'NIRVANA',
  crumb = 'Members',
  perMember = '90vh', // scroll length per member
}) {
  const rootRef = useRef(null);
  const goToRef = useRef(() => {});
  const [active, setActive] = useState(0);
  const members = useMemo(() => rawMembers.map(normalize), [rawMembers]);
  const n = members.length;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !n) return undefined;

    const stage = root.querySelector('.tm-stage');
    const card = root.querySelector('.mc');
    const figs = [...root.querySelectorAll('.mc-fig')];
    const titles = [...root.querySelectorAll('.mc-t')];
    const descs = [...root.querySelectorAll('.mc-d')];
    const dashes = [...root.querySelectorAll('.mc-dash i')];
    const hint = root.querySelector('.tm-hint');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // position:sticky stops working under an ancestor with overflow:hidden; clip looks the same.
    const restore = [];
    for (let el = root.parentElement; el && el !== document.documentElement; el = el.parentElement) {
      const cs = getComputedStyle(el);
      const hx = cs.overflowX === 'hidden'; const hy = cs.overflowY === 'hidden';
      if (hx || hy) {
        restore.push([el, el.style.overflowX, el.style.overflowY]);
        if (hx) el.style.overflowX = 'clip';
        if (hy) el.style.overflowY = 'clip';
      }
    }

    const geom = () => {
      const r = root.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      return { r, top, total: r.height - stage.offsetHeight };
    };
    const target = () => {
      const g = geom();
      const raw = g.total > 0 ? clamp((g.top - g.r.top) / g.total, 0, 1) : 0;
      return clamp((raw - 0.03) / 0.94, 0, 1);
    };
    goToRef.current = (j) => {
      const g = geom();
      const startY = window.scrollY + g.r.top - g.top;
      const raw = 0.03 + 0.94 * (n > 1 ? clamp(j, 0, n - 1) / (n - 1) : 0);
      window.scrollTo({ top: startY + raw * g.total, behavior: reduce ? 'auto' : 'smooth' });
    };

    let lastActive = -1;
    const render = (p) => {
      const raw = p * (n - 1);
      const k = Math.min(Math.floor(raw), n - 1);
      const f = raw - k;
      const tF = n > 1 ? k + ss(0.12, 0.88, f) : 0;
      const tT = n > 1 ? k + ss(0.10, 0.60, f) : 0;
      const tD = n > 1 ? k + ss(0.28, 0.80, f) : 0;
      const next = Math.min(k + 1, n - 1);
      card.style.setProperty('--accent', mix(members[k].accent, members[next].accent, n > 1 ? ss(0.12, 0.88, f) : 0));

      figs.forEach((el, i) => {
        const d = i - tF;
        // Members slide out from, and back in under, the accent band on the right.
        const e = clamp(Math.abs(d), 0, 1);
        el.style.transform = `translateX(${(e * 115).toFixed(2)}%)`;
        el.style.opacity = '1';
        el.style.zIndex = d < 0 ? 2 : 3;
        el.style.visibility = e >= 0.999 ? 'hidden' : 'visible';
      });
      titles.forEach((el, i) => { el.style.transform = `translateY(${((i - tT) * 104).toFixed(2)}%)`; });
      descs.forEach((el, i) => {
        const d = i - tD;
        el.style.transform = `translateY(${(d * 108).toFixed(2)}%)`;
        el.style.opacity = (1 - ss(0.55, 1, Math.abs(d))).toFixed(3);
      });

      const a = Math.round(tF);
      if (a !== lastActive) {
        lastActive = a;
        dashes.forEach((d, i) => d.classList.toggle('is-on', i === a));
        setActive(a); // only when the member changes, not every frame
      }
      hint.style.opacity = (1 - ss(0, 0.04, p)).toFixed(3);
    };

    let visible = true;
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '100px' });
      observer.observe(root);
    }
    let cur = target(); let last = performance.now(); let raf = 0;
    render(cur);
    const frame = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (visible) {
        const tp = target();
        cur = reduce ? tp : cur + (tp - cur) * (1 - Math.exp(-dt * 7));
        if (Math.abs(tp - cur) < 0.0003) cur = tp;
        render(cur);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
      restore.forEach(([el, ox, oy]) => { el.style.overflowX = ox; el.style.overflowY = oy; });
    };
  }, [members, n]);

  if (!n) return null;
  const current = members[Math.min(active, n - 1)];
  const socials = ['instagram', 'linkedin', 'email'].filter((k) => current.links?.[k]);

  return (
    <section className="team" ref={rootRef} style={{ '--n': n, '--team-per': perMember }} aria-label="Meet the club members">
      <div className="tm-stage">
        <div className="mc" style={{ '--accent': members[0].accent }}>
          <div className="mc-in">
            <div className="mc-wm" aria-hidden="true">{watermark}</div>
            <div className="mc-slab" />
            <div className="mc-band" />

            <div className="mc-figs">
              {members.map((m) => (
                <div className="mc-fig" key={m.id}>
                  {m.photo ? <img src={m.photo} alt="" draggable="false" /> : <Silhouette />}
                </div>
              ))}
            </div>

            <div className="mc-copy">
              <div className="mc-crumb">Home / <b>{crumb}</b></div>
              <div className="mc-tmask">
                {members.map((m, i) => (i === active
                  ? <h2 className="mc-t" key={m.id}>{m.name}</h2>
                  : <h2 className="mc-t" key={m.id} aria-hidden="true">{m.name}</h2>))}
              </div>
              <div className="mc-dmask">
                {members.map((m) => (
                  <div className="mc-d" key={m.id}>
                    {m.post && <span className="mc-role">{m.post}</span>}
                    {m.bio && <p>{m.bio}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mc-soc">
              {socials.map((k) => (
                <a key={k} href={current.links[k]} aria-label={`${current.name} on ${LABELS[k]}`}
                  {...(k === 'email' ? {} : { target: '_blank', rel: 'noreferrer noopener' })}>
                  {ICONS[k]}
                </a>
              ))}
            </div>

            <div className="mc-dash" aria-hidden="true">
              {members.map((m, i) => <i key={m.id} className={i === 0 ? 'is-on' : ''} />)}
            </div>

            <button className="mc-btn mc-prev" type="button" aria-label="Previous member" onClick={() => goToRef.current(active - 1)}>
              <svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="mc-btn mc-next" type="button" aria-label="Next member" onClick={() => goToRef.current(active + 1)}>
              <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
        <div className="tm-hint">Scroll or use the arrows</div>
      </div>
    </section>
  );
}