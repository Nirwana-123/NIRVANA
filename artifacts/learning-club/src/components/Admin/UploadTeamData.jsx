import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { uploadAllTeamData, validateTeamData } from './upload';
import './Admin.css';

export default function TeamDataPage({ onAuthError, onNote }) {
  const [busy, setBusy] = useState(null); // 'upload' | 'validate' | null
  const [progress, setProgress] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [report, setReport] = useState(null);

  const handleError = (err) => {
    if (err.code === 'permission-denied') onAuthError?.({ status: 403, message: err.message });
    else onNote?.(err.message || 'Something went wrong');
  };

  const handleUpload = async () => {
    onNote?.('');
    setBusy('upload');
    setUploadResult(null);
    setProgress(null);
    try {
      const stats = await uploadAllTeamData(auth.currentUser, (done, total) => setProgress({ done, total }));
      setUploadResult(stats);
      onNote?.(
        stats.failed
          ? `Uploaded ${stats.successful} of ${stats.total}. ${stats.failed} failed.`
          : `Uploaded ${stats.successful} team members.`,
      );
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(null);
    }
  };

  const handleValidate = async () => {
    onNote?.('');
    setBusy('validate');
    setReport(null);
    try {
      setReport(await validateTeamData());
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <h1>Team data</h1>

      <div className="td-grid">
        <section className="adm-card td-card">
          <h2>Upload Team Data</h2>
          <p>Upload all team data from TeamData.js to Firebase Firestore in a structured format.</p>
          <button type="button" className="td-btn td-primary" onClick={handleUpload} disabled={!!busy}>
            {busy === 'upload'
              ? progress ? `Uploading ${progress.done}/${progress.total}…` : 'Uploading…'
              : 'Upload team data to Firestore'}
          </button>

          {uploadResult && (
            <div className="td-result" role="status">
              <p className="td-summary">
                {uploadResult.successful} uploaded
                {uploadResult.failed > 0 && <span className="td-bad">, {uploadResult.failed} failed</span>}
              </p>
              <ul className="td-list">
                {Object.entries(uploadResult.byCategory).map(([name, c]) => (
                  <li key={name}>
                    <span>{name}</span>
                    <span className={c.failed ? 'td-bad' : ''}>{c.successful}/{c.total}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="adm-card td-card">
          <h2>Validate Team Data</h2>
          <p>Check what team data is currently in Firestore and validate the structure.</p>
          <button type="button" className="td-btn td-outline" onClick={handleValidate} disabled={!!busy}>
            {busy === 'validate' ? 'Checking…' : 'Validate team data'}
          </button>

          {report && (
            <div className="td-result" role="status">
              <p className="td-summary">
                {report.inFirestore} in Firestore · {report.inFile} in TeamData.js
              </p>
              {report.issues.length === 0 ? (
                <p className="td-ok">Everything matches.</p>
              ) : (
                <ul className="td-issues">
                  {report.issues.map((issue) => <li key={issue}>{issue}</li>)}
                </ul>
              )}
              <ul className="td-list">
                {Object.entries(report.byCategory).map(([name, c]) => (
                  <li key={name}>
                    <span>{name}</span>
                    <span className={c.inFirestore === c.inFile ? '' : 'td-bad'}>
                      {c.inFirestore}/{c.inFile}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
