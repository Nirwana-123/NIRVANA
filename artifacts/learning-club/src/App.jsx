import { useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ArrowRight, ArrowUp, BookOpen, Facebook, Instagram, Mail, Menu, Twitter, X, Youtube } from 'lucide-react';
const queryClient = new QueryClient();
const navigation = [
  { label: 'HOME', href: '/', title: 'Home' },
  { label: 'ABOUT', href: '/about', title: 'About' },
  { label: 'EVENTS', href: '/events', title: 'Events' },
  { label: 'GALLERY', href: '/gallery', title: 'Gallery' },
  { label: 'CONTACT', href: '/contact', title: 'Contact' },
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
        <main className="board" id="main-content" aria-label={`${pageName} page`}>
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
            {navigation.map((item) => (
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

function ChalkboardHero() {
  const boardRef = useRef(null);
  const stickRef = useRef(null);
  const bannerRef = useRef(null);
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

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const updatePosition = () => {
      if (motionPreference.matches || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const offset = Math.round(-banner.getBoundingClientRect().top * 0.12);
        banner.style.setProperty('--hero-scroll-offset', `${offset}px`);
      });
    };
    const handleMotionPreferenceChange = () => {
      if (motionPreference.matches) {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        banner.style.removeProperty('--hero-scroll-offset');
      } else {
        updatePosition();
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);
    motionPreference.addEventListener('change', handleMotionPreferenceChange);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      motionPreference.removeEventListener('change', handleMotionPreferenceChange);
      if (frame) window.cancelAnimationFrame(frame);
      banner.style.removeProperty('--hero-scroll-offset');
    };
  }, []);

  return (
    <>
    <section
    className="hero-banner"  
    ref={bannerRef}
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

      <section className="learning-section" aria-labelledby="lesson-heading">
        <h2 className="section-heading center-heading" id="lesson-heading">A place for every kind of growing</h2>
        <p className="section-lede">Small steps count. Our sessions make space for school skills, brave questions, and being part of a team.</p>
        <div className="lesson-grid">
          <article className="lesson-card" style={{ '--card-color': 'var(--sun)' }}>
            <h3>Schoolwork, together</h3><p>Reading, writing, maths, and homework help—at a pace that feels right.</p>
          </article>
          <article className="lesson-card" style={{ '--card-color': 'var(--sky)' }}>
            <h3>Confidence to try</h3><p>Room to make mistakes, ask again, and discover “I can do this.”</p>
          </article>
          <article className="lesson-card" style={{ '--card-color': 'var(--rose)' }}>
            <h3>Creative curiosity</h3><p>Hands-on projects and playful ideas that make learning feel alive.</p>
          </article>
          <article className="lesson-card wide" style={{ '--card-color': 'var(--sage)' }}>
            <BookOpen size={23} color="var(--sage)" aria-hidden="true" />
            <div><h3>A circle of belonging</h3><p>Kind mentors and friendly faces help each child feel welcome, noticed, and included.</p></div>
          </article>
        </div>
      </section>
      <section className="home-note">
        <div>
          <h2>Learning is better side by side.</h2>
          <p>Whether you’re looking for a welcoming place for a young learner or hoping to share your time as a mentor, we’d love to meet you.</p>
        </div>
        <Link className="chalk-button outline" href="/contact">Find your way in <ArrowRight size={14} /></Link>
      </section>
    </>
  );
}

function AboutPage() {
  return (
    <>
      <PageMeta title="About" description="Meet the values and approach behind The Learning Nook, a supportive community learning club." />
      <header className="subpage-head">
        {/* <p className="eyebrow">OUR LITTLE STORY</p> */}
        <h1 className="page-heading" style={{marginTop:'30px'}}>About Nirwana</h1>
        <p className="page-intro">Education, Values, and a Brighter Future</p>
      </header>
      <section className="content-section two-col">
        <div className="chalk-copy">
          <h2 className="section-heading">More than homework help</h2>
          <p>At Nirwana, we believe every child deserves the opportunity to learn, grow, and dream without limits. We are a learning club dedicated to educating underprivileged children, supporting their academic journey, and nurturing the values that help them become kind, confident, and responsible individuals.</p>
          <p>We aim to create a welcoming environment where children feel supported, discover their potential, and understand that their circumstances do not define their future.</p>
        </div>
        <aside className="quote-card">
          <blockquote>“You don’t have to know it yet. We can figure it out together.”</blockquote>
          <p>A thought we try to bring to every lesson, project, and conversation.</p>
        </aside>
      </section>
      <section className="content-section two-col">
        <div>
          <h2 className="section-heading">What we hold close</h2>
          <p className="section-lede" style={{ margin: '0 0 20px' }}>The way we learn matters as much as what we learn.</p>
        </div>
        <div className="values-list">
          <div className="value-row"><span className="value-num">01</span><div><h3>Kindness first</h3><p>Every child deserves patience, respect, and a warm welcome.</p></div></div>
          <div className="value-row"><span className="value-num">02</span><div><h3>Curiosity over perfection</h3><p>Questions and mistakes are part of the good work of learning.</p></div></div>
          <div className="value-row"><span className="value-num">03</span><div><h3>We belong to each other</h3><p>We make a community where children and mentors can show up as themselves.</p></div></div>
        </div>
      </section>
      <section className="content-section">
        <h2 className="section-heading center-heading">What We Do</h2>
        <div className="steps">
          <article className="step" style={{ '--step-color': 'var(--sun)' }}><span>First</span><h3>Education for All</h3><p>We provide educational support and guidance to help children strengthen their academic foundations and develop a love for learning.</p></article>
          <article className="step" style={{ '--step-color': 'var(--sky)' }}><span>Second</span><h3>Building Moral Values</h3><p>We encourage honesty, discipline, kindness, respect, and compassion to help children grow into responsible members of society.</p></article>
          <article className="step" style={{ '--step-color': 'var(--rose)' }}><span>Third</span><h3>Confidence and Creativity</h3><p>We motivate children to ask questions, express their ideas, explore their interests, and approach new challenges with confidence.</p></article>
          <article className="step" style={{ '--step-color': 'var(--Mint)' }}><span>Fourth</span><h3>Life Skills Development</h3><p>We help children develop essential life skills such as communication, teamwork, problem-solving, and decision-making to prepare them for everyday challenges.</p></article>
          <article className="step" style={{ '--step-color': 'var(--Peach)' }}><span>Fifth</span><h3>A Community That Cares</h3><p>We foster a friendly, inclusive space where every child feels welcomed, respected, encouraged, and valued.</p></article>
          <article className="step" style={{ '--step-color': 'var(--Lavender)' }}><span>Sixth</span><h3>Awareness and Social Responsibility</h3><p>We encourage children to understand their role in society, respect diversity, care for the environment, and contribute positively to their communities.</p></article>
        </div>
      </section>
    </>
  );
}

function EventsPage() {
  return (
    <>
      <PageMeta title="Events" description="Explore the kinds of welcoming learning sessions and community gatherings at The Learning Nook." />
      <header className="subpage-head">
        <p className="eyebrow">WHAT WE GET UP TO</p>
        <h1 className="page-heading">Little gatherings,<br />big discoveries.</h1>
        <p className="page-intro">Our club calendar is made of shared learning time, playful projects, and chances to meet one another.</p>
      </header>
      <section className="content-section">
        <h2 className="section-heading">The kinds of days we make</h2>
        <p className="section-lede" style={{ margin: '0 0 20px' }}>These are example session ideas, not confirmed dates. Please get in touch for current details.</p>
        <div className="event-list">
          <article className="event-item">
            <div className="event-tag">Drop in</div>
            <div><h3>Homework &amp; reading table</h3><p>Bring a book, a school question, or just yourself. A mentor can help you find a starting point.</p></div>
            <span className="event-type">LEARNING</span>
          </article>
          <article className="event-item">
            <div className="event-tag" style={{ borderColor: 'var(--sky)', color: 'var(--sky)' }}>Make</div>
            <div><h3>Curiosity workshop</h3><p>A hands-on afternoon for trying, making, wondering, and sharing what you notice.</p></div>
            <span className="event-type">CREATIVE</span>
          </article>
          <article className="event-item">
            <div className="event-tag" style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }}>Together</div>
            <div><h3>Family &amp; friends gathering</h3><p>A relaxed chance to meet the club community and celebrate the things we’ve been learning.</p></div>
            <span className="event-type">COMMUNITY</span>
          </article>
        </div>
        <div className="note-strip">The schedule, location, and age groups can vary. Reach out before visiting so we can share the latest information and help you feel prepared.</div>
      </section>
      <section className="content-section two-col">
        <div><h2 className="section-heading">Would you like to help host?</h2><p className="chalk-copy">Volunteers bring all kinds of strengths: patient listening, a love of books, a knack for puzzles, or simply a little time to share.</p></div>
        <Link href="/contact" className="chalk-button">Ask about volunteering <ArrowRight size={14} /></Link>
      </section>
    </>
  );
}

