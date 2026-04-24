"""
Service for interacting with UniProt REST API to fetch protein metadata.
"""

import httpx
import os
# from goatools.obo_parser import GODag # Removed GOATools imports
# from goatools.gosubdag.gosubdag import GoSubDag # Removed GOATools imports

# Path to the GO OBO file (no longer needed without goatools)
# GO_OBO_FILE = "go-basic.obo"
# GO_OBO_URL = "http://release.geneontology.org/2024-03-01/ontology/go-basic.obo" 

# Global variable to store GO DAG (Directed Acyclic Graph) (no longer needed)
# go_dag = None

# async def _load_go_obo_file(): # No longer needed
#     """Load the GO OBO file, downloading it if necessary."""
#     global go_dag
#     if go_dag is None:
#         if not os.path.exists(GO_OBO_FILE):
#             print(f"DEBUG (Backend): Mengunduh {GO_OBO_FILE}...")
#             async with httpx.AsyncClient(timeout=60.0) as client:
#                 response = await client.get(GO_OBO_URL)
#                 response.raise_for_status()
#                 with open(GO_OBO_FILE, "wb") as f:
#                     f.write(response.content)
#             print(f"DEBUG (Backend): {GO_OBO_FILE} berhasil diunduh.")
        
#         print(f"DEBUG (Backend): Memuat {GO_OBO_FILE}...")
#         go_dag = GODag(GO_OBO_FILE)
#         print(f"DEBUG (Backend): {GO_OBO_FILE} berhasil dimuat. Jumlah GO terms: {len(go_dag)}")

async def fetch_uniprot_features(accession_id: str) -> list[dict]:
    """
    Fetch functional features (signals, transit peptides, regions) from UniProt.
    """
    signals = []
    
    # Base ID without version number
    base_id = accession_id.split('.')[0]
    
    try:
        url = f"https://rest.uniprot.org/uniprotkb/search?query=xref:refseq-nt_{base_id}&format=json"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                # If we get hits, use the first one (primary match)
                if data.get('results') and len(data['results']) > 0:
                    primary_entry = data['results'][0]
                    features = primary_entry.get('features', [])
                    
                    for feature in features:
                        ftype = feature.get('type')
                        desc = feature.get('description', '')
                        
                        is_signal = ftype == 'Signal'
                        is_transit = ftype == 'Transit peptide'
                        is_nls = ftype == 'Region' and 'nuclear' in desc.lower()
                        
                        if is_signal or is_transit or is_nls:
                            location = feature.get('location', {})
                            start = location.get('start', {}).get('value')
                            end = location.get('end', {}).get('value')
                            
                            if start and end:
                                signals.append({
                                    "type": ftype,
                                    "start": int(start),
                                    "end": int(end),
                                    "description": desc if desc else ftype
                                })
    except Exception as e:
        print(f"Error fetching from UniProt API: {e}")
        
    return signals

def fallback_signal_detection(protein_seq: str) -> list[dict]:
    """
    KOSONG. 
    Kembalikan list kosong karena fitur ditarik sementara.
    """
    return []

async def fetch_uniprot_go_terms(accession_id: str) -> dict:
    """
    Fetch Gene Ontology (GO) terms from UniProt and structure them for Sunburst Chart.
    Returns a dictionary with 'ids', 'labels', 'parents' lists.
    """
    # await _load_go_obo_file() # No longer needed

    go_ids_from_uniprot = []
    base_id = accession_id.split('.')[0]

    print(f"DEBUG (Backend): Mencoba fetch GO terms untuk Accession ID: {accession_id} (Base ID: {base_id})")

    try:
        url = f"https://rest.uniprot.org/uniprotkb/search?query=xref:refseq-nt_{base_id}&format=json"
        print(f"DEBUG (Backend): URL UniProt GO: {url}")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            print(f"DEBUG (Backend): Status code UniProt GO: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                print(f"DEBUG (Backend): Data UniProt GO diterima. Jumlah hasil: {len(data.get('results', []))}")

                if data.get('results') and len(data['results']) > 0:
                    primary_entry = data['results'][0]
                    xrefs = primary_entry.get('uniProtKBCrossReferences', [])
                    print(f"DEBUG (Backend): Jumlah xrefs: {len(xrefs)}")

                    for ref in xrefs:
                        if ref.get('database') == 'GO':
                            go_id = ref.get('id') # e.g., GO:0005515
                            properties = ref.get('properties', [])

                            term_desc = ""
                            term_category = ""

                            for prop in properties:
                                if prop.get('key') == 'GoTerm':
                                    term_full = prop.get('value', '')
                                    if ':' in term_full:
                                        cat_code, desc = term_full.split(':', 1)
                                        term_desc = desc

                                        if cat_code == 'C': term_category = "Cellular Component"
                                        elif cat_code == 'F': term_category = "Molecular Function"
                                        elif cat_code == 'P': term_category = "Biological Process"

                            if go_id and term_category and term_desc:
                                go_ids_from_uniprot.append({
                                    "id": go_id,
                                    "category": term_category,
                                    "description": term_desc
                                })
                    print(f"DEBUG (Backend): Jumlah GO Terms yang ditemukan: {len(go_ids_from_uniprot)}")
                else:
                    print("DEBUG (Backend): Tidak ada hasil UniProt untuk Accession ID ini.")
            else:
                print(f"DEBUG (Backend): Gagal fetch UniProt GO terms. Response: {response.text}")

    except Exception as e:
        print(f"ERROR (Backend): Error fetching GO terms from UniProt API: {e}")
    
    # Return raw GO terms for now, without goatools processing
    # The frontend will handle the basic display
    return go_ids_from_uniprot
