import { useEffect, useRef } from 'react';
import './diya-board.css';

const DEFAULT_ITEMS = [
  { q: 'What is 12 × 7?', a: '84. Try 10 × 7 first, then add 2 × 7.' },
  { q: 'Why does the moon change shape?', a: 'We only ever see the part the sun is lighting.' },
  { q: 'How do you spell “friend”?', a: 'f-r-i-e-n-d. A friend is there till the end.' },
  { q: 'What is a half plus a quarter?', a: 'Three quarters. Fold a roti and see.' },
  { q: 'Why do we light a diya at Diwali?', a: 'To welcome light, hope, and a fresh start.' },
  { q: 'Is it okay to get it wrong?', a: 'Yes. That’s where we start figuring it out together.' },
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** A chalkboard of questions. The cursor is a diya; each answer shows only in its light. */
export default function DiyaBoard({
  heading = 'A little light helps.',
  intro = 'Move the diya over the board and each answer glows in its light. On a phone, tap a question.',
  items = DEFAULT_ITEMS,
}) {
  const boardRef = useRef(null);

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return undefined;
    const diya = board.querySelector('.dq-diya');
    const cards = Array.from(board.querySelectorAll('.dq-card'));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let centers = [];
    let R = 230;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const measure = () => {
      const br = board.getBoundingClientRect();
      centers = cards.map((c) => {
        const a = c.querySelector('.dq-a').getBoundingClientRect();
        return { x: a.left - br.left + a.width / 2, y: a.top - br.top + a.height / 2 };
      });
      R = clamp(br.width * 0.3, 170, 250);
    };
    const aim = (i) => {
      if (centers[i]) {
        tx = centers[i].x;
        ty = centers[i].y - 14;
      }
    };
    const pointer = (e) => {
      const br = board.getBoundingClientRect();
      tx = e.clientX - br.left;
      ty = e.clientY - br.top;
    };
    const focusHandlers = cards.map((_, i) => () => aim(i));

    board.addEventListener('pointermove', pointer);
    board.addEventListener('pointerdown', pointer);
    cards.forEach((c, i) => c.addEventListener('focus', focusHandlers[i]));
    window.addEventListener('resize', measure);

    measure();
    aim(0);
    cx = tx;
    cy = ty;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measure();
        aim(0);
        cx = tx;
        cy = ty;
      });
    }

    const draw = (now) => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      const fl = reduce ? 1 : 1 + 0.03 * Math.sin(now / 90) + 0.02 * Math.sin(now / 37);
      board.style.setProperty('--x', `${cx.toFixed(1)}px`);
      board.style.setProperty('--y', `${cy.toFixed(1)}px`);
      board.style.setProperty('--r', `${(R * fl).toFixed(1)}px`);
      diya.style.transform = `translate(${(cx - 32).toFixed(1)}px, ${(cy - 22).toFixed(1)}px)`;
      cards.forEach((c, i) => {
        const m = centers[i];
        if (!m) return;
        const d = Math.hypot(m.x - cx, m.y - cy);
        const op = clamp(1 - (d - R * 0.25) / (R * 0.6), 0, 1);
        c.querySelector('.dq-a').style.opacity = op.toFixed(3);
        c.querySelector('.dq-q').style.opacity = (0.62 + 0.38 * op).toFixed(3);
      });
    };

    let visible = true;
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        if (visible) measure();
      }, { rootMargin: '100px' });
      observer.observe(board);
    }

    let raf = 0;
    draw(0);
    const frame = (now) => {
      if (visible) draw(now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
      board.removeEventListener('pointermove', pointer);
      board.removeEventListener('pointerdown', pointer);
      cards.forEach((c, i) => c.removeEventListener('focus', focusHandlers[i]));
      window.removeEventListener('resize', measure);
    };
  }, [items]);

  return (
    <section className="dq content-section" aria-labelledby="dq-title">
      <h2 className="section-heading" id="dq-title">{heading}</h2>
      <p className="section-lede dq-intro">{intro}</p>
      <div className="dq-board" ref={boardRef}>
        <div className="dq-cards">
          {items.map((it) => (
            <div className="dq-card" tabIndex={0} key={it.q}>
              <div className="dq-q">{it.q}</div>
              <div className="dq-a">{it.a}</div>
            </div>
          ))}
        </div>
        <div className="dq-veil" />
        <div className="dq-diya" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <path d="M10 40 L3 34 L13 37Z" fill="#b5532a" />
            <path d="M10 40 C12 58 52 58 54 40 C46 45 18 45 10 40Z" fill="#c2602f" />
            <ellipse cx="32" cy="40" rx="22" ry="5" fill="#d9793c" />
            <ellipse cx="32" cy="40" rx="17" ry="3" fill="#6b3418" />
            <circle cx="23" cy="50" r="1.2" fill="#f0b07a" />
            <circle cx="32" cy="53" r="1.2" fill="#f0b07a" />
            <circle cx="41" cy="50" r="1.2" fill="#f0b07a" />
            <rect x="31" y="33" width="2" height="7" fill="#2b1c10" />
            <g className="dq-flame">
              <path d="M32 34 C23 27 27 16 32 6 C37 16 41 27 32 34Z" fill="#ffa928" />
              <path d="M32 32 C28 27 30 21 32 16 C34 21 36 27 32 32Z" fill="#fff0b0" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}