import { useMemo } from 'react';
import { getNucleotideColor } from '../utils/colorMap';
import '../styles/SequenceViewer.css';

const BASES_PER_ROW = 20;

/**
 * SequenceViewer — renders DNA or RNA sequence as a color-coded grid.
 *
 * Features:
 * - Toggle between DNA and RNA view
 * - Color-coded nucleotide cells
 * - Hover tooltip with position info
 * - Codon highlighting (groups of 3)
 * - Nucleotide frequency stats bar
 * - Staggered entrance animation
 */
export default function SequenceViewer({
  dnaSequence,
  rnaSequence,
  fullLength,
  nucleotideCounts,
  activeView,
  onViewChange,
  highlightedCodon,
  onCodonHover,
  baseOffset = 0,
}) {
  const sequence = activeView === 'dna' ? dnaSequence : rnaSequence;

  // Pre-compute row boundaries for position labels
  const rows = useMemo(() => {
    if (!sequence) return [];
    const result = [];
    for (let i = 0; i < sequence.length; i += BASES_PER_ROW) {
      result.push({
        start: i,
        end: Math.min(i + BASES_PER_ROW, sequence.length),
        bases: sequence.slice(i, i + BASES_PER_ROW).split(''),
      });
    }
    return result;
  }, [sequence]);

  // Nucleotide stats
  const stats = useMemo(() => {
    if (!nucleotideCounts) return [];
    const items = [
      { base: 'A', count: nucleotideCounts.A, color: '#22c55e' },
      { base: activeView === 'dna' ? 'T' : 'U', count: nucleotideCounts.T, color: activeView === 'dna' ? '#ef4444' : '#f97316' },
      { base: 'G', count: nucleotideCounts.G, color: '#eab308' },
      { base: 'C', count: nucleotideCounts.C, color: '#3b82f6' },
    ];
    return items;
  }, [nucleotideCounts, activeView]);

  if (!sequence) return null;

  return (
    <section className="sequence-section" id="sequence-viewer">
      <div className="section-header">
        <div className="section-title">
          <span className="icon">🧬</span>
          {activeView === 'dna' ? 'DNA' : 'RNA'} Sequence
          <span className="section-badge">{fullLength} bp</span>
        </div>

        <div className="view-toggle" id="view-toggle">
          <button
            className={`toggle-btn ${activeView === 'dna' ? 'active' : ''}`}
            onClick={() => onViewChange('dna')}
          >
            DNA
          </button>
          <button
            className={`toggle-btn ${activeView === 'rna' ? 'active' : ''}`}
            onClick={() => onViewChange('rna')}
          >
            RNA
          </button>
        </div>
      </div>

      <div className="sequence-grid" id="sequence-grid">
        {rows.map((row, rowIdx) => (
          row.bases.map((base, colIdx) => {
            const currentIdx = row.start + colIdx;
            const globalIdx = baseOffset + currentIdx;
            const codonIdx = Math.floor(globalIdx / 3);
            const { color, label, bgLight } = getNucleotideColor(base);
            const isHighlighted = highlightedCodon !== null && codonIdx === highlightedCodon;

            const isLeftEdge = currentIdx % 20 < 3;
            const isRightEdge = currentIdx % 20 > 16;

            return (
              <div
                key={globalIdx}
                className={`nucleotide-cell animate ${isHighlighted ? 'codon-highlight' : ''} ${currentIdx < 20 ? 'tooltip-bottom' : ''} ${isLeftEdge ? 'tooltip-left' : ''} ${isRightEdge ? 'tooltip-right' : ''}`}
                style={{
                  backgroundColor: bgLight,
                  color: color,
                  animationDelay: `${Math.min(currentIdx * 10, 500)}ms`,
                  border: `1px solid ${color}33`,
                }}
                onMouseEnter={() => onCodonHover?.(codonIdx)}
                onMouseLeave={() => onCodonHover?.(null)}
                title={`${label} — Position ${globalIdx + 1}`}
              >
                {base}
                <span className="cell-tooltip">
                  {label} #{globalIdx + 1}
                  {activeView === 'rna' && ` · Codon ${codonIdx + 1}`}
                </span>
              </div>
            );
          })
        ))}
      </div>

      <div className="nuc-stats" id="nuc-stats">
        {stats.map((s) => (
          <div className="nuc-stat" key={s.base}>
            <span className="dot" style={{ backgroundColor: s.color }} />
            <span>{s.base}:</span>
            <span className="count">{s.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
