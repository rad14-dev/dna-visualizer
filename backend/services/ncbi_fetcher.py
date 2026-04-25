"""
NCBI E-Utilities Fetcher — handles fetching sequence data from NCBI API.

Uses Biopython's Entrez module with proper rate limiting and error handling.
NCBI policy: max 3 requests/second without API key, 10 with API key.
"""

import time
from io import StringIO

from Bio import Entrez, SeqIO
from Bio.SeqRecord import SeqRecord

from ..config import settings


# Configure Entrez with credentials (default fallback)
Entrez.email = settings.NCBI_EMAIL
if settings.NCBI_API_KEY:
    Entrez.api_key = settings.NCBI_API_KEY

# Rate limiting tracker
_last_request_time: float = 0.0
_MIN_DELAY = 0.34  # ~3 requests per second (NCBI without API key)


def _rate_limit() -> None:
    """Enforce NCBI rate limiting between requests."""
    global _last_request_time
    now = time.time()
    elapsed = now - _last_request_time
    if elapsed < _MIN_DELAY:
        time.sleep(_MIN_DELAY - elapsed)
    _last_request_time = time.time()


def fetch_sequence(accession_id: str, email: str = None, max_retries: int = 3) -> SeqRecord:
    """
    Fetch a sequence record from NCBI by accession number.

    Args:
        accession_id: NCBI accession number (e.g., NM_000558)
        email: User email for NCBI Entrez (optional)
        max_retries: Number of retry attempts on failure

    Returns:
        SeqRecord object from Biopython

    Raises:
        ValueError: If accession_id is empty or record not found
        ConnectionError: If NCBI API is unreachable after retries
    """
    if not accession_id or not accession_id.strip():
        raise ValueError("Accession ID tidak boleh kosong.")

    accession_id = accession_id.strip()
    last_error = None

    # Gunakan email dari parameter jika ada, jika tidak gunakan default dari settings
    if email and email.strip():
        Entrez.email = email.strip()

    for attempt in range(1, max_retries + 1):
        try:
            _rate_limit()

            handle = Entrez.efetch(
                db="nucleotide",
                id=accession_id,
                rettype="fasta",
                retmode="text",
            )
            text = handle.read()
            handle.close()

            if not text.strip() or "Error" in text[:100]:
                raise ValueError(
                    f"Accession '{accession_id}' tidak ditemukan di NCBI."
                )

            record = SeqIO.read(StringIO(text), "fasta")

            if len(record.seq) == 0:
                raise ValueError(
                    f"Sekuens kosong untuk accession '{accession_id}'."
                )

            return record

        except ValueError:
            raise  # Don't retry validation errors
        except Exception as e:
            last_error = e
            if attempt < max_retries:
                wait_time = 2 ** attempt  # Exponential backoff
                print(
                    f"⚠️  Attempt {attempt}/{max_retries} gagal: {e}. "
                    f"Retry dalam {wait_time}s..."
                )
                time.sleep(wait_time)

    raise ConnectionError(
        f"Gagal mengakses NCBI setelah {max_retries} percobaan. "
        f"Error terakhir: {last_error}"
    )
