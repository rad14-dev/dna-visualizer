"""
Bio Logic Service — handles DNA transcription and RNA translation.

Core biology functions:
- Transcription: DNA → RNA (T → U)
- Translation: RNA → Protein (codons → amino acids)
- Nucleotide counting and codon parsing
"""

from Bio.Seq import Seq
from Bio.Data.CodonTable import standard_dna_table


# ─── Amino Acid Full Names ─────────────────────────────────────────
AMINO_ACID_NAMES: dict[str, str] = {
    "A": "Alanine",
    "R": "Arginine",
    "N": "Asparagine",
    "D": "Aspartic Acid",
    "C": "Cysteine",
    "E": "Glutamic Acid",
    "Q": "Glutamine",
    "G": "Glycine",
    "H": "Histidine",
    "I": "Isoleucine",
    "L": "Leucine",
    "K": "Lysine",
    "M": "Methionine",
    "F": "Phenylalanine",
    "P": "Proline",
    "S": "Serine",
    "T": "Threonine",
    "W": "Tryptophan",
    "Y": "Tyrosine",
    "V": "Valine",
    "*": "Stop",
}


# ─── Standard Codon Table (RNA codons → amino acid) ────────────────
CODON_TABLE: dict[str, dict] = {}

def _build_codon_table() -> None:
    """Build a lookup table of all 64 codons from Biopython's standard table."""
    for codon, aa in standard_dna_table.forward_table.items():
        rna_codon = codon.replace("T", "U")
        CODON_TABLE[rna_codon] = {
            "amino_acid": aa,
            "amino_acid_name": AMINO_ACID_NAMES.get(aa, "Unknown"),
        }
    for stop_codon in standard_dna_table.stop_codons:
        rna_codon = stop_codon.replace("T", "U")
        CODON_TABLE[rna_codon] = {
            "amino_acid": "*",
            "amino_acid_name": "Stop",
        }

_build_codon_table()


# ─── Validation ────────────────────────────────────────────────────
VALID_DNA_BASES = set("ATGCNRYWSMKHBVD")  # Include IUPAC ambiguity codes
VALID_RNA_BASES = set("AUGCNRYWSMKHBVD")


def validate_dna_sequence(sequence: str) -> bool:
    """Check if a string is a valid DNA sequence."""
    return all(base in VALID_DNA_BASES for base in sequence.upper())


def validate_rna_sequence(sequence: str) -> bool:
    """Check if a string is a valid RNA sequence."""
    return all(base in VALID_RNA_BASES for base in sequence.upper())


# ─── Core Functions ────────────────────────────────────────────────

def transcribe(dna_seq: Seq) -> Seq:
    """
    Transcribe DNA to RNA (replace T with U).

    Args:
        dna_seq: Biopython Seq object of DNA

    Returns:
        Biopython Seq object of RNA
    """
    return dna_seq.transcribe()


def translate(rna_seq: Seq, to_stop: bool = False) -> Seq:
    """
    Translate RNA to protein (amino acid chain).

    Args:
        rna_seq: Biopython Seq object of RNA
        to_stop: If True, stop at first stop codon

    Returns:
        Biopython Seq object of protein sequence
    """
    # Back-transcribe RNA to DNA for Biopython's translate
    dna_from_rna = rna_seq.back_transcribe()
    return dna_from_rna.translate(to_stop=to_stop)


def count_nucleotides(sequence: str) -> dict[str, int]:
    """
    Count frequency of each nucleotide in a sequence.

    Args:
        sequence: DNA or RNA sequence string

    Returns:
        Dictionary with nucleotide counts
    """
    seq_upper = sequence.upper()
    return {
        "A": seq_upper.count("A"),
        "T": seq_upper.count("T"),
        "G": seq_upper.count("G"),
        "C": seq_upper.count("C"),
        "U": seq_upper.count("U"),
    }


