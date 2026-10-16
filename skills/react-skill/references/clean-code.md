# Universal Clean Code & Software Engineering Standards

Aturan rekayasa perangkat lunak standar yang berlaku universal untuk seluruh project dan bahasa pemrograman.

---

## 1. Core Engineering Principles
- **SOLID Principles**:
  - **Single Responsibility (SRP)**: Satu class atau fungsi hanya boleh memiliki satu alasan untuk berubah.
  - **Open/Closed (OCP)**: Terbuka untuk ekstensi, tertutup untuk modifikasi.
  - **Liskov Substitution (LSP)**: Subtipe harus dapat menggantikan tipe dasarnya tanpa merusak program.
  - **Interface Segregation (ISP)**: Jangan memaksa client bergantung pada interface yang tidak digunakannya.
  - **Dependency Inversion (DIP)**: Bergantung pada abstraksi, bukan konkresi.
- **DRY (Don't Repeat Yourself)**: Ekstrak logika berulang ke dalam helper, service, atau modul terpisah.
- **KISS (Keep It Simple, Stupid)**: Prioritaskan kejelasan dan keterbacaan daripada trik kode yang terlalu rumit.

---

## 2. Naming & Self-Documenting Code
- **Meaningful Naming**:
  - Nama variabel, fungsi, dan class harus jelas dan deskriptif (`isDrawerCollapsed`, `fetchUserPermissions()`).
  - Hindari nama ambigu atau singkatan tanpa konteks (`temp`, `data1`, `fn()`).
- **Dilarang Menulis Komentar Redundan**:
  - **Dilarang keras menulis komentar yang hanya menjelaskan apa yang dilakukan kode** (contoh: `// Inisialisasi variabel`, `// Set loading state`, `// Panggil API`).
  - Kode harus jelas dengan sendirinya (*self-documenting*). Jika alur kode terlalu rumit hingga butuh komentar penjelas alur, pecah menjadi fungsi-fungsi kecil dengan penamaan yang ekspresif.
  - Komentar hanya diizinkan untuk alasan non-obvious (*"Why"*, bukan *"What"*), seperti workarounds bug library pihak ketiga atau regulasi keamanan tertentu.

---

## 3. Universal Class & Component Member Hierarchy
Untuk menjaga konsistensi di setiap file/class (Component, Service, Controller, Store, Helper), urutan anggota disusun dari atas ke bawah:
1. **Injections / Dependensi Eksternal**: Injeksi service, context, atau controller.
2. **State & Variabel Lokal**: Deklarasi state, konstanta lokal, referensi variabel.
3. **Derived / Computed State**: State reaktif turunan.
4. **Constructor / Lifecycle Initialization**: Inisialisasi awal objek.
5. **Lifecycle Hooks**: Hook framework (`ngOnInit`, `useEffect`, `mounted`, dll.).
6. **Public Methods / Actions**: Method yang dipanggil oleh presentation layer/event handler.
7. **Private / Helper Methods**: Logika internal diletakkan di bagian bawah.

---

## 4. Error Handling & Resilience
- Tangani error pada HTTP requests atau I/O dengan feedback yang jelas dan ramah pengguna.
- Hindari *silent failure* (selalu log error atau tampilkan fallback UI).
- Validasi data di boundary layer (input controller, response parsing API).

---

## 5. Dead Code & Cleanliness
- **No Dead Code**: Hapus kode yang sudah tidak dipanggil, fungsi usang, dan `console.log` debug sebelum code review atau commit.
- **Unused Imports**: Wajib membersihkan seluruh unused import di setiap file.
- **No Stale Dummy Data**: Segera bersihkan data mock/dummy setelah endpoint riil terintegrasi.
