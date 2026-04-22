/**
 * Color mapping for DNA/RNA nucleotides.
 * Each nucleotide gets a distinct color for visual identification.
 */

export const NUCLEOTIDE_COLORS = {
  A: { color: '#22c55e', label: 'Adenine', bgLight: 'rgba(34, 197, 94, 0.15)' },
  T: { color: '#ef4444', label: 'Thymine', bgLight: 'rgba(239, 68, 68, 0.15)' },
  U: { color: '#f97316', label: 'Uracil', bgLight: 'rgba(249, 115, 22, 0.15)' },
  C: { color: '#3b82f6', label: 'Cytosine', bgLight: 'rgba(59, 130, 246, 0.15)' },
  G: { color: '#eab308', label: 'Guanine', bgLight: 'rgba(234, 179, 8, 0.15)' },
};

/**
 * Get the color for a specific nucleotide character.
 * Falls back to gray for unknown characters.
 */
export function getNucleotideColor(base) {
  const upper = base?.toUpperCase();
  return NUCLEOTIDE_COLORS[upper] || {
    color: '#6b7280',
    label: 'Unknown',
    bgLight: 'rgba(107, 114, 128, 0.15)',
  };
}

/**
 * Get CSS variable name for a nucleotide
 */
export function getNucleotideCSSVar(base) {
  const map = {
    A: '--color-adenine',
    T: '--color-thymine',
    U: '--color-uracil',
    C: '--color-cytosine',
    G: '--color-guanine',
  };
  return map[base?.toUpperCase()] || '--text-tertiary';
}
