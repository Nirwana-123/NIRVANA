import { useCallback, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useSessionTimeout } from '@/lib/useSessionTimeout';
import EventPage from './EventPage';
import ImagesPage from './ImageUpload';
import './Admin.css';
import './Dashboard.css'; // layout only: sidebar + two-column pages

const API = import.meta.env.VITE_API_URL ?? '';

// Sidebar sections. "events" and "images" have screens; add the others as you build them.
const SECTIONS = [
  { id: 'events', label: 'Events' },
  { id: 'images', label: 'Images' },
  { id: 'updates', label: 'Updates' },
  { id: 'articles', label: 'Articles' },
  { id: 'team', label: 'Team data' },
  { id: 'volunteers', label: 'Approve volunteers' },
];

async function api(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Something went wrong');
    error.status = response.status;
    throw error;
  }
  return data;
}

// Firebase tokens last 1 hour; ask for a fresh one on every request
const getToken = () => auth.currentUser.getIdToken();

/* ---------------- Dashboard (shown only to signed-in admins) ---------------- */
export default function DashBoard({ handleSignOut }) {
  const expire = useCallback(() => handleSignOut('expired'), [handleSignOut]);
  const warn = useSessionTimeout(expire);

  const [section, setSection] = useState('events');
  const [note, setNote] = useState('');

  // 401/403 -> sign out, anything else -> show the message
  const guard = useCallback((err) => {
    if (err.status === 401 || err.status === 403) handleSignOut();
    else setNote(err.message);
  }, [handleSignOut]);

  const current = SECTIONS.find((s) => s.id === section);
  const email = auth.currentUser?.email ?? '';

  return (
    <div className="adm-shell">
      {/* ---------- Sidebar ---------- */}
      <aside className="adm-side">
        <div className="adm-profile">
          <div className="adm-avatar" aria-hidden="true"><User size={52} /></div>
          <strong>Admin</strong>
          <small title={email}>{email}</small>
        </div>

        <nav aria-label="Admin sections">
          <ul className="adm-nav">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={s.id === section ? 'active' : ''}
                  aria-current={s.id === section ? 'page' : undefined}
                  onClick={() => { setNote(''); setSection(s.id); }}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <button className="adm-btn ghost adm-logout" onClick={() => handleSignOut()}>
          <LogOut size={16} aria-hidden="true" /> Log out
        </button>
      </aside>

      {/* ---------- Main ---------- */}
      <main className="adm-main">
        {note && <p className="adm-note" role="status">{note}</p>}

        {warn && (
          <div className="adm-warn" role="alert">
            <span>
              {warn.canExtend
                ? `You will be logged out in ${warn.seconds}s because of inactivity.`
                : `Your session ends in ${warn.seconds}s. You will need to log in again.`}
            </span>
            {warn.canExtend && <button className="adm-btn ghost" type="button">Stay logged in</button>}
          </div>
        )}

        {section === 'events' && (
          <EventPage api={api} getToken={getToken} onAuthError={guard} onNote={setNote} />
        )}

        {section === 'images' && (
          <ImagesPage api={api} getToken={getToken} onAuthError={guard} onNote={setNote} />
        )}

        {section !== 'events' && section !== 'images' && (
          <>
            <h1>{current.label}</h1>
            <section className="adm-card">
              <p className="adm-empty">{current.label} is not available in this panel yet.</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
