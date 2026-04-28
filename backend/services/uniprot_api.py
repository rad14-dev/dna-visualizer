"""
Service for interacting with UniProt REST API to fetch protein metadata.
"""

import httpx
import os

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
