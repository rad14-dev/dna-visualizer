"""
Pydantic models for request validation and response serialization.
"""

from pydantic import BaseModel, Field


class SequenceRequest(BaseModel):
    """Request body for sequence processing."""

    accession_id: str = Field(
        ...,
        description="NCBI Accession Number (e.g., NM_000558)",
        examples=["NM_000558", "NM_001301717", "NC_000001.11"],
    )
    email: str | None = Field(
        None,
        description="Email untuk NCBI Entrez",
        examples=["user@example.com"],
    )


class NucleotideCounts(BaseModel):
    """Nucleotide frequency counts for DNA."""
    A: int = 0
    T: int = 0
    G: int = 0
    C: int = 0

class RNANucleotideCounts(BaseModel):
    """Nucleotide frequency counts for RNA."""
    A: int = 0
    U: int = 0
    G: int = 0
    C: int = 0


class CodonInfo(BaseModel):
    """Information about a single codon and its amino acid."""

    codon: str
    amino_acid: str
    amino_acid_name: str
    position: int


class FunctionalSignal(BaseModel):
    """Information about a functional signal peptide."""
    type: str
    start: int
    end: int
    description: str


class ORFInfo(BaseModel):
    """Information about an Open Reading Frame (Start to Stop)."""
    label: str
    start_index: int
    stop_index: int
    length: int
    sequence: str
    is_complete: bool
    signals: list[FunctionalSignal] = []


class AllergenMatch(BaseModel):
    """Information about a matched allergen sequence."""
    allergen_name: str
    matched_sequence: str
    start_index: int
    end_index: int


class QualityInfo(BaseModel):
    """Information about protein quality and allergens."""
    is_complete: bool
    length: int
    amino_acid_counts: dict[str, int]
    limiting_amino_acids: list[str] = []
    allergens_found: list[AllergenMatch] = []


class RestrictionSite(BaseModel):
    """Information about a restriction enzyme cut site."""
    enzyme: str
    position: int
    pattern: str


class RestrictionAnalysis(BaseModel):
    """Information about restriction sites and resulting fragments."""
    sites: list[RestrictionSite] = []
    fragments: list[int] = []


class GOTerm(BaseModel):
    """Information about a Gene Ontology term."""
    id: str
    category: str
    description: str


class SequenceResponse(BaseModel):
    """Full response with DNA, RNA, and protein sequences."""

    accession_id: str
    description: str
    dna_sequence: str
    rna_sequence: str
    protein_sequence: str
    dna_length: int
    codon_count: int
    nucleotide_counts: NucleotideCounts
    rna_nucleotide_counts: RNANucleotideCounts
    amino_acid_counts: dict[str, int]
    codons: list[CodonInfo]
    orfs: list[ORFInfo] = []
    protein_quality: dict[str, QualityInfo] = {}
    functional_signals: list[FunctionalSignal] = []
    restriction_analysis: RestrictionAnalysis | None = None
    go_terms: list[GOTerm] = []


class ErrorResponse(BaseModel):
    """Standardized error response."""

    error: str
    detail: str


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    version: str = "1.0.0"