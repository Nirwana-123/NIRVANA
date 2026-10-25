import { useEffect, useRef } from 'react';
import './Values-garden.css';

const NS = 'http://www.w3.org/2000/svg';
const GY = 372;
const LEAF = 'M0 0 C8 -7 20 -7 28 0 C20 7 8 7 0 0Z';
const SHAPES = {
  lotus: 'M0 0 C-.28 -.25 -.3 -.65 0 -1 C.3 -.65 .28 -.25 0 0Z',
  round: 'M0 0 C-.38 -.2 -.45 -.75 0 -1 C.45 -.75 .38 -.2 0 0Z',
  slim: 'M0 0 C-.2 -.3 -.22 -.8 0 -1 C.22 -.8 .2 -.3 0 0Z',
};

// One flower per value. s/e = the part of the meter (0..1) in which that flower grows.
const PLANT_DEFS = [
  {
    x: 190, H: 215, s: 0.04, e: 0.52, ph: 0, budC: '#4f9a5a', budR: [10, 16], budY: -11, cy: 0, r0: 0, lf: 1.1,
    layers: [
      { n: 7, len: 46, spread: 80, shape: 'lotus', c: '#e58aae' },
      { n: 6, len: 40, spread: 62, shape: 'lotus', c: '#f2a9c3' },
      { n: 5, len: 32, spread: 40, shape: 'lotus', c: '#fbd0df' },
    ],
  },
  {
    x: 450, H: 250, s: 0.2, e: 0.72, ph: 1.7, budC: '#5b9a3f', budR: [11, 15], budY: -10, cy: 0, r0: 0, lf: 1.2,
    layers: [
      { n: 11, len: 32, spread: 104, shape: 'round', c: '#e8791a' },
      { n: 9, len: 27, spread: 88, shape: 'round', c: '#f6a21e' },
      { n: 7, len: 22, spread: 66, shape: 'round', c: '#ffc23a' },
      { n: 5, len: 15, spread: 40, shape: 'round', c: '#ffd86b' },
    ],
  },
  {
    x: 710, H: 230, s: 0.36, e: 0.92, ph: 3.1, budC: '#4f8f3c', budR: [13, 13], budY: 0, cy: -22, r0: 9, lf: 1.35,
    center: { r: 15, c: '#5a3a1e', c2: '#3e2714' },
    layers: [
      { n: 18, len: 40, full: true, off: 0, shape: 'slim', c: '#eeaa14' },
      { n: 18, len: 34, full: true, off: 0.5, shape: 'slim', c: '#ffd23f' },
    ],
  },
];

const VALUES = [
  { title: 'Kindness first', text: 'Every child deserves patience, respect, and a warm welcome.', dot: '#f2a9c3' },
  { title: 'Curiosity over perfection', text: 'Questions and mistakes are part of the good work of learning.', dot: '#f6a21e' },
  { title: 'We belong to each other', text: 'We make a community where children and mentors can show up as themselves.', dot: '#ffd23f' },
];

