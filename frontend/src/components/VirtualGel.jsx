import React, { useMemo } from 'react';

/**
 * VirtualGel — Displays a virtual agarose gel electrophoresis.
 */
export default function VirtualGel({ fragments = [] }) {
  // Typical marker sizes (in bp) for a 1kb ladder
  const markerBands = [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 500, 250];
  const maxMarker = markerBands[0];

  // Helper function to map base pair size to a vertical position (logarithmic scale)
  // Smaller fragments travel further (down)
  const getPosition = (bp) => {
    if (bp <= 0) return 100;
    if (bp > maxMarker) return 5;
    
    // Logarithmic distribution: log10(max) - log10(bp) / log10(max)
    const logMax = Math.log10(maxMarker);
    const logBp = Math.log10(bp);
    const minLog = Math.log10(100); // minimum practical size for this gel
    
    let ratio = (logMax - logBp) / (logMax - minLog);
    // Ensure it's between 5% and 95%
    return Math.max(5, Math.min(95, ratio * 100));
  };

  const calculateIntensity = (bp) => {
    // Larger fragments stain brighter in gel because they bind more dye (Ethidium Bromide)
    const minOpacity = 0.4;
    const maxOpacity = 0.95;
    const ratio = Math.min(1, bp / 8000);
    return minOpacity + (maxOpacity - minOpacity) * ratio;
  };

  return (
    <section className="virtual-gel-section" id="virtual-gel" style={{ marginTop: '2rem' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
        <span className="icon" style={{ fontSize: '1.5rem' }}>🧪</span>
        <span className="section-title" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Virtual Gel Electrophoresis</span>
      </div>

      <div style={{
        background: '#0d0d14',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)'
      }}>
        {/* Deskripsi */}
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)', 
          textAlign: 'center', 
          maxWidth: '600px',
          marginBottom: '2rem'
        }}>
          Simulasi pemisahan fragmen DNA berdasarkan ukuran menggunakan *Virtual Agarose Gel*.
          Pita (*bands*) yang berada lebih di bawah merupakan fragmen yang lebih pendek/kecil.
        </p>

        {/* The Gel Container */}
        <div style={{
          width: '300px',
          height: '450px',
          background: 'linear-gradient(180deg, #11111a 0%, #08080c 100%)',
          borderRadius: '8px',
          position: 'relative',
          display: 'flex',
          border: '2px solid #222',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          {/* Well Labels */}
          <div style={{
            position: 'absolute',
            top: '-25px',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-around',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontWeight: 'bold',
            letterSpacing: '1px'
          }}>
            <span style={{ flex: 1, textAlign: 'center' }}>M</span>
            <span style={{ flex: 1, textAlign: 'center' }}>DIGEST</span>
          </div>

          {/* Lane 1: Marker (Ladder) */}
          <div className="lane marker-lane" style={{
            flex: 1,
            position: 'relative',
            borderRight: '1px solid rgba(255,255,255,0.05)',
            margin: '0 10px'
          }}>
            {/* The Well */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '20%',
              right: '20%',
              height: '8px',
              background: '#000',
              border: '1px solid #333',
              borderRadius: '2px'
            }} />

            {/* Marker Bands */}
            {markerBands.map((bp, i) => (
              <div key={i} className="gel-band marker-band" style={{
                position: 'absolute',
                top: `${getPosition(bp)}%`,
                left: '15%',
                right: '15%',
                height: '3px',
                background: '#818cf8', // Muted purple/blue for marker
                borderRadius: '1px',
                opacity: calculateIntensity(bp) * 0.7, // Markers are usually a bit faint
                boxShadow: '0 0 4px rgba(129, 140, 248, 0.5)'
              }}>
                {/* Size label tooltip on hover */}
                <div className="band-tooltip" style={{
                  position: 'absolute',
                  left: '-45px',
                  top: '-6px',
                  fontSize: '10px',
                  color: '#818cf8',
                  fontFamily: 'monospace'
                }}>
                  {bp >= 1000 ? `${bp/1000}k` : bp}
                </div>
              </div>
            ))}
          </div>

          {/* Lane 2: Sample (Digested Fragments) */}
          <div className="lane sample-lane" style={{
            flex: 1,
            position: 'relative',
            margin: '0 10px'
          }}>
             {/* The Well */}
             <div style={{
              position: 'absolute',
              top: '10px',
              left: '20%',
              right: '20%',
              height: '8px',
              background: '#000',
              border: '1px solid #333',
              borderRadius: '2px'
            }} />

            {/* Fragment Bands */}
            {fragments.length === 0 ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                width: '100%',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: '0.75rem',
                fontStyle: 'italic'
              }}>
                Tidak terpotong<br/>(1 pita utuh)
              </div>
            ) : null}

            {fragments.map((bp, i) => (
              <div key={i} className="gel-band sample-band" style={{
                position: 'absolute',
                top: `${getPosition(bp)}%`,
                left: '10%',
                right: '10%',
                height: '4px',
                background: '#22c55e', // Bright green for our sample (like SYBR safe)
                borderRadius: '2px',
                opacity: calculateIntensity(bp),
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)',
                cursor: 'pointer'
              }} title={`${bp} bp`}>
                <div style={{
                  position: 'absolute',
                  right: '-55px',
                  top: '-5px',
                  fontSize: '10px',
                  color: '#22c55e',
                  fontFamily: 'monospace',
                  opacity: 0.8
                }}>
                  {bp}bp
                </div>
              </div>
            ))}
          </div>

        </div>
        
        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          gap: '1rem',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)'
        }}>
          <div><span style={{color: '#818cf8'}}>■</span> M = Marker (1kb Ladder)</div>
          <div><span style={{color: '#22c55e'}}>■</span> DIGEST = Sample</div>
        </div>
      </div>
    </section>
  );
}