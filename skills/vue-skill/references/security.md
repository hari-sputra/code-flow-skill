# Security Best Practices & Standards

Standar keamanan software untuk mencegah celah kerentanan (vulnerability) pada aplikasi.

---

## 1. XSS (Cross-Site Scripting) Prevention
- Hindari bypass parser keamanan framework (misal `dangerouslySetInnerHTML`, `bypassSecurityTrustHtml`, atau manipulasi `innerHTML` mentah).
- Jika harus merender HTML dinamis, wajib melewati sanitasi ketat (contoh menggunakan `DOMPurify`).
- Utamakan mekanisme binding teks bawaan framework yang otomatis melakukan character escaping.

---

## 2. Input Validation & Sanitization
- Validasi seluruh input user di presentation layer dan boundary API sebelum diproses.
- Bersihkan input URL, path parameter, dan query parameters dari karakter berbahaya (mencegah path traversal dan injection).

---

## 3. Sensitive Data Protection
- **Dilarang keras mencetak informasi sensitif** (password, secret key, private token, JWT, PII) ke dalam `console.log` atau error log production.
- Simpan kredensial atau token autentikasi di storage yang aman (Secure HttpOnly cookies atau secure session storage terisolasi).

---

## 4. Safe External Navigation
- Setiap hyperlink `<a>` yang membuka URL eksternal dengan `target="_blank"` wajib memiliki atribut:
  ```html
  rel="noopener noreferrer"
  ```
  untuk mencegah serangan *reverse tabnabbing*.
