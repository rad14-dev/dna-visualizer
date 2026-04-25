"""
Sequence route handler — API endpoints for DNA/RNA/Protein processing.
"""

import asyncio
from fastapi import APIRouter, HTTPException
from ..models.schemas import (
    SequenceRequest,
    SequenceResponse,
    ErrorResponse,
    HealthResponse,
    NucleotideCounts,
    CodonInfo,
    ORFInfo,
    QualityInfo,
    AllergenMatch,
    FunctionalSignal,
    RestrictionAnalysis,
    RestrictionSite,
    GOTerm,
)
from ..services.ncbi_fetcher import fetch_sequence
from ..services.bio_logic import process_sequence, get_full_codon_table
from ..services.uniprot_api import fetch_uniprot_features, fallback_signal_detection, fetch_uniprot_go_terms

router = APIRouter(prefix="/api", tags=["sequence"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint to verify the backend is running."""
    return HealthResponse()


@router.post(
    "/process",
    response_model=SequenceResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Accession not found"},
        500: {"model": ErrorResponse, "description": "Processing error"},
        504: {"model": ErrorResponse, "description": "NCBI timeout"},
    },
)
async def process_accession(request: SequenceRequest):
    """
    Fetch a sequence from NCBI and process it through the full pipeline:
    DNA → RNA (transcription) → Protein (translation).
    """
    try:
        # Step 1 & 3.5: Fetch from NCBI and UniProt in parallel to save time (avoid Vercel timeout)
        record_task = asyncio.to_thread(fetch_sequence, request.accession_id, email=request.email)
        go_terms_task = fetch_uniprot_go_terms(request.accession_id)
        
        record, go_terms = await asyncio.gather(record_task, go_terms_task)

        # Step 2: Process (transcribe + translate)
        result = process_sequence(str(record.seq))
        
        # Step 3: Functional signals (fitur ini ditarik sementara)
        signals = []
        for orf in result["orfs"]:
            orf["signals"] = []

        # Step 4: Build response
        return SequenceResponse(
            accession_id=request.accession_id,
            description=record.description,
            dna_sequence=result["dna_sequence"],
            rna_sequence=result["rna_sequence"],
            protein_sequence=result["protein_sequence"],
            dna_length=result["dna_length"],
            codon_count=result["codon_count"],
            nucleotide_counts=result["nucleotide_counts"],
            rna_nucleotide_counts=result["rna_nucleotide_counts"],
            amino_acid_counts=result["amino_acid_counts"],
            codons=[CodonInfo(**c) for c in result["codons"]],
            orfs=[ORFInfo(**o) for o in result["orfs"]],
            protein_quality={
                label: QualityInfo(**quality)
                for label, quality in result["protein_quality"].items()
            },
            functional_signals=[FunctionalSignal(**s) for s in signals],
            restriction_analysis=RestrictionAnalysis(
                sites=[RestrictionSite(**site) for site in result["restriction_analysis"]["sites"]],
                fragments=result["restriction_analysis"]["fragments"]
            ) if result.get("restriction_analysis") else None,
            go_terms=[GOTerm(**g) for g in go_terms],
        )

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ConnectionError as e:
        raise HTTPException(status_code=504, detail=str(e))
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error memproses sekuens: {str(e)}",
        )


@router.get("/codon-table")
async def get_codon_table():
    """Return the full standard genetic code codon table."""
    return {"codons": get_full_codon_table()}