import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import './Admin.css';

const SUMMARY_MAX = 250;

const todayISO = () => new Date().toISOString().slice(0, 10);

// "2026-10-21" -> "21 October 2026"
const prettyDate = (iso) =>
    iso
        ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

// the day the event was published, written like "21/10/2026"
const createdOn = () => {
    const now = new Date();
    return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
};

/* ---------------- "Create New Event" page ---------------- */
export default function EventPage({ onAuthError, onNote }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(todayISO());
    const [venue, setVenue] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const readingTime = useMemo(() => {
        const words = `${summary} ${content}`.trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
    }, [summary, content]);

    const hasPreview = title || venue || summary;

    // warn before closing the tab with unsaved text
    const dirty = Boolean(title || venue || summary || content);
    useEffect(() => {
        if (!dirty) return undefined;
        const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    const reset = () => {
        setTitle(''); setDate(todayISO()); setVenue(''); setSummary(''); setContent(''); setError('');
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !date || !venue.trim() || !summary.trim()) {
            return setError('Fill in the title, date, venue and short description.');
        }
        setError('');
        setSaving(true);
        try {
            const eventData = {
                title: title.trim(),
                Eventdate: prettyDate(date),          // "21 October 2026" (shown to visitors)
                eventDateISO: date,                   // "2026-10-21" (handy for sorting)
                Venue: venue.trim(),
                description: summary.trim(),
                content: content.split('\n').map((line) => line.trim()).filter(Boolean), // one entry per paragraph
                image: '',                            // empty for now; fill in when images are added
                readingTime: String(readingTime),
                date: createdOn(),                    // when it was published
                timestamp: Date.now(),                // for newest-first lists
            };
            const saved = await addDoc(collection(firestore, 'EventData'), eventData);

            onNote?.(`Event published (ID: ${saved.id}).`);
            reset();
        } catch (err) {
            if (err.status === 401 || err.status === 403) onAuthError?.(err);
            else if (err.code === 'permission-denied') setError('Firestore refused the save. Check the "events" rules and your entry in "executives".');
            else setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <h1 className="adm-page-title">Create new event</h1>

            <form className="adm-cols" onSubmit={submit} noValidate>
                {/* ---------- Left: form ---------- */}
                <div className="adm-form">

                    <h2 className="adm-sec-title">Event details</h2>
                    <fieldset className="adm-float">
                        <input aria-label="Event title" placeholder="Event title *" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </fieldset>
                    <fieldset className="adm-float">
                        <legend>Event Date *</legend>
                        <input
                            id="ev-date"
                            aria-label="Event date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </fieldset>
                    <fieldset className="adm-float">
                        <input aria-label="Venue" aria-describedby="ev-venue-hint" placeholder="Venue *" value={venue} onChange={(e) => setVenue(e.target.value)} required />
                    </fieldset>
                    <small id="ev-venue-hint" className="adm-hint">Enter the complete venue (building, institution, etc.)</small>

                    <h2 className="adm-sec-title adm-gap">Short description</h2>
                    <textarea
                        style={{ outline: '1px solid grey', padding: '5px' }}
                        aria-label="Short description"
                        placeholder="Short description / summary *"
                        rows={5}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        required
                    />

                    <small className={`adm-hint${summary.length > SUMMARY_MAX ? ' over' : ''}`}>
                        {summary.length}/{SUMMARY_MAX} characters (recommended max)
                    </small>
                    <small className="adm-hint">This summary appears in the event list card before people open the full event.</small>
                    <small className="adm-hint">Estimated reading time: {readingTime} min</small>

                    <h2 className="adm-sec-title adm-gap">Event content</h2>
                    <textarea
                        style={{ outline: '1px solid grey', padding: '5px' }}
                        aria-label="Event content"
                        placeholder="Write the full event details here. Each new line becomes its own paragraph."
                        rows={10}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {error && <p className="adm-note adm-error" role="alert">{error}</p>}

                    <div className="adm-actions">
                        <button type="submit" className="adm-btn primary" disabled={saving}>{saving ? 'Publishing…' : 'Publish event'}</button>
                        <button type="button" className="adm-btn ghost" onClick={reset} disabled={saving}>Clear form</button>
                    </div>
                </div>

                {/* ---------- Right: live preview ---------- */}
                <aside className="adm-preview" aria-labelledby="ev-prev">
                    <h2 id="ev-prev">Event preview</h2>
                    {!hasPreview ? (
                        <p className="adm-placeholder">Fill in the form fields to see a preview of your event</p>
                    ) : (
                        <article className="adm-ev-card">
                            <div className="adm-ev-body">
                                <h3>{title || 'Untitled event'}</h3>
                                <p className="adm-ev-meta">{[prettyDate(date), venue].filter(Boolean).join(' • ')}</p>
                                {summary && <p>{summary}</p>}
                                <small>{readingTime} min read</small>
                            </div>
                        </article>
                    )}
                </aside>
            </form>
        </>
    );
}
