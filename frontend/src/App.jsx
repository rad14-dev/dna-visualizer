import { useState, useEffect, useMemo } from 'react';
import { useSequence } from './hooks/useSequence';
import InputForm from './components/InputForm';
import StepIndicator from './components/StepIndicator';
import SequenceViewer from './components/SequenceViewer';
import ProteinViewer from './components/ProteinViewer';
import CodonTable from './components/CodonTable';
import SequenceStats from './components/SequenceStats';

/**
 * App — DNA Visualizer main application.
 * DNA to Protein visualization pipeline.
 */
export default function App() {
  const {
    loading,
    error,
    data,
    activeView,
    highlightedCodon,
    activeStep,
    fetchSequence,
    setActiveView,
    setHighlightedCodon,
    reset,
  } = useSequence();
  const [currentPage, setCurrentPage] = useState(1);
  const [displayMode, setDisplayMode] = useState('page'); // 'page' or 'scroll'
  const codonsPerPage = 9;
  const basesPerPage = codonsPerPage * 3;

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data?.accession_id]);

  const totalPages = data ? Math.ceil(data.codon_count / codonsPerPage) : 0;
  
  const pagedData = useMemo(() => {
    if (!data) return null;
    
    const startIndex = (currentPage - 1) * codonsPerPage;
    const baseStart = startIndex * 3;
    const baseEnd = baseStart + basesPerPage;

    return {
      dnaSlice: displayMode === 'page' ? data.dna_sequence.slice(baseStart, baseEnd) : data.dna_sequence,
      rnaSlice: displayMode === 'page' ? data.rna_sequence.slice(baseStart, baseEnd) : data.rna_sequence,
      proteinSlice: displayMode === 'page' ? data.protein_sequence.slice(startIndex, startIndex + codonsPerPage) : data.protein_sequence,
      codonSlice: displayMode === 'page' ? data.codons.slice(startIndex, startIndex + codonsPerPage) : data.codons,
      baseOffset: displayMode === 'page' ? baseStart : 0,
      codonOffset: displayMode === 'page' ? startIndex : 0
    };
  }, [data, currentPage, displayMode]);

  const [codonTableData, setCodonTableData] = useState(null);

  // Fetch static codon table on mount
  useEffect(() => {
    fetch('/api/codon-table')
      .then((r) => r.json())
      .then((d) => setCodonTableData(d.codons))
      .catch(() => {});
  }, []);

  return (
    <div className="app">
      {/* ─── Header ──────────────────────────────────────────── */}
      <header className="app-header" id="app-header">
        <div className="header-content">
          <div className="header-brand">
            <div className="header-logo">🧬</div>
            <div>
              <h1 className="header-title">
                DNA<span className="text-gradient"> Visualizer</span>
              </h1>
              <p className="header-subtitle">
                DNA → RNA → Protein · Visual Converter
              </p>
            </div>
          </div>

          {data && (
            <button
              className="reset-btn"
              onClick={reset}
              id="reset-btn"
            >
              ↻ New Sequence
            </button>
          )}
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────── */}
      <main className="app-main">
        <InputForm
          onSubmit={fetchSequence}
          loading={loading}
          error={error}
          onDismissError={() => {}}
        />

        {(loading || data) && (
          <StepIndicator activeStep={activeStep} />
        )}

        {data && (
          <>
            {/* Description Card */}
            <div className="view-mode-container">
              <div className="description-card" id="description-card">
                <div className="description-label">Sequence Info</div>
                <div className="description-text">{data.description}</div>
                <div className="description-meta">
                  <span className="meta-item">
                    Length: <strong>{data.dna_length.toLocaleString()} bp</strong>
                    <div className="info-trigger">
                      ⓘ
                      <div className="info-tooltip">
                        <strong>DNA Length</strong>
                        <p>Total jumlah basa nukleotida (A, T, G, C) dalam sekuens DNA.</p>
                        <small>Kegunaan: Menentukan ukuran fisik gen atau fragmen DNA.</small>
                      </div>
                    </div>
                  </span>
                  <span className="meta-item">
                    Codons: <strong>{data.codon_count.toLocaleString()}</strong>
                    <div className="info-trigger">
                      ⓘ
                      <div className="info-tooltip">
                        <strong>Codon Count</strong>
                        <p>Jumlah triplet basa (3 huruf) yang diterjemahkan menjadi protein.</p>
                        <small>Kegunaan: Menunjukkan panjang fungsional dari sekuens protein yang dihasilkan.</small>
                      </div>
                    </div>
                  </span>
                </div>
              </div>

              <div className="mode-toggle-card">
                <div className="mode-label">Display Mode</div>
                <div className="mode-btns">
                  <button 
                    className={`mode-btn ${displayMode === 'page' ? 'active' : ''}`}
                    onClick={() => setDisplayMode('page')}
                  >
                    <span className="mode-icon">📄</span> Pagination
                  </button>
                  <button 
                    className={`mode-btn ${displayMode === 'scroll' ? 'active' : ''}`}
                    onClick={() => setDisplayMode('scroll')}
                  >
                    <span className="mode-icon">↕️</span> Full Scroll
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            {data && data.rna_nucleotide_counts && data.amino_acid_counts && (
              <SequenceStats 
                dnaCounts={data.nucleotide_counts}
                rnaCounts={data.rna_nucleotide_counts}
                aaCounts={data.amino_acid_counts}
              />
            )}

            {/* Pagination Controls */}
            {displayMode === 'page' && (
              <div className="pagination-wrapper">
                <div className="pagination-info">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  <span className="pagination-count">({data.codon_count} codons total)</span>
                </div>
                <div className="pagination-btns">
                  <button 
                    className="page-btn" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <div className="page-indicator">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3) pageNum = currentPage - 3 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                      if (pageNum <= 0) return null;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    className="page-btn" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* DNA/RNA Viewer */}
            <SequenceViewer
              dnaSequence={pagedData.dnaSlice}
              rnaSequence={pagedData.rnaSlice}
              fullLength={data.dna_length}
              nucleotideCounts={data.nucleotide_counts}
              activeView={activeView}
              onViewChange={setActiveView}
              highlightedCodon={highlightedCodon}
              onCodonHover={setHighlightedCodon}
              baseOffset={pagedData.baseOffset}
            />

            {/* Protein Viewer */}
            <ProteinViewer
              proteinSequence={pagedData.proteinSlice}
              codons={pagedData.codonSlice}
              orfs={data.orfs}
              highlightedCodon={highlightedCodon}
              onCodonHover={setHighlightedCodon}
              codonOffset={pagedData.codonOffset}
            />

            {/* Codon Table */}
            <CodonTable
              codons={codonTableData}
              sequenceCodons={data.codons}
            />
          </>
        )}

        {!data && !loading && (
          <div className="empty-state" id="empty-state">
            <div className="empty-icon">🧪</div>
            <h2 className="empty-title">Masukkan Accession Number</h2>
            <p className="empty-desc">
              Fetch sekuens DNA dari NCBI, lalu lihat proses transkripsi dan
              translasi secara visual.
            </p>
            <div className="empty-features">
              <div className="feature-card">
                <span className="feature-icon">📡</span>
                <span>Fetch dari NCBI</span>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🔄</span>
                <span>DNA → RNA</span>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🔬</span>
                <span>RNA → Protein</span>
              </div>
              <div className="feature-card">
                <span className="feature-icon">🎨</span>
                <span>Color-coded</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <footer className="app-footer">
        <p>DNA Visualizer · DNA to Protein Converter · Powered by NCBI & Biopython</p>
      </footer>
    </div>
  );
}
