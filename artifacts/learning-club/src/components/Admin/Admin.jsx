import { useCallback, useEffect, useState } from 'react';
import {
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import DashBoard from './DashBoard';
import SignIn from './SignIn';
import './Admin.css';

const loginMessage = (code) => {
  if (code === 'auth/too-many-requests') return 'Too many tries. Please wait a few minutes.';
  if (code === 'auth/network-request-failed') return 'No connection. Check your internet.';
  return 'Wrong email or password.';
};

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // keep the admin page out of search engines
  useEffect(() => {
    document.title = 'Admin | NIRVANA';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  const handleSignIn = async (email, password) => {
    setMessage('');
    try {
      await setPersistence(auth, browserSessionPersistence); // closing the tab also logs out
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged updates currentUser for us
    } catch (error) {
      setMessage(loginMessage(error.code));
    }
  };

  const handleSignOut = useCallback((reason) => {
    if (reason === 'expired') setMessage('Your session expired. Please log in again.');
    signOut(auth).catch((err) => console.error('Sign out error:', err));
  }, []);

  if (loading) {
    return <main className="adm-login"><p>Loading…</p></main>;
  }

  return currentUser
    ? <DashBoard handleSignOut={handleSignOut} />
    : <SignIn handleSignIn={handleSignIn} message={message} />;
}
