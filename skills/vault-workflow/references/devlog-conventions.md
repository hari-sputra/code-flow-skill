# Daily Development Log (DevLog) Conventions

Standar pencatatan progres teknis, arsitektur, dan keputusan harian pada software development.

---

## 1. Naming Convention: File Tunggal per Hari
- Setiap hari kerja/sesi development, buat atau perbarui satu file di folder `vault/DevLogs/` (atau folder devlog project) dengan format tanggal ISO murni:
  ```text
  vault/DevLogs/YYYY-MM-DD.md
  ```
  Contoh: `vault/DevLogs/2026-09-10.md`.
- **Dilarang menambahkan suffix nama modul di nama file** (seperti `2026-09-10-auth.md`), karena dalam satu hari pengerjaan dapat mencakup lebih dari satu modul atau perbaikan umum.

---

## 2. Struktur Konten Modular
Di dalam satu file DevLog harian, kelompokkan progres secara modular berdasarkan modul/aspek yang dikerjakan:
1. `## 1. <Modul / Fitur A>`: Rincian pengerjaan, masalah yang ditemukan, dan solusi teknis.
2. `## 2. <Modul / Fitur B>`: Rincian pengerjaan berikutnya jika ada.
3. `## 3. <Dokumentasi / Refactor / Rules>`: Catatan perubahan arsitektur atau aturan.
4. `## 📊 Status Akhir & Verifikasi`: Hasil build, unit test, dan rencana langkah selanjutnya (*next steps*).

---

## 3. Indexing
- Tautkan setiap file DevLog baru ke dalam berkas `Index.md` project pada section *Development Logs* agar riwayat mudah ditelusuri.
