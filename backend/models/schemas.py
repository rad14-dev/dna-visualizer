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


class ORFInfo(BaseModel):
    """Information about an Open Reading Frame (Start to Stop)."""
    label: str
    start_index: int
    stop_index: int
    length: int
    sequence: str
    is_complete: bool


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


class ErrorResponse(BaseModel):
    """Standardized error response."""

    error: str
    detail: str


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"
    version: str = "1.0.0"