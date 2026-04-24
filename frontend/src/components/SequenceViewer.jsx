import { useMemo, useState, useRef } from 'react';
import { getNucleotideColor } from '../utils/colorMap';
import '../styles/SequenceViewer.css';
import * as Tone from 'tone';

const BASES_PER_ROW = 20;

// Mapping nukleotida ke nada untuk beberapa jenis tangga nada
const SCALES = {
  pentatonic: {
    name: "C-Major Pentatonic",
    notes: {
      'G': 'A4', // La
      'C': 'G4', // Sol
      'A': 'E4', // Mi
      'T': 'D4', // Re
      'U': 'C4'  // Do
    }
  },
  pelog: {
    name: "Pelog (Javanese)",
    notes: {
      'G': 'A#4', // Pelog intervals (approx)
      'C': 'G4', 
      'A': 'E4', 
      'T': 'D#4', 
      'U': 'C4'
    }
  },
  slendro: {
    name: "Slendro (Javanese)",
    notes: {
      'G': 'A4', // Slendro intervals (approx)
      'C': 'G4', 
      'A': 'F4', 
      'T': 'D4', 
      'U': 'C4'
    }
  }
};

/**
 * SequenceViewer — renders DNA or RNA sequence as a color-coded grid.
 * Includes DNA/Protein Sonification (Tone.js).
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
  restrictionSites = [],
}) {
  const sequence = activeView === 'dna' ? dnaSequence : rnaSequence;
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [scale, setScale] = useState('pentatonic');
  const [playingIndex, setPlayingIndex] = useState(-1);
  const synthRef = useRef(null);
  const sequenceRef = useRef(null);

  // Initialize synth
  const initAudio = async () => {
    if (!synthRef.current) {
      await Tone.start(); // Start audio context
      
      // PolySynth untuk karakter suara instrumen Xylophone (FM Synth)
      const synth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 1.2,
        oscillator: {
          type: "sine"
        },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0,
          release: 0.5
        },
        modulation: {
          type: "square"
        },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.05,
          sustain: 0,
          release: 0.2
        }
      });
      
      // Efek Reverb kecil
      const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).toDestination();
      synth.connect(reverb);
      synthRef.current = synth;
    }
  };

  const togglePlay = async () => {
    if (!sequence) return;
    
    if (isPlaying) {
      Tone.Transport.stop();
      if (sequenceRef.current) {
        sequenceRef.current.stop();
      }
      setIsPlaying(false);
      setPlayingIndex(-1);
      return;
    }

    await initAudio();
    
    // Create sequence of notes based on selected scale
    const activeScaleNotes = SCALES[scale].notes;
    const notes = sequence.split('').map((base, i) => ({
      time: i, 
      note: activeScaleNotes[base] || 'C4', 
      idx: i 
    }));

    Tone.Transport.bpm.value = bpm;
    
    if (sequenceRef.current) {
      sequenceRef.current.dispose();
    }

    sequenceRef.current = new Tone.Sequence((time, event) => {
      // Mainkan nada
      synthRef.current.triggerAttackRelease(event.note, "8n", time);
      // Update visualizer tersinkronisasi (harus via Tone.Draw agar sync dgn audio thread)
      Tone.Draw.schedule(() => {
        setPlayingIndex(event.idx);
        // Highlight codon corresponding to this base
        const codonIdx = Math.floor((baseOffset + event.idx) / 3);
        onCodonHover?.(codonIdx);
      }, time);
    }, notes, "8n");

    sequenceRef.current.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
  };

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
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span><span className="icon">🧬</span>{activeView === 'dna' ? 'DNA' : 'RNA'} Sequence</span>
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

      {/* Audio Controls */}
      <div style={{
        background: 'var(--bg-surface)',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={togglePlay}
          style={{
            background: isPlaying ? 'var(--color-error)' : 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isPlaying ? '⏸ Stop Sonification' : '▶ Play Sonification'}
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <label>BPM: {bpm}</label>
          <input 
            type="range" 
            min="60" 
            max="300" 
            value={bpm} 
            onChange={(e) => {
              const newBpm = parseInt(e.target.value);
              setBpm(newBpm);
              if (isPlaying) Tone.Transport.bpm.value = newBpm;
            }}
            style={{ width: '100px', cursor: 'pointer' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <label htmlFor="scale-select">Scale:</label>
          <select
            id="scale-select"
            value={scale}
            onChange={(e) => {
              setScale(e.target.value);
              // Stop playing if scale changes to re-initialize sequence with new notes
              if (isPlaying) {
                togglePlay();
              }
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              outline: 'none'
            }}
          >
            {Object.entries(SCALES).map(([key, data]) => (
              <option key={key} value={key}>{data.name}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
          Instrumen: Xylophone (FM Synth)
        </div>
      </div>

      <div className="sequence-grid" id="sequence-grid">
        {rows.map((row, rowIdx) => (
          row.bases.map((base, colIdx) => {
            const currentIdx = row.start + colIdx;
            const globalIdx = baseOffset + currentIdx;
            const codonIdx = Math.floor(globalIdx / 3);
            const { color, label, bgLight } = getNucleotideColor(base);
            
            // Check highlight conditions
            const isHighlightedCodon = highlightedCodon !== null && codonIdx === highlightedCodon;
            const isPlayingNow = isPlaying && currentIdx === playingIndex;
            
            // Restriction enzyme site checking
            // We find if the CURRENT globalIdx is a cut site
            // Restriction sites are 1-based from backend, meaning cut is AFTER that position
            // So if globalIdx + 1 matches a site position, we render the scissors on the right border
            const cutSite = activeView === 'dna' ? restrictionSites.find(site => site.position === (globalIdx + 1)) : null;

            const isLeftEdge = currentIdx % 20 < 3;
            const isRightEdge = currentIdx % 20 > 16;

            return (
              <div
                key={globalIdx}
                className={`nucleotide-cell animate ${isHighlightedCodon ? 'codon-highlight' : ''} ${isPlayingNow ? 'playing-highlight' : ''} ${currentIdx < 20 ? 'tooltip-bottom' : ''} ${isLeftEdge ? 'tooltip-left' : ''} ${isRightEdge ? 'tooltip-right' : ''}`}
                style={{
                  backgroundColor: isPlayingNow ? '#eab308' : bgLight,
                  color: isPlayingNow ? '#000' : color,
                  animationDelay: `${Math.min(currentIdx * 10, 500)}ms`,
                  border: `1px solid ${color}33`,
                  transform: isPlayingNow ? 'scale(1.2)' : 'none',
                  zIndex: isPlayingNow ? 10 : 1,
                  transition: 'transform 0.1s ease-out, background-color 0.1s',
                  position: 'relative' // for scissors absolute positioning
                }}
                onMouseEnter={() => onCodonHover?.(codonIdx)}
                onMouseLeave={() => onCodonHover?.(null)}
                title={`${label} — Position ${globalIdx + 1}`}
              >
                {base}
                
                {/* Ikon Gunting jika ini adalah Restriction Site (hanya di DNA view) */}
                {cutSite && (
                  <div style={{
                    position: 'absolute',
                    right: '-8px', // cut is after this base
                    top: '-12px',
                    fontSize: '14px',
                    zIndex: 20,
                    color: '#ef4444',
                    textShadow: '0 0 2px black'
                  }} title={`Cut site: ${cutSite.enzyme} (${cutSite.pattern})`}>
                    ✂️
                  </div>
                )}
                
                {/* Visual line separating the cut */}
                {cutSite && (
                  <div style={{
                    position: 'absolute',
                    right: '-1px',
                    top: '-4px',
                    bottom: '-4px',
                    width: '2px',
                    backgroundColor: '#ef4444',
                    zIndex: 15,
                    boxShadow: '0 0 4px #ef4444'
                  }} />
                )}

                <span className="cell-tooltip">
                  {label} #{globalIdx + 1}
                  {activeView === 'rna' && ` · Codon ${codonIdx + 1}`}
                  {cutSite && <><br/><strong style={{color: '#ef4444'}}>{cutSite.enzyme} Site</strong></>}
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