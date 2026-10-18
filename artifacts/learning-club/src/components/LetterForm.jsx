import { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import emailjs from '@emailjs/browser';
import anime from 'animejs/lib/anime.es.js';
import './LetterForm.css';

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* The small rolled scroll (used on the table and in the pigeon's feet). */
function RollShapes() {
  return (
    <>
      <rect x="4" y="6" width="52" height="14" rx="7" fill="#f1e2bb" stroke="#a87b3f" strokeWidth="1.5" />
      <ellipse cx="8" cy="13" rx="4.5" ry="7" fill="#e3cf9c" stroke="#a87b3f" strokeWidth="1.5" />
      <ellipse cx="52" cy="13" rx="4.5" ry="7" fill="#e3cf9c" stroke="#a87b3f" strokeWidth="1.5" />
      <rect x="27" y="4" width="6" height="18" rx="1.5" fill="#b3262b" />
    </>
  );
}

/* The pigeon. It faces right, lives in <body> (portal) and is positioned with fixed coordinates. */
const Pigeon = forwardRef(function Pigeon(_, ref) {
  return (
    <div className="pigeon" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 140 116" width="140" height="116">
        <path d="M30 60L4 50L8 66L4 80L32 72Z" fill="#6f7a8d" />
        <g className="pg-wing back">
          <path d="M58 54C44 50 24 54 12 66C28 74 48 72 64 64Z" fill="#6f7a8d" />
        </g>
        <ellipse cx="64" cy="64" rx="38" ry="22" fill="#9aa5b8" />
        <ellipse cx="72" cy="72" rx="26" ry="12" fill="#bcc5d4" />
        <ellipse cx="92" cy="52" rx="13" ry="10" fill="#7fb5a8" />
        <g className="pg-head">
          <circle cx="100" cy="42" r="15" fill="#8a95a9" />
          <circle cx="105" cy="39" r="3.4" fill="#f0b64a" />
          <circle cx="105.6" cy="39" r="1.5" fill="#1d1d1d" />
          <path d="M114 41L129 45L114 48Z" fill="#e8d6bd" />
          <circle cx="116" cy="42" r="2" fill="#fff" />
        </g>
        <g className="pg-wing">
          <path d="M62 56C48 50 26 54 14 68C30 78 52 76 68 66Z" fill="#7d8798" stroke="#5f6a7d" strokeWidth="1.2" />
          <path d="M30 66L52 64M24 70L50 69" stroke="#5f6a7d" strokeWidth="1" />
        </g>
        <path d="M58 84L56 100M74 84L76 100" stroke="#e07b6a" strokeWidth="3" strokeLinecap="round" />
        <g className="pg-carried" transform="translate(34 86)"><RollShapes /></g>
      </svg>
    </div>
  );
});

/**
 * Contact form drawn as an old parchment letter.
 * On "Send": the letter folds into a scroll, a pigeon flies in, grabs it and flies away.
 * The form is sent through EmailJS before the pigeon animation plays.
 */
export default function LetterForm() {
  const stageRef = useRef(null);
  const paperRef = useRef(null);
  const formRef = useRef(null);
  const rollRef = useRef(null);
  const pigeonRef = useRef(null);
  const alive = useRef(true);
  const [phase, setPhase] = useState('idle'); // idle | sending | sent
  const [status, setStatus] = useState('idle');

  /* Entrance: the page unrolls when it scrolls into view. */
  useEffect(() => {
    alive.current = true;
    const paper = paperRef.current;
    const stage = stageRef.current;
    if (!paper || !stage) return undefined;

    if (reducedMotion() || !('IntersectionObserver' in window)) {
      paper.style.opacity = 1;
      return undefined;
    }

    anime.set(paper, { scaleY: 0.08, opacity: 0 });
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      anime({ targets: paper, scaleY: [0.08, 1], opacity: [0, 1], duration: 1100, easing: 'easeOutElastic(1, .8)' });
    }, { threshold: 0.2 });
    observer.observe(stage);

    return () => {
      alive.current = false;
      observer.disconnect();
      anime.remove([paperRef.current, rollRef.current, pigeonRef.current].filter(Boolean));
    };
  }, []);

  const unroll = async () => {
    anime.set(rollRef.current, { opacity: 0, scale: 1 });
    anime.set(paperRef.current, { scaleX: 1, scaleY: 0.08, rotateZ: 0, opacity: 0 });
    await anime({ targets: paperRef.current, scaleY: 1, opacity: 1, duration: 1100, easing: 'easeOutElastic(1, .8)' }).finished;
  };

  const flyAway = async () => {
    const paper = paperRef.current;
    const roll = rollRef.current;
    const bird = pigeonRef.current;

    stageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await wait(550);

    // 1. The letter folds up into a scroll.
    await anime.timeline({ easing: 'easeInOutQuad' })
      .add({ targets: paper, scaleY: 0.1, rotateZ: -1.5, duration: 600 })
      .add({ targets: paper, scaleX: 0.14, opacity: 0, duration: 380 })
      .add({ targets: roll, opacity: [0, 1], scale: [0.4, 1], duration: 380 }, '-=360').finished;
    if (!alive.current) return;

    // 2. The pigeon flies in from the left and lands on the scroll.
    const rect = roll.getBoundingClientRect();
    const landX = rect.left + rect.width / 2 - 64; // feet sit at (64, 99) inside the 140x116 pigeon
    const landY = rect.top + rect.height / 2 - 99;
    bird.style.visibility = 'visible';
    bird.classList.remove('is-landed', 'has-scroll');
    bird.classList.add('is-flying');
    anime.set(bird, { translateX: -190, translateY: Math.max(-20, landY - 300), scale: 1, rotate: 0, opacity: 1 });
    await anime({
      targets: bird,
      translateX: { value: landX, duration: 1700, easing: 'easeOutSine' },
      translateY: [
        { value: landY - 110, duration: 900, easing: 'easeInOutSine' },
        { value: landY, duration: 800, easing: 'easeOutCubic' },
      ],
    }).finished;
    if (!alive.current) return;

    // 3. It pecks at the scroll, then grabs it.
    bird.classList.remove('is-flying');
    bird.classList.add('is-landed');
    await wait(1000);
    roll.style.opacity = 0;
    bird.classList.add('has-scroll');
    await anime({ targets: bird, translateY: [{ value: landY - 18, duration: 180 }, { value: landY, duration: 180 }] }).finished;

    // 4. It flaps away into the sky with the letter.
    bird.classList.remove('is-landed');
    bird.classList.add('is-flying');
    await anime({
      targets: bird,
      translateX: [
        { value: landX + 90, duration: 700, easing: 'easeOutQuad' },
        { value: window.innerWidth + 260, duration: 1500, easing: 'easeInSine' },
      ],
      translateY: [
        { value: landY - 140, duration: 700, easing: 'easeOutQuad' },
        { value: -280, duration: 1500, easing: 'easeInSine' },
      ],
      scale: [{ value: 1, duration: 700 }, { value: 0.4, duration: 1500 }],
      rotate: [{ value: -8, duration: 700 }, { value: -14, duration: 1500 }],
    }).finished;
    bird.style.visibility = 'hidden';
    bird.classList.remove('is-flying', 'has-scroll');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (phase !== 'idle') return;
    const form = formRef.current;
    if (!form) return;

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS is not configured. Set the required VITE_EMAILJS_* variables.');
      setStatus('error');
      return;
    }

    setPhase('sending');
    setStatus('sending');

    try {
      await emailjs.sendForm(serviceId, templateId, form, { publicKey });
    } catch (error) {
      console.error('EmailJS error:', error);
      if (alive.current) {
        setStatus('error');
        setPhase('idle');
      }
      return;
    }

    if (!alive.current) return;
    if (!reducedMotion()) {
      try {
        await flyAway();
      } catch (error) {
        console.error('Letter delivery animation error:', error);
      }
    }
    if (!alive.current) return;

    setPhase('sent');
    setStatus('success');

    if (reducedMotion()) {
      form.reset();
      setPhase('idle');
      return;
    }
    await wait(1600);
    if (!alive.current) return;
    form.reset();
    await unroll();
    if (alive.current) setPhase('idle');
  };

  const statusMessage = {
    idle: '',
    sending: 'Sending your letter…',
    success: 'Your letter is on its way!',
    error: 'Sorry, your letter could not be sent. Please try again.',
  }[status];

  return (
    <div className="letter-stage" ref={stageRef}>
      <div className="letter-paper" ref={paperRef}>
        <form className="letter" ref={formRef} onSubmit={handleSubmit}>
          <p className="letter-salutation">To the friends at Nirvana,</p>

          <div className="letter-field">
            <label htmlFor="message">What is on your mind?</label>
            <textarea id="message" name="message" rows={6} placeholder="Tell us a little about what brings you here…" required />
          </div>

          <p className="letter-closing">Yours truly,</p>

          <div className="letter-row">
            <div className="letter-field">
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" autoComplete="name" placeholder="What should we call you?" required />
            </div>
            <div className="letter-field">
              <label htmlFor="email">Your email</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="So we can write back" required />
            </div>
          </div>

          <div className="letter-foot">
            <p className="letter-status" role="status" aria-live="polite">{statusMessage}</p>
            <button className="wax-seal" type="submit" disabled={phase !== 'idle'} aria-label="Send letter by pigeon">
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>

      <div className="letter-roll" ref={rollRef} aria-hidden="true">
        <svg viewBox="0 0 60 26" width="60" height="26"><RollShapes /></svg>
      </div>

      {createPortal(<Pigeon ref={pigeonRef} />, document.body)}
    </div>
  );
}
