import { useState, useCallback } from 'react';

const API_BASE = '/api';

/**
 * Custom hook for managing sequence fetching, processing state, and UI interactions.
 */
export function useSequence() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeView, setActiveView] = useState('dna'); // 'dna' | 'rna'
  const [highlightedCodon, setHighlightedCodon] = useState(null);
  const [activeStep, setActiveStep] = useState(0); // 0=idle, 1=fetching, 2=transcribing, 3=done

  /**
   * Fetch and process a sequence from NCBI via the backend API.
   */
  const fetchSequence = useCallback(async (accessionId) => {
    if (!accessionId?.trim()) {
      setError('Masukkan Accession Number terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setActiveStep(1); // Fetching

    try {
      const response = await fetch(`${API_BASE}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accession_id: accessionId.trim() }),
      });

      setActiveStep(2); // Processing

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          response.status === 404
            ? `Accession "${accessionId}" tidak ditemukan di NCBI.`
            : response.status === 504
              ? 'Server NCBI sedang sibuk. Silakan coba lagi.'
              : errorData.detail || `Error: ${response.status}`;
        throw new Error(message);
      }

      const result = await response.json();

      // Small delay for visual feedback
      await new Promise((r) => setTimeout(r, 300));
      setActiveStep(3); // Done
      setData(result);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Backend server tidak berjalan. Pastikan uvicorn sudah dijalankan.');
      } else {
        setError(err.message);
      }
      setActiveStep(0);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset all state to initial values.
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
    setActiveView('dna');
    setHighlightedCodon(null);
    setActiveStep(0);
  }, []);

  return {
    // State
    loading,
    error,
    data,
    activeView,
    highlightedCodon,
    activeStep,
    // Actions
    fetchSequence,
    setActiveView,
    setHighlightedCodon,
    setActiveStep,
    reset,
  };
}
