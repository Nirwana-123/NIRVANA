import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { uploadAllTeamData, validateTeamData } from '../../../Utils/UploadTeam';
import './Admin.css';
// import './TeamDataPage.css';

export default function TeamDataPage({ onAuthError, onNote }) {
  const dialogRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Any logged-in user is treated as admin (the dashboard is already sign-in only)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setIsAdmin(!!currentUser));
    return () => unsubscribe();
  }, []);

  const handleOpen = () => {
    setResult(null);
    setError(null);
    dialogRef.current?.showModal();
  };

  const handleClose = () => {
    if (!loading) dialogRef.current?.close();
  };

  const handleError = (err, setLocalError) => {
    if (err.code === 'permission-denied') {
      const message = 'Firestore denied access to the "teamData" collection. Check the deployed Firestore rules for this admin account.';
      if (setLocalError) setLocalError(message);
      else onNote?.(message);
    }
    else if (setLocalError) setLocalError(err.message || 'An unknown error occurred');
    else onNote?.(err.message || 'Something went wrong');
  };

  const handleUpload = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setProgress(null);
      setValidationResult(null);

      const stats = await uploadAllTeamData(auth.currentUser, (done, total) => setProgress({ done, total }));
      setResult(stats);
      onNote?.(
        stats.failed
          ? `Uploaded ${stats.successful} of ${stats.total}. ${stats.failed} failed.`
          : `Uploaded ${stats.successful} team members.`,
      );
    } catch (err) {
      console.error('Error uploading team data:', err);
      handleError(err, setError);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    try {
      setIsValidating(true);
      setValidationResult(null);
      setValidationResult(await validateTeamData());
    } catch (err) {
      console.error('Error validating team data:', err);
      handleError(err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      <h1>Team data</h1>

      {!isAdmin && (
        <p className="td-alert td-alert-warn" role="alert">
          You need to be logged in to upload team data.
        </p>
      )}

      <div className="td-grid">
        <section className="adm-card td-card">
          <h2>Upload Team Data</h2>
          <p>Upload all team data from TeamData.js to Firebase Firestore in a structured format.</p>
          <button type="button" className="td-btn td-primary" onClick={handleOpen}>
            Upload team data to Firestore
          </button>
        </section>

        <section className="adm-card td-card">
          <h2>Validate Team Data</h2>
          <p>Check what team data is currently in Firestore and validate the structure.</p>
          <button type="button" className="td-btn td-outline" onClick={handleValidate} disabled={isValidating}>
            {isValidating ? 'Validating…' : 'Validate team data'}
          </button>

          {validationResult && (
            <div className="td-panel td-info" role="status">
              <h3>Validation Results</h3>
              <p>Total Categories: {Object.keys(validationResult.byCategory).length}</p>
              <p>Total Members: {validationResult.inFirestore}</p>
              <p>Members in TeamData.js: {validationResult.inFile}</p>

              <h4>Members per Category</h4>
              <ul className="td-list">
                {Object.entries(validationResult.byCategory).map(([category, c]) => (
                  <li key={category}>
                    <span>{category}</span>
                    <span className={c.inFirestore === c.inFile ? '' : 'td-bad'}>
                      {c.inFirestore}
                      {c.inFirestore !== c.inFile && ` (expected ${c.inFile})`}
                    </span>
                  </li>
                ))}
              </ul>

              {validationResult.issues.length === 0 ? (
                <p className="td-ok">Everything matches.</p>
              ) : (
                <>
                  <h4>Issues</h4>
                  <ul className="td-issues">
                    {validationResult.issues.map((issue) => <li key={issue}>{issue}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ---------- Upload confirmation dialog ---------- */}
      <dialog ref={dialogRef} className="td-dialog" aria-labelledby="td-dialog-title" onCancel={(e) => loading && e.preventDefault()}>
        <h2 id="td-dialog-title">Upload Team Data to Firestore</h2>
        <p>This will upload all team data from TeamData.js to Firebase Firestore in a structured format.</p>
        <p className="td-muted">
          Each team category (Sir, ProgramCoordinators, Founder, CoFounder, Team2019, Team2020, etc.)
          will be saved in the "teamData" collection with its category name.
        </p>

        {loading && (
          <div className="td-loading" role="status">
            <span className="td-spinner" aria-hidden="true" />
            {progress && <span>{progress.done}/{progress.total}</span>}
          </div>
        )}

        {result && (
          <div className="td-panel td-success" role="status">
            <h3>Upload Complete!</h3>
            <p>Total processed: {result.total}</p>
            <p>Successfully uploaded: {result.successful}</p>
            <p>Failed: {result.failed}</p>

            <h4>Category Statistics</h4>
            <ul className="td-list">
              {Object.entries(result.byCategory).map(([category, s]) => (
                <li key={category}>
                  <span>{category}</span>
                  <span className={s.failed ? 'td-bad' : ''}>{s.successful}/{s.total} uploaded</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <div className="td-panel td-error" role="alert">{error}</div>}

        {!isAdmin && (
          <p className="td-alert td-alert-error" role="alert">You must be logged in to upload data.</p>
        )}

        <div className="td-actions">
          <button type="button" className="td-btn td-text" onClick={handleClose} disabled={loading}>
            Close
          </button>
          <button type="button" className="td-btn td-primary" onClick={handleUpload} disabled={loading || !isAdmin}>
            {loading ? 'Uploading…' : 'Start upload'}
          </button>
        </div>
      </dialog>
    </>
  );
}
