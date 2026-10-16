# Investigation & Knowledge Graph Standards

Standar alur kerja investigasi codebase dan sinkronisasi knowledge graph.

---

## 1. Graphify First (Mandatory)
Sebelum melakukan scanning file mentah atau pencarian string massal (`grep`, `find`, pembacaan file bertubi-tubi):
1. **Periksa Knowledge Graph terlebih dahulu**:
   - `graphify query "<pertanyaan>"`: Mendapatkan subgraph relevan dengan cepat.
   - `graphify explain "<konsep>"`: Penjelasan terarah arsitektur dan relasi komponen.
   - `graphify path "<A>" "<B>"`: Menganalisis dependensi antar dua entitas.
   - `graphify-out/wiki/index.md`: Navigasi dokumentasi komunitas dan struktur sistem.
2. **Conditional Fallback**: Pembacaan file kode langsung hanya dilakukan apabila Graphify belum memuat informasi atau konteks yang dibutuhkan masih belum memadai.

---

## 2. Knowledge Graph Synchronization
- Setiap kali menambahkan fitur baru, mengubah arsitektur, atau merombak dependensi file kode, jalankan sinkronisasi AST:
  ```bash
  graphify update .
  ```
  untuk memastikan graph tetap akurat dan mutakhir tanpa biaya API token.
