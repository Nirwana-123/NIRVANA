import { useEffect, useRef } from 'react';
import { ProgramCoordinators } from './Team/TeamData';

const toFaculty = (list) =>
  list.map(({ name, position, description, gmail,photo }) => ({
    name,
    post: position,
    bio: description,
    email: gmail,
    Photo:photo
  }));

/*
  "Guided by faculty, driven by students". Sits above <Meettheteam /> on the Team page.

  <FacultySection faculty={faculty} students={members} />

  faculty: [{ name, post, bio, photo }]   First item is the Faculty Chairperson (shown in the middle, larger).
           Put the two Co-Chairpersons after it. Set `lead: true` on any item to choose a different lead.
           bio: 2 to 3 lines about the person.
  students (optional): your members array; up to 5 small photos appear under "Driven by students".
*/

const FACULTY_CSS = `
/* "Guided by faculty, driven by students". Uses your site variables with fallbacks. */
.fac{
  --f-board:var(--board,#183a30);
  --f-chalk:var(--chalk,#f2eedc);
  --f-muted:var(--chalk-muted,#d1d9c9);
  --f-sun:var(--sun,#f2d76f);
  --f-sky:var(--sky,#9ed3df);
  --f-rose:var(--rose,#e5a2b3);
  --f-wood:var(--wood,#8b5a35);
  --f-wood2:var(--wood-light,#bd8753);
  --f-line:rgba(242,238,220,.24);
  --f-hand:var(--font-chalk,'Patrick Hand','Comic Sans MS',cursive);
  color:var(--f-chalk);
  padding-block:clamp(36px,6vw,72px) clamp(28px,5vw,56px);
}
.fac h2,.fac h3,.fac p{margin:0}

.fac-head{text-align:center}
.fac-eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--f-sun);font-weight:700}
.fac-title{font:400 clamp(48px,8vw,92px)/1 var(--f-hand);color:var(--f-sun);margin-top:6px}
.fac-lede{max-width:52ch;margin:12px auto 0;color:var(--f-muted);font-size:14px;line-height:1.8}

.fac-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(16px,3vw,44px);align-items:start;padding-top:44px}
.fac-card{display:flex;flex-direction:column;align-items:center;text-align:center;min-width:0;transition:transform .7s cubic-bezier(.2,.7,.2,1) var(--d,0ms)}
.fac-card.lead{transform:translateY(-24px)}
.fac-js:not(.is-in) .fac-card{transform:translateY(18px)}
.fac-js:not(.is-in) .fac-card.lead{transform:translateY(0)}

.fac-photo{
  width:min(100%,210px);aspect-ratio:3 / 4;border-radius:999px 999px 8px 8px;overflow:hidden;position:relative;
  background:#d2dfd0;color:#8aa89a;
  box-shadow:0 0 0 3px var(--ring,var(--f-sky)),0 16px 26px rgba(0,0,0,.4);
  transition:transform .35s ease;
}
.fac-card.lead .fac-photo{width:min(100%,250px);box-shadow:0 0 0 3px var(--f-sun),0 0 34px rgba(242,215,111,.35),0 16px 26px rgba(0,0,0,.4)}
.fac-card:hover .fac-photo{transform:rotate(-1.5deg) translateY(-4px)}
.fac-photo img{width:100%;height:100%;object-fit:cover;object-position:50% 20%;display:block}
.fac-photo svg{width:100%;height:100%;display:block}
.fac-shelf{width:100%;height:9px;margin-top:-2px;border-radius:2px;background:linear-gradient(var(--f-wood2),var(--f-wood));box-shadow:0 8px 12px rgba(0,0,0,.35)}

.fac-name{font:400 clamp(26px,3vw,34px)/1.05 var(--f-hand);margin-top:20px}
.fac-post{margin-top:6px;font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:var(--f-sun)}
.fac-bio{width:100%;max-width:34ch;margin-top:12px;padding-top:12px;border-top:1px dashed var(--f-line);font-size:14px;line-height:1.7;color:var(--f-muted)}

.fac-bridge{display:grid;justify-items:center;margin-top:clamp(30px,5vw,56px)}
.fac-arrow{width:min(150px,38vw);height:84px;overflow:visible}
.fac-arrow path{fill:none;stroke:var(--f-chalk);stroke-width:3;stroke-linecap:round}
.fac-arrow .dash{stroke-dasharray:3 9}
.fac-js:not(.is-in) .fac-arrow .dash{stroke-dasharray:0 400}
.fac.is-in .fac-arrow .dash{transition:stroke-dasharray 1.4s ease .5s}
.fac-driven{font:400 clamp(36px,6vw,64px)/1 var(--f-hand);color:var(--f-sky);margin-top:4px;text-align:center}
.fac-students{display:flex;justify-content:center;margin-top:12px}
.fac-students i{width:38px;height:38px;border-radius:50%;margin-inline:-7px;overflow:hidden;background:#d2dfd0;color:#8aa89a;border:3px solid var(--f-board);display:block}
.fac-students img,.fac-students svg{width:100%;height:100%;display:block;object-fit:cover}

@media (max-width:760px){
  .fac-row{grid-template-columns:minmax(0,1fr);gap:44px;padding-top:30px}
  .fac-card.lead{order:-1;transform:none}
  .fac-js:not(.is-in) .fac-card,.fac-js:not(.is-in) .fac-card.lead{transform:translateY(12px)}
  .fac-card.lead .fac-photo{width:min(78%,240px)}
  .fac-photo{width:min(66%,200px)}
}
@media (prefers-reduced-motion:reduce){
  .fac-card,.fac-photo{transition:none}
  .fac-js:not(.is-in) .fac-card{transform:none}
  .fac-card.lead{transform:none}
  .fac-js:not(.is-in) .fac-arrow .dash{stroke-dasharray:3 9}
}

`;

