# Universal Responsive Design & Layout Standards

Panduan arsitektur layout dan antarmuka responsif lintas ukuran layar (Mobile, Tablet, Desktop, Ultra-wide).

---

## 1. Mobile-First & Fluid Breakpoints
- Terapkan pendekatan **mobile-first**: tulis styling default untuk mobile viewport terlebih dahulu, lalu lakukan overriding untuk layar lebar melalui media query atau breakpoint modifiers (`sm:`, `md:`, `lg:`, `xl:`).
- Hindari hardcoded ukuran piksel kaku untuk kontainer utama (seperti `width: 950px`). Gunakan kombinasi `w-full`, `max-w-7xl`, `flex-1`, dan persentase fleksibel.

---

## 2. Flex Safety & Text Wrapping
- Pada kontainer `flex`, tambahkan class `min-w-0` pada flex children yang menampung teks panjang, truncate, atau tabel. Hal ini mencegah flex child meluas melebihi batas layar (*horizontal blowout*).

---

## 3. Responsive Tables & Data Grids
- Seluruh tabel data, matriks lebar, atau data grid wajib dibungkus dalam kontainer berkelas:
  ```html
  <div class="overflow-x-auto w-full">
    <table>...</table>
  </div>
  ```
  agar user dapat menggeser tabel secara horizontal dengan nyaman tanpa merusak tata letak halaman utama.

---

## 4. Touch-Friendly Spacing & Targets
- Ukuran touch target tombol, opsi dropdown, atau tautan interaktif minimal berukuran **40px – 44px** untuk kenyamanan akses di layar sentuh.
- Terapkan padding dan gap yang proporsional sesuai ukuran layar (contoh: padding kecil di mobile `p-4`, membesar di desktop `md:p-6 lg:p-8`).

---

## 5. No Viewport Horizontal Overflow
- Pastikan tidak ada scrollbar horizontal liar pada viewport `window` di resolusi apa pun.