def get_codons(rna_sequence: str) -> list[dict]:
    """
    Split RNA sequence into codons (triplets) with amino acid mapping.

    Args:
        rna_sequence: RNA sequence string

    Returns:
        List of codon info dictionaries with position, codon, and amino acid
    """
    codons = []
    seq = rna_sequence.upper()

    for i in range(0, len(seq) - 2, 3):
        codon = seq[i : i + 3]
        if len(codon) == 3:
            codon_info = CODON_TABLE.get(codon, {
                "amino_acid": "?",
                "amino_acid_name": "Unknown",
            })
            codons.append({
                "codon": codon,
                "amino_acid": codon_info["amino_acid"],
                "amino_acid_name": codon_info["amino_acid_name"],
                "position": i // 3 + 1,
            })

    return codons


def find_orfs(protein_seq: str) -> list[dict]:
    """
    Find Open Reading Frames (ORFs) within a protein sequence.
    An ORF starts with 'M' (Methionine) and ends with '*' (Stop).
    """
    orfs = []
    seq = str(protein_seq)
    n = len(seq)
    
    i = 0
    while i < n:
        if seq[i] == 'M':
            start_idx = i
            # Search for the next stop codon
            stop_idx = seq.find('*', start_idx)
            
            if stop_idx != -1:
                # Found a complete ORF (Start to Stop)
                sequence = seq[start_idx:stop_idx]
                orfs.append({
                    "start_index": start_idx + 1,
                    "stop_index": stop_idx + 1,
                    "length": len(sequence),
                    "sequence": sequence,
                    "label": f"Fragment {len(orfs) + 1}",
                    "is_complete": True
                })
                i = stop_idx + 1
            else:
                # Start but no Stop found before end of sequence
                sequence = seq[start_idx:]
                orfs.append({
                    "start_index": start_idx + 1,
                    "stop_index": n,
                    "length": len(sequence),
                    "sequence": sequence,
                    "label": f"Fragment {len(orfs) + 1} (Incomplete)",
                    "is_complete": False
                })
                break
        else:
            i += 1
            
    return orfs


def process_sequence(dna_sequence: str) -> dict:
    """
    Full processing pipeline: DNA → RNA → Protein with metadata.

    Args:
        dna_sequence: Raw DNA sequence string

    Returns:
        Dictionary with all processed data
    """
    dna_seq = Seq(dna_sequence.upper())

    # Transcription
    rna_seq = transcribe(dna_seq)

    # Translation (full, including stop codons as *)
    protein_seq = translate(rna_seq, to_stop=False)

    # Nucleotide counts
    dna_nuc_counts = count_nucleotides(str(dna_seq))
    rna_nuc_counts = count_nucleotides(str(rna_seq))

    # Amino acid counts
    aa_counts = {}
    for aa in str(protein_seq):
        aa_counts[aa] = aa_counts.get(aa, 0) + 1

    # Codon breakdown
    codons = get_codons(str(rna_seq))

    # ORF detection
    orfs = find_orfs(str(protein_seq))
    print(f"DEBUG: Found {len(orfs)} ORFs")

    return {
        "dna_sequence": str(dna_seq),
        "rna_sequence": str(rna_seq),
        "protein_sequence": str(protein_seq),
        "dna_length": len(dna_seq),
        "codon_count": len(codons),
        "nucleotide_counts": {
            "A": dna_nuc_counts["A"],
            "T": dna_nuc_counts["T"],
            "G": dna_nuc_counts["G"],
            "C": dna_nuc_counts["C"],
        },
        "rna_nucleotide_counts": {
            "A": rna_nuc_counts["A"],
            "U": rna_nuc_counts["U"],
            "G": rna_nuc_counts["G"],
            "C": rna_nuc_counts["C"],
        },
        "amino_acid_counts": aa_counts,
        "codons": codons,
        "orfs": orfs,
    }


def get_full_codon_table() -> list[dict]:
    """Return the full standard codon table for the frontend."""
    return [
        {
            "codon": codon,
            "amino_acid": info["amino_acid"],
            "amino_acid_name": info["amino_acid_name"],
        }
        for codon, info in sorted(CODON_TABLE.items())
    ]
