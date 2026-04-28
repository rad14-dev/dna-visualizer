import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getAminoAcidData, PROPERTY_LABELS } from '../utils/aminoAcidData';
import '../styles/ProteinViewer.css';
import * as $3Dmol from '3dmol';

// Objek pemetaan sederhana untuk gen populer
const PDB_MAPPING = {
  'NM_000600': '1TRZ', // Insulin
  'NM_000558': '1A3N', // Hemoglobin alpha
  'NM_000518': '1GZX', // Hemoglobin beta
  'NM_000963': '5IKR', // COX-2
};

/**
 * ProteinViewer — displays the translated protein chain as colored amino acid pills.
 *
 * Features:
 * - Color-coded by chemical property (nonpolar, polar, charged, start, stop)
 * - Hover popup with full name, abbreviation, and property
 * - Click highlights corresponding codon in SequenceViewer
 * - Property legend
 * - Staggered entrance animation
 * - 3D Protein Structure Viewer integration with controls
 * - Functional signal highlighting
 */
export default function ProteinViewer({
  proteinSequence,
  codons,
  orfs = [],
  highlightedCodon,
  onCodonHover,
  codonOffset = 0,
  accessionId,
  functionalSignals = [],
}) {
  const viewerRef = useRef(null);
  const viewerInstance = useRef(null);
  const [pdbId, setPdbId] = useState(null);
  const [isSpinning, setIsSpinning] = useState(true);
  const [visualStyle, setVisualStyle] = useState('cartoon');

  // 1. Memetakan Accession ID ke PDB ID
  useEffect(() => {
    if (accessionId) {
      const baseId = accessionId.split('.')[0];
      if (PDB_MAPPING[baseId]) {
        setPdbId(PDB_MAPPING[baseId]);
      } else if (PDB_MAPPING[accessionId]) {
        setPdbId(PDB_MAPPING[accessionId]);
      } else {
        setPdbId(null);
      }
    } else {
      setPdbId(null);
    }
  }, [accessionId]);

  // Helper untuk menerapkan gaya visual
  const applyStyle = (viewer, styleStr) => {
    viewer.setStyle({}, { [styleStr]: { colorscheme: 'ssPyMOL' } });
    viewer.render();
  };

  // 2. Menginisialisasi 3Dmol viewer
  useEffect(() => {
    if (!pdbId || !viewerRef.current) return;

    // Bersihkan kontainer jika sebelumnya sudah ada elemen
    viewerRef.current.innerHTML = '';
    
    // Pastikan container memiliki posisi relatif dan dimensions yang cukup
    viewerRef.current.style.position = 'relative';
    
    const config = { backgroundColor: '#000000' };
    const viewer = $3Dmol.createViewer(viewerRef.current, config);
    viewerInstance.current = viewer;

    $3Dmol.download(`pdb:${pdbId}`, viewer, {}, function () {
      applyStyle(viewer, 'cartoon');
      viewer.zoomTo();
      viewer.render();
      viewer.spin(true);
      setIsSpinning(true);
      setVisualStyle('cartoon');
    });

    return () => {
      if (viewerInstance.current) {
        viewerInstance.current.removeAllModels();
        viewerInstance.current.clear();
        viewerInstance.current = null;
      }
    };
  }, [pdbId]);

  // Handlers untuk kontrol
  const toggleSpin = useCallback(() => {
    if (viewerInstance.current) {
      const newSpinState = !isSpinning;
      viewerInstance.current.spin(newSpinState);
      setIsSpinning(newSpinState);
    }
  }, [isSpinning]);

  const changeStyle = useCallback((newStyle) => {
    if (viewerInstance.current) {
      applyStyle(viewerInstance.current, newStyle);
      setVisualStyle(newStyle);
    }
  }, []);

  const resetCamera = useCallback(() => {
    if (viewerInstance.current) {
      viewerInstance.current.zoomTo();
      viewerInstance.current.render();
    }
  }, []);

  if (!proteinSequence) return null;

  const aminoAcids = proteinSequence.split('');

  // Helper untuk mengecek apakah index ini bagian dari sinyal fungsional
  // Karena sekarang signals dipetakan ke orfs, ini digunakan jika ingin highlight sequence utama
  const getSignalForIndex = (idx) => {
    // Note: functionalSignals uses 1-based indexing, map to 0-based
    return functionalSignals.find(s => idx >= (s.start - 1) && idx < s.end);
  };

  const getSignalColor = (type) => {
    switch(type) {
      case 'Signal Peptide': return 'rgba(234, 179, 8, 0.4)'; // Yellow
      case 'Transit Peptide': return 'rgba(16, 185, 129, 0.4)'; // Green
      case 'Import to Nucleus': return 'rgba(59, 130, 246, 0.4)'; // Blue (NLS)
      case 'Export from Nucleus': return 'rgba(239, 68, 68, 0.4)'; // Red (NES)
      default: return 'rgba(168, 85, 247, 0.4)'; // Purple
    }
  };

  return (
    <section className="protein-section" id="protein-viewer">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div className="section-title">
          <span className="icon">🔬</span>
          Protein Sequence
          <span className="section-badge">{aminoAcids.length} aa</span>
        </div>

        {functionalSignals.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {functionalSignals.map((signal, i) => (
              <span key={i} style={{ 
                fontSize: '0.75rem', 
                backgroundColor: getSignalColor(signal.type), 
                padding: '4px 12px', 
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '10px' }}>
                  {signal.type === 'Import to Nucleus' ? '📥' : 
                   signal.type === 'Export from Nucleus' ? '📤' : 
                   signal.type === 'Signal Peptide' ? '🚚' : '🔄'}
                </span>
                Loc: {signal.type}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="protein-chain" id="protein-chain">
        {aminoAcids.map((aa, idx) => {
          const globalIdx = codonOffset + idx;
          const data = getAminoAcidData(aa);
          const codon = codons?.[idx];
          const isHighlighted = highlightedCodon !== null && highlightedCodon === globalIdx;

          const isLeftEdge = idx % 12 < 2; // Shift right if near left edge
          const isRightEdge = idx % 12 > 9; // Shift left if near right edge

          const activeSignal = getSignalForIndex(idx);
          const signalColor = activeSignal ? getSignalColor(activeSignal.type) : `${data.color}20`;

          return (
            <div
              key={globalIdx}
              className={`aa-pill animate ${isHighlighted ? 'highlighted' : ''} ${idx < 12 ? 'tooltip-bottom' : ''} ${isLeftEdge ? 'tooltip-left' : ''} ${isRightEdge ? 'tooltip-right' : ''}`}
              style={{
                backgroundColor: signalColor,
                color: data.color,
                borderColor: activeSignal ? data.color : `${data.color}40`,
                borderWidth: activeSignal ? '2px' : '1px',
                borderStyle: activeSignal ? 'dashed' : 'solid',
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
                {activeSignal && (
                  <div style={{ 
                    marginTop: '6px', 
                    paddingTop: '6px', 
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <strong style={{ color: '#818cf8' }}>{activeSignal.type}</strong>
                    <span>{activeSignal.description}</span>
                  </div>
                )}
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

      {/* 3D Structure Viewer section */}
      <div className="protein-3d-section" style={{ marginTop: '2rem' }}>
        <div className="fragments-header" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="icon">🧬</span>
          <span className="fragments-title" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>3D Structure</span>
          <div className="info-trigger">
            ⓘ
            <div className="info-tooltip">
              <strong>Protein Folding</strong>
              <p style={{textAlign: 'left', whiteSpace: 'normal'}}>Fungsi sebuah protein sangat bergantung pada bentuk 3D-nya (folding). Visualisasi ini membantu memahami bagaimana rantai linier asam amino melipat menjadi struktur fungsional atau reseptor spesifik.</p>
            </div>
          </div>
        </div>
        
        {/* 3. Menampilkan Viewer atau Pesan Kosong */}
        {pdbId ? (
          <div className="viewer-container relative w-full rounded-xl overflow-hidden shadow-lg border border-gray-700 bg-black" style={{ height: '450px' }}>
            <div
              ref={viewerRef}
              className="absolute inset-0 w-full h-full"
              style={{ width: '100%', height: '100%' }}
            />
            {/* Tombol Kontrol */}
            <div className="absolute bottom-4 right-4 flex gap-2 bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-gray-600 z-10">
              <button 
                onClick={toggleSpin}
                className={`px-3 py-1 text-xs font-semibold rounded ${isSpinning ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                {isSpinning ? '⏸ Pause' : '▶ Play'}
              </button>
              
              <div className="flex bg-gray-800 rounded overflow-hidden text-xs">
                <button 
                  onClick={() => changeStyle('cartoon')}
                  className={`px-2 py-1 ${visualStyle === 'cartoon' ? 'bg-gray-600 text-white font-bold' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                  Cartoon
                </button>
                <button 
                  onClick={() => changeStyle('sphere')}
                  className={`px-2 py-1 border-l border-r border-gray-700 ${visualStyle === 'sphere' ? 'bg-gray-600 text-white font-bold' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                  Sphere
                </button>
                <button 
                  onClick={() => changeStyle('stick')}
                  className={`px-2 py-1 ${visualStyle === 'stick' ? 'bg-gray-600 text-white font-bold' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                  Stick
                </button>
              </div>
              
              <button 
                onClick={resetCamera}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded font-semibold transition-colors"
              >
                🎯 Reset
              </button>
            </div>
            {/* Label PDB ID */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-xs text-gray-300 border border-gray-700 font-mono z-10">
              PDB: {pdbId}
            </div>
          </div>
        ) : (
          <div style={{ padding: '1.5rem', backgroundColor: '#13131f', borderRadius: '8px', textAlign: 'center', color: '#8888a0', border: '1px dashed #333' }}>
            3D Structure not available for this fragment
          </div>
        )}
      </div>

      {orfs && orfs.length > 0 && (
        <div className="protein-fragments" id="protein-fragments" style={{ marginTop: '2rem' }}>
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
                <div className="fragment-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="fragment-label">{orf.label}</span>
                  <span className="fragment-range">Pos: {orf.start_index} - {orf.stop_index}</span>
                </div>
                
                {/* 
                  NOTE: Bagian sinyal fungsional pada fragment list telah dihapus/ditarik kembali sesuai permintaan.
                */}
                
                <div className="fragment-seq-container">
                  <div className="fragment-sequence" style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--accent-light)', 
                    wordBreak: 'break-all',
                    lineHeight: '1.4'
                  }}>
                    {orf.sequence}
                  </div>
                </div>

                <div className="fragment-stats" style={{ marginTop: '8px' }}>
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