import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ArrowRight, ArrowUp, BookOpen, Facebook, Heart, Instagram, Lightbulb, Mail, MapPin, Menu, MessageCircle, Sprout, Twitter, Users, X, Youtube } from 'lucide-react';
import anime from 'animejs/lib/anime.es.js';
import { stepAvatars } from './step-avatars';
import kunalPhoto from '@/components/Kunal.png';
import abhishekPhoto from '@/components/Abhishek.png';
import aryanPhoto from '@/components/aryan.png';
import './about-heavy.css';
import Valuesgarden from '@/components/Valuesgarden';
import Diyaboard from '@/components/Diyaboard';
import Meettheteam from './components/Team/Team';
import LocationMap from '@/components/Location';
import Centres from '@/components/centres/Centres';
import Developers from './components/developers';
import ContactForm from '@/components/LetterForm';
import EventsTrail from '@/components/Eventstrail';
import SwingGallery from '@/components/SwingGallery';
import FacultySection from '@/components/Facultysection';
const Admin = lazy(() => import('./components/Admin/Admin'));
const queryClient = new QueryClient();
const navigation = [
  { label: 'HOME', href: '/', title: 'Home' },
  { label: 'ABOUT', href: '/about', title: 'About' },
  { label: 'TEAM', href: '/team', title: 'Team' },
  { label: 'CENTRES', href: '/centres', title: 'Centres' },
  { label: 'EVENTS', href: '/events', title: 'Events' },
  { label: 'GALLERY', href: '/gallery', title: 'Gallery' },
  { label: 'CONTACT', href: '/contact', title: 'Contact' },
];
const footerLinks = [
  { label: 'HOME', href: '/', title: 'Home' },
  { label: 'ABOUT', href: '/about', title: 'About' },
  { label: 'DEVELOPERS', href: '/developers', title: 'Developers' },
  { label: 'ADMIN', href: '/admin', title: 'Admin' },
];

function BrandLogo({ className = '' }) {
  return (
    <img
      className={`brand-logo ${className}`}
      src={`${import.meta.env.BASE_URL}logo1.jpeg`}
      alt=""
      width="44"
      height="44"
    />
  );
}

