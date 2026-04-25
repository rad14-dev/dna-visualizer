import { useState, useEffect } from 'react';
import '../styles/InputForm.css';

const EXAMPLE_IDS = ['NM_000558', 'NC_000001.11', 'X00001', 'AY123456']; // Contoh Accession ID yang lebih beragam

/**
 * InputForm — Accession Number & Email input with validation, loading state, and hint chips.
 */
export default function InputForm({ onSubmit, loading, error, onDismissError }) {
  const [accession, setAccession] = useState('');
  const [email, setEmail] = useState('');
  const [hasError, setHasError] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('ncbi_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const validateAccession = (v) => {
    if (!v.trim()) return false;
    // Basic NCBI nucleotide accession pattern (flexible for NM_, NC_, X_, AY_, etc.)
    return /^[A-Za-z]{1,6}_?\d{1,12}(\.\d+)?$/.test(v.trim());
  };

  const validateEmail = (e) => {
    if (!e.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const isAccessionValid = validateAccession(accession);
    const isEmailValid = validateEmail(email);

    setHasError(!isAccessionValid);
    setEmailError(!isEmailValid);

    if (!isAccessionValid || !isEmailValid) {
      return;
    }

    // Save email to localStorage for future use
    localStorage.setItem('ncbi_email', email.trim());

    onSubmit(accession.trim(), email.trim());
  };

  const handleHintClick = (id) => {
    setAccession(id);
    setHasError(false);
  };

  return (
    <section className="input-section" id="input-form">
      <div className="input-card">
        <form onSubmit={handleSubmit}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
            {/* Email Input Field */}
            <div>
              <label className="input-label" htmlFor="email-input" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Email Anda (Syarat NCBI)</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.7 }}>Disimpan secara lokal</span>
              </label>
              <input
                id="email-input"
                type="email"
                className={`input-field ${emailError ? 'error' : ''}`}
                style={{ width: '100%', marginBottom: 0 }}
                placeholder="email@institusi.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                disabled={loading}
                autoComplete="email"
              />
              {emailError && <span style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Email tidak valid.</span>}
            </div>

            {/* Accession Input Field */}
            <div>
              <label className="input-label" htmlFor="accession-input">
                NCBI Accession Number (Nucleotide)
              </label>

              <div className="input-wrapper" style={{ marginBottom: 0 }}>
                <input
                  id="accession-input"
                  type="text"
                  className={`input-field ${hasError ? 'error' : ''}`}
                  placeholder="e.g. NM_000558, NC_000001, X00001"
                  value={accession}
                  onChange={(e) => {
                    setAccession(e.target.value);
                    setHasError(false);
                  }}
                  disabled={loading}
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading || !accession.trim() || !email.trim()}
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

              <div className="input-hints" style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginRight: '4px' }}>
                  Contoh Nucleotide Accession:
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
            </div>
          </div>

        </form>

        {(error || hasError) && (
          <div className="error-banner" role="alert" style={{ marginTop: '1rem' }}>
            <span className="error-icon">⚠️</span>
            <span>
              {hasError
                ? 'Format Accession Number tidak valid. Gunakan format seperti NM_000558, NC_000001, X00001.'
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