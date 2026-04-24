# Future Development

-[x] ### 1. Protein Quality & Allergen Analysis (Food Tech Core)
    Backend (FastAPI): Gunakan biopython untuk ekstraksi komposisi asam amino.
    Logic: Implementasikan perhitungan skor DIAAS/PDCAAS. Bandingkan profil asam amino esensial hasil translasi dengan Standar Referensi FAO/WHO 2011.
    Allergen Scanner: Lakukan pencocokan sekuens (string matching) terhadap motif epitop alergen umum (seperti sekuens pemicu alergi pada gluten, kacang, atau protein kedelai).
    Frontend (React): Tampilkan perbandingan gizi menggunakan Radar Chart atau Multi-Bar Chart dari library recharts. Tambahkan pesan edukasi jika ditemukan "Limiting Amino Acid".
-[ ] ### 2. Protein Functional Signal & UniProt API Integration
  - API Integration: Gunakan UniProt REST API (rest.uniprot.org) untuk mengambil metadata protein berdasarkan Accession ID atau sekuens.
  - Data Extraction: Ambil koordinat fungsional dari field features (type: Signal, Transit peptide, atau Region untuk NLS).
  -Functional Signals: Deteksi dan labeli secara otomatis:
  - Signal Peptide: (Sekresi keluar sel).
  - Nuclear Localization Signal (NLS): (Pola seperti PKKKRKV untuk impor ke nukleus).
  - Mitochondrial Transit Peptide.
  - UI/UX: Beri highlight latar belakang warna yang berbeda pada baris sekuens asam amino untuk setiap sinyal yang ditemukan dan tambahkan Badge Status lokasi subseluler (contoh: [Loc: Nucleus]).
-[x] ### 3. Restriction Enzyme Mapping & Simulation
  - Backend: Gunakan library Bio.Restriction untuk memetakan situs pemotongan enzim standar (seperti EcoRI, BamHI, HindIII, dsb).
  - Visual: Tampilkan ikon "gunting" kecil di atas koordinat DNA yang tepat pada antarmuka sekuens.
  - Simulation Section: Buat komponen baru yang memvisualisasikan Virtual Gel Electrophoresis. Jika user melakukan "Digest", tampilkan pita-pita DNA (bands) berdasarkan panjang fragmen yang dihasilkan dari pemotongan tersebut.
-[x] ### 4. DNA/Protein Sonification (Tone.js)
  - Audio Engine: Gunakan Tone.js dengan PolySynth (Triangle/Sine wave) untuk meniru karakter suara instrumen Asia (Gamelan/Koto/Xylophone).
  - Nukleotida Mapping (C-Mayor Pentatonic):
    G (3 H-bonds): A4 (La) - Tinggi/Terang.
    C (3 H-bonds): G4 (Sol) - Resonan.
    A (2 H-bonds): E4 (Mi) - Menengah.
    T (2 H-bonds): D4 (Re) - Rendah.
    U (RNA): C4 (Do) - Root.
  - Interactivity: Play/Pause, BPM slider, dan visualizer yang menyala sinkron saat nada dimainkan melewati sekuens.

# Persyaratan Global
1. Arsitektur: Semua pemrosesan berat dilakukan di FastAPI; React fokus pada rendering dan animasi.
2. Animasi: Gunakan Framer Motion untuk transisi alur Central Dogma Timeline (DNA → RNA → Protein).
3. Desain UI: Estetika minimalis bertema laboratorium modern (Dark/Light mode) menggunakan Tailwind CSS dan Lucide-React untuk ikonografi.
4. Data Persistence: Gunakan localStorage untuk caching hasil API UniProt agar performa tetap cepat.