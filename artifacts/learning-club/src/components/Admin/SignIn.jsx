import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import './Admin.css';

// Email + password form. `handleSignIn` and `message` come from Admin.jsx.
export default function SignIn({ handleSignIn, message }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    await handleSignIn(email.trim(), password);
    setBusy(false);
  };

  return (
    <main className="adm-login">
      <form className="adm-login-card" onSubmit={submit}>
        <span className="adm-lock"><Lock size={26} aria-hidden="true" /></span>
        <h1>Admin</h1>
        <p>Log in to manage event photos.</p>

        <label htmlFor="adm-email">Email</label>
        <input id="adm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus />

        <label htmlFor="adm-pass" style={{ marginTop: 14 }}>Password</label>
        <div className="adm-pass-row">
          <input id="adm-pass" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
          <button type="button" className="adm-icon-btn" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {message && <p className="adm-error" role="alert">{message}</p>}
        <button className="adm-btn primary" type="submit" disabled={busy || !email || !password}>
          {busy ? 'Checking…' : 'Log in'}
        </button>
      </form>
    </main>
  );
}
