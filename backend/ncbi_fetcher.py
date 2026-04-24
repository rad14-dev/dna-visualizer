import os
from Bio import Entrez
from urllib.error import HTTPError
from dotenv import load_dotenv

# Muat variabel dari file .env
load_dotenv()

# Daftarkan email ke NCBI
Entrez.email = os.getenv("NCBI_EMAIL")
# Entrez.api_key = os.getenv("NCBI_API_KEY") # Aktifkan jika Anda punya API key

def fetch_sequence(accession_id: str, database: str = "nucleotide") -> dict:
    """
    Mengambil data sekuens dari NCBI berdasarkan Accession ID.
    Default database adalah 'nucleotide' karena awalan NM_ merujuk pada nukleotida.
    """
    if not Entrez.email:
        return {"error": "Email NCBI belum diatur di file .env"}

    try:
        # Menggunakan efetch untuk mengambil data. 
        # rettype="gb" untuk format GenBank, atau "fasta" untuk sekuens saja.
        with Entrez.efetch(db=database, id=accession_id, rettype="fasta", retmode="text") as handle:
            data = handle.read()
            
            if not data.strip():
                return {"error": f"Accession '{accession_id}' tidak ditemukan di database '{database}'."}
            
            return {"success": True, "data": data}
            
    except HTTPError as e:
        if e.code == 400:
            return {"error": f"Bad Request (400): ID '{accession_id}' mungkin salah format atau tidak valid."}
        elif e.code == 429:
            return {"error": "Terlalu banyak permintaan (Rate Limit 429). Mohon tunggu beberapa saat."}
        else:
            return {"error": f"HTTP Error dari NCBI: {e.code}"}
            
    except Exception as e:
        return {"error": f"Terjadi kesalahan sistem: {str(e)}"}

# Blok eksekusi untuk menguji script secara mandiri
if __name__ == "__main__":
    # Anda bisa mengganti ID ini untuk pengujian
    test_accession = "NM_000558"
    print(f"Memulai pengujian fetching data untuk Accession ID: {test_accession}...\n")
    
    hasil = fetch_sequence(test_accession)
    
    # Menampilkan sebagian hasil agar terminal tidak terlalu penuh jika sekuensnya panjang
    if "success" in hasil:
        print("Berhasil mengambil data!")
        print(f"Preview Sekuens:\n{hasil['data'][:500]}...\n")
    else:
        print(f"Gagal: {hasil['error']}")