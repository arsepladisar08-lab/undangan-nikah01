# Google Apps Script Backend — Wedding Invitation

Backend untuk Google Sheets dan Google Drive. Kode sumber yang berlaku adalah file ini, `Code.gs`.

## Fitur dan batas akses

**Publik:** ping, membaca foto publik, membaca konfigurasi audio, membaca feed ucapan RSVP yang memang ditampilkan pada halaman undangan, serta mengirim RSVP.

**Admin dengan sesi server:** membaca daftar tamu lengkap, menambah/memperbarui/menghapus tamu, mengunggah foto, mengubah foto, mengubah pengaturan audio, mengganti PIN admin, dan logout.

Daftar tamu (termasuk nomor WhatsApp dan catatan) hanya dapat dibaca menggunakan token sesi admin. Jangan membagikan Spreadsheet database kepada publik.

## 1. Buat Spreadsheet dan pasang backend

1. Buat Spreadsheet melalui [sheets.new](https://sheets.new).
2. Buka **Ekstensi → Apps Script**.
3. Ganti seluruh isi `Code.gs` dengan versi terbaru dari repository: [google-apps-script/Code.gs](https://github.com/arsepladisar08-lab/undangan-nikah01/blob/main/google-apps-script/Code.gs).
4. Simpan project.

## 2. Siapkan PIN admin di server

1. Di editor Apps Script, pilih fungsi `setupAdminPin` lalu klik **Run/Jalankan**.
2. Berikan izin yang diminta Google.
3. Masukkan PIN/passphrase unik minimal **10 karakter**. Jangan memakai tanggal lahir, tanggal acara, atau PIN mudah ditebak.
4. PIN disimpan sebagai salted SHA-256 hash di **Script Properties**, bukan teks biasa.
5. Sesi login berlaku maksimal 6 jam. Lima percobaan login gagal memicu cooldown global 15 menit.

Jika mengganti PIN, lakukan dari tab keamanan pada panel admin. Sesi saat ini akan berakhir dan pemilik perlu login kembali.

## 3. Deploy sebagai Web App

1. Pilih **Deploy → New deployment → Web app**.
2. **Execute as:** Me (pemilik script).
3. **Who has access:** Anyone. Akses publik hanya membuka endpoint yang memang diperlukan undangan; operasi admin tetap memerlukan token sesi yang diverifikasi server-side.
4. Deploy, berikan izin, lalu salin URL Web App dengan format `https://script.google.com/macros/s/.../exec`.

Saat memperbarui kode di masa depan, pilih **Deploy → Manage deployments → Edit → New version → Deploy**. Menyimpan kode di editor saja tidak memperbarui versi Web App yang sedang aktif.

## 4. Konfigurasikan frontend untuk semua pengunjung

Tambahkan environment variable berikut ke Vercel/Netlify, kemudian redeploy frontend:

```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

URL ini bukan rahasia. Frontend membutuhkannya agar perangkat tamu yang berbeda dapat membaca foto/audio dan mengirim RSVP ke backend yang sama. Jangan memasukkan PIN admin atau token sesi ke environment variable.

Pada perangkat pemilik, URL juga dapat disimpan melalui tab Pengaturan Google Apps Script sebagai override lokal.

## 5. Verifikasi setelah deployment

- Buka `?action=ping`: harus mengembalikan status sukses.
- Buka `?action=getPhotos` dan `?action=getAudio`: boleh dibaca publik.
- Buka `?action=getGuests` tanpa token: harus ditolak.
- Kirim `saveGuests`, `uploadPhoto`, dan `saveAudio` tanpa token: harus ditolak.
- Login melalui `?admin=1`; verifikasi bahwa daftar tamu bisa dimuat setelah login.
- Kirim RSVP dari browser/perangkat lain dan pastikan data masuk ke sheet RSVP.

## Catatan keamanan dan operasional

- Google Apps Script Web App tetap harus dapat dijangkau publik agar tamu dapat RSVP tanpa login Google. Karena itu, **semua operasi tulis admin wajib memeriksa token di server**.
- Feed RSVP publik memang ditampilkan di undangan. Jangan masukkan data sensitif ke kolom ucapan.
- Foto yang diunggah dibuat dapat dilihat oleh siapa pun yang memiliki tautan, sesuai kebutuhan galeri publik.
- Pembatasan login pada Apps Script menggunakan cooldown global karena Apps Script Web App tidak menyediakan alamat IP klien sebagai bagian dari event request standar. Pemilik dapat terkunci sementara jika banyak percobaan gagal.
- Periksa izin Drive dan Spreadsheet milik akun pemilik. Kegagalan kebijakan berbagi file akan membuat upload gagal secara eksplisit.
- Jangan mengandalkan localStorage/sessionStorage sebagai otorisasi. Browser hanya menyimpan token sesi; server menentukan apakah token masih sah.