const memories = [
  { title: 'A story shared aloud', bg: '#d2dfd0', symbol: 'READ' },
  { title: 'Number games & big ideas', bg: '#eadcb8', symbol: '1 + 1' },
  { title: 'Making something new', bg: '#dfcdd7', symbol: 'MAKE' },
  { title: 'A question worth chasing', bg: '#c8dce0', symbol: '?' },
  { title: 'Learning side by side', bg: '#e8d3c0', symbol: 'TOGETHER' },
  { title: 'A proud little moment', bg: '#d5dfbd', symbol: 'I DID IT' },
];

function GalleryPage() {
  return (
    <>
      <PageMeta title="Gallery" description="A scrapbook of the activities and learning moments that make The Learning Nook feel like a community." />
      <header className="subpage-head">
        <p className="eyebrow">MEMORIES FROM THE NOOK</p>
        <h1 className="page-heading">A little scrapbook<br />of trying things.</h1>
        <p className="page-intro">Our best moments aren’t always big. Sometimes they’re a new word, a solved puzzle, or someone finding their place at the table.</p>
      </header>
      <section className="content-section">
        <h2 className="section-heading">A few things we love to do</h2>
        <div className="gallery-grid">
          {memories.map((memory) => (
            <article className="memory-card" key={memory.title}>
              <div className="memory-art" style={{ '--art-bg': memory.bg }}>
                <span className="art-symbol">{memory.symbol}</span>
              </div>
              <div className="memory-caption">{memory.title}</div>
            </article>
          ))}
        </div>
        <p className="gallery-footnote">Illustrated activity cards are here as a stand-in for club photos. Add approved, consented photos here when the club is ready to share them.</p>
      </section>
      <section className="content-section two-col">
        <div>
          <h2 className="section-heading">Every child’s story is their own</h2>
          <p className="chalk-copy">We believe children should be able to learn and grow without feeling watched or put on display. Any real photos shared here should be chosen with care and permission.</p>
        </div>
        <div className="quote-card"><blockquote>“Look what I figured out!”</blockquote><p>That’s the kind of moment worth keeping close.</p></div>
      </section>
    </>
  );
}

