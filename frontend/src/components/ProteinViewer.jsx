import { getAminoAcidData, PROPERTY_LABELS } from '../utils/aminoAcidData';
import '../styles/ProteinViewer.css';

/**
 * ProteinViewer — displays the translated protein chain as colored amino acid pills.
 *
 * Features:
 * - Color-coded by chemical property (nonpolar, polar, charged, start, stop)
 * - Hover popup with full name, abbreviation, and property
 * - Click highlights corresponding codon in SequenceViewer
 * - Property legend
 * - Staggered entrance animation
 */
export default function ProteinViewer({
  proteinSequence,
  codons,
  orfs = [],
  highlightedCodon,
  onCodonHover,
  codonOffset = 0,
}) {
  if (!proteinSequence) return null;

  const aminoAcids = proteinSequence.split('');

  return (
    <section className="protein-section" id="protein-viewer">
      <div className="section-header">
        <div className="section-title">
          <span className="icon">🔬</span>
          Protein Sequence
          <span className="section-badge">{aminoAcids.length} aa</span>
        </div>
      </div>

      <div className="protein-chain" id="protein-chain">
        {aminoAcids.map((aa, idx) => {
          const globalIdx = codonOffset + idx;
          const data = getAminoAcidData(aa);
          const codon = codons?.[idx];
          const isHighlighted = highlightedCodon !== null && highlightedCodon === globalIdx;

          return (
            <div
              key={globalIdx}
              className={`aa-pill animate ${isHighlighted ? 'highlighted' : ''} ${idx < 12 ? 'tooltip-bottom' : ''}`}
              style={{
                backgroundColor: `${data.color}20`,
                color: data.color,
                borderColor: `${data.color}40`,
                animationDelay: `${Math.min(idx * 50, 1000)}ms`,
              }}
              onMouseEnter={() => onCodonHover?.(globalIdx)}
              onMouseLeave={() => onCodonHover?.(null)}
            >
              {aa}
              <div className="aa-popup">
                <div className="aa-popup-name">{data.name}</div>
                <div className="aa-popup-detail">
                  {data.abbr3} ({aa})
                  {codon && ` · ${codon.codon}`}
                </div>
                <div
                  className="aa-popup-property"
                  style={{ color: data.color }}
                >
                  {PROPERTY_LABELS[data.property]?.icon}{' '}
                  {PROPERTY_LABELS[data.property]?.label || data.property}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="property-legend" id="property-legend">
        {Object.entries(PROPERTY_LABELS).map(([key, { label, color, icon }]) => (
          <div className="legend-item" key={key}>
            <span
              className="legend-swatch"
              style={{ backgroundColor: `${color}30`, border: `1px solid ${color}50` }}
            />
            <span>{icon} {label}</span>
          </div>
        ))}
      </div>

      {orfs && orfs.length > 0 && (
        <div className="protein-fragments" id="protein-fragments">
          <div className="fragments-header">
            <span className="icon">📜</span>
            <span className="fragments-title">Identified Protein Fragments</span>
            <span className="fragments-count">{orfs.length} found</span>
          </div>
          
          <div className="fragments-list">
            {orfs.map((orf, idx) => (
              <div 
                key={idx} 
                className={`fragment-card ${!orf.is_complete ? 'incomplete' : ''}`}
                id={`fragment-${idx + 1}`}
              >
                <div className="fragment-info">
                  <span className="fragment-label">{orf.label}</span>
                  <span className="fragment-range">Pos: {orf.start_index} - {orf.stop_index}</span>
                </div>
                
                <div className="fragment-seq-container">
                  <div className="fragment-sequence">{orf.sequence}</div>
                </div>

                <div className="fragment-stats">
                  <span className="stat-item">Length: <strong>{orf.length} aa</strong></span>
                  <span className="stat-item">Status: <strong>{orf.is_complete ? 'Complete (M → *)' : 'Incomplete'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
