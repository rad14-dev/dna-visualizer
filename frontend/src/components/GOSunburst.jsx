import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

export default function GOSunburst({ goTerms = [] }) {
  const chartData = useMemo(() => {
    if (!goTerms || goTerms.length === 0) return null;

    // Define root node
    const ids = ['Root'];
    const labels = ['Gene Ontology'];
    const parents = [''];
    const values = [0]; // Optional: size
    const colors = ['#1a1a2e']; // Base color

    // Maps for tracking
    const categoryCount = {};
    
    // Process categories first
    const categories = [...new Set(goTerms.map(term => term.category))];
    
    const categoryColors = {
      'Cellular Component': '#1e3a8a', // Dark blue
      'Biological Process': '#15803d', // Sage green
      'Molecular Function': '#7e22ce'  // Neon purple
    };

    categories.forEach(cat => {
      if (cat) {
        ids.push(cat);
        labels.push(cat);
        parents.push('Root');
        values.push(0); 
        colors.push(categoryColors[cat] || '#333');
      }
    });

    // Add individual terms
    goTerms.forEach(term => {
      if (term.category && term.id) {
        const uniqueId = `${term.category}-${term.id}`;
        ids.push(uniqueId);
        labels.push(term.description);
        parents.push(term.category);
        values.push(1); // Give equal weight to all leaf nodes
        
        // Inherit color with slight transparency
        colors.push(categoryColors[term.category] + '99'); 
      }
    });

    return [{
      type: 'sunburst',
      ids: ids,
      labels: labels,
      parents: parents,
      values: values,
      branchvalues: 'total',
      outsidetextfont: {size: 10, color: 'white'},
      insidetextfont: {size: 12, color: 'white'},
      marker: {
        colors: colors,
        line: {width: 1, color: '#0d0d14'}
      },
      hoverinfo: 'label+parent',
    }];
  }, [goTerms]);

  if (!goTerms || goTerms.length === 0) return null;

  return (
    <section className="go-sunburst-section" id="go-sunburst" style={{ marginTop: '2rem' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="icon" style={{ fontSize: '1.5rem' }}>🎯</span>
        <span className="section-title" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Gene Ontology (GO)</span>
      </div>

      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden'
      }}>
        <p style={{ 
          fontSize: '0.85rem', 
          color: 'var(--text-secondary)', 
          textAlign: 'center', 
          marginBottom: '1rem',
          maxWidth: '800px'
        }}>
          Visualisasi hierarkis peran biologis protein berdasarkan standar Gene Ontology (UniProt). 
          Klik pada segmen untuk memperbesar cabang (Zoom).
        </p>

        <div style={{ width: '100%', maxWidth: '800px', height: '500px' }}>
          {chartData && (
            <Plot
              data={chartData}
              layout={{
                margin: {l: 0, r: 0, b: 0, t: 0},
                paper_bgcolor: 'rgba(0,0,0,0)',
                plot_bgcolor: 'rgba(0,0,0,0)',
                sunburstcolorway: ["#1e3a8a", "#15803d", "#7e22ce"],
                extendsunburstcolors: true,
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#1e3a8a', display: 'inline-block', borderRadius: '2px' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Cellular Component</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#15803d', display: 'inline-block', borderRadius: '2px' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Biological Process</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                <span style={{ width: '12px', height: '12px', backgroundColor: '#7e22ce', display: 'inline-block', borderRadius: '2px' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Molecular Function</span>
            </div>
        </div>
      </div>
    </section>
  );
}