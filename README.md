# Indonesia Map

# ⌛ Introduction

This is an interactive web application that displays the map of Indonesia with **38 provinces**, featuring interactive thematic visualization (Choropleth map for Population, Population Density, and Area), real-time weather & Air Quality Index (AQI) monitoring via Open-Meteo, island filters, search with auto-complete, pan & zoom controls, multi-province comparison matrix, and dark mode support.

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

Statistical and geospatial data utilized in this application are derived from official government references of the Republic of Indonesia:

1. **Population Estimates & Demographics:**

   - **Statistics Indonesia (BPS RI)** — Interim Population Projections 2020–2023 and the publication _Provinces in Figures 2023/2024_.
   - Official Portal: [https://www.bps.go.id](https://www.bps.go.id)

2. **Land Area & Administrative Data (38 Provinces):**

   - **Ministry of Home Affairs of the Republic of Indonesia (Kemendagri RI)** — _Ministerial Decree (Kepmen Mendagri) No. 100.1.1-6117 of 2022_ on Granting and Updating Codes, Government Administrative Region Data, and Islands (including the 4 New Autonomous Regions in Papua: South Papua, Central Papua, Highland Papua, and Southwest Papua).
   - **Geospatial Information Agency (BIG)** — Official territorial boundaries and land area data for Indonesian provinces.

3. **Geometry & Vector SVG Maps:**

   - **38 Provinces SVG Map:** [amCharts standard via yunanmr/map-indonesia-svg](https://github.com/yunanmr/map-indonesia-svg)
   - **Baseline 34 Provinces Reference:** [Simplemaps Indonesia SVG](https://simplemaps.com/svg/country/id)

4. **Regional Profiles & Historical Summaries:**

   - [Indonesian Wikipedia](https://id.wikipedia.org) for provincial capitals, time zones, and brief historical descriptions.

5. **Real-time Weather & Air Quality (Atmospheric Data):**
   - **Open-Meteo Weather & Air Quality API** — Open-source environmental forecast APIs providing real-time meteorological conditions (temperature, apparent temperature, relative humidity, wind speed, and WMO weather codes) and air quality metrics (US AQI, PM2.5, PM10, and Ozone) for all 38 provincial capitals without requiring an API key.
   - License: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)
   - Official Portals: [Open-Meteo Weather](https://open-meteo.com) | [Open-Meteo Air Quality](https://open-meteo.com/en/docs/air-quality-api)

# 📚 Technical Documentation

This repository provides comprehensive technical and product engineering documentation:

- 📄 [**Product Requirements Document (PRD.md)**](./PRD.md) — Product vision, target user personas, functional and non-functional specifications, user flow diagrams, and the product evolution roadmap.
- 🏛️ [**System Architecture (ARCHITECTURE.md)**](./ARCHITECTURE.md) — System architecture, module layout, component hierarchy, 5-quantile statistical formulas, canvas pan-zoom boundary math, and Neobrutalism design tokens.
- 🔬 [**Codebase Quality Evaluation (EVALUATION.md)**](./EVALUATION.md) — Multi-axis code quality audit (correctness, readability, architecture, security, performance), accessibility assessment, and prioritized technical recommendations.