const STAGE_NAMES = [
  [0.12, 'A seed in the soil'],
  [0.3, 'First green shoots'],
  [0.55, 'Growing tall'],
  [0.8, 'Buds are forming'],
  [0.97, 'Blooming'],
  [2, 'In full bloom'],
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ss = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const bez = (t, a, b, c) => {
  const u = 1 - t;
  return u * u * a + 2 * u * t * b + t * t * c;
};
function mk(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
  if (parent) parent.appendChild(node);
  return node;
}

/**
 * Scroll-driven blooming garden tied to a "love and care" meter.
 * pin={true} (default): once the whole garden fills the screen it holds in place while the meter
 * fills, then releases and the page scrolls on as normal. Scroll length is --vg-length (CSS).
 * pin={false}: no pinning, it just grows as the section scrolls through the viewport.
 */
export default function ValuesGarden({ pin = true }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const q = (sel) => root.querySelector(sel);
    const plantsG = q('.vg-plants');
    const fliesG = q('.vg-flies');
    const fill = q('.vg-fill');
    const heart = q('.vg-heart');
    const pct = q('.vg-pct');
    const sname = q('.vg-sname');
    const meter = q('.vg-meter');
    const hint = q('.vg-hint');
    const glow1 = q('.vg-glow1');
    const glow2 = q('.vg-glow2');
    const vals = Array.from(root.querySelectorAll('.vg-val'));
    const stage = q('.vg-stage');

    // position:sticky silently stops working if any ancestor has overflow:hidden.
    // overflow:clip looks identical but keeps sticky working, so swap it while this is mounted.
    const restoreOverflow = [];
    if (pin) {
      for (let el = root.parentElement; el && el !== document.documentElement; el = el.parentElement) {
        const cs = getComputedStyle(el);
        const hideX = cs.overflowX === 'hidden';
        const hideY = cs.overflowY === 'hidden';
        if (hideX || hideY) {
          restoreOverflow.push([el, el.style.overflowX, el.style.overflowY]);
          if (hideX) el.style.overflowX = 'clip';
          if (hideY) el.style.overflowY = 'clip';
        } else if (cs.overflowX === 'auto' || cs.overflowX === 'scroll' || cs.overflowY === 'auto' || cs.overflowY === 'scroll') {
          // eslint-disable-next-line no-console
          console.warn('[ValuesGarden] A scrolling ancestor can stop the pinned garden from sticking:', el);
        }
      }
    }

    plantsG.replaceChildren();
    fliesG.replaceChildren();

    const plants = PLANT_DEFS.map((def) => ({ ...def, layers: def.layers.map((l) => ({ ...l })) }));
    plants.forEach((P) => {
      const g = mk('g', {}, plantsG);
      P.seed = mk('ellipse', { cx: P.x, cy: GY + 9, rx: 7, ry: 4, fill: '#8a5d34' }, g);
      P.stem = mk('path', { fill: 'none', stroke: '#5aa05a', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
      P.l1 = mk('path', { d: LEAF, fill: '#4f9a4f' }, g);
      P.l2 = mk('path', { d: LEAF, fill: '#62b062' }, g);
      P.head = mk('g', {}, g);
      const inner = mk('g', { transform: `translate(0 ${P.cy})` }, P.head);
      P.layers.forEach((L) => {
        L.els = [];
        for (let k = 0; k < L.n; k += 1) {
          const a = L.full ? -180 + (k + (L.off || 0)) * (360 / L.n) : L.spread * ((2 * k) / (L.n - 1) - 1);
          L.els.push({ p: mk('path', { d: SHAPES[L.shape], fill: L.c }, inner), a });
        }
      });
      P.bud = mk('ellipse', { cx: 0, cy: P.budY, rx: P.budR[0], ry: P.budR[1], fill: P.budC }, inner);
      if (P.center) {
        P.disc = mk('circle', { cx: 0, cy: 0, r: P.center.r, fill: P.center.c }, inner);
        P.disc2 = mk('circle', { cx: 0, cy: 0, r: P.center.r * 0.55, fill: P.center.c2 }, inner);
      }
      P.tip = mk('circle', { r: 3, fill: '#5aa05a' }, g);
    });

    const flies = [];
    for (let i = 0; i < 10; i += 1) {
      flies.push({
        x: 90 + i * 80 + ((i * 37) % 30),
        y: 130 + ((i * 53) % 170),
        ph: i * 1.3,
        halo: mk('circle', { r: 8, fill: '#ffe58a', opacity: 0 }, fliesG),
        dot: mk('circle', { r: 2.4, fill: '#fff3b8', opacity: 0 }, fliesG),
      });
    }

    const target = () => {
      const r = root.getBoundingClientRect();
      if (pin) {
        // Starts at 0 the moment the stage reaches its pinned position (whole garden on screen),
        // reaches 1 when the track ends. A short pause at each end so it never feels rushed.
        const top = parseFloat(getComputedStyle(stage).top) || 0;
        const total = r.height - stage.offsetHeight;
        const raw = total > 0 ? clamp((top - r.top) / total, 0, 1) : 0;
        return clamp((raw - 0.04) / 0.9, 0, 1);
      }
      const vh = window.innerHeight;
      return clamp((vh * 0.9 - r.top) / (r.height * 0.85), 0, 1);
    };

    const render = (p, now) => {
      glow1.setAttribute('opacity', (0.03 + 0.12 * p).toFixed(3));
      glow1.setAttribute('r', (120 + 90 * p).toFixed(1));
      glow2.setAttribute('opacity', (0.02 + 0.05 * p).toFixed(3));
      glow2.setAttribute('r', (220 + 110 * p).toFixed(1));

      plants.forEach((P, pi) => {
        const g = clamp((p - P.s) / (P.e - P.s), 0, 1);
        const e = ss(0.02, 0.72, g);
        const h = P.H * e;
        const sw = reduce ? 0 : Math.sin(now * 0.0009 + P.ph) * 3 * e;
        const x = P.x;
        const tx = x + sw * 1.5;
        const ty = GY - h;
        P.stem.setAttribute('d', `M${x} ${GY} Q${(x + sw).toFixed(2)} ${(GY - h / 2).toFixed(2)} ${tx.toFixed(2)} ${ty.toFixed(2)}`);
        P.stem.style.opacity = e > 0.005 ? 1 : 0;
        P.seed.style.opacity = (1 - ss(0, 0.14, g)).toFixed(3);

        const hs = ss(0.4, 0.72, g);
        const o = ss(0.68, 1, g);
        const leaf = (node, t, ang, sc) => {
          const px = bez(t, x, x + sw, tx);
          const py = bez(t, GY, GY - h / 2, ty);
          node.setAttribute('transform', `translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${ang}) scale(${sc.toFixed(3)})`);
          node.style.opacity = sc > 0.01 ? 1 : 0;
        };
        leaf(P.l1, 0.22, -28, ss(0.05, 0.45, g) * P.lf);
        leaf(P.l2, 0.5, -152, ss(0.12, 0.55, g) * P.lf * 0.9);

        P.tip.setAttribute('cx', tx.toFixed(2));
        P.tip.setAttribute('cy', ty.toFixed(2));
        P.tip.setAttribute('r', (e > 0.01 ? 3 * (1 - hs) : 0).toFixed(2));
        P.head.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${hs.toFixed(3)})`);

        const sy = 0.3 + 0.7 * o;
        const k = 0.1 + 0.9 * o;
        P.layers.forEach((L) => {
          L.els.forEach((it) => {
            it.p.setAttribute('transform', `rotate(${(it.a * k).toFixed(2)}) translate(0 ${-P.r0}) scale(${L.len} ${(L.len * sy).toFixed(2)})`);
          });
        });
        P.bud.style.opacity = (1 - ss(0.1, 0.7, o)).toFixed(3);
        if (P.disc) {
          const d = ss(0.1, 0.5, o);
          P.disc.style.opacity = d;
          P.disc2.style.opacity = d;
        }
        const v = vals[pi];
        if (v) {
          v.style.opacity = o.toFixed(3);
          v.style.transform = `translateY(${((1 - o) * 10).toFixed(1)}px)`;
        }
      });

      const f = ss(0.82, 1, p);
      flies.forEach((F) => {
        const t = reduce ? 0 : now * 0.001;
        const dx = Math.sin(t * 0.7 + F.ph) * 14;
        const dy = Math.cos(t * 0.9 + F.ph * 1.7) * 10;
        const tw = reduce ? 1 : 0.55 + 0.45 * Math.sin(t * 2.2 + F.ph);
        [F.halo, F.dot].forEach((n) => {
          n.setAttribute('cx', (F.x + dx).toFixed(1));
          n.setAttribute('cy', (F.y + dy).toFixed(1));
        });
        F.halo.setAttribute('opacity', (f * tw * 0.22).toFixed(3));
        F.dot.setAttribute('opacity', (f * tw).toFixed(3));
      });

      const pc = Math.round(p * 100);
      fill.style.width = `${(p * 100).toFixed(1)}%`;
      heart.style.left = `${(p * 100).toFixed(1)}%`;
      pct.textContent = String(pc);
      meter.setAttribute('aria-valuenow', String(pc));
      for (let n = 0; n < STAGE_NAMES.length; n += 1) {
        if (p < STAGE_NAMES[n][0]) {
          sname.textContent = STAGE_NAMES[n][1];
          break;
        }
      }
      if (hint) hint.style.opacity = (1 - ss(0, 0.05, p)).toFixed(3);
    };

    let visible = true;
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }, { rootMargin: '100px' });
      observer.observe(root);
    }

    let cur = target();
    let last = performance.now();
    let raf = 0;
    render(cur, 0);
    const frame = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (visible) {
        const tp = target();
        cur = reduce ? tp : cur + (tp - cur) * (1 - Math.exp(-dt * 4.5));
        if (Math.abs(tp - cur) < 0.0004) cur = tp;
        render(cur, now);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
      restoreOverflow.forEach(([el, ox, oy]) => {
        el.style.overflowX = ox;
        el.style.overflowY = oy;
      });
    };
  }, [pin]);

  return (
    <section className={`vg content-section${pin ? ' vg-pin' : ''}`} ref={rootRef} aria-labelledby="vg-title">
      <div className="vg-stage">
        <div className="vg-head">
          <div>
            <h2 className="section-heading" id="vg-title">What we hold close</h2>
            <p className="section-lede">The way we learn matters as much as what we learn.</p>
          </div>
          <div className="vg-meter" role="progressbar" aria-label="Love and care" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
            <div className="vg-mtop">
              <span className="vg-mlabel">Love and care</span>
              <span className="vg-mpct"><span className="vg-pct">0</span>%</span>
            </div>
            <div className="vg-bar">
              <div className="vg-fill" />
              <svg className="vg-heart" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21C12 21 3 14.5 3 8.5A4.5 4.5 0 0 1 12 6.5A4.5 4.5 0 0 1 21 8.5C21 14.5 12 21 12 21Z" fill="#f4849f" />
              </svg>
            </div>
            <div className="vg-sname">A seed in the soil</div>
          </div>
        </div>

        <svg className="vg-svg" viewBox="0 0 900 430" preserveAspectRatio="xMidYMax meet" role="img" aria-label="A lotus, a marigold and a sunflower grow and bloom as you scroll">
          <circle className="vg-glow2" cx="450" cy="190" r="300" fill="#f2c94c" opacity="0" />
          <circle className="vg-glow1" cx="450" cy="190" r="170" fill="#f2c94c" opacity="0" />
          <path d="M0 372 Q110 360 230 372 T470 372 T710 372 T900 366 L900 430 L0 430Z" fill="#3b2a1c" />
          <ellipse cx="190" cy="375" rx="46" ry="9" fill="#4a3624" />
          <ellipse cx="450" cy="375" rx="46" ry="9" fill="#4a3624" />
          <ellipse cx="710" cy="375" rx="46" ry="9" fill="#4a3624" />
          <g className="vg-plants" />
          <g className="vg-flies" />
        </svg>

        <div className="vg-vals">
          {VALUES.map((v) => (
            <div className="vg-val" key={v.title}>
              <h3><i style={{ background: v.dot }} />{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>

        <div className="vg-hint">Scroll to give love and care<span aria-hidden="true">&#8595;</span></div>
      </div>
    </section>
  );
}
