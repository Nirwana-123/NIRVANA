import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import {
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth, firestore } from '@/lib/firebase';
import DashBoard from './DashBoard';
import SignIn from './SignIn';
import './Admin.css';

const loginMessage = (code) => {
  if (code === 'auth/too-many-requests') return 'Too many tries. Please wait a few minutes.';
  if (code === 'auth/network-request-failed') return 'No connection. Check your internet.';
  return 'Wrong email or password.';
};

export default function Admin() {
  const [logged, setLogged] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // A signed-in user is an admin only if executives/<their email> exists with access: true
  const grantAccess = useCallback(async (user) => {
    if (!user?.email) {
      setLogged(false);
      return;
    }
    try {
      const snap = await getDoc(doc(firestore, 'executives', user.email.toLowerCase()));
      if (snap.exists() && snap.data().access === true) {
        setLogged(true);
        setMessage('');
      } else {
        setLogged(false);
        setMessage('Access denied. This account is not authorized.');
        await signOut(auth);
      }
    } catch {
      setLogged(false);
      setMessage('Could not check permission. Please try again.');
      await signOut(auth);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setLoading(true);
        await grantAccess(user);
      } else {
        setLogged(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [grantAccess]);

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
      // onAuthStateChanged runs grantAccess for us
    } catch (error) {
      setLogged(false);
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

  return logged && currentUser
    ? <DashBoard handleSignOut={handleSignOut} />
    : <SignIn handleSignIn={handleSignIn} message={message} />;
}