const RINGS = ['var(--sky,#9ed3df)', 'var(--rose,#e5a2b3)'];

function Silhouette() {
  return (
    <svg viewBox="0 0 60 80" width="60" height="80" aria-hidden="true">
      <circle cx="30" cy="30" r="13" fill="currentColor" />
      <path d="M4 80 C4 56 16 48 30 48 C44 48 56 56 56 80Z" fill="currentColor" />
    </svg>
  );
}

function Portrait({ photo, name }) {
  return photo ? <img src={photo} alt={`Portrait of ${name}`} loading="lazy" /> : <Silhouette />;
}

export default function FacultySection({
  faculty = toFaculty(ProgramCoordinators),
  eyebrow = 'Our faculty',
  title = 'Guided by',
  lede = 'The faculty who mentor the club and stand behind everything we do.',
  drivenBy = 'Driven by students',
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.add('fac-js');
    if (reduce || !('IntersectionObserver' in window)) {
      root.classList.add('is-in');
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        root.classList.add('is-in');
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  if (!faculty.length) return null;

  // Desktop order: co-chair, CHAIR, co-chair. The lead is the one marked `lead`, else the first.
  const leadIndex = Math.max(0, faculty.findIndex((f) => f.lead));
  const lead = faculty[leadIndex];
  const others = faculty.filter((_, i) => i !== leadIndex);
  const ordered = others.length >= 2
    ? [others[0], lead, ...others.slice(1)]
    : [lead, ...others];

  let ringIndex = 0;

  return (
    <section className="fac" ref={rootRef} aria-label="Faculty">
      <style>{FACULTY_CSS}</style>
      <header className="fac-head">
        <p className="fac-eyebrow">{eyebrow}</p>
        <h2 className="fac-title">{title}</h2>
        {lede && <p className="fac-lede">{lede}</p>}
      </header>

      <div className="fac-row">
        {ordered.map((person, i) => {
          const isLead = person === lead;
          const ring = isLead ? undefined : RINGS[ringIndex++ % RINGS.length];
          return (
            <article
              className={`fac-card${isLead ? ' lead' : ''}`}
              style={{ '--d': `${i * 120}ms`, ...(ring ? { '--ring': ring } : {}) }}
              key={person.name}
            >
              <div className="fac-photo"><Portrait photo={person.Photo} name={person.name} /></div>
              <div className="fac-shelf" aria-hidden="true" />
              <h3 className="fac-name">{person.name}</h3>
              {person.post && <p className="fac-post">{person.post}</p>}
              {person.bio && <p className="fac-bio">{person.bio}</p>}
            </article>
          );
        })}
      </div>

      <div className="fac-bridge" aria-hidden="true">
        <svg className="fac-arrow" viewBox="0 0 150 84" width="150" height="84" fill="none" stroke="#f2eedc" strokeWidth="3" strokeLinecap="round">
          <path className="dash" d="M75 4 C20 18 130 40 75 74" />
          <path d="M64 66 L75 78 L86 66" />
        </svg>
      </div>
      <p className="fac-driven">{drivenBy}</p>
      
    </section>
  );
}