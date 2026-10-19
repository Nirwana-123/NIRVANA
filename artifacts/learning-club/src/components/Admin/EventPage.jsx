import { useEffect, useMemo, useState } from 'react';
import './Admin.css';

const MAX_IMAGE_MB = 10;
const SUMMARY_MAX = 250;

const slugify = (text) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const todayISO = () => new Date().toISOString().slice(0, 10);

const prettyDate = (iso) =>
    iso
        ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '';

// Signed upload straight to Cloudinary (same flow the Images section uses)
async function uploadImage(file, slug, { api, getToken }) {
    const sig = await api('/api/admin/sign', { token: await getToken(), method: 'POST', body: { event: slug } });
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sig.apiKey);
    form.append('timestamp', sig.timestamp);
    form.append('signature', sig.signature);
    form.append('folder', sig.folder);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: form });
    if (!res.ok) throw new Error('Cloudinary rejected the image upload.');
    const data = await res.json();
    return data.secure_url;
}

/* ---------------- "Create New Event" page ---------------- */
export default function EventPage({ api, getToken, onAuthError, onNote }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(todayISO());
    const [venue, setVenue] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null); // { file, preview }
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // free the preview URL when the image changes or the page closes
    useEffect(() => () => image && URL.revokeObjectURL(image.preview), [image]);

    const readingTime = useMemo(() => {
        const words = `${summary} ${content}`.trim().split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.ceil(words / 200));
    }, [summary, content]);

    const hasPreview = title || venue || summary || image;

    const pickImage = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (!file.type.startsWith('image/')) return setError(`${file.name} is not an image.`);
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setError(`${file.name} is larger than ${MAX_IMAGE_MB} MB.`);
        setError('');
        setImage({ file, preview: URL.createObjectURL(file) });
    };

    const reset = () => {
        setTitle(''); setDate(todayISO()); setVenue(''); setSummary(''); setContent(''); setImage(null); setError('');
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !date || !venue.trim() || !summary.trim()) {
            return setError('Fill in the title, date, venue and short description.');
        }
        setError('');
        setSaving(true);
        try {
            const imageUrl = image ? await uploadImage(image.file, slugify(title), { api, getToken }) : '';
            await api('/api/admin/events', {
                token: await getToken(),
                method: 'POST',
                body: { title: title.trim(), date, venue: venue.trim(), summary: summary.trim(), content: content.trim(), imageUrl },
            });
            onNote?.('Event published.');
            reset();
        } catch (err) {
            if (err.status === 401 || err.status === 403) onAuthError?.(err);
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

                    <h2 className="adm-sec-title adm-gap">Event image</h2>
                    <label className="adm-select-image">
                        {image ? 'Change image' : 'Select image'}
                        <input type="file" accept="image/*" hidden onChange={pickImage} />
                    </label>
                    {image && <small className="adm-hint">{image.file.name}</small>}
                    <small className="adm-hint">For best results, use a landscape image with a 16:9 aspect ratio (e.g. 1280×720).</small>

                    <textarea
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
                        aria-label="Event content"
                        placeholder="Write the full event details here"
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
                            {image && <img src={image.preview} alt="" />}
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