function SiteFrame({ children }) {
  const [location] = useLocation();
  const pageName = navigation.find((item) => item.href === location)?.title ?? 'Home';

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (

    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to page content</a>
      <aside className="side-rail" aria-label="Main navigation">
        <Link href="/" className="brand-mark" aria-label="NIRVANA home">
         <BrandLogo />
          <div className="brand-name">NIRVANA</div>
          <div className="brand-note">A Reason To Smile</div>
        </Link>
        <div className="rail-rule" />
        <p className="nav-label">FIND YOUR WAY</p>
        <nav className="side-nav">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={location === item.href ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="rail-bottom">
          <div className="rail-doodle" aria-hidden="true">✳ &nbsp; learn together</div>
          {/* <div className="rail-invite">
            There’s a place for you here.
            <br />
            <Link href="/contact">COME SAY HELLO <ArrowRight size={12} /></Link>
          </div> */}
        </div>
      </aside>

      <header className={`mobile-nav${menuOpen ? ' is-open' : ''}`}>
        <div className="mobile-nav-top">
          <Link href="/" className="mobile-home" aria-label="NIRVANA home">
            <BrandLogo className="mobile-logo" />
            <span className="mobile-brand-name">NIRVANA</span>
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
        <nav id="mobile-navigation" className="mobile-links" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={location === item.href ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="board-frame">
        <main className={`board${location === '/about' ? ' board-about' : ''}`} id="main-content" aria-label={`${pageName} page`}>
          <div className="board-content" key={location}>
            
            {children}
           
          </div>
        </main>
      </div>
       <Footer />
    </div>
  );
}

const socials = [
  { label: 'Instagram', href: 'https://instagram.com/', Icon: Instagram },
  { label: 'Facebook', href: 'https://facebook.com/', Icon: Facebook },
  { label: 'Twitter', href: 'https://twitter.com/', Icon: Twitter },
  { label: 'YouTube', href: 'https://youtube.com/', Icon: Youtube },
  { label: 'Email', href: 'mailto:hello@example.com', Icon: Mail },
];

function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-left">
          <div className="footer-logos">
            <img src={`${import.meta.env.BASE_URL}logo1.jpeg`} alt="" />
            <img src={`${import.meta.env.BASE_URL}logo2.png`} alt="" />
          </div>
          <div className="footer-title">NIRVANA</div>
          <div className="footer-sub">A Reason to Smile</div>
        </div>

        <div className="footer-right">
          <nav className="footer-links" aria-label="Footer navigation">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href}>{item.title}</Link>
            ))}
          </nav>
          <div className="footer-socials">
            {socials.map(({ label, href, Icon }) => (
              <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer">
                <Icon size={30} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`back-to-top${showTop ? ' is-visible' : ''}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp size={24} />
      </button>
    </footer>
  );
}

function PageMeta({ title, description }) {
  useEffect(() => {
    document.title = `${title} | The Learning Nook`;
    const updateMeta = (selector, attribute, value) => {
      const meta = document.querySelector(selector);
      meta?.setAttribute(attribute, value);
    };
    updateMeta('meta[name="description"]', 'content', description);
    updateMeta('meta[property="og:title"]', 'content', `${title} | The Learning Nook`);
    updateMeta('meta[property="og:description"]', 'content', description);
    updateMeta('meta[name="twitter:title"]', 'content', `${title} | The Learning Nook`);
    updateMeta('meta[name="twitter:description"]', 'content', description);
  }, [title, description]);
  return null;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function Reveal({
  as: Tag = 'div',
  animation = 'up',
  delay = 0,
  threshold = 0.2,
  once = false,
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const viewportHeight = entry.rootBounds?.height ?? window.innerHeight;
        const hasReachedThreshold =
          entry.intersectionRatio >= threshold ||
          entry.intersectionRect.height >= viewportHeight * threshold;
        if (hasReachedThreshold) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!entry.isIntersecting) {
          setVisible(false);
        }
      },
      { threshold: [0, 0.05, threshold, 0.5], rootMargin: '0px 0px -8% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, once]);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${animation}${visible ? ' is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function ChalkUnderline({ className = '' }) {
  return (
    <Reveal as="div" animation="fade" className={`chalk-draw ${className}`} aria-hidden="true">
      <svg viewBox="0 0 420 20" preserveAspectRatio="none">
        <path d="M4 12 C110 4 300 4 416 9" pathLength="1" />
      </svg>
    </Reveal>
  );
}

function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let frame = 0;

    const update = () => {
      frame = 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
      barRef.current?.style.setProperty('--progress', progress);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="scroll-progress" ref={barRef} aria-hidden="true" />;
}

const aboutValues = [
  { num: '01', title: 'Kindness first', text: 'Every child deserves patience, respect, and a warm welcome.' },
  { num: '02', title: 'Curiosity over perfection', text: 'Questions and mistakes are part of the good work of learning.' },
  { num: '03', title: 'We belong to each other', text: 'We make a community where children and mentors can show up as themselves.' },
];

const aboutSteps = [
  { label: 'First', color: 'var(--sun)', title: 'Education for All', text: 'We provide educational support and guidance to help children strengthen their academic foundations and develop a love for learning.' },
  { label: 'Second', color: 'var(--sky)', title: 'Building Moral Values', text: 'We encourage honesty, discipline, kindness, respect, and compassion to help children grow into responsible members of society.' },
  { label: 'Third', color: 'var(--rose)', title: 'Confidence and Creativity', text: 'We motivate children to ask questions, express their ideas, explore their interests, and approach new challenges with confidence.' },
  { label: 'Fourth', color: 'var(--Mint)', title: 'Life Skills Development', text: 'We help children develop essential life skills such as communication, teamwork, problem-solving, and decision-making to prepare them for everyday challenges.' },
  { label: 'Fifth', color: 'var(--Peach)', title: 'A Community That Cares', text: 'We foster a friendly, inclusive space where every child feels welcomed, respected, encouraged, and valued.' },
  { label: 'Sixth', color: 'var(--Lavender)', title: 'Awareness and Social Responsibility', text: 'We encourage children to understand their role in society, respect diversity, care for the environment, and contribute positively to their communities.' },
];

function ChalkboardHero() {
  const boardRef = useRef(null);
  const stickRef = useRef(null);
  const underlineRef = useRef(null);
  const runRef = useRef(0);

  useEffect(() => {
    const board = boardRef.current;
    const stick = stickRef.current;
    const underline = underlineRef.current;
    if (!board || !stick || !underline) return undefined;

    board.classList.add('animation-ready');
    const elements = Array.from(board.querySelectorAll('[data-write]'));
    const texts = elements.map((element) => element.textContent ?? '');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

    const split = (element, text) => {
      element.replaceChildren();
      return Array.from(text, (character) => {
        const span = document.createElement('span');
        span.className = 'chalk-letter';
        span.textContent = character;
        element.appendChild(span);
        return span;
      });
    };


    const moveStick = (span) => {
      const boardBounds = board.getBoundingClientRect();
      const letterBounds = span.getBoundingClientRect();
      stick.style.left = `${letterBounds.right - boardBounds.left - 14}px`;
      stick.style.top = `${letterBounds.top - boardBounds.top + letterBounds.height * 0.62}px`;
    };

    const play = async () => {
      const run = ++runRef.current;
      underline.classList.remove('is-writing');
      stick.style.opacity = '0';
      const letters = elements.map((element, index) => split(element, texts[index]));

      if (reduceMotion) {
        letters.flat().forEach((letter) => letter.classList.add('is-writing'));
        underline.classList.add('is-writing');
        return;
      }

      await wait(300);
      if (run !== runRef.current) return;
      stick.style.opacity = '1';

      for (let index = 0; index < letters.length; index += 1) {
        const isHeading = elements[index].classList.contains('chalk-hero-line');
        const step = isHeading ? 170 : (index === 0 ? 55 : 28);
        const duration = isHeading ? 0.3 : 0.14;

        for (const letter of letters[index]) {
          if (run !== runRef.current) return;
          letter.style.setProperty('--write-duration', `${duration}s`);
          letter.classList.add('is-writing');
          moveStick(letter);
          await wait(letter.textContent === ' ' ? step / 2 : step);
        }

        if (elements[index].classList.contains('chalk-hero-line') && elements[index].textContent.startsWith('Shine')) {
          await wait(200);
          if (run !== runRef.current) return;
          underline.classList.add('is-writing');
          await wait(800);
        }
        await wait(250);
      }
      if (run === runRef.current) stick.style.opacity = '0';
    };

    const replay = board.querySelector('.chalk-replay');
    replay?.addEventListener('click', play);
    const fontReady = document.fonts?.ready ?? Promise.resolve();
    fontReady.then(() => {
      if (board.isConnected) void play();
    });

    return () => {
      runRef.current += 1;
      replay?.removeEventListener('click', play);
    };
  }, []);

  return (
    <>
    <section
    className="hero-banner"
    style={{ '--hero-image': `url(${import.meta.env.BASE_URL}hero.png)` }}
  >
      <svg className="chalk-filter" aria-hidden="true" focusable="false">
        <filter id="chalk-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" />
        </filter>
      </svg>
     
      <section className="home-hero chalk-hero" ref={boardRef} aria-label="Learn. Grow. Shine.">
        <p className="chalk-hero-tag" data-write>pull up a chair, there's room to grow</p>
        <h1 className="chalk-hero-line" data-write>NIRVANA</h1>
        {/* <h1 className="chalk-hero-line" data-write>Grow.</h1> */}
        <h2 className="chalk-hero-line chalk-hero-subtitle chalk-yellow" data-write>A Reason to Smile</h2>
        <svg className="chalk-underline" ref={underlineRef} viewBox="0 0 420 20" aria-hidden="true">
          <path d="M4 12 C110 4 300 4 416 9" />
        </svg>
        <p className="chalk-hero-copy" data-write>
          A caring learning club for underprivileged children, where every child feels valued and inspired to learn and grow.
        </p>
        <div className="chalk-stick" ref={stickRef} aria-hidden="true" />
        <div className="chalk-actions">
          <Link href="/events" className="chalk-button">See what we do <ArrowRight size={14} /></Link>
          <Link href="/about" className="chalk-button outline">Our little story</Link>
          <button type="button" className="chalk-replay">Write again</button>
        </div>
      </section>
       </section>
    </>
  );
}

function HomePage() {
  return (
    <>
      <PageMeta title="Home" description="A joyful community club where volunteer mentors help children learn, grow in confidence, and feel they belong." />
      <ChalkboardHero />

      <div className="home-rest">
        <Valuesgarden />
        <Diyaboard/>
      </div>
      
    </>
  );
}

function AboutLetters({ as: Tag = 'span', text, ...rest }) {
  return (
    <Tag aria-label={text} {...rest}>
      {text.split(' ').map((word, i) => (
        <span className="ah-word" aria-hidden="true" key={i}>
          {Array.from(word).map((character, j) => <span className="ah-l" key={j}>{character}</span>)}
        </span>
      ))}
    </Tag>
  );
}

function AboutWords({ text, ...rest }) {
  return (
    <blockquote aria-label={text} {...rest}>
      {text.split(' ').map((word, i) => (
        <span className="ah-w" aria-hidden="true" key={i}><span>{word}</span></span>
      ))}
    </blockquote>
  );
}

const aboutShape = (pointAt) => {
  const points = [];
  for (let i = 0; i < 60; i += 1) {
    const [x, y] = pointAt((i / 60) * Math.PI * 2);
    points.push(`${(200 + x).toFixed(1)},${(200 + y).toFixed(1)}`);
  }
  return points.join(' ');
};

const aboutShapes = [
  aboutShape((t) => [152 * Math.sin(t) ** 3, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 9.5 + 10]),
  aboutShape((t) => {
    const radius = 120 + 58 * Math.cos(5 * t);
    return [radius * Math.cos(t), radius * Math.sin(t)];
  }),
  aboutShape((t) => [150 * Math.cos(t), 150 * Math.sin(t)]),
];

function AboutPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const reduce = prefersReducedMotion();
    const qs = (selector, scope = root) => scope.querySelector(selector);
    const qa = (selector, scope = root) => Array.from(scope.querySelectorAll(selector));
    const observers = [];
    const listeners = [];
    const confetti = new Set();
    let raf = 0;
    if (reduce || !('IntersectionObserver' in window)) root.classList.add('ah-static');

    const listen = (element, type, handler) => {
      element.addEventListener(type, handler);
      listeners.push(() => element.removeEventListener(type, handler));
    };
    const register = (element, onEnter, onLeave, threshold = 0.3) => {
      if (reduce || !('IntersectionObserver' in window)) return;
      onLeave(element);
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const height = entry.rootBounds?.height ?? window.innerHeight;
          if (entry.intersectionRatio >= threshold || entry.intersectionRect.height >= height * threshold) {
            onEnter(entry.target);
          } else if (!entry.isIntersecting) {
            onLeave(entry.target);
          }
        });
      }, { threshold: [0, 0.05, threshold, 0.5] });
      observer.observe(element);
      observers.push(observer);
    };

    const hero = qs('.ah-hero');
    const heading = qs('.ah-hero h1');
    const heroLetters = qa('.ah-l', heading);
    const subtitle = qs('.ah-sub');
    const underline = qs('.ah-u path');
    const dotsEl = qs('.ah-dots');
    const cols = Math.min(40, Math.ceil(window.innerWidth / 38));
    const rows = Math.min(24, Math.ceil(hero.offsetHeight / 38));
    dotsEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    dotsEl.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    dotsEl.innerHTML = '<i></i>'.repeat(cols * rows);
    const dots = qa('i', dotsEl);
    const grid = { grid: [cols, rows] };
    const wave = anime({
      targets: dots,
      scale: [{ value: 0.3, duration: 0 }, { value: 2.4, duration: 500, easing: 'easeOutSine' }, { value: 1, duration: 900, easing: 'easeInOutQuad' }],
      opacity: [{ value: 0.2, duration: 0 }, { value: 1, duration: 500 }, { value: 0.4, duration: 900 }],
      delay: anime.stagger(70, { ...grid, from: 'center' }),
      endDelay: 700,
      loop: true,
      autoplay: false,
    });

    const onHeroClick = (event) => {
      if (reduce) return;
      const bounds = dotsEl.getBoundingClientRect();
      const col = Math.min(cols - 1, Math.max(0, Math.floor(((event.clientX - bounds.left) / bounds.width) * cols)));
      const row = Math.min(rows - 1, Math.max(0, Math.floor(((event.clientY - bounds.top) / bounds.height) * rows)));
      anime({
        targets: dots,
        backgroundColor: [{ value: '#f2c14e', duration: 150 }, { value: '#f5f1e6', duration: 800 }],
        translateY: [{ value: -14, duration: 200 }, { value: 0, duration: 600 }],
        delay: anime.stagger(35, { ...grid, from: row * cols + col }),
      });
    };
    const onHeroMove = (event) => {
      if (reduce) return;
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      heading.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg)`;
    };
    const onHeroLeave = () => { heading.style.transform = ''; };
    listen(hero, 'click', onHeroClick);
    listen(hero, 'mousemove', onHeroMove);
    listen(hero, 'mouseleave', onHeroLeave);

    register(hero, () => {
      wave.play();
      anime.remove(heroLetters);
      anime({
        targets: heroLetters,
        translateY: [150, 0],
        rotateX: [-100, 0],
        rotateZ: () => [anime.random(-25, 25), 0],
        opacity: [0, 1],
        delay: anime.stagger(55, { from: 'center' }),
        duration: 1500,
        easing: 'easeOutElastic(1, .55)',
      });
      anime({ targets: subtitle, opacity: [0, 1], translateY: [20, 0], delay: 900, duration: 800, easing: 'easeOutCubic' });
      anime({ targets: underline, strokeDashoffset: [anime.setDashoffset, 0], delay: 1100, duration: 1200, easing: 'easeInOutSine' });
    }, () => {
      wave.pause();
      anime.set(heroLetters, { opacity: 0 });
      anime.set(subtitle, { opacity: 0 });
      anime.set(underline, { strokeDashoffset: anime.setDashoffset });
    });

    qa('.ah-rv').forEach((element) => {
      const isHeading = element.tagName === 'H2';
      const targets = isHeading ? qa('.ah-l', element) : element;
      register(element, () => {
        anime.remove(targets);
        anime({
          targets,
          opacity: [0, 1],
          translateY: [isHeading ? 70 : 50, 0],
          rotate: [isHeading ? 10 : 0, 0],
          delay: isHeading ? anime.stagger(30) : 0,
          duration: 1000,
          easing: 'easeOutExpo',
        });
      }, () => {
        anime.remove(targets);
        anime.set(targets, { opacity: 0 });
      });
    });

    const quote = qs('.ah-q');
    const quoteWords = qa('.ah-w > span', quote);
    register(quote, () => {
      anime.remove(quoteWords);
      anime({ targets: quoteWords, translateY: ['115%', 0], rotateZ: [10, 0], delay: () => anime.random(0, 600), duration: 1000, easing: 'easeOutExpo' });
    }, () => {
      anime.remove(quoteWords);
      anime.set(quoteWords, { translateY: '115%', rotateZ: 10 });
    }, 0.4);

    const polygon = qs('.ah-poly');
    polygon.setAttribute('points', aboutShapes[0]);
    polygon.setAttribute('fill', '#e8a0a8');
    polygon.setAttribute('stroke', '#e8a0a8');
    const keyframes = (start, end) => [
      { value: start, delay: 300, duration: 700, easing: 'easeInOutCubic' },
      { value: end, delay: 800, duration: 700, easing: 'easeInOutCubic' },
    ];
    const morph = anime({
      targets: polygon,
      points: keyframes(aboutShapes[1], aboutShapes[2]),
      fill: keyframes('#8cc3dd', '#a9c8a2'),
      stroke: keyframes('#8cc3dd', '#a9c8a2'),
      strokeWidth: [{ value: 7, duration: 1500, easing: 'easeInOutSine' }, { value: 3, duration: 1500, easing: 'easeInOutSine' }],
      autoplay: false,
    });
    const ring = qs('.ah-ring');
    const meter = qs('.ah-meter i');
    const values = qa('.ah-val');
    let currentValue = 0;

    qa('.ah-step').forEach((card, index) => {
      register(card, () => {
        card.classList.add('is-visible');
        anime.remove(card);
        anime({ targets: card, opacity: 1, translateY: 0, rotateX: 0, scale: 1, delay: (index % 3) * 140, duration: 1200, easing: 'easeOutElastic(1, .7)' });
      }, () => {
        card.classList.remove('is-visible');
        anime.remove(card);
        anime.set(card, { opacity: 0, translateY: 90, rotateX: -60, scale: 0.9 });
      }, 0.2);

      const tilt = qs('.ah-tilt', card);
      const onTiltMove = (event) => {
        if (reduce) return;
        const bounds = tilt.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        tilt.style.transform = `perspective(700px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) scale(1.03)`;
        tilt.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
        tilt.style.setProperty('--my', `${(y + 0.5) * 100}%`);
        tilt.style.setProperty('--g', 1);
      };
      const onTiltLeave = () => {
        tilt.style.transform = '';
        tilt.style.setProperty('--g', 0);
      };
      listen(tilt, 'mousemove', onTiltMove);
      listen(tilt, 'mouseleave', onTiltLeave);
    });

    const big = qs('.ah-big');
    const bigLetters = qa('.ah-l', big);
    register(big, () => {
      anime.remove(bigLetters);
      anime({
        targets: bigLetters,
        translateY: [-220, 0],
        rotate: () => [anime.random(-40, 40), 0],
        opacity: [0, 1],
        delay: anime.stagger(50),
        duration: 1400,
        easing: 'easeOutElastic(1, .6)',
        complete: () => anime({
          targets: bigLetters,
          translateY: [{ value: -14, duration: 500 }, { value: 0, duration: 500 }],
          delay: anime.stagger(80),
          loop: true,
          easing: 'easeInOutSine',
        }),
      });
    }, () => {
      anime.remove(bigLetters);
      anime.set(bigLetters, { opacity: 0 });
    }, 0.4);

    const button = qs('.ah-btn');
    const onButtonClick = (event) => {
      if (reduce) return;
      anime({ targets: event.currentTarget, scale: [0.88, 1], duration: 800, easing: 'easeOutElastic(1, .5)' });
      for (let i = 0; i < 34; i += 1) {
        const chip = document.createElement('i');
        const size = anime.random(6, 13);
        chip.className = 'ah-chip';
        chip.style.cssText = `left:${event.clientX}px;top:${event.clientY}px;width:${size}px;height:${size}px;background:${['#f2c14e', '#8cc3dd', '#e8a0a8', '#a9c8a2', '#f0b58f', '#b9a9d9'][i % 6]}`;
        document.body.appendChild(chip);
        confetti.add(chip);
        const angle = Math.random() * Math.PI * 2;
        const distance = anime.random(90, 300);
        anime({
          targets: chip,
          translateX: Math.cos(angle) * distance,
          translateY: Math.sin(angle) * distance + anime.random(20, 90),
          rotate: anime.random(-540, 540),
          scale: [1, 0],
          opacity: [1, 0],
          duration: anime.random(900, 1500),
          easing: 'easeOutCubic',
          complete: () => {
            chip.remove();
            confetti.delete(chip);
          },
        });
      }
    };
    listen(button, 'click', onButtonClick);

    const doodleLayer = qs('.ah-doodles');
    doodleLayer.innerHTML = '';
    const doodles = [];
    const glyphs = ['✳', '★', '✦', '+', '✿'];
    const colors = ['#f2c14e', '#8cc3dd', '#e8a0a8', '#a9c8a2', '#f0b58f', '#b9a9d9'];
    if (!reduce) {
      for (let i = 0; i < 16; i += 1) {
        const element = document.createElement('i');
        element.textContent = glyphs[i % glyphs.length];
        element.style.left = `${anime.random(2, 96)}%`;
        element.style.fontSize = `${anime.random(18, 46)}px`;
        element.style.color = colors[i % colors.length];
        doodleLayer.appendChild(element);
        doodles.push({ element, top: anime.random(0, window.innerHeight), speed: anime.random(5, 16) / 10 });
      }
    }

    const row1 = qs('.ah-row');
    const row2 = qs('.ah-row.ah-o');
    let offset1 = 0;
    let offset2 = 0;
    let velocity = 0;
    let lastY = window.scrollY;
    const tick = () => {
      const y = window.scrollY;
      velocity += ((y - lastY) - velocity) * 0.12;
      lastY = y;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      qs('.ah-bar').style.setProperty('--p', maxScroll > 0 ? Math.min(1, y / maxScroll) : 0);

      if (!reduce) {
        const speed = 1.2 + Math.abs(velocity) * 0.5;
        const skew = `skewX(${-velocity * 0.5}deg)`;
        // const width1 = row1.scrollWidth / 4;
        // const width2 = row2.scrollWidth / 4;
        // if (width1 > 0 && width2 > 0) {
        //   offset1 += speed;
        //   offset2 += speed;
        //   row1.style.transform = `translateX(${-(offset1 % width1)}px) ${skew}`;
        //   row2.style.transform = `translateX(${(offset2 % width2) - width2}px) ${skew}`;
        // }
        const height = window.innerHeight + 120;
        doodles.forEach(({ element, top, speed: drift }) => {
          const yOffset = ((((top - y * drift) % height) + height) % height) - 60;
          element.style.transform = `translateY(${yOffset}px) rotate(${y * drift * 0.2}deg)`;
        });
      }

      const pin = qs('.ah-pin');
      if (!reduce) {
        const bounds = pin.getBoundingClientRect();
        const range = Math.max(1, pin.offsetHeight - window.innerHeight);
        const progress = Math.max(0, Math.min(1, -bounds.top / range));
        morph.seek(progress * 3000);
        ring.style.transform = `rotate(${progress * 540}deg)`;
        meter.style.setProperty('--p', progress);
        const active = progress < 0.22 ? 0 : progress < 0.72 ? 1 : 2;
        if (active !== currentValue) {
          currentValue = active;
          values.forEach((value, index) => value.classList.toggle('on', index === active));
        }
        raf = window.requestAnimationFrame(tick);
      }
    };
    if (!reduce) tick();

    return () => {
      window.cancelAnimationFrame(raf);
      observers.forEach((observer) => observer.disconnect());
      listeners.forEach((removeListener) => removeListener());
      anime.remove(qa('*'));
      confetti.forEach((chip) => {
        anime.remove(chip);
        chip.remove();
      });
    };
  }, []);

  return (
    <>
      <PageMeta title="About" description="Meet the values and approach behind The Learning Nook, a supportive community learning club." />
      <div className="ah" ref={rootRef}>
        <div className="ah-bar" aria-hidden="true" />
        <div className="ah-doodles" aria-hidden="true" />
        <div className="ah-main">
          <section className="ah-hero">
            <div className="ah-dots" aria-hidden="true" />
            <div className="ah-hero-in">
              <AboutLetters as="h1" text="About Nirvana" />
              <svg className="ah-u" viewBox="0 0 420 20" aria-hidden="true">
                <path d="M4 12 C110 4 300 4 416 9" fill="none" stroke="#f2c14e" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="ah-sub">Education, Values, and a Brighter Future</p>
            </div>
            <div className="ah-hint"></div>
          </section>

          

          <section className="ah-wrap">
            <AboutLetters as="h2" className="ah-rv" text="More than homework help" />
            <p className="ah-rv">At Nirwana, we believe every child deserves the opportunity to learn, grow, and dream without limits. We are a learning club dedicated to educating underprivileged children, supporting their academic journey, and nurturing the values that help them become kind, confident, and responsible individuals.</p>
            <p className="ah-rv">We aim to create a welcoming environment where children feel supported, discover their potential, and understand that their circumstances do not define their future.</p>
            <AboutWords className="ah-q" text="“You don’t have to know it yet. We can figure it out together.”" />
          </section>

          <section className="ah-pin">
            <div className="ah-pin-in">
              <div className="ah-shape">
                <svg viewBox="0 0 400 400" aria-hidden="true">
                  <circle className="ah-ring" cx="200" cy="200" r="190" fill="none" stroke="#f5f1e6" strokeOpacity=".4" strokeWidth="3" strokeDasharray="2 12" strokeLinecap="round" />
                  <polygon className="ah-poly" fillOpacity=".28" strokeWidth="3" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h2>What we hold close</h2>
                <p className="ah-pin-lede">The way we learn matters as much as what we learn.</p>
                <div className="ah-vals">
                  {aboutValues.map((value, index) => (
                    <div className={`ah-val${index === 0 ? ' on' : ''}`} key={value.num}>
                      <b>{value.num}</b><h3>{value.title}</h3><p>{value.text}</p>
                    </div>
                  ))}
                </div>
                <div className="ah-meter"><i /></div>
              </div>
            </div>
          </section>

          <section className="ah-wrap ah-work">
            <AboutLetters as="h2" className="ah-rv ah-center" text="What We Do" />
            <div className="ah-steps">
              {aboutSteps.map((step, index) => (
                <article className="ah-step" style={{ '--sc': step.color }} key={step.label}>
                  <div className="ah-tilt">
                    <div className="ah-step-avatar" aria-hidden="true" dangerouslySetInnerHTML={{ __html: stepAvatars[index] }} />
                    <em className="ah-lb">{step.label}</em>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="ah-outro">
            <div>
              <AboutLetters as="div" className="ah-big" text="Learn together." />
              <Link className="ah-btn" href="/contact">Come say hello</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function TeamPage() {
   const members = [
    { name: 'Aryan G.',  post: 'Co-convenor', bio: 'mujhe meetha pasand h', photo: aryanPhoto, instagram: 'nirvana.club', linkedin: 'asha-r', email: 'asha@example.com' },
    { name: 'Kunal L.', post: 'Sexkaretary',            bio: 'Gaandu h bsdka', photo: kunalPhoto, instagram: '', linkedin: '', email: '' },
    { name: 'Abhishek D.', post: 'Creative Head',           bio: 'meetha', photo: abhishekPhoto, instagram: '', linkedin: '', email: '' },
  ];

  const faculty = [
  { name: 'Dr. Full Name', post: 'Faculty Chairperson',    bio: 'Two to three lines about them.' },
  { name: 'Dr. Full Name', post: 'Faculty Co-Chairperson', bio: 'Two to three lines about them.' },
  { name: 'Dr. Full Name', post: 'Faculty Co-Chairperson', bio: 'Two to three lines about them.' },
];
  return (
    <>
      <PageMeta title="Team" description="Meet the mentors, organizers, and volunteers who make The Learning Nook a welcoming place to learn and grow." />
      
      <FacultySection faculty={faculty} />

      <Meettheteam members={members} />
    </>
  );
}

function CentresPage() {
  return (
    <>
      <PageMeta title="Centres" description="Explore the NIRVANA learning centres, meet the centre heads, and find contact and location details." />
      <header className="subpage-head">
        <p className="eyebrow">A PLACE TO LEARN TOGETHER</p>
        <h1 className="page-heading">Our Centres.</h1>
        <p className="page-intro">Meet the people and places that make our learning community feel like home.</p>
      </header>
      <Centres />
    </>
  );
}

function EventsPage() {
  return (
    <>
      <PageMeta title="Events" description="Explore the kinds of welcoming learning sessions and community gatherings at NIRVANA." />
      <header className="subpage-head">
        <p className="eyebrow">WHAT WE GET UP TO</p>
        <h1 className="page-heading">Little gatherings,<br />big discoveries.</h1>
        <p className="page-intro">Follow the chalk trail through the club's year. Every stop is a day we come together. New stops are being added.</p>
      </header>

      <EventsTrail />

      <section className="content-section two-col">
        <div>
          <h2 className="section-heading">Would you like to help host?</h2>
          <p className="chalk-copy">Volunteers bring all kinds of strengths: patient listening, a love of books, a knack for puzzles, or simply a little time to share.</p>
        </div>
        <Link href="/contact" className="chalk-button">Ask about volunteering <ArrowRight size={14} /></Link>
      </section>
    </>
  );
}

function GalleryPage() {
  return (
    <>
      <PageMeta title="Gallery" description="A scrapbook of the activities and learning moments that make The Learning Nook feel like a community." />
      <SwingGallery />
    </>
  );
}

function ContactPage() {
  return (
    <>
       <PageMeta title="Contact" description="Get in touch with The Learning Nook to ask about joining, volunteering, or learning more." />
      <header className="subpage-head">
        <p className="eyebrow">WE’RE GLAD YOU’RE HERE</p>
        <h1 className="page-heading">Get In Touch.</h1>
        <p className="page-intro">Curious about the club, thinking of volunteering, or helping a young person find support? Send a note and we’ll take it from there.</p>
      </header>
      <section className="content-section contact-layout">
        <div>
          <h2 className="section-heading">Write us a little note</h2>
          <p className="section-lede" style={{ margin: '0 0 18px' }}>Write your letter, press the wax seal, and a pigeon will carry it away.</p>
          <ContactForm />
        </div>
        <aside className="contact-details" aria-label="Contact details">
          <h2 className="contact-details-heading">CONTACT DETAILS</h2>
          <div className="contact-details-card">
            <div className="cd-row">
              <Mail className="cd-icon" size={28} aria-hidden="true" />
              <div>
                <p className="cd-label">Email</p>
                <a className="cd-value" href="mailto:nss@svnit.ac.in">Nirwana_chapter@svnit.ac.in</a>
              </div>
            </div>

            <div className="cd-row">
              <MapPin className="cd-icon" size={28} aria-hidden="true" />
              <div>
                <p className="cd-label">Address</p>
                <p className="cd-value">
                  NIRWANA , SVNIT<br />
                  Ichchhanath, Surat<br />
                  Gujarat - 395007
                </p>
              </div>
            </div>

            <div className="cd-row cd-social-row">
              <p className="cd-label">Connect With Us</p>
              <div className="cd-socials">
                {socials
                  .filter(({ label }) => label !== 'Email')
                  .map(({ label, href, Icon }) => (
                    <a key={label} href={href} aria-label={label} target="_blank" rel="noreferrer">
                      <Icon size={22} />
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </aside>
      </section>

      <LocationMap
        query="Sardar Vallabhbhai National Institute of Technology, Surat, Gujarat 395007"
        label="Find us here"
        note="SVNIT campus, Ichchhanath, Surat-Dumas Road, Athwa, Surat, Gujarat 395007. Please message us before visiting to confirm session times."
      />

      <section className="content-section">
        <h2 className="section-heading">Before you visit</h2>
        <p className="chalk-copy">The club’s meeting place, session times, and ways to join should be confirmed directly with the organizers. Send a note and we’ll help you find the right next step.</p>
      </section>
    </>
  );
}

function PageShell({ children }) {
  return <SiteFrame>{children}</SiteFrame>;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/"><PageShell><HomePage /></PageShell></Route>
        <Route path="/about"><PageShell><AboutPage /></PageShell></Route>
        <Route path="/team"><PageShell><TeamPage /></PageShell></Route>
        <Route path="/centres"><PageShell><CentresPage /></PageShell></Route>
        <Route path="/events"><PageShell><EventsPage /></PageShell></Route>
        <Route path="/gallery"><PageShell><GalleryPage /></PageShell></Route>
        <Route path="/contact"><PageShell><ContactPage /></PageShell></Route>
        <Route path="/developers"><Developers/></Route>
        <Route path="/admin"><Suspense fallback={<main className="adm-login"><p>Loading…</p></main>}><Admin /></Suspense></Route>
        <Route><NotFound /></Route>
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
