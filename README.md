# CinemaTix Frontend — Web Sinema Kuratorial

Aplikasi Single Page Application (SPA) **CinemaTix** berbasis **React 18 + Vite + Tailwind CSS** untuk pemesanan tiket bioskop dan pemilihan kursi secara daring (Kelompok 5, Kelas SI5B, Universitas MDP).

## Karakter Desain

- **Cinema Noir & Warm Ivory**: Palet kertas hangat `#F7F5F0`, garis batas `#E5E0D8`, aksen merah beludru `#8B1E2E`, aksen kuningan `#B8860B`, serta ruang pemilihan kursi bertema teater obsidian `#111217`.
- **Tipografi Editorial**: `Plus Jakarta Sans` (judul), `DM Sans` (antarmuka), dan `JetBrains Mono` (kode tiket, kursi, jam tayang, dan harga).
- **Responsif Penuh**: Bilah navigasi atas pada Desktop dan *bottom navigation bar* ergonomis + *sticky checkout bar* pada Mobile.

## Menjalankan di Lokal

1. Salin berkas environment:
   ```bash
   cp .env.example .env
   ```
   Sesuaikan `VITE_API_BASE_URL` (bawaan `http://localhost:5000/api`).

2. Instal dependensi dan jalankan server pengembangan:
   ```bash
   npm install
   npm run dev
   ```
   Buka `http://localhost:5173`.
