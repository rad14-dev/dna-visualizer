import { useState, useMemo } from 'react';
import '../styles/SequenceViewer.css';

/**
 * CodonTable — interactive table showing all 64 standard genetic code codons.
 *
 * Features:
 * - Search/filter codons
 * - Highlight codons present in the current sequence
 * - Color-coded by amino acid property
 */
export default function CodonTable({ codons, sequenceCodons }) {
  const [search, setSearch] = useState('');

  // Count codon frequency from sequence
  const codonFrequency = useMemo(() => {
    if (!sequenceCodons) return {};
    const freq = {};
    sequenceCodons.forEach((c) => {
      freq[c.codon] = (freq[c.codon] || 0) + 1;
    });
    return freq;
  }, [sequenceCodons]);

  // Filter codons by search
  const filteredCodons = useMemo(() => {
    if (!codons) return [];
    if (!search.trim()) return codons;
    const q = search.toUpperCase();
    return codons.filter(
      (c) =>
        c.codon.includes(q) ||
        c.amino_acid.includes(q) ||
        c.amino_acid_name.toUpperCase().includes(q)
    );
  }, [codons, search]);

  if (!codons || codons.length === 0) return null;

  return (
    <section className="sequence-section" id="codon-table" style={{ animationDelay: '300ms' }}>
      <div className="section-header">
        <div className="section-title">
          <span className="icon">📊</span>
          Codon Table
          <span className="section-badge">64 codons</span>
        </div>

        <input
          type="text"
          placeholder="Search codons..."
          className="input-field"
          style={{
            maxWidth: '200px',
            padding: '6px 12px',
            fontSize: 'var(--text-sm)',
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="codon-search"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '4px',
          padding: 'var(--space-4)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          maxHeight: '350px',
          overflowY: 'auto',
        }}
      >
        {filteredCodons.map((c) => {
          const freq = codonFrequency[c.codon] || 0;
          const isInSequence = freq > 0;
          return (
            <div
              key={c.codon}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-xs)',
                background: isInSequence ? 'var(--accent-subtle)' : 'transparent',
                border: `1px solid ${isInSequence ? 'var(--accent)' : 'var(--border-subtle)'}`,
                transition: 'all var(--transition-fast)',
                cursor: 'default',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {c.codon}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>→</span>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  color: c.amino_acid === '*' ? 'var(--color-error)' : 'var(--accent-light)',
                }}
              >
                {c.amino_acid === '*' ? 'Stop' : c.amino_acid}
              </span>
              {isInSequence && (
                <span
                  style={{
                    marginLeft: 'auto',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  ×{freq}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
