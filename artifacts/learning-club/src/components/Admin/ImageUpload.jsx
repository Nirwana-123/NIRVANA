import { useCallback, useEffect, useRef, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { Copy, ImagePlus, Trash2, UploadCloud } from 'lucide-react';
import { firestore } from '@/lib/firebase';

const MAX_MB = 10;

// From your Cloudinary dashboard (see .env):  VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// The event that is selected when the page opens. Must match the Cloudinary folder name exactly:
// Media Library > Events > Dushera(2026)
const DEFAULT_EVENT = 'Dushera(2026)';
// Add more events here (exact folder names). Events that already have photos are added automatically.
const EVENT_FOLDERS = [];

const EVENT_NAME = /^[A-Za-z0-9 _()-]{1,60}$/;
const thumbOf = (url) => url.replace('/upload/', '/upload/c_fill,w_420,h_300,q_auto,f_auto/');

// Sends one file straight to Cloudinary, into the folder  Events/<event>
function sendToCloudinary(file, event, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('folder', `Events/${event}`);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let body = {};
      try { body = JSON.parse(xhr.responseText); } catch { /* not JSON */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new Error(body.error?.message || 'Cloudinary rejected the upload'));
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });
}

/* ---------------- "Upload photos" page ---------------- */
export default function ImagesPage({ onNote }) {
  const [eventName, setEventName] = useState(DEFAULT_EVENT);
  const [queue, setQueue] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);
  const queueRef = useRef([]);
  queueRef.current = queue;

  const refresh = useCallback(async () => {
    try {
      const snap = await getDocs(query(collection(firestore, 'photos'), orderBy('createdAt', 'desc'), limit(300)));
      setPhotos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      onNote(err.code === 'permission-denied' ? 'Firestore refused to list photos. Check the "photos" rules.' : 'Could not load the photo list.');
    }
  }, [onNote]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => () => queueRef.current.forEach((i) => URL.revokeObjectURL(i.preview)), []);

  // dropdown options: default event, your own list, and every event that already has photos
  const libraryEvents = [...new Set(photos.map((p) => p.event).filter(Boolean))];
  const eventOptions = [...new Set([DEFAULT_EVENT, ...EVENT_FOLDERS, ...libraryEvents])];

  const addFiles = (fileList) => {
    const items = [];
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) return onNote(`${file.name} is not an image.`);
      if (file.size > MAX_MB * 1024 * 1024) return onNote(`${file.name} is larger than ${MAX_MB} MB.`);
      items.push({ id: `${file.name}-${file.size}-${Math.random()}`, file, preview: URL.createObjectURL(file), progress: 0, status: 'ready' });
    });
    setQueue((q) => [...q, ...items]);
  };

  const patch = (id, changes) => setQueue((q) => q.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  const removeFromQueue = (id) => setQueue((q) => { q.filter((i) => i.id === id).forEach((i) => URL.revokeObjectURL(i.preview)); return q.filter((i) => i.id !== id); });

  const uploadOne = async (item, event) => {
    patch(item.id, { status: 'uploading', progress: 0, error: '' });
    // 1) the photo goes to Cloudinary, folder Events/<event>
    //    (if an earlier try already got it there, it is not uploaded a second time)
    let result = item.uploaded;
    if (!result) {
      result = await sendToCloudinary(item.file, event, (progress) => patch(item.id, { progress }));
      patch(item.id, { uploaded: result });
    }
    // 2) its link is saved in Firestore, so the website (and this list) can find it
    await addDoc(collection(firestore, 'photos'), {
      event,
      url: result.secure_url,
      publicId: result.public_id,
      createdAt: serverTimestamp(),
    });
    patch(item.id, { status: 'done', progress: 100 });
  };

  const uploadAll = async () => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) return onNote('Cloudinary is not set up: add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env and restart.');
    if (!EVENT_NAME.test(eventName)) return onNote('Choose a valid event first.');
    onNote('');
    setUploading(true);
    for (const item of queueRef.current.filter((i) => i.status !== 'done')) {
      try {
        await uploadOne(item, eventName);
      } catch (err) {
        const message = err.code === 'permission-denied'
          ? 'Photo is in Cloudinary, but Firestore refused to save its link. Check the "photos" rules and your "executives" entry, then press Upload again.'
          : err.message;
        patch(item.id, { status: 'error', error: message });
        onNote(message);
      }
    }
    setUploading(false);
    await refresh();
    onNote(`Upload finished. Photos are in Events / ${eventName}.`);
  };

  // Removes the photo from the website list. The file itself stays in Cloudinary.
  const remove = async (photo) => {
    if (!window.confirm('Remove this photo from the website? The file stays in Cloudinary until you delete it there.')) return;
    try {
      await deleteDoc(doc(firestore, 'photos', photo.id));
      setPhotos((list) => list.filter((p) => p.id !== photo.id));
    } catch (err) {
      onNote(err.code === 'permission-denied' ? 'Firestore refused the removal.' : err.message);
    }
  };

  const copy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      onNote('Link copied.');
    } catch {
      onNote('Could not copy the link.');
    }
  };

  const shown = filter === 'all' ? photos : photos.filter((p) => p.event === filter);
  const pending = queue.filter((i) => i.status !== 'done').length;

  return (
    <>
      <h1>Upload photos</h1>

      <div className="adm-cols">
        {/* Left: form */}
        <section className="adm-form" aria-labelledby="adm-up">
          <h2 id="adm-up" className="adm-sec-title">Event details</h2>

          <label htmlFor="adm-event">Event</label>
          <select id="adm-event" className="adm-select" value={eventName} onChange={(e) => setEventName(e.target.value)}>
            {eventOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <small className="adm-hint">Photos are saved in Cloudinary under Events / {eventName}.</small>

          <h2 className="adm-sec-title">Photos</h2>
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

          <button type="button" className="adm-btn primary" onClick={uploadAll} disabled={uploading || pending === 0}>
            {uploading ? 'Uploading…' : pending ? `Upload ${pending} photo${pending === 1 ? '' : 's'}` : 'Upload photos'}
          </button>
        </section>

        {/* Right: queue preview */}
        <aside className="adm-preview" aria-labelledby="adm-prev">
          <h2 id="adm-prev">Upload preview</h2>
          {queue.length === 0 ? (
            <p className="adm-placeholder">Add photos to see them here before uploading.</p>
          ) : (
            <ul className="adm-queue">
              {queue.map((item) => (
                <li key={item.id} className={item.status}>
                  <img src={item.preview} alt="" />
                  <div>
                    <span className="adm-fname">{item.file.name}</span>
                    <div className="adm-bar"><i style={{ width: `${item.progress}%` }} /></div>
                    <small>{item.status === 'done' ? 'Uploaded' : item.status === 'error' ? (item.error || 'Failed') : item.status === 'uploading' ? `${item.progress}%` : 'Ready'}</small>
                  </div>
                  <button className="adm-icon-btn" onClick={() => removeFromQueue(item.id)} disabled={item.status === 'uploading'} aria-label={`Remove ${item.file.name}`}><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {/* Library, full width under the form */}
      <section className="adm-lib" aria-labelledby="adm-lib">
        <div className="adm-lib-head">
          <h2 id="adm-lib" className="adm-sec-title">Uploaded photos <span>({shown.length})</span></h2>
          <select className="adm-select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by event">
            <option value="all">All events</option>
            {libraryEvents.map((e) => <option key={e} value={e}>{e}</option>)}
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
                    <button className="adm-icon-btn danger" onClick={() => remove(photo)} aria-label="Remove from website"><Trash2 size={16} /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
