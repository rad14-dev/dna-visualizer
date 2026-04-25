# Prompt: Advanced Bio-Visualizer Modules Integration

## 1. Modul: Gene Ontology (GO) Sunburst Chart
**Deskripsi:** Visualisasi hierarkis interaktif untuk membedah peran biologis protein berdasarkan standar Gene Ontology.

### Instruksi Teknis untuk AI Agent:
- **Data Fetching:** Gunakan `UniProt API` atau `QuickGO API` (EBI). Lakukan mapping dari NCBI Accession ID ke UniProt ID untuk menarik field `features` dan `keywords`.
- **Visualization Logic:**
    - Gunakan library **D3.js** atau **Plotly.js** untuk rendering Sunburst Chart.
    - Struktur Hierarki:
        1. Pusat: Root (Molecular Function, Biological Process, Cellular Component).
        2. Ring 1-3: Sub-kategori spesifik (misal: Enzyme Activity -> Protease -> Serine Protease).
- **Interaktivitas UI/UX:**
    - **Zoom-on-Click:** Saat satu segmen diklik, grafik akan memperbesar cabang tersebut.
    - **Hover Tooltip:** Tampilkan deskripsi lengkap fungsi dan GO ID.
    - **Color Mapping:** Skema warna laboratorium (Biru Tua: Komponen Sel, Hijau Sage: Proses Biologis, Ungu Neon: Fungsi Molekuler).

---

## 2. Modul: Advanced Electrophoresis Simulator (Lab Config)
**Deskripsi:** Simulator persiapan eksperimen virtual untuk memisahkan fragmen DNA berdasarkan variabel fisik laboratorium.

### Instruksi Konfigurasi:
Buatlah panel kontrol interaktif sebelum simulasi "Digital Digest" dijalankan:

#### A. Opsi Larutan (Matrix & Buffer)
- **Agarose Concentration:** Slider 0.5% - 2.0%.
    - *Logika:* Persentase lebih tinggi memperlambat semua pita namun memberikan resolusi lebih baik untuk fragmen kecil (<500bp).
- **Buffer Selection:** Dropdown (TAE vs TBE).
    - *Logika:* TBE memberikan resolusi lebih tajam untuk fragmen kecil; TAE lebih baik untuk recovery fragmen besar (>2kb).

#### B. Opsi Kelistrikan (Voltage & Time)
- **Voltage:** Slider 50V - 150V.
    - *Logika:* Tegangan tinggi mempercepat migrasi (Short run), namun tegangan >120V meningkatkan risiko pita "smearing" atau gel meleleh.
- **Run Time:** Input angka (Menit).

#### C. Simulator Engine (Physics Logic)
- **Migration Formula:** Gunakan pendekatan logaritmik: $v \propto \frac{V}{L \cdot \log(bp) \cdot [Agarose]}$, di mana $v$ adalah kecepatan migrasi.
- **Visual Feedback:** - Animasi pita DNA (bands) yang bergerak ke bawah "gel" menggunakan **Framer Motion**.
    - Ketebalan pita harus merepresentasikan intensitas (jumlah basa).
    - Berikan "Warning System" jika kombinasi Voltage dan Time berisiko merusak hasil (smearing).

---

## Persyaratan Global untuk AI Agent:
1. **Frontend:** Gunakan React (Vite) + Tailwind CSS.
2. **State Management:** Pastikan sinkronisasi antara parameter input elektroforesis dengan kecepatan animasi pita di layar.
3. **Responsive Design:** Panel konfigurasi harus tetap mudah diakses di samping visualisasi gel utama.
4. **Bio-Logic Accuracy:** Pastikan hasil pemisahan pita sesuai dengan titik potong yang ditemukan oleh modul `Restriction Enzyme Mapping`.

---