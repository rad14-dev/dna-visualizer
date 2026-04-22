# DNA-Visualizer 🧬
### DNA → RNA → Protein · Interactive Visual Converter

**Bio-Visualizer** adalah platform web interaktif yang dirancang untuk menjembatani data genomik mentah dari NCBI dengan visualisasi yang indah dan informatif. Aplikasi ini memudahkan siapapun untuk melihat proses **Central Dogma Biologi Molekuler** (Transkripsi & Translasi) secara *real-time* dengan skema warna yang menarik.

> [!TIP]
> **🚀 Kabar Gembira!** Kami akan segera merilis **Versi Web** agar Anda dapat menggunakan aplikasi ini langsung dari browser tanpa perlu instalasi lokal.

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
- **Composition Analysis (NEW 📊)**: Analisis statistik instan menggunakan grafik pie interaktif untuk:
  - Persentase basa DNA (A, T, G, C).
  - Persentase basa RNA (A, U, G, C).
  - Distribusi sifat kimia Asam Amino (Nonpolar, Polar, Positif, Negatif, dll).
- **Interactive Sequence Viewer**: Visualisasi grid nukleotida dan asam amino yang responsif dengan efek *cascading entrance*.
- **Codon Mapping Logic**: Fitur hover cerdas yang menghubungkan unit protein kembali ke kodon RNA asalnya.
- **Biochemical Metadata**: Popup informasi detail untuk setiap komponen sekuens saat di-hover.
- **Modern Tech Stack**: Dibangun dengan **FastAPI** yang cepat dan **React** yang dinamis.

---

## 🛠️ Arsitektur Teknologi

### Backend (Python)
- **FastAPI**: Web framework berkinerja tinggi.
- **Biopython**: Library standar industri untuk komputasi biologi.
- **Pydantic**: Validasi data dan skema API.

### Frontend (React)
- **React 18**: Library UI deklaratif.
- **Recharts**: Library visualisasi data untuk grafik pie.
- **Vanilla CSS**: Desain kustom premium dengan nuansa *Dark Mode*.

---

## 🚀 Cara Menjalankan Secara Lokal

### 1. Persiapan Backend
Buka terminal baru di folder `backend`:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```
Pastikan file `.env` sudah terisi:
`NCBI_EMAIL=email_anda@example.com`

Jalankan server:
```powershell
uvicorn main:app --reload --port 8001
```

### 2. Persiapan Frontend
Buka terminal baru di folder `frontend`:
```powershell
cd frontend
npm install
npm run dev
```
Akses aplikasi melalui `http://localhost:5173`.

---

## 👨‍🔬 Siapa yang Dapat Memanfaatkan Aplikasi Ini?

1. **Mahasiswa Biologi/Bioinformatika**: Memahami pemetaan kodon dan sifat asam amino secara visual tanpa harus menghafal tabel manual.
2. **Dosen & Pengajar**: Media pembelajaran interaktif untuk menunjukkan proses transkripsi dan translasi di kelas.
3. **Peneliti Biologi**: Alat pengecekan cepat (*quick check*) untuk profil protein dan komposisi basa dari sekuens genetik.
4. **Bioinformatics Enthusiasts**: Contoh implementasi nyata integrasi API NCBI dengan web modern.

---

## 🧪 Contoh Accession Numbers untuk Dicoba
- **Manusia:** `NM_000558` (Hemoglobin Alpha), `NM_007294` (BRCA1 - Gen Panjang)
- **Hewan:** `NM_008503` (Lysozyme C - Mencit)
- **Tumbuhan:** `NM_113037` (RUBISCO - Arabidopsis)

---
*Dikembangkan dengan ❤️ untuk kemajuan pendidikan sains.*
