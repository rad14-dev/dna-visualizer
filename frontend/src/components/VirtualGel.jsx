import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

/**
 * VirtualGel — Displays an advanced virtual agarose gel electrophoresis simulator.
 */
export default function VirtualGel({ fragments = [] }) {
  // Simulator State
  const [agarose, setAgarose] = useState(1.0); // 0.5% - 2.0%
  const [voltage, setVoltage] = useState(100); // 50V - 150V
  const [time, setTime] = useState(45); // Minutes
  const [buffer, setBuffer] = useState('TAE'); // TAE or TBE
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  // State untuk custom tooltip (terutama untuk mobile/tap)
  const [activeTooltip, setActiveTooltip] = useState(null);

  const controls = useAnimation();

  // Typical marker sizes (in bp) for a 1kb ladder
  const markerBands = [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 500, 250];
  const maxMarker = 10000;
  
  // Reset simulation when fragments or parameters change
  useEffect(() => {
    setIsRunning(false);
    setProgress(0);
    setActiveTooltip(null);
    controls.set({ top: '10px' });
  }, [fragments, agarose, voltage, time, buffer, controls]);

  // Handle klik/tap di luar gel untuk menutup tooltip
  useEffect(() => {
    const handleOutsideClick = (e) => {
      // Jika yang diklik bukan elemen dengan class 'gel-band', tutup tooltip
      if (!e.target.closest('.gel-band')) {
        setActiveTooltip(null);
      }
    };
    
    // Gunakan 'pointerdown' untuk kompatibilitas yang lebih baik di perangkat sentuh/mobile
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  // Migration Formula: v ∝ V / (L * log(bp) * [Agarose])
  // We compute a final "target position" percentage for each fragment.
  const calculateTargetPosition = (bp) => {
    if (bp <= 0) return 100;
    
    // Base log ratio
    const logMax = Math.log10(maxMarker);
    const logBp = Math.log10(bp);
    const minLog = Math.log10(50); // theoretical minimum
    
    let baseRatio = (logMax - logBp) / (logMax - minLog);
    
    // Apply Physics Multipliers
    // 1. Voltage (higher V = goes further)
    const voltageMultiplier = voltage / 100; 
    
    // 2. Time (more time = goes further)
    const timeMultiplier = time / 45;
    
    // 3. Agarose Concentration (higher % = slower, goes less far)
    const agaroseMultiplier = 1.0 / agarose;
    
    // 4. Buffer effect (simplified): TBE slightly slower but better resolution for small
    const bufferMultiplier = buffer === 'TBE' ? 0.9 : 1.0;
    
    let finalRatio = baseRatio * voltageMultiplier * timeMultiplier * agaroseMultiplier * bufferMultiplier;
    
    // Convert to percentage (max 95% to stay in gel)
    // Add 5% base offset so it starts below the well
    let positionPct = 5 + (finalRatio * 90);
    
    // If it runs off the gel
    if (positionPct > 100) positionPct = 105; 
    
    return positionPct;
  };

  const calculateIntensity = (bp) => {
    const minOpacity = 0.4;
    const maxOpacity = 0.95;
    const ratio = Math.min(1, bp / 8000);
    return minOpacity + (maxOpacity - minOpacity) * ratio;
  };

  const handleBandClick = (e, info) => {
    e.preventDefault();
    e.stopPropagation(); // Mencegah event ditangkap oleh window (yang akan menutup tooltip)
    // Toggle: Jika tooltip ini yang sedang aktif, maka tutup. Jika tidak, buka.
    setActiveTooltip(activeTooltip === info ? null : info);
  };

  // Warning logic for "Smearing"
  const isSmearing = voltage > 120 && agarose < 1.0;
  const isMelting = voltage >= 140 && time > 60;

  const handleRun = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setProgress(0);
    setActiveTooltip(null); // Tutup tooltip saat run dimulai
    
    // Reset positions
    await controls.set({ top: '10px', opacity: 0 });
    
    // Animate
    // For simplicity, we animate a generic "run" state, but the actual bands 
    // will use motion.div with calculated target positions
    controls.start({ opacity: 1, transition: { duration: 0.5 } });
    
    // Simulate time passing
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 50);
  };

  return (
    <section className="virtual-gel-section" id="virtual-gel" style={{ marginTop: '2rem' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
        <span className="icon" style={{ fontSize: '1.5rem' }}>🧪</span>
        <span className="section-title" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Advanced Virtual Electrophoresis</span>
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
          Konfigurasikan variabel lab sebelum melakukan "Run". Kecepatan migrasi pita DNA bergantung pada tegangan, waktu, konsentrasi agarose, dan jenis buffer.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', width: '100%', maxWidth: '900px' }}>
          
          {/* Panel Kontrol Laboratorium */}
          <div style={{ 
            background: 'var(--bg-surface)', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            border: '1px solid var(--border-subtle)',
            flex: '1',
            minWidth: '280px',
            maxWidth: '350px'
          }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              Lab Configuration
            </h3>

            {/* Agarose Concentration */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span title="Persentase matriks gel agarose yang digunakan." style={{cursor: 'help'}}>Agarose Concentration (Matrix)</span>
                <span style={{ color: 'var(--accent-light)', fontWeight: 'bold' }}>{agarose.toFixed(1)}%</span>
              </label>
              <input 
                type="range" min="0.5" max="2.0" step="0.1" 
                value={agarose} 
                onChange={(e) => setAgarose(parseFloat(e.target.value))}
                disabled={isRunning}
                style={{ width: '100%', cursor: 'pointer' }}
                title={`Saat ini: ${agarose.toFixed(1)}%`}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
                <span>Fast / Low Res</span>
                <span>Slow / High Res</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px', lineHeight: '1.2' }}>
                *Persentase lebih tinggi memperlambat pergerakan namun memberikan resolusi lebih baik untuk fragmen kecil (&lt;500bp).
              </p>
            </div>

            {/* Voltage */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span title="Tegangan listrik yang diaplikasikan pada gel." style={{cursor: 'help'}}>Voltage (Kelistrikan)</span>
                <span style={{ color: 'var(--accent-light)', fontWeight: 'bold' }}>{voltage} V</span>
              </label>
              <input 
                type="range" min="50" max="150" step="10" 
                value={voltage} 
                onChange={(e) => setVoltage(parseInt(e.target.value))}
                disabled={isRunning}
                style={{ width: '100%', cursor: 'pointer' }}
                title={`Saat ini: ${voltage} Volt`}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px', lineHeight: '1.2' }}>
                *Tegangan tinggi mempercepat migrasi, namun &gt;120V meningkatkan risiko pita "smearing" (buram) atau gel meleleh.
              </p>
            </div>

            {/* Run Time */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <span title="Durasi waktu elektroforesis dijalankan." style={{cursor: 'help'}}>Run Time (Waktu)</span>
                <span style={{ color: 'var(--accent-light)', fontWeight: 'bold' }}>{time} m</span>
              </label>
              <input 
                type="range" min="15" max="120" step="5" 
                value={time} 
                onChange={(e) => setTime(parseInt(e.target.value))}
                disabled={isRunning}
                style={{ width: '100%', cursor: 'pointer' }}
                title={`Saat ini: ${time} menit`}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px', lineHeight: '1.2' }}>
                *Berapa lama listrik dialirkan. Waktu yang lama bisa membuat fragmen lari keluar dari gel.
              </p>
            </div>

            {/* Buffer Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }} title="Jenis larutan buffer yang digunakan sebagai konduktor." style={{cursor: 'help'}}>
                Buffer Solution (Larutan)
              </label>
              <select 
                value={buffer} 
                onChange={(e) => setBuffer(e.target.value)}
                disabled={isRunning}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  background: 'var(--bg-primary)', 
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                title={`Saat ini menggunakan buffer ${buffer}`}
              >
                <option value="TAE">TAE (Baik untuk recovery fragmen besar &gt;2kb)</option>
                <option value="TBE">TBE (Baik untuk resolusi fragmen kecil)</option>
              </select>
            </div>

            {/* Warnings */}
            {(isSmearing || isMelting) && (
              <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.75rem', color: '#fca5a5' }}>
                <strong>⚠️ Warning:</strong><br/>
                {isMelting ? 'Tegangan dan waktu terlalu tinggi! Risiko gel meleleh tinggi.' : 'Tegangan tinggi dengan agarose rendah berisiko menghasilkan pita yang "smearing" (buram).'}
              </div>
            )}

            {/* Run Button */}
            <button 
              onClick={handleRun}
              disabled={isRunning}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: isRunning ? 'var(--bg-hover)' : 'var(--accent)',
                color: isRunning ? 'var(--text-tertiary)' : 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              title="Mulai simulasi elektroforesis dengan pengaturan saat ini."
            >
              {isRunning ? `Running... ${progress}%` : '▶ RUN DIGEST'}
            </button>
          </div>

          {/* Gel Visualization Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: '300px',
              height: '450px',
              background: 'linear-gradient(180deg, #11111a 0%, #08080c 100%)',
              borderRadius: '8px',
              position: 'relative',
              display: 'flex',
              border: '2px solid #222',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              overflow: 'hidden' // hide bands that run off the bottom
            }} title="Simulasi Agarose Gel. Fragmen kecil berlari lebih cepat ke bawah.">
              {/* Well Labels */}
              <div style={{
                position: 'absolute',
                top: '5px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontWeight: 'bold',
                letterSpacing: '1px',
                zIndex: 10
              }}>
                <span style={{ flex: 1, textAlign: 'center' }} title="Marker: Ladder DNA standar 1kb.">M</span>
                <span style={{ flex: 1, textAlign: 'center' }} title="Digest: Sampel DNA yang telah dipotong enzim.">DIGEST</span>
              </div>

              {/* Lane 1: Marker (Ladder) */}
              <div className="lane marker-lane" style={{
                flex: 1,
                position: 'relative',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                margin: '0 10px',
                marginTop: '30px'
              }}>
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '8px', background: '#000', border: '1px solid #333', borderRadius: '2px' }} title="Sumur (Well) tempat sampel dimasukkan." />

                {markerBands.map((bp, i) => {
                  const targetPos = calculateTargetPosition(bp);
                  const isOffGel = targetPos > 100;
                  // If smearing is true, we blur the marker slightly
                  const blur = isSmearing ? 'blur(2px)' : 'none';
                  
                  const isTooltipActive = activeTooltip === `marker-${i}`;

                  return (
                    <motion.div 
                      key={`m-${i}`}
                      className="gel-band"
                      initial={{ top: '10px', opacity: 0 }}
                      animate={{ 
                        top: progress === 100 ? `${targetPos}%` : '10px',
                        opacity: progress === 100 && !isOffGel ? calculateIntensity(bp) * 0.7 : 0
                      }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      onPointerDown={(e) => progress === 100 && !isOffGel && handleBandClick(e, `marker-${i}`)}
                      onMouseEnter={() => progress === 100 && !isOffGel && setActiveTooltip(`marker-${i}`)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      style={{
                        position: 'absolute',
                        left: '15%',
                        right: '15%',
                        height: isSmearing ? '6px' : '3px',
                        background: '#818cf8',
                        borderRadius: '1px',
                        boxShadow: '0 0 4px rgba(129, 140, 248, 0.5)',
                        filter: blur,
                        pointerEvents: isOffGel ? 'none' : 'auto',
                        cursor: 'pointer',
                        zIndex: isTooltipActive ? 20 : 1
                      }}
                    >
                      {/* Hide default text tooltip to rely solely on the custom box on touch/hover */}
                      {/* Mobile/Tap Tooltip */}
                      {isTooltipActive && (
                        <div style={{
                          position: 'absolute',
                          left: '120%',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'var(--bg-elevated)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-strong)',
                          fontSize: '11px',
                          color: '#818cf8',
                          whiteSpace: 'nowrap',
                          boxShadow: 'var(--shadow-lg)'
                        }}>
                          <strong>{bp} bp</strong> (Marker)
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Lane 2: Sample (Digested Fragments) */}
              <div className="lane sample-lane" style={{
                flex: 1,
                position: 'relative',
                margin: '0 10px',
                marginTop: '30px'
              }}>
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '8px', background: '#000', border: '1px solid #333', borderRadius: '2px' }} title="Sumur (Well) tempat sampel dimasukkan." />

                {fragments.length === 0 ? (
                  <div style={{ position: 'absolute', top: '50%', left: '0', width: '100%', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                    Tidak terpotong<br/>(1 pita utuh)
                  </div>
                ) : null}

                {fragments.map((bp, i) => {
                  const targetPos = calculateTargetPosition(bp);
                  const isOffGel = targetPos > 100;
                  
                  // Smearing effect affects sample more heavily
                  const blur = isSmearing ? 'blur(3px)' : 'none';
                  // Melting causes catastrophic visual failure
                  const opacity = isMelting ? 0.1 : calculateIntensity(bp);
                  const height = isSmearing ? '8px' : '4px';

                  const isTooltipActive = activeTooltip === `sample-${i}`;

                  return (
                    <motion.div 
                      key={`s-${i}`}
                      className="gel-band"
                      initial={{ top: '10px', opacity: 0 }}
                      animate={{ 
                        top: progress === 100 ? `${targetPos}%` : '10px',
                        opacity: progress === 100 && !isOffGel ? opacity : 0
                      }}
                      transition={{ duration: 2.2, ease: "easeOut" }}
                      onPointerDown={(e) => progress === 100 && !isOffGel && handleBandClick(e, `sample-${i}`)}
                      onMouseEnter={() => progress === 100 && !isOffGel && setActiveTooltip(`sample-${i}`)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      style={{
                        position: 'absolute',
                        left: '10%',
                        right: '10%',
                        height: height,
                        background: '#22c55e', 
                        borderRadius: '2px',
                        boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)',
                        cursor: 'pointer',
                        filter: blur,
                        pointerEvents: isOffGel ? 'none' : 'auto',
                        zIndex: isTooltipActive ? 20 : 1
                      }}
                    >
                      {/* Hide default text tooltip to rely solely on the custom box on touch/hover */}
                      
                      {/* Mobile/Tap Tooltip */}
                      {isTooltipActive && (
                        <div style={{
                          position: 'absolute',
                          right: '120%',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'var(--bg-elevated)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--color-success)',
                          fontSize: '11px',
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          boxShadow: 'var(--shadow-lg)'
                        }}>
                          <strong>Sampel DNA</strong><br/>
                          Panjang: <span style={{ color: '#22c55e' }}>{bp} bp</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            {progress === 100 && isMelting && (
               <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem', fontWeight: 'bold' }}>
                 GEL MELTED! Run conditions were too extreme.
               </div>
            )}
            {progress === 100 && (
               <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                 Simulasi Selesai. Pita yang hilang mungkin telah lari keluar dari gel.
               </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}