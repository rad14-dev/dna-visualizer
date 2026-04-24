"""
Bio Logic Service — handles DNA transcription and RNA translation.

Core biology functions:
- Transcription: DNA → RNA (T → U)
- Translation: RNA → Protein (codons → amino acids)
- Nucleotide counting and codon parsing
- Protein Quality & Allergen Analysis
- Restriction Enzyme Analysis
"""

from Bio.Seq import Seq
from Bio.Data.CodonTable import standard_dna_table
from Bio import Restriction

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

# ─── Reference Standards & Allergens ───────────────────────────────
# FAO/WHO 2011 Essential Amino Acid requirements for older child/adult (mg/g protein)
# We use this to identify limiting amino acids roughly.
FAO_WHO_REQ_MG_PER_G = {
    "H": 16, # Histidine
    "I": 30, # Isoleucine
    "L": 61, # Leucine
    "K": 48, # Lysine
    "M": 23, # Methionine + Cysteine (SAA)
    "C": 0,  # Included in Methionine
    "F": 41, # Phenylalanine + Tyrosine (AAA)
    "Y": 0,  # Included in Phenylalanine
    "T": 25, # Threonine
    "W": 6.6,# Tryptophan
    "V": 40, # Valine
}

# Simple database of some known allergen epitopes (string matching)
# These are highly simplified examples for demonstration purposes
ALLERGEN_EPITOPES = {
    "Peanut (Ara h 1)": "QQEQQ",
    "Peanut (Ara h 2)": "DPYSPS",
    "Gluten (Gliadin)": "PQQPFPQQ",
    "Soy (Gly m 4)": "VEEGL",
    "Milk (Casein)": "VAPFPE",
    "Egg (Ovalbumin)": "EMPSEE"
}

# Standard Restriction Enzymes to map
COMMON_ENZYMES = ["EcoRI", "BamHI", "HindIII", "TaqI", "NotI", "XhoI", "SmaI"]

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
    """
    return dna_seq.transcribe()


def translate(rna_seq: Seq, to_stop: bool = False) -> Seq:
    """
    Translate RNA to protein (amino acid chain).
    """
    dna_from_rna = rna_seq.back_transcribe()
    return dna_from_rna.translate(to_stop=to_stop)


def count_nucleotides(sequence: str) -> dict[str, int]:
    """
    Count frequency of each nucleotide in a sequence.
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
            stop_idx = seq.find('*', start_idx)
            
            if stop_idx != -1:
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

def analyze_protein_quality(orf_sequence: str) -> dict:
    """
    Analyze an ORF sequence for protein quality (limiting amino acids)
    and check for known allergen epitopes.
    """
    aa_counts = {}
    for aa in orf_sequence:
        aa_counts[aa] = aa_counts.get(aa, 0) + 1
        
    total_aa = len(orf_sequence)
    limiting_aas = []
    allergens = []
    
    if total_aa > 0:
        # Calculate roughly mg of amino acid per g of protein
        # Average MW of an amino acid is ~110 Da.
        # This is a very rough approximation for educational purposes.
        for aa, required_mg in FAO_WHO_REQ_MG_PER_G.items():
            if required_mg > 0:
                count = aa_counts.get(aa, 0)
                # If Methionine or Phenylalanine, add their pairs
                if aa == "M": count += aa_counts.get("C", 0)
                if aa == "F": count += aa_counts.get("Y", 0)
                
                # Approx mg/g = (count * 110) / (total_aa * 110) * 1000 = (count / total_aa) * 1000
                actual_mg = (count / total_aa) * 1000
                
                if actual_mg < required_mg:
                    limiting_aas.append(AMINO_ACID_NAMES.get(aa, aa))
        
        # Scan for allergens
        for allergen_name, epitope in ALLERGEN_EPITOPES.items():
            start = orf_sequence.find(epitope)
            if start != -1:
                allergens.append({
                    "allergen_name": allergen_name,
                    "matched_sequence": epitope,
                    "start_index": start + 1,
                    "end_index": start + len(epitope)
                })
                
    return {
        "is_complete": True, # Usually calculated elsewhere
        "length": total_aa,
        "amino_acid_counts": aa_counts,
        "limiting_amino_acids": limiting_aas,
        "allergens_found": allergens
    }

def analyze_restriction_sites(dna_seq: Seq) -> dict:
    """
    Map restriction enzyme cut sites and calculate fragment sizes.
    """
    # Create an enzyme batch from our common list
    rb = Restriction.RestrictionBatch(COMMON_ENZYMES)
    
    # Perform restriction analysis
    analysis = rb.search(dna_seq)
    
    sites = []
    all_cut_positions = [0] # Start of sequence
    
    for enzyme_name, positions in analysis.items():
        if positions:
            # Biopython returns positions 1-based, where cut occurs after the position
            # Use getattr on the Restriction module to get the enzyme class
            # Instead of str(enzyme_name), we use the actual class name which is just enzyme_name.
            # In Biopython, enzymes are classes dynamically created in the Restriction module.
            try:
                # enzyme_name is typically a string-like object (a restriction type)
                name_str = str(enzyme_name)
                enzyme_class = getattr(Restriction, name_str)
                pattern = enzyme_class.site
                
                for pos in positions:
                    sites.append({
                        "enzyme": name_str,
                        "position": pos,
                        "pattern": pattern
                    })
                    all_cut_positions.append(pos)
            except AttributeError:
                pass
                
    all_cut_positions.append(len(dna_seq)) # End of sequence
    all_cut_positions.sort()
    
    # Calculate fragment sizes
    fragments = []
    for i in range(len(all_cut_positions) - 1):
        frag_size = all_cut_positions[i+1] - all_cut_positions[i]
        if frag_size > 0:
            fragments.append(frag_size)
            
    # Sort fragments by size descending (like in a gel)
    fragments.sort(reverse=True)
            
    return {
        "sites": sites,
        "fragments": fragments
    }

def process_sequence(dna_sequence: str) -> dict:
    """
    Full processing pipeline: DNA → RNA → Protein with metadata.
    """
    # Create Seq object explicitly using the modern Biopython syntax
    dna_seq = Seq(dna_sequence.upper())

    # Transcription
    rna_seq = transcribe(dna_seq)

    # Translation
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
    
    # Protein Quality Analysis for each ORF
    quality_data = {}
    for orf in orfs:
        quality = analyze_protein_quality(orf["sequence"])
        quality["is_complete"] = orf["is_complete"]
        quality_data[orf["label"]] = quality
        
    # Restriction Enzyme Analysis
    restriction_data = analyze_restriction_sites(dna_seq)

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
        "protein_quality": quality_data,
        "restriction_analysis": restriction_data
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