import { useEffect, useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import './Verify.css';

// Shows at /verify (manual search) and /verify/<ID> (what the QR code opens)
export default function Verify() {
  const [match, params] = useRoute('/verify/:id');
  const [, navigate] = useLocation();
  const id = match ? decodeURIComponent(params.id).trim() : '';
  const [input, setInput] = useState(id);
  const [state, setState] = useState({ status: id ? 'loading' : 'idle' });

  // keep individual certificate pages out of search engines
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    setInput(id);
    if (!id) {
      setState({ status: 'idle' });
      return undefined;
    }

    let active = true;
    setState({ status: 'loading' });

    const verifyCertificate = async () => {
      try {
        const certificates = query(
          collection(db, 'Volunteer_Data'),
          where('id', '==', id),
        );
        const snapshot = await getDocs(certificates);
        const record = snapshot.docs[0]?.data();

        if (!record || typeof record.name !== 'string' || !record.name.trim()) {
          if (active) setState({ status: 'invalid' });
          return;
        }

        if (active) {
          setState({
            status: 'valid',
            data: { id, name: record.name.trim() },
          });
        }
      } catch (error) {
        console.error('Certificate verification lookup failed:', error);
        if (active) {
          setState({
            status:
              error.code === 'resource-exhausted'
                ? 'busy'
                : error.code === 'permission-denied'
                  ? 'permission'
                  : 'error',
          });
        }
      }
    };

    void verifyCertificate();
    return () => { active = false; };
  }, [id]);

  const submit = (event) => {
    event.preventDefault();
    const value = input.trim();
    if (value) navigate(`/verify/${encodeURIComponent(value)}`);
  };
  const { status, data } = state;

  return (
    <section className="vf" aria-labelledby="vf-title">
      <p className="vf-eyebrow">CERTIFICATE CHECK</p>
      <h1 className="vf-title" id="vf-title">Verify a certificate.</h1>

      <div className={`vf-card ${status}`} role="status" aria-live="polite">
        {status === 'idle' && (
          <p className="vf-text">Scan the QR code on the certificate, or type its ID below.</p>
        )}
        {status === 'loading' && <p className="vf-text">Checking certificate…</p>}

        {status === 'valid' && (
          <>
            <ShieldCheck size={46} aria-hidden="true" />
            <h2>Certificate verified</h2>
            <p className="vf-name">{data.name}</p>
            <dl>
              <dt>Certificate ID</dt><dd>{data.id}</dd>
            </dl>
            <p className="vf-text">This certificate is genuine and was issued by NIRVANA.</p>
          </>
        )}

        {status === 'invalid' && (
          <>
            <ShieldAlert size={46} aria-hidden="true" />
            <h2>No certificate found</h2>
            <p className="vf-text">
              We have no record of <b>{id}</b>. Check for typing mistakes (IDs are case-sensitive).
              If you scanned a QR code and still see this, the certificate may not be genuine.
            </p>
          </>
        )}

        {status === 'busy' && <p className="vf-text">Too many checks in a short time. Please wait a minute and try again.</p>}
        {status === 'permission' && (
          <p className="vf-text">
            Firestore denied this lookup. Enable public read access for the Volunteer_Data collection in your Firestore rules.
          </p>
        )}
        {status === 'error' && <p className="vf-text">We couldn’t check right now. Please try again in a moment.</p>}
      </div>

      <form className="vf-form" onSubmit={submit}>
        <label htmlFor="vf-id">Certificate ID</label>
        <div>
          <input
            id="vf-id"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="NIRV-2026-XXXXXX"
            autoComplete="off"
            spellCheck="false"
          />
          <button type="submit" disabled={!input.trim()}>
            <Search size={16} aria-hidden="true" /> Verify
          </button>
        </div>
      </form>

      <p className="vf-help">Need help? <Link href="/contact">Contact the club</Link>.</p>
    </section>
  );
}