function ContactPage() {
  const [status, setStatus] = useState('');
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`A note from ${String(form.get('name') || 'a visitor')}`);
    const body = encodeURIComponent(
      `Name: ${String(form.get('name') || '')}\nReply email: ${String(form.get('email') || '')}\n\n${String(form.get('message') || '')}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setStatus('Your email app should open with your note ready. Add the club’s email address before sending.');
  }

  return (
    <>
      <PageMeta title="Contact" description="Get in touch with The Learning Nook to ask about joining, volunteering, or learning more." />
      <header className="subpage-head">
        <p className="eyebrow">WE’RE GLAD YOU’RE HERE</p>
        <h1 className="page-heading">Let’s start<br />with a hello.</h1>
        <p className="page-intro">Curious about the club, thinking of volunteering, or helping a young person find support? Send a note and we’ll take it from there.</p>
      </header>
      <section className="content-section contact-layout">
        <div>
          <h2 className="section-heading">Write us a little note</h2>
          <p className="section-lede" style={{ margin: '0 0 18px' }}>This demo opens your email app with the message filled in. Add the club’s email address before you send.</p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field"><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" placeholder="What should we call you?" required /></div>
            <div className="field"><label htmlFor="email">Your email</label><input id="email" name="email" type="email" autoComplete="email" placeholder="So we can write back" required /></div>
            <div className="field"><label htmlFor="message">What’s on your mind?</label><textarea id="message" name="message" placeholder="Tell us a little about what brings you here…" required /></div>
            <button type="submit" className="chalk-button">Open a message <Mail size={14} /></button>
            {status && <p className="form-status" role="status">{status}</p>}
          </form>
        </div>
        <aside className="contact-aside">
          <h2>There are lots of ways to say hello.</h2>
          <p>Ask about learning sessions, volunteer roles, or how the club can support your family. You don’t need to have it all figured out before reaching out.</p>
          <ul>
            <li><strong>FOR FAMILIES</strong>Ask about getting to know the club and what support could look like.</li>
            <li><strong>FOR VOLUNTEERS</strong>Tell us what you enjoy and how you might like to lend a hand.</li>
            <li><strong>FOR NEIGHBOURS</strong>Share an idea, offer a resource, or simply introduce yourself.</li>
          </ul>
          <div className="note-strip">This website uses an email-app link rather than collecting or storing your message.</div>
        </aside>
      </section>
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
        <Route path="/events"><PageShell><EventsPage /></PageShell></Route>
        <Route path="/gallery"><PageShell><GalleryPage /></PageShell></Route>
        <Route path="/contact"><PageShell><ContactPage /></PageShell></Route>
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
