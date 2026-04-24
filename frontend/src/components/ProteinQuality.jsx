import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

/**
 * ProteinQuality — Displays protein quality (limiting amino acids) and allergens using Recharts.
 */
export default function ProteinQuality({ orfs, proteinQuality }) {
  if (!orfs || orfs.length === 0 || !proteinQuality) return null;

  return (
    <section className="protein-quality-section" id="protein-quality" style={{ marginTop: '2rem' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
        <span className="icon" style={{ fontSize: '1.5rem' }}>🥩</span>
        <span className="section-title" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Protein Quality & Allergen Analysis</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {orfs.map((orf, idx) => {
          const quality = proteinQuality[orf.label];
          if (!quality) return null;

          // Siapkan data untuk Radar Chart
          // Menggunakan data mock yang berdasarkan counts untuk visualisasi jika diperlukan
          // Idealnya, persentase kecukupan dari FAO requirement ditampilkan di sini
          const chartData = [
            { subject: 'His', A: quality.amino_acid_counts['H'] || 0, fullMark: 10 },
            { subject: 'Ile', A: quality.amino_acid_counts['I'] || 0, fullMark: 10 },
            { subject: 'Leu', A: quality.amino_acid_counts['L'] || 0, fullMark: 10 },
            { subject: 'Lys', A: quality.amino_acid_counts['K'] || 0, fullMark: 10 },
            { subject: 'Met+Cys', A: (quality.amino_acid_counts['M'] || 0) + (quality.amino_acid_counts['C'] || 0), fullMark: 10 },
            { subject: 'Phe+Tyr', A: (quality.amino_acid_counts['F'] || 0) + (quality.amino_acid_counts['Y'] || 0), fullMark: 10 },
            { subject: 'Thr', A: quality.amino_acid_counts['T'] || 0, fullMark: 10 },
            { subject: 'Trp', A: quality.amino_acid_counts['W'] || 0, fullMark: 10 },
            { subject: 'Val', A: quality.amino_acid_counts['V'] || 0, fullMark: 10 },
          ];

          return (
            <div key={idx} style={{ 
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-light)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', textAlign: 'left', margin: 0 }}>
                {orf.label} Quality
              </h3>

              {/* Radar Chart */}
              <div style={{ height: '250px', width: '100%', background: 'var(--bg-primary)', borderRadius: '8px', padding: '0.5rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="var(--border-strong)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', textAlign: 'left' }}
                      itemStyle={{ color: 'var(--accent-light)' }}
                    />
                    <Radar name="Count" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Limiting Amino Acids */}
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', lineHeight: 1 }}>⚠️</span>
                  <strong style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', margin: 0, lineHeight: 1 }}>Limiting Amino Acids</strong>
                </div>
                {quality.limiting_amino_acids && quality.limiting_amino_acids.length > 0 ? (
                  <>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textAlign: 'left' }}>
                      Protein ini kekurangan asam amino esensial berikut berdasarkan standar FAO/WHO:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
                      {quality.limiting_amino_acids.map((aa, i) => (
                        <span key={i} style={{ background: 'var(--bg-primary)', color: 'var(--color-warning)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                          {aa}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', margin: 0, textAlign: 'left' }}>
                    Protein berkualitas tinggi! Memenuhi semua kebutuhan asam amino esensial.
                  </p>
                )}
              </div>

              {/* Allergen Scanner */}
              <div style={{ background: quality.allergens_found?.length > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '8px', border: `1px solid ${quality.allergens_found?.length > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', lineHeight: 1 }}>{quality.allergens_found?.length > 0 ? '🚨' : '✅'}</span>
                  <strong style={{ color: quality.allergens_found?.length > 0 ? 'var(--color-error)' : 'var(--color-success)', display: 'flex', alignItems: 'center', margin: 0, lineHeight: 1 }}>Allergen Scanner</strong>
                </div>
                
                {quality.allergens_found && quality.allergens_found.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'left' }}>
                    {quality.allergens_found.map((allergen, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>
                        Terdeteksi motif <strong>{allergen.allergen_name}</strong> ({allergen.matched_sequence}) pada posisi {allergen.start_index}-{allergen.end_index}.
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, textAlign: 'left' }}>
                    Tidak ada motif epitop alergen umum yang terdeteksi.
                  </p>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}