/**
 * Amino acid metadata — full names, abbreviations, chemical properties, and colors.
 */

export const AMINO_ACID_DATA = {
  G: { name: 'Glycine',       abbr3: 'Gly', property: 'nonpolar',  color: '#f59e0b' },
  A: { name: 'Alanine',       abbr3: 'Ala', property: 'nonpolar',  color: '#f59e0b' },
  V: { name: 'Valine',        abbr3: 'Val', property: 'nonpolar',  color: '#f59e0b' },
  L: { name: 'Leucine',       abbr3: 'Leu', property: 'nonpolar',  color: '#f59e0b' },
  I: { name: 'Isoleucine',    abbr3: 'Ile', property: 'nonpolar',  color: '#f59e0b' },
  P: { name: 'Proline',       abbr3: 'Pro', property: 'nonpolar',  color: '#f59e0b' },
  F: { name: 'Phenylalanine', abbr3: 'Phe', property: 'nonpolar',  color: '#f59e0b' },
  M: { name: 'Methionine',    abbr3: 'Met', property: 'start',     color: '#a855f7' },
  W: { name: 'Tryptophan',    abbr3: 'Trp', property: 'nonpolar',  color: '#f59e0b' },
  S: { name: 'Serine',        abbr3: 'Ser', property: 'polar',     color: '#10b981' },
  T: { name: 'Threonine',     abbr3: 'Thr', property: 'polar',     color: '#10b981' },
  C: { name: 'Cysteine',      abbr3: 'Cys', property: 'polar',     color: '#10b981' },
  Y: { name: 'Tyrosine',      abbr3: 'Tyr', property: 'polar',     color: '#10b981' },
  N: { name: 'Asparagine',    abbr3: 'Asn', property: 'polar',     color: '#10b981' },
  Q: { name: 'Glutamine',     abbr3: 'Gln', property: 'polar',     color: '#10b981' },
  K: { name: 'Lysine',        abbr3: 'Lys', property: 'positive',  color: '#6366f1' },
  R: { name: 'Arginine',      abbr3: 'Arg', property: 'positive',  color: '#6366f1' },
  H: { name: 'Histidine',     abbr3: 'His', property: 'positive',  color: '#6366f1' },
  D: { name: 'Aspartic Acid', abbr3: 'Asp', property: 'negative',  color: '#ef4444' },
  E: { name: 'Glutamic Acid', abbr3: 'Glu', property: 'negative',  color: '#ef4444' },
  '*': { name: 'Stop Codon',  abbr3: 'Stp', property: 'stop',      color: '#6b7280' },
};

export const PROPERTY_LABELS = {
  nonpolar: { label: 'Nonpolar', color: '#f59e0b', icon: '⬡' },
  polar:    { label: 'Polar (Uncharged)', color: '#10b981', icon: '◯' },
  positive: { label: '(+) Charged', color: '#6366f1', icon: '⊕' },
  negative: { label: '(-) Charged', color: '#ef4444', icon: '⊖' },
  start:    { label: 'Start Codon', color: '#a855f7', icon: '▶' },
  stop:     { label: 'Stop Codon', color: '#6b7280', icon: '■' },
};

/**
 * Get amino acid data by single-letter code.
 */
export function getAminoAcidData(code) {
  return AMINO_ACID_DATA[code] || {
    name: 'Unknown',
    abbr3: '???',
    property: 'unknown',
    color: '#6b7280',
  };
}
