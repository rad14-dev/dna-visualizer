# DNA-Visualizer 🧬
### DNA → RNA → Protein · Interactive Visual Converter

**DNA-Visualizer** adalah platform web interaktif yang dirancang untuk menjembatani data genomik mentah dari NCBI dengan visualisasi yang indah dan informatif. Aplikasi ini memudahkan siapapun untuk melihat proses **Central Dogma Biologi Molekuler** (Transkripsi & Translasi) secara *real-time* dengan skema warna yang menarik dan analisis bioinformatika tingkat lanjut.

> [!IMPORTANT]
> **🚀 Versi Web Tersedia!** Aplikasi ini sekarang telah dioptimalkan untuk hosting di **Vercel** dengan fitur parallel fetching untuk performa maksimal.

---

## 📥 Cara Meng-clone Repositori
Untuk mulai berkontribusi atau menjalankan proyek ini di mesin lokal, silakan clone repositori ini:

```bash
# Clone repositori
git clone https://github.com/username/dna-visualizer.git

# Masuk ke direktori proyek
cd dna-visualizer
```

---

## ✨ Fitur Utama

- **NCBI Real-Time Integration**: Fetch data sekuens DNA asli dari database NCBI hanya dengan memasukkan *Accession Number* (contoh: `NM_000558`, `NM_007294`).
- **Parallel API Processing (NEW ⚡)**: Mengambil data dari NCBI dan UniProt secara bersamaan untuk respon super cepat (di bawah 10 detik).
- **ORF Detection (NEW 🔬)**: Secara otomatis mendeteksi *Open Reading Frames* (M → *) dalam sekuens protein.
- **Protein Quality & Allergen Analysis (NEW 🛡️)**: 
  - Analisis asam amino pembatas berdasarkan standar FAO/WHO.
  - Deteksi motif alergen (Epitope matching) seperti pada kacang, gluten, dan susu.
- **Virtual Gel Electrophoresis (NEW 🧬)**: Simulasi pemotongan enzim restriksi (EcoRI, BamHI, HindIII, dll) dan visualisasi fragmen pada gel agarose.
- **Gene Ontology Sunburst (NEW 📊)**: Visualisasi kategori fungsional protein (Cellular Component, Molecular Function, Biological Process) menggunakan data dari UniProt.
- **Interactive Sequence Viewer**: Visualisasi nukleotida dan asam amino yang responsif dengan fitur hover untuk pemetaan kodon.
- **Composition Analysis**: Statistik instan untuk persentase basa (DNA/RNA) dan sifat kimia asam amino.

---

## 🛠️ Arsitektur Teknologi

### Backend (Python)
- **FastAPI**: Web framework berkinerja tinggi.
- **Biopython**: Library standar industri untuk komputasi biologi (NCBI Fetch, Restriction Analysis).
- **AsyncIO**: Eksekusi parallel untuk optimasi latensi API.
- **Pydantic**: Validasi data dan skema API.

### Frontend (React)
- **React 18**: Library UI deklaratif.
- **Recharts & Plotly**: Library visualisasi data untuk grafik pie dan sunburst chart.
- **Vanilla CSS**: Desain kustom premium dengan nuansa *Dark Mode* dan *Glassmorphism*.

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Persiapan Backend
Buka terminal baru di direktori root proyek:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```
Pastikan file `.env` sudah terisi di dalam folder `backend`:
`NCBI_EMAIL=email_anda@example.com`

Jalankan server dari direktori root:
```powershell
uvicorn backend.main:app --reload --port 8000
```

### 2. Persiapan Frontend
Buka terminal baru di folder `frontend`:
```powershell
cd frontend
npm install
npm run dev
```
Akses aplikasi melalui `http://localhost:5173`. Backend akan secara otomatis di-proxy melalui konfigurasi Vite.

---

## 👨‍🔬 Siapa yang Dapat Memanfaatkan Aplikasi Ini?

1. **Mahasiswa Biologi/Bioinformatika**: Memahami pemetaan kodon dan sifat asam amino secara visual.
2. **Dosen & Pengajar**: Media pembelajaran interaktif untuk menunjukkan proses biologi molekuler dan analisis restriksi.
3. **Peneliti Biologi**: Alat pengecekan cepat (*quick check*) untuk deteksi ORF, alergenitas, dan pola pemotongan enzim.
4. **Bioinformatics Enthusiasts**: Contoh implementasi integrasi API NCBI & UniProt dengan web modern.

---

## 🧪 Contoh Accession Numbers untuk Dicoba
- **Manusia:** `NM_000558` (Hemoglobin Alpha), `NM_007294` (BRCA1 - Gen Panjang)
- **Hewan:** `NM_008503` (Lysozyme C - Mencit)
- **Tumbuhan:** `NM_113037` (RUBISCO - Arabidopsis)

---
*Dikembangkan dengan ❤️ untuk kemajuan pendidikan sains.*
