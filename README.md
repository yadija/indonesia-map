# Indonesia Map

# ⌛ Introduction

This is an interactive web application that displays the map of Indonesia with **38 provinces**, featuring interactive thematic visualization (Choropleth map for Population, Population Density, and Area), island filters, search with auto-complete, pan & zoom controls, and dark mode support.

# 🚀 Installation

To install the application, you can use the following command:

```bash
npm install
```

# 🚈 Running the application

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
```

```bash
npm run preview
```

# 📖 Data Sources & References

Data statistik dan geospasial yang digunakan dalam aplikasi ini bersumber dari rujukan resmi pemerintah Republik Indonesia:

1. **Estimasi Populasi & Demografi:**

   - **Badan Pusat Statistik (BPS RI)** — Proyeksi Penduduk Interim 2020–2023 dan Publikasi _Provinsi Dalam Angka 2023/2024_.
   - Portal Resmi: [https://www.bps.go.id](https://www.bps.go.id)

2. **Luas Wilayah & Administrasi 38 Provinsi:**

   - **Kementerian Dalam Negeri Republik Indonesia (Kemendagri RI)** — _Keputusan Menteri Dalam Negeri (Kepmen Mendagri) No. 100.1.1-6117 Tahun 2022_ tentang Pemberian dan Pemutakhiran Kode, Data Wilayah Administrasi Pemerintahan, dan Pulau (mencakup 4 Daerah Otonom Baru di Papua: Papua Selatan, Papua Tengah, Papua Pegunungan, dan Papua Barat Daya).
   - **Badan Informasi Geospasial (BIG)** — Data batas wilayah dan luas daratan resmi provinsi Indonesia.

3. **Geometri & Peta Vektor (SVG):**

   - **Peta SVG 38 Provinsi:** [amCharts standard via yunanmr/map-indonesia-svg](https://github.com/yunanmr/map-indonesia-svg)
   - **Peta Referensi Awal (34 Provinsi):** [Simplemaps Indonesia SVG](https://simplemaps.com/svg/country/id)

4. **Profil & Ringkasan Sejarah Wilayah:**
   - Ensiklopedia [Wikipedia Bahasa Indonesia](https://id.wikipedia.org) untuk informasi ibu kota, zona waktu, dan deskripsi ringkas setiap provinsi.
