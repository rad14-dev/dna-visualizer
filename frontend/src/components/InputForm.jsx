import { useState } from 'react';
import '../styles/InputForm.css';

const EXAMPLE_IDS = ['NM_000558', 'NM_001301717', 'NM_005228'];

/**
 * InputForm — Accession Number input with validation, loading state, and hint chips.
 */
export default function InputForm({ onSubmit, loading, error, onDismissError }) {
  const [value, setValue] = useState('');
  const [hasError, setHasError] = useState(false);

  const validate = (v) => {
    if (!v.trim()) return false;
    // Basic NCBI accession pattern
    return /^[A-Za-z]{1,3}_?\d{3,12}(\.\d+)?$/.test(v.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate(value)) {
      setHasError(true);
      return;
    }
    setHasError(false);
    onSubmit(value.trim());
  };

  const handleHintClick = (id) => {
    setValue(id);
    setHasError(false);
  };

  return (
    <section className="input-section" id="input-form">
      <div className="input-card">
        <form onSubmit={handleSubmit}>
          <label className="input-label" htmlFor="accession-input">
            NCBI Accession Number
          </label>

          <div className="input-wrapper">
            <input
              id="accession-input"
              type="text"
              className={`input-field ${hasError ? 'error' : ''}`}
              placeholder="e.g. NM_000558"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setHasError(false);
              }}
              disabled={loading}
              autoComplete="off"
              spellCheck="false"
            />
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !value.trim()}
              id="submit-btn"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <span>🧬</span>
                  Fetch & Process
                </>
              )}
            </button>
          </div>

          <div className="input-hints">
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginRight: '4px' }}>
              Contoh:
            </span>
            {EXAMPLE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className="hint-chip"
                onClick={() => handleHintClick(id)}
                disabled={loading}
              >
                {id}
              </button>
            ))}
          </div>
        </form>

        {(error || hasError) && (
          <div className="error-banner" role="alert">
            <span className="error-icon">⚠️</span>
            <span>
              {hasError
                ? 'Format Accession Number tidak valid. Gunakan format seperti NM_000558.'
                : error}
            </span>
            <button
              className="dismiss-btn"
              onClick={() => {
                setHasError(false);
                onDismissError?.();
              }}
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
