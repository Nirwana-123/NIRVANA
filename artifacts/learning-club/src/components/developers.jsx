import { useState } from 'react';
import { ArrowUpRight, Linkedin, Mail } from 'lucide-react';
import './developers.css';

// Edit these two developers. Photos go in public/developers/ (optional:
// if a photo is missing, the initials are shown inside the glowing ring).
const developers = [
  {
    id: 'dev-1',
    name: 'Mohit Kumar Soni',
    photo: 'developers/dev-1.jpg',
    email: 'developer.one@example.com',
    linkedin: 'https://www.linkedin.com/in/your-profile-one',
    color: 'var(--sun)',
    accent: 'var(--sky)',
  },
  {
    id: 'dev-2',
    name: 'Kislay Gupta',
    photo: 'developers/dev-2.jpg',
    email: 'developer.two@example.com',
    linkedin: 'https://www.linkedin.com/in/your-profile-two',
    color: 'var(--rose)',
    accent: 'var(--sage)',
  },
];

const stars = [
  { x: '6%', y: '12%', s: 14, d: 0 },
  { x: '92%', y: '8%', s: 18, d: 0.8 },
  { x: '14%', y: '82%', s: 12, d: 1.4 },
  { x: '88%', y: '76%', s: 16, d: 0.4 },
  { x: '50%', y: '3%', s: 10, d: 1.1 },
  { x: '3%', y: '48%', s: 10, d: 1.8 },
  { x: '97%', y: '44%', s: 12, d: 0.2 },
];

const initials = (name) =>
  name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

// Tilt only on devices that can hover, and never for reduced motion
const canTilt = () =>
  window.matchMedia('(hover: hover)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function DeveloperCard({ developer, index }) {
  const [photoFailed, setPhotoFailed] = useState(false);

  const handleMove = (event) => {
    if (!canTilt()) return;
    const el = event.currentTarget;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    el.style.setProperty('--rx', `${((0.5 - y) * 14).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((x - 0.5) * 16).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    el.style.setProperty('--g', 1);
  };

  const handleLeave = (event) => {
    const el = event.currentTarget;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--g', 0);
  };

  return (
  <>
    
    <article
      className="dev-card"
      style={{ '--i': index, '--c': developer.color, '--c2': developer.accent }}
    >
        
      <div className="dev-tilt" onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <div className="dev-inner">
          <span className="dev-glare" aria-hidden="true" />

          <div className="dev-avatar">
            <span className="dev-ring a" aria-hidden="true" />
            <span className="dev-ring b" aria-hidden="true" />
            <span className="dev-orbit" style={{ '--d': '7s', '--s': '0deg' }} aria-hidden="true"><i /></span>
            <span className="dev-orbit" style={{ '--d': '11s', '--s': '120deg' }} aria-hidden="true"><i /></span>
            <span className="dev-orbit" style={{ '--d': '9s', '--s': '240deg' }} aria-hidden="true"><i /></span>
            <div className="dev-photo">
              {developer.photo && !photoFailed ? (
                <img
                  src={`${import.meta.env.BASE_URL}${developer.photo}`}
                  alt={`Portrait of ${developer.name}`}
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <span aria-hidden="true">{initials(developer.name)}</span>
              )}
            </div>
          </div>

          <p className="dev-code" aria-hidden="true">&lt;developer /&gt;</p>
          <h3 className="dev-name">{developer.name}</h3>
          <div className="dev-actions">
            <a className="dev-btn primary" href={`mailto:${developer.email}`}>
              <Mail size={16} aria-hidden="true" />
              <ArrowUpRight size={15} className="dev-arrow" aria-hidden="true" />
            </a>
            <a
              className="dev-btn ghost"
              href={developer.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label={`${developer.name} on LinkedIn (opens in a new tab)`}
            >
              <Linkedin size={16} aria-hidden="true" />
              <ArrowUpRight size={15} className="dev-arrow" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </article>
    </>
  );
}

const backBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 700,
  textDecoration: 'none',
  background: 'transparent', color: '#f2eedc',border: '1px solid rgba(242, 238, 220, .55)',
  position:'absolute',
  left:'30px'
};

export default function Developers() {
  return (
    <section className="devs" aria-labelledby="devs-title">
      <div className="dev-stars" aria-hidden="true">
        {stars.map((star, i) => (
          <i
            key={i}
            style={{ left: star.x, top: star.y, width: star.s, height: star.s, animationDelay: `${star.d}s` }}
          />
        ))}
      </div>

      <header className="devs-head">
        <button style={backBtn} onClick={() => window.history.back()}>⟸ Back</button>
        <p className="devs-eyebrow">BUILT WITH CARE</p>
        <h2 className="devs-title" id="devs-title">Meet the developers.</h2>
        <p className="devs-intro">The two people who designed and built this website. Say hello, they love hearing from you.</p>
      </header>

      <div className="devs-grid">
        {developers.map((developer, index) => (
          <DeveloperCard key={developer.id} developer={developer} index={index} />
        ))}
      </div>
    </section>
  );
}
