import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, ImagePlus, LogOut, Trash2, UploadCloud } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useSessionTimeout } from '@/lib/useSessionTimeout';
import './Admin.css';

const API = import.meta.env.VITE_API_URL ?? '';
const MAX_MB = 10;

const slugify = (text) =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const thumbOf = (url) => url.replace('/upload/', '/upload/c_fill,w_420,h_300,q_auto,f_auto/');

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

/* ---------------- Dashboard (shown only to authorized admins) ---------------- */
export default function DashBoard({ handleSignOut }) {
  // Firebase tokens last 1 hour; ask for a fresh one on every request
  const getToken = () => auth.currentUser.getIdToken();
  const expire = useCallback(() => handleSignOut('expired'), [handleSignOut]);
  const warn = useSessionTimeout(expire);
  const [eventName, setEventName] = useState('');
  const [queue, setQueue] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const inputRef = useRef(null);
  const queueRef = useRef([]);
  queueRef.current = queue;

  const guard = useCallback((err) => {
    if (err.status === 401 || err.status === 403) handleSignOut();
    else setNote(err.message);
  }, [handleSignOut]);

  const refresh = useCallback(async () => {
    try {
      const data = await api('/api/admin/photos', { token: await getToken() });
      if (!Array.isArray(data.photos)) throw new Error('Invalid response from photo service.');
      setPhotos(data.photos);
    } catch (err) { guard(err); }
  }, [guard]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => () => queueRef.current.forEach((i) => URL.revokeObjectURL(i.preview)), []);

  const addFiles = (fileList) => {
    const items = [];
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) return setNote(`${file.name} is not an image.`);
      if (file.size > MAX_MB * 1024 * 1024) return setNote(`${file.name} is larger than ${MAX_MB} MB.`);
      items.push({ id: `${file.name}-${file.size}-${Math.random()}`, file, preview: URL.createObjectURL(file), progress: 0, status: 'ready' });
    });
    setQueue((q) => [...q, ...items]);
  };

  const patch = (id, changes) => setQueue((q) => q.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  const removeFromQueue = (id) => setQueue((q) => { q.filter((i) => i.id === id).forEach((i) => URL.revokeObjectURL(i.preview)); return q.filter((i) => i.id !== id); });

  const uploadOne = async (item, slug) => {
    patch(item.id, { status: 'uploading', progress: 0 });
    const sig = await api('/api/admin/sign', { token: await getToken(), method: 'POST', body: { event: slug } });
    await new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('file', item.file);
      form.append('api_key', sig.apiKey);
      form.append('timestamp', sig.timestamp);
      form.append('signature', sig.signature);
      form.append('folder', sig.folder);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
      xhr.upload.onprogress = (e) => e.lengthComputable && patch(item.id, { progress: Math.round((e.loaded / e.total) * 100) });
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Cloudinary rejected the upload')));
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(form);
    });
    patch(item.id, { status: 'done', progress: 100 });
  };

  const uploadAll = async () => {
    const slug = slugify(eventName);
    if (!slug) return setNote('Type the event name first.');
    setNote('');
    setUploading(true);
    for (const item of queueRef.current.filter((i) => i.status !== 'done')) {
      try { await uploadOne(item, slug); }
      catch (err) { patch(item.id, { status: 'error' }); if (err.status === 401 || err.status === 403) return handleSignOut(); setNote(err.message); }
    }
    setUploading(false);
    await refresh();
    setNote('Upload finished.');
  };

  const remove = async (photo) => {
    if (!window.confirm('Delete this photo for good?')) return;
    try {
      await api('/api/admin/photos', { token: await getToken(), method: 'DELETE', body: { publicId: photo.id } });
      setPhotos((list) => list.filter((p) => p.id !== photo.id));
    } catch (err) { guard(err); }
  };

  const copy = async (url) => {
    await navigator.clipboard.writeText(url);
    setNote('Link copied.');
  };

  const events = [...new Set(photos.map((p) => p.event))];
  const shown = filter === 'all' ? photos : photos.filter((p) => p.event === filter);
  const pending = queue.filter((i) => i.status !== 'done').length;

  return (
    <div className="adm">
      <header className="adm-top">
        <h1>Admin panel</h1>
        <button className="adm-btn ghost" onClick={() => handleSignOut()}><LogOut size={16} aria-hidden="true" /> Log out</button>
      </header>

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

      <section className="adm-card" aria-labelledby="adm-up">
        <h2 id="adm-up">Upload event photos</h2>

        <label htmlFor="adm-event">Event name</label>
        <input id="adm-event" list="adm-events" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="e.g. Diwali Celebration 2026" />
        <datalist id="adm-events">{events.map((e) => <option key={e} value={e} />)}</datalist>

        <div
          className={`adm-drop${dragging ? ' on' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        >
          <UploadCloud size={34} aria-hidden="true" />
          <p>Drag photos here, or</p>
          <button type="button" className="adm-btn ghost" onClick={() => inputRef.current?.click()}>
            <ImagePlus size={16} aria-hidden="true" /> Choose photos
          </button>
          <small>JPG, PNG or WebP, up to {MAX_MB} MB each</small>
          <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
        </div>

        {queue.length > 0 && (
          <>
            <ul className="adm-queue">
              {queue.map((item) => (
                <li key={item.id} className={item.status}>
                  <img src={item.preview} alt="" />
                  <div>
                    <span className="adm-fname">{item.file.name}</span>
                    <div className="adm-bar"><i style={{ width: `${item.progress}%` }} /></div>
                    <small>{item.status === 'done' ? 'Uploaded' : item.status === 'error' ? 'Failed' : item.status === 'uploading' ? `${item.progress}%` : 'Ready'}</small>
                  </div>
                  <button className="adm-icon-btn" onClick={() => removeFromQueue(item.id)} disabled={item.status === 'uploading'} aria-label={`Remove ${item.file.name}`}><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
            <button className="adm-btn primary" onClick={uploadAll} disabled={uploading || pending === 0}>
              {uploading ? 'Uploading…' : `Upload ${pending} photo${pending === 1 ? '' : 's'}`}
            </button>
          </>
        )}
      </section>

      <section className="adm-card" aria-labelledby="adm-lib">
        <div className="adm-lib-head">
          <h2 id="adm-lib">Uploaded photos <span>({shown.length})</span></h2>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by event">
            <option value="all">All events</option>
            {events.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {shown.length === 0 ? (
          <p className="adm-empty">No photos yet.</p>
        ) : (
          <ul className="adm-grid">
            {shown.map((photo) => (
              <li key={photo.id}>
                <img src={thumbOf(photo.url)} alt={`${photo.event} photo`} loading="lazy" />
                <div className="adm-meta">
                  <span>{photo.event}</span>
                  <div>
                    <button className="adm-icon-btn" onClick={() => copy(photo.url)} aria-label="Copy link"><Copy size={16} /></button>
                    <button className="adm-icon-btn danger" onClick={() => remove(photo)} aria-label="Delete photo"><Trash2 size={16} /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
