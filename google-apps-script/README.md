# Panduan Integrasi Google Apps Script & Google Drive / Spreadsheet

Backend ini memungkinkan Anda untuk:
1. **Membagikan undangan ke berbagai orang dengan nama masing-masing di halaman pembuka** (`?to=Nama+Tamu`).
2. **Mengganti / Mengunggah 12 foto undangan langsung ke Google Drive** (disimpan di folder otomatis `"Undangan Pernikahan Bagaskara & Sekar"`).
3. **Mencatat secara otomatis tautan gambar yang diunggah ke Google Spreadsheet** (pada sheet `"Photos"`).
4. **Menyimpan daftar tamu dan tautan WhatsApp langsung ke Google Spreadsheet** (pada sheet `"Guests"`).

---

## Langkah 1: Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet, contoh: `Database Undangan Bagaskara & Sekar`.

---

## Langkah 2: Pasang Kode Google Apps Script
1. Di Google Spreadsheet tersebut, klik menu **Ekstensi** (Extensions) > **Apps Script**.
2. Hapus semua kode bawaan di file `Code.gs`.
3. Buka file `Code.gs` di folder ini (atau klik tombol **"Salin Kode Apps Script"** di panel Admin aplikasi undangan), lalu tempel (paste) seluruh kodenya.
4. Klik tombol **Simpan** (ikon disket 💾 atau `Ctrl+S` / `Cmd+S`).

---

## Langkah 3: Deploy sebagai Web App
1. Di pojok kanan atas Apps Script, klik tombol biru **Terapkan (Deploy)** > **Penerapan baru (New deployment)**.
2. Klik ikon gerigi ⚙️ di sebelah *Pilih jenis* (Select type) > pilih **Aplikasi web (Web app)**.
3. Isi konfigurasi berikut:
   - **Deskripsi**: `Backend Undangan Pernikahan`
   - **Jalankan sebagai (Execute as)**: `Saya (email Anda)`
   - **Yang memiliki akses (Who has access)**: **`Siapa saja (Anyone)`** *(Wajib agar aplikasi web dapat mengunggah foto dan membaca data tanpa login Google)*.
4. Klik tombol **Terapkan (Deploy)**.
5. Google akan meminta izin akses (Authorization Required):
   - Klik **Tinjau izin (Review permissions)**.
   - Pilih akun Google Anda.
   - Klik **Lanjutan (Advanced)** > klik **Buka Untitled project (tidak aman)** / nama project Anda.
   - Klik **Izinkan (Allow)**.
6. Salin **URL Aplikasi Web** (Web App URL) yang berformat:
   `https://script.google.com/macros/s/AKfycb.../exec`

---

## Langkah 4: Hubungkan ke Aplikasi Undangan
1. Buka aplikasi undangan pernikahan.
2. Klik tombol **"Kelola Undangan & Foto"** di bagian footer atau klik ikon gerigi admin (atau buka url dengan `?admin=1`).
3. Masuk ke tab **"Pengaturan Google Apps Script"**.
4. Tempel URL Web App ke kolom **Google Apps Script Web App URL**.
5. Klik **"Uji Koneksi"**. Bila sukses, status akan berubah menjadi hijau ✅.
6. Sekarang Anda bisa:
   - Mengunggah foto baru di tab **"Kelola & Ganti Foto"** (akan otomatis tersimpan di Google Drive & dicatat di Google Sheets).
   - Menambahkan daftar tamu di tab **"Buku Tamu & Link WhatsApp"** dan menyimpannya ke Google Sheets.
