import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Mail } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const navigation = [
  { label: 'HOME', href: '/', title: 'Home' },
  { label: 'ABOUT', href: '/about', title: 'About' },
  { label: 'EVENTS', href: '/events', title: 'Events' },
  { label: 'GALLERY', href: '/gallery', title: 'Gallery' },
  { label: 'CONTACT', href: '/contact', title: 'Contact' },
];

function SiteFrame({ children }) {
  const [location] = useLocation();
  const pageName = navigation.find((item) => item.href === location)?.title ?? 'Home';

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to page content</a>
      <aside className="side-rail" aria-label="Main navigation">
        <Link href="/" className="brand-mark" aria-label="NIRVANA home">
          <div className="brand-name">NIRVANA</div>
          <div className="brand-note">A little room to grow</div>
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
          <div className="rail-invite">
            There’s a place for you here.
            <br />
            <Link href="/contact">COME SAY HELLO <ArrowRight size={12} /></Link>
          </div>
        </div>
      </aside>

      <header className="mobile-nav">
        <div className="mobile-nav-top">
          <Link href="/" className="mobile-brand">NIRVANA</Link>
          <span className="mobile-tagline">A little room to grow</span>
        </div>
        <nav className="mobile-links" aria-label="Main navigation">
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
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="page-footer">
      <div>
        <div className="footer-brand">The Learning Nook</div>
        <span>A welcoming place to learn, try, and belong.</span>
      </div>
      <nav className="footer-nav" aria-label="Footer navigation">
        {navigation.slice(1).map((item) => <Link key={item.href} href={item.href}>{item.title}</Link>)}
      </nav>
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

function HomePage() {
  return (
    <>
      <PageMeta title="Home" description="A joyful community club where volunteer mentors help children learn, grow in confidence, and feel they belong." />
      <section className="home-hero">
        <span className="doodle doodle-one" aria-hidden="true">✧</span>
        <span className="doodle doodle-two" aria-hidden="true">☆</span>
        <span className="hero-kicker">pull up a chair, there’s room to grow</span>
        <h1 className="hero-title">Learn. Grow.<br /><span>Shine.</span></h1>
        <div className="scribble-line" aria-hidden="true" />
        <p className="hero-copy">
          A friendly learning club where children find patient help with schoolwork,
          courage to try something new, and people who are glad they came.
        </p>
        <div className="hero-actions">
          <Link href="/events" className="chalk-button">See what we do <ArrowRight size={14} /></Link>
          <Link href="/about" className="chalk-button outline">Our little story</Link>
        </div>
      </section>

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
        <p className="eyebrow">OUR LITTLE STORY</p>
        <h1 className="page-heading">A table with room<br />for one more.</h1>
        <p className="page-intro">The Learning Nook is built around a simple idea: children do well when they feel safe, supported, and known.</p>
      </header>
      <section className="content-section two-col">
        <div className="chalk-copy">
          <h2 className="section-heading">More than homework help</h2>
          <p>We’re a community club where volunteer mentors share time, attention, and encouragement with children who could use an extra hand with learning.</p>
          <p>There’s no one right way to learn here. We listen first, celebrate effort, and make room for the small breakthroughs that add up to confidence.</p>
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
        <h2 className="section-heading center-heading">A session, in three gentle steps</h2>
        <div className="steps">
          <article className="step" style={{ '--step-color': 'var(--sun)' }}><span>First</span><h3>Settle in</h3><p>We start with a hello, a check-in, and a little time to feel at home.</p></article>
          <article className="step" style={{ '--step-color': 'var(--sky)' }}><span>Then</span><h3>Learn by doing</h3><p>We work through school tasks or follow a curious idea together.</p></article>
          <article className="step" style={{ '--step-color': 'var(--rose)' }}><span>Always</span><h3>Notice the good</h3><p>We finish by recognizing effort and choosing a next small step.</p></article>
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
