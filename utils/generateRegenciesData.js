import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.resolve(__dirname, '..', 'src', 'data', 'regencies');
const masterFilePath = path.resolve(__dirname, 'sources', 'indonesia-kab-master.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const MASTER_URL =
  'https://raw.githubusercontent.com/JfrAziz/indonesia-district/master/kab%2037.geojson';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

function toTitleCase(str) {
  return str.toLowerCase().replace(/(?:^|\s|-)\S/g, (match) => match.toUpperCase());
}

/**
 * Converts GeoJSON features to SVG paths with proportional viewBox and uniform padding.
 */
function convertGeojsonToSvgPaths(features, targetDimension = 600, padding = 30) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  function updateBounds(coords) {
    for (const pt of coords) {
      if (Array.isArray(pt[0])) {
        updateBounds(pt);
      } else {
        const [lon, lat] = pt;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }

  for (const feature of features) {
    if (feature.geometry && feature.geometry.coordinates) {
      updateBounds(feature.geometry.coordinates);
    }
  }

  const midLat = (minLat + maxLat) / 2;
  const latScale = Math.cos((midLat * Math.PI) / 180);
  const xSpan = (maxLon - minLon) * latScale;
  const ySpan = maxLat - minLat;

  const maxSpan = Math.max(xSpan, ySpan);
  const scale = (targetDimension - padding * 2) / maxSpan;
  const drawnWidth = xSpan * scale;
  const drawnHeight = ySpan * scale;

  const viewBoxWidth = Math.round(drawnWidth + padding * 2);
  const viewBoxHeight = Math.round(drawnHeight + padding * 2);

  function project(lon, lat) {
    const x = padding + (lon - minLon) * latScale * scale;
    const y = padding + (maxLat - lat) * scale;
    return [Number(x.toFixed(2)), Number(y.toFixed(2))];
  }

  function ringToPath(ring) {
    if (!ring || ring.length === 0) return '';
    let d = '';
    for (let i = 0; i < ring.length; i++) {
      const [x, y] = project(ring[i][0], ring[i][1]);
      d += i === 0 ? `M${x},${y}` : `L${x},${y}`;
    }
    d += 'Z';
    return d;
  }

  function geometryToPath(geometry) {
    if (geometry.type === 'Polygon') {
      return geometry.coordinates.map(ringToPath).join(' ');
    } else if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.map((poly) => poly.map(ringToPath).join(' ')).join(' ');
    }
    return '';
  }

  const paths = features.map((feature) => ({
    feature,
    d: geometryToPath(feature.geometry),
  }));

  return {
    viewBox: `0 0 ${viewBoxWidth} ${viewBoxHeight}`,
    paths,
  };
}

// Comprehensive BPS Official Metadata Lookup for representative island provinces
const METADATA_LOOKUP = {
  // --- SUMATERA: SUMATERA BARAT (IDSB) ---
  'KEPULAUAN MENTAWAI': {
    id: '1301',
    name: 'Kabupaten Kepulauan Mentawai',
    type: 'Kabupaten',
    capital: 'Tuapejat',
    population: 91200,
    areaKm2: 6011.35,
    description:
      'Gugusan pulau surga selancar ombak kelas dunia (surfing) dan kebudayaan suku Mentawai (Sikerei) yang lestari.',
  },
  'PESISIR SELATAN': {
    id: '1302',
    name: 'Kabupaten Pesisir Selatan',
    type: 'Kabupaten',
    capital: 'Painan',
    population: 515400,
    areaKm2: 5749.89,
    description:
      'Membentang di pesisir barat Minangkabau dengan destinasi bahari Kawasan Mandeh (Raja Ampat-nya Sumatera).',
  },
  SOLOK: {
    id: '1303',
    name: 'Kabupaten Solok',
    type: 'Kabupaten',
    capital: 'Arosuka',
    population: 397800,
    areaKm2: 3738.0,
    description:
      'Lumbung beras bareh Solok, Danau Singkarak, Danau Kembar (Diateh dan Dibawah), serta perkebunan teh Alahan Panjang.',
  },
  SIJUNJUNG: {
    id: '1304',
    name: 'Kabupaten Sijunjung',
    type: 'Kabupaten',
    capital: 'Muaro Sijunjung',
    population: 240400,
    areaKm2: 3130.4,
    description:
      'Kawasan Geopark Nasional Ranah Minang Silokek dan Perkampungan Adat Nagari Sijunjung warisan budaya.',
  },
  'TANAH DATAR': {
    id: '1305',
    name: 'Kabupaten Tanah Datar',
    type: 'Kabupaten',
    capital: 'Batusangkar',
    population: 376400,
    areaKm2: 1336.1,
    description:
      'Luhak Nan Tuo pusat asal-usul kebudayaan Minangkabau, berdirinya Istano Basa Pagaruyung dan Danau Singkarak.',
  },
  'PADANG PARIAMAN': {
    id: '1306',
    name: 'Kabupaten Padang Pariaman',
    type: 'Kabupaten',
    capital: 'Parit Malintang',
    population: 441700,
    areaKm2: 1332.68,
    description:
      'Pesisir barat penyangga ibu kota tempat Bandara Internasional Minangkabau (BIM) berada.',
  },
  AGAM: {
    id: '1307',
    name: 'Kabupaten Agam',
    type: 'Kabupaten',
    capital: 'Lubuk Basung',
    population: 535000,
    areaKm2: 1804.3,
    description:
      'Menghubungkan Danau Maninjau dengan Kelok 44 yang melegenda serta lereng megah Gunung Marapi dan Singgalang.',
  },
  'LIMA PULUH KOTA': {
    id: '1308',
    name: 'Kabupaten Lima Puluh Kota',
    type: 'Kabupaten',
    capital: 'Sarilamak',
    population: 390700,
    areaKm2: 3273.4,
    description:
      'Kawasan lembah tebing granit eksotis Lembah Harau, jembatan layang Kelok 9 megah, dan situs megalitik Belubus.',
  },
  PASAMAN: {
    id: '1309',
    name: 'Kabupaten Pasaman',
    type: 'Kabupaten',
    capital: 'Lubuk Sikaping',
    population: 304300,
    areaKm2: 3947.63,
    description:
      'Daerah lintasan Garis Khatulistiwa (Equator) di Bonjol, tempat kelahiran Pahlawan Nasional Tuanku Imam Bonjol.',
  },
  'SOLOK SELATAN': {
    id: '1310',
    name: 'Kabupaten Solok Selatan',
    type: 'Kabupaten',
    capital: 'Padang Aro',
    population: 184800,
    areaKm2: 3346.2,
    description:
      'Negeri Seribu Rumah Gadang peninggalan arsitektur tradisional Minang di kaki Gunung Kerinci.',
  },
  DHARMASRAYA: {
    id: '1311',
    name: 'Kabupaten Dharmasraya',
    type: 'Kabupaten',
    capital: 'Pulau Punjung',
    population: 233400,
    areaKm2: 2961.13,
    description:
      'Kawasan bersejarah pusat Kerajaan Melayu Dharmasraya kuno dan sentra perkebunan sawit serta karet.',
  },
  'PASAMAN BARAT': {
    id: '1312',
    name: 'Kabupaten Pasaman Barat',
    type: 'Kabupaten',
    capital: 'Simpang Ampek',
    population: 442800,
    areaKm2: 3887.77,
    description:
      'Pesisir barat bergunung dengan puncak Gunung Talamau tertinggi di Sumbar dan pelabuhan laut Teluk Tapang.',
  },
  'KOTA PADANG': {
    id: '1371',
    name: 'Kota Padang',
    type: 'Kota',
    capital: 'Padang',
    population: 928500,
    areaKm2: 693.66,
    description:
      'Ibu kota Provinsi Sumatera Barat, pusat maritim Pantai Padang, Jembatan Siti Nurbaya, dan kuliner rendang mendunia.',
  },
  'KOTA SOLOK': {
    id: '1372',
    name: 'Kota Solok',
    type: 'Kota',
    capital: 'Solok',
    population: 76300,
    areaKm2: 71.29,
    description:
      'Kota Beras Serambi Madinah yang menjadi simpul persimpangan lintas tengah Sumatera.',
  },
  'KOTA SAWAH LUNTO': {
    id: '1373',
    name: 'Kota Sawahlunto',
    type: 'Kota',
    capital: 'Sawahlunto',
    population: 67800,
    areaKm2: 273.45,
    description:
      'Kota warisan tambang batu bara Ombilin yang diakui sebagai Situs Warisan Dunia UNESCO.',
  },
  'KOTA PADANG PANJANG': {
    id: '1374',
    name: 'Kota Padang Panjang',
    type: 'Kota',
    capital: 'Padang Panjang',
    population: 57700,
    areaKm2: 23.0,
    description:
      'Kota Serambi Mekkah berhawa sejuk di perlintasan pegunungan, terkenal dengan Pusat Dokumentasi Minangkabau.',
  },
  'KOTA BUKITTINGGI': {
    id: '1375',
    name: 'Kota Bukittinggi',
    type: 'Kota',
    capital: 'Bukittinggi',
    population: 124400,
    areaKm2: 25.24,
    description:
      'Kota Wisata bersejarah bekas ibu kota PDRI, ikon Jam Gadang, Ngarai Sianok, dan Lobang Jepang.',
  },
  'KOTA PAYAKUMBUH': {
    id: '1376',
    name: 'Kota Payakumbuh',
    type: 'Kota',
    capital: 'Payakumbuh',
    population: 143700,
    areaKm2: 80.43,
    description:
      'Kota kuliner dan pusat perdagangan luhak Limopuluah, terkenal dengan kuliner galamai, batiah, dan rendang.',
  },
  'KOTA PARIAMAN': {
    id: '1377',
    name: 'Kota Pariaman',
    type: 'Kota',
    capital: 'Pariaman',
    population: 96700,
    areaKm2: 66.13,
    description:
      'Kota pesisir pantai barat yang terkenal dengan tradisi pesta budaya bahari Tabuik dan penangkaran penyu.',
  },

  // --- JAWA: JAWA BARAT (IDJB) ---
  BOGOR: {
    id: '3201',
    name: 'Kabupaten Bogor',
    type: 'Kabupaten',
    capital: 'Cibinong',
    population: 5427000,
    areaKm2: 2986.2,
    description:
      'Kabupaten dengan populasi terbesar di Indonesia, terkenal dengan dataran tinggi Puncak, Danau Lido, dan Gunung Salak.',
  },
  SUKABUMI: {
    id: '3202',
    name: 'Kabupaten Sukabumi',
    type: 'Kabupaten',
    capital: 'Palabuhanratu',
    population: 2725000,
    areaKm2: 4145.7,
    description:
      'Kabupaten terluas kedua di Pulau Jawa, menaungi UNESCO Ciletuh-Palabuhanratu Geopark dan pesisir Samudra Hindia.',
  },
  CIANJUR: {
    id: '3203',
    name: 'Kabupaten Cianjur',
    type: 'Kabupaten',
    capital: 'Cianjur',
    population: 2477000,
    areaKm2: 3614.35,
    description:
      'Lumbung beras pandanwangi Jawa Barat, situs megalitikum Gunung Padang, dan Kebun Raya Cibodas di lereng Gunung Gede Pangrango.',
  },
  BANDUNG: {
    id: '3204',
    name: 'Kabupaten Bandung',
    type: 'Kabupaten',
    capital: 'Soreang',
    population: 3666000,
    areaKm2: 1762.4,
    description:
      'Dataran tinggi sejuk perkebunan teh Ciwidey, Kawah Putih, sentra kerajinan sepatu Cibaduyut, dan hulu Sungai Citarum.',
  },
  GARUT: {
    id: '3205',
    name: 'Kabupaten Garut',
    type: 'Kabupaten',
    capital: 'Tarogong Kidul',
    population: 2585000,
    areaKm2: 3074.07,
    description:
      'Dijuluki Swiss van Java, terkenal dengan dodol Garut, kerajinan kulit Sukaregang, serta panorama Gunung Papandayan.',
  },
  TASIKMALAYA: {
    id: '3206',
    name: 'Kabupaten Tasikmalaya',
    type: 'Kabupaten',
    capital: 'Singaparna',
    population: 1865000,
    areaKm2: 2708.82,
    description:
      'Pusat kerajinan anyaman mendong, batik Priangan, Gunung Galunggung, serta pesantren-pesantren bersejarah di Jawa Barat.',
  },
  CIAMIS: {
    id: '3207',
    name: 'Kabupaten Ciamis',
    type: 'Kabupaten',
    capital: 'Ciamis',
    population: 1229000,
    areaKm2: 1597.67,
    description:
      'Bumi Galuh bersejarah dengan situs Karangkamulyan, keindahan alam Cagar Alam Panjalu, dan pertanian agraris.',
  },
  KUNINGAN: {
    id: '3208',
    name: 'Kabupaten Kuningan',
    type: 'Kabupaten',
    capital: 'Kuningan',
    population: 1206000,
    areaKm2: 1195.71,
    description:
      'Kabupaten asri di lereng timur Gunung Ciremai tempat berlangsungnya Perundingan Linggarjati yang bersejarah.',
  },
  CIREBON: {
    id: '3209',
    name: 'Kabupaten Cirebon',
    type: 'Kabupaten',
    capital: 'Sumber',
    population: 2270000,
    areaKm2: 1070.29,
    description:
      'Pusat sentra batik Trusmi megamendung, industri rotan ekspor, dan pelabuhan perdagangan pesisir Laut Jawa.',
  },
  MAJALENGKA: {
    id: '3210',
    name: 'Kabupaten Majalengka',
    type: 'Kabupaten',
    capital: 'Majalengka',
    population: 1305000,
    areaKm2: 1204.24,
    description:
      'Kota Angin yang menaungi Bandara Internasional Jawa Barat (BIJB Kertajati) dan terasering persawahan Panyaweuyan.',
  },
  SUMEDANG: {
    id: '3211',
    name: 'Kabupaten Sumedang',
    type: 'Kabupaten',
    capital: 'Sumedang Utara',
    population: 1152000,
    areaKm2: 1558.72,
    description:
      'Kota Tahu bersejarah bekas Kerajaan Sumedang Larang, menaungi Bendungan Jatigede dan kampus pendidikan Jatinangor.',
  },
  INDRAMAYU: {
    id: '3212',
    name: 'Kabupaten Indramayu',
    type: 'Kabupaten',
    capital: 'Indramayu',
    population: 1834000,
    areaKm2: 2040.11,
    description:
      'Lumbung padi nasional pesisir utara, sentra mangga gedong gincu, kilang minyak Pertamina Balongan, dan pelabuhan nelayan.',
  },
  SUBANG: {
    id: '3213',
    name: 'Kabupaten Subang',
    type: 'Kabupaten',
    capital: 'Subang',
    population: 1595000,
    areaKm2: 2051.76,
    description:
      'Membentang dari Gunung Tangkuban Parahu, pemandian air panas Ciater, hingga Pelabuhan Internasional Patimban.',
  },
  PURWAKARTA: {
    id: '3214',
    name: 'Kabupaten Purwakarta',
    type: 'Kabupaten',
    capital: 'Purwakarta',
    population: 997800,
    areaKm2: 971.72,
    description:
      'Sentra kuliner sate maranggi, Waduk Jatiluhur PLTA pertama Indonesia, dan Taman Air Mancur Sri Baduga.',
  },
  KARAWANG: {
    id: '3215',
    name: 'Kabupaten Karawang',
    type: 'Kabupaten',
    capital: 'Karawang Barat',
    population: 2439000,
    areaKm2: 1913.71,
    description:
      'Kawasan lumbung padi nasional yang bertransformasi menjadi pusat industri otomotif dan elektronik terbesar di Asia Tenggara.',
  },
  BEKASI: {
    id: '3216',
    name: 'Kabupaten Bekasi',
    type: 'Kabupaten',
    capital: 'Cikarang Pusat',
    population: 3113000,
    areaKm2: 1273.88,
    description:
      'Kota Industri Cikarang (GIIC, Jababeka, MM2100) yang menjadi motor penggerak manufaktur nasional.',
  },
  'BANDUNG BARAT': {
    id: '3217',
    name: 'Kabupaten Bandung Barat',
    type: 'Kabupaten',
    capital: 'Ngamprah',
    population: 1788000,
    areaKm2: 1305.77,
    description:
      'Destinasi wisata dataran tinggi Lembang, observatorium Bosscha, kawasan karst Citatah, dan jalur Kereta Cepat Whoosh Padalarang.',
  },
  PANGANDARAN: {
    id: '3218',
    name: 'Kabupaten Pangandaran',
    type: 'Kabupaten',
    capital: 'Parigi',
    population: 423600,
    areaKm2: 1010.0,
    description:
      'Destinasi pariwisata bahari unggulan Jawa Barat dengan Pantai Pangandaran, Green Canyon (Cukang Taneuh), dan konservasi penyu.',
  },
  'KOTA BOGOR': {
    id: '3271',
    name: 'Kota Bogor',
    type: 'Kota',
    capital: 'Bogor',
    population: 1043000,
    areaKm2: 118.5,
    description:
      'Kota Hujan yang memiliki Kebun Raya Bogor tertua di Asia Tenggara, Istana Kepresidenan Bogor, dan IPB University.',
  },
  'KOTA SUKABUMI': {
    id: '3272',
    name: 'Kota Sukabumi',
    type: 'Kota',
    capital: 'Sukabumi',
    population: 346300,
    areaKm2: 48.33,
    description:
      'Kota sejuk di kaki Gunung Gede Pangrango yang menjadi pusat perdagangan dan kuliner khas mochi Sukabumi.',
  },
  'KOTA BANDUNG': {
    id: '3273',
    name: 'Kota Bandung',
    type: 'Kota',
    capital: 'Bandung',
    population: 2444000,
    areaKm2: 167.31,
    description:
      'Ibu kota Jawa Barat, Kota Kembang, pusat industri kreatif, fashion, kuliner, dan perguruan tinggi terkemuka (ITB, Unpad).',
  },
  'KOTA CIREBON': {
    id: '3274',
    name: 'Kota Cirebon',
    type: 'Kota',
    capital: 'Cirebon',
    population: 333300,
    areaKm2: 37.36,
    description:
      'Kota Udang dan pusat peradaban Islam di pesisir Pantura dengan peninggalan Keraton Kasepuhan dan Keraton Kanoman.',
  },
  'KOTA BEKASI': {
    id: '3275',
    name: 'Kota Bekasi',
    type: 'Kota',
    capital: 'Bekasi',
    population: 2543000,
    areaKm2: 210.49,
    description:
      'Kota satelit metropolitan terpadat di timur Jakarta dengan pertumbuhan ekonomi, perumahan, dan pusat komersial yang dinamis.',
  },
  'KOTA DEPOK': {
    id: '3276',
    name: 'Kota Depok',
    type: 'Kota',
    capital: 'Depok',
    population: 2056000,
    areaKm2: 200.29,
    description:
      'Kota Pendidikan tempat Universitas Indonesia (UI) berada, menjadi simpul strategis antara DKI Jakarta dan Bogor.',
  },
  'KOTA CIMAHI': {
    id: '3277',
    name: 'Kota Cimahi',
    type: 'Kota',
    capital: 'Cimahi',
    population: 568400,
    areaKm2: 40.37,
    description:
      'Kota Militer dan animasi kreatif yang terletak strategis di antara Kota Bandung dan Kabupaten Bandung Barat.',
  },
  'KOTA TASIKMALAYA': {
    id: '3278',
    name: 'Kota Tasikmalaya',
    type: 'Kota',
    capital: 'Tasikmalaya',
    population: 716100,
    areaKm2: 171.61,
    description:
      'Pusat perdagangan Priangan Timur yang tersohor dengan bordir Tasik, payung geulis, dan kerajinan tangan.',
  },
  'KOTA BANJAR': {
    id: '3279',
    name: 'Kota Banjar',
    type: 'Kota',
    capital: 'Banjar',
    population: 200900,
    areaKm2: 131.97,
    description:
      'Pintu gerbang jalur selatan Jawa Barat yang berbatasan langsung dengan Jawa Tengah, simpul transportasi darat lintas selatan.',
  },

  // --- BALI & NUSA TENGGARA: BALI (IDBA) ---
  JEMBRANA: {
    id: '5101',
    name: 'Kabupaten Jembrana',
    type: 'Kabupaten',
    capital: 'Negara',
    population: 317100,
    areaKm2: 841.8,
    description:
      'Pintu gerbang barat pulau Bali dengan pelabuhan Gilimanuk dan kawasan konservasi Taman Nasional Bali Barat.',
  },
  TABANAN: {
    id: '5102',
    name: 'Kabupaten Tabanan',
    type: 'Kabupaten',
    capital: 'Tabanan',
    population: 462700,
    areaKm2: 849.31,
    description:
      'Lumbung beras Bali yang terkenal dengan lanskap sawah terasering Jatiluwih (UNESCO) dan Pura Tanah Lot.',
  },
  BADUNG: {
    id: '5103',
    name: 'Kabupaten Badung',
    type: 'Kabupaten',
    capital: 'Mangupura',
    population: 549500,
    areaKm2: 398.75,
    description:
      'Pusat pariwisata internasional Bali mencakup Kuta, Seminyak, Canggu, Nusa Dua, dan Pura Uluwatu.',
  },
  GIANYAR: {
    id: '5104',
    name: 'Kabupaten Gianyar',
    type: 'Kabupaten',
    capital: 'Gianyar',
    population: 516300,
    areaKm2: 364.36,
    description:
      'Pusat kebudayaan, seni lukis, tari, dan kerajinan Bali berpusat di Ubud.',
  },
  KLUNGKUNG: {
    id: '5105',
    name: 'Kabupaten Klungkung',
    type: 'Kabupaten',
    capital: 'Semarapura',
    population: 207000,
    areaKm2: 313.96,
    description:
      'Pusat sejarah Kerajaan Klungkung dan mencakup kepulauan eksotis Nusa Penida, Lembongan, dan Ceningan.',
  },
  BANGLI: {
    id: '5106',
    name: 'Kabupaten Bangli',
    type: 'Kabupaten',
    capital: 'Bangli',
    population: 258700,
    areaKm2: 526.76,
    description:
      'Kabupaten berhawa sejuk tanpa pantai di Bali, memiliki Danau dan Gunung Batur Kintamani serta desa wisata Penglipuran.',
  },
  'KARANG ASEM': {
    id: '5107',
    name: 'Kabupaten Karangasem',
    type: 'Kabupaten',
    capital: 'Amlapura',
    population: 493800,
    areaKm2: 839.54,
    description:
      'Ujung timur Bali tempat berdirinya Gunung Agung dan Pura Agung Besakih, pura terbesar di Bali.',
  },
  BULELENG: {
    id: '5108',
    name: 'Kabupaten Buleleng',
    type: 'Kabupaten',
    capital: 'Singaraja',
    population: 792800,
    areaKm2: 1364.73,
    description:
      'Kabupaten terluas di Bali yang membentang di pesisir utara, terkenal dengan Pantai Lovina dan air terjun Gitgit.',
  },
  'KOTA DENPASAR': {
    id: '5171',
    name: 'Kota Denpasar',
    type: 'Kota',
    capital: 'Denpasar',
    population: 726600,
    areaKm2: 125.98,
    description:
      'Ibu kota Provinsi Bali sekaligus pusat pemerintahan, perekonomian, perdagangan, dan pendidikan.',
  },

  // --- KALIMANTAN: KALIMANTAN TIMUR (IDKI) ---
  PASER: {
    id: '6401',
    name: 'Kabupaten Paser',
    type: 'Kabupaten',
    capital: 'Tanah Grogot',
    population: 283700,
    areaKm2: 11603.94,
    description:
      'Pintu gerbang selatan Kaltim, kaya sumber daya tambang batu bara, kelapa sawit, dan situs Keraton Sadurengas.',
  },
  'KUTAI BARAT': {
    id: '6402',
    name: 'Kabupaten Kutai Barat',
    type: 'Kabupaten',
    capital: 'Sendawar',
    population: 168900,
    areaKm2: 20381.59,
    description:
      'Pedalaman hulu Sungai Mahakam yang kaya seni budaya suku Dayak Benuaq-Tunjung dan cagar alam anggrek Kersik Luway.',
  },
  'KUTAI KARTANEGARA': {
    id: '6403',
    name: 'Kabupaten Kutai Kartanegara',
    type: 'Kabupaten',
    capital: 'Tenggarong',
    population: 752300,
    areaKm2: 27263.1,
    description:
      'Pusat Kerajaan Kutai Martapura tertua di Indonesia, Museum Mulawarman, dan wilayah mitra utama IKN Nusantara.',
  },
  'KUTAI TIMUR': {
    id: '6404',
    name: 'Kabupaten Kutai Timur',
    type: 'Kabupaten',
    capital: 'Sangatta',
    population: 442100,
    areaKm2: 35747.5,
    description:
      'Tambang batu bara terbuka terbesar di dunia di Sangatta, Taman Nasional Kutai, dan karst purba Sangkulirang-Mangkalihat.',
  },
  BERAU: {
    id: '6405',
    name: 'Kabupaten Berau',
    type: 'Kabupaten',
    capital: 'Tanjung Redeb',
    population: 256400,
    areaKm2: 34127.47,
    description:
      'Surga wisata bahari kelas dunia di Kepulauan Derawan, Danau Ubur-ubur Kakaban, dan Maratua.',
  },
  'PENAJAM PASER UTARA': {
    id: '6409',
    name: 'Kabupaten Penajam Paser Utara',
    type: 'Kabupaten',
    capital: 'Penajam',
    population: 184800,
    areaKm2: 3333.06,
    description:
      'Lokasi Kawasan Inti Pusat Pemerintahan (KIPP) Ibu Kota Nusantara (IKN) Indonesia di Kecamatan Sepaku.',
  },
  'MAHAKAM HULU': {
    id: '6411',
    name: 'Kabupaten Mahakam Ulu',
    type: 'Kabupaten',
    capital: 'Ujoh Bilang',
    population: 35600,
    areaKm2: 15315.0,
    description:
      'Wilayah perbatasan jantung Kalimantan di pedalaman riam Sungai Mahakam yang sarat kearifan adat Dayak.',
  },
  'KOTA BALIKPAPAN': {
    id: '6471',
    name: 'Kota Balikpapan',
    type: 'Kota',
    capital: 'Balikpapan',
    population: 727700,
    areaKm2: 503.3,
    description:
      'Kota Minyak pintu gerbang utama Kaltim dengan kilang minyak Pertamina RU V dan Bandara Internasional Sepinggan.',
  },
  'KOTA SAMARINDA': {
    id: '6472',
    name: 'Kota Samarinda',
    type: 'Kota',
    capital: 'Samarinda',
    population: 856400,
    areaKm2: 718.0,
    description:
      'Ibu kota Provinsi Kalimantan Timur yang dibelah Sungai Mahakam, sentra kerajinan sarung tenun Samarinda.',
  },
  'KOTA BONTANG': {
    id: '6474',
    name: 'Kota Bontang',
    type: 'Kota',
    capital: 'Bontang',
    population: 185900,
    areaKm2: 497.57,
    description:
      'Kota Industri petrokimia dan gas alam cair (LNG Badak NGL & Pupuk Kaltim), serta perkampungan atas air Bontang Kuala.',
  },

  // --- SULAWESI: SULAWESI SELATAN (IDSN) ---
  'KEPULAUAN SELAYAR': {
    id: '7301',
    name: 'Kabupaten Kepulauan Selayar',
    type: 'Kabupaten',
    capital: 'Benteng',
    population: 139400,
    areaKm2: 1357.03,
    description:
      'Gugusan kepulauan eksotis di Laut Flores yang menaungi Taman Nasional Taka Bonerate dengan atol karang terbesar ketiga dunia.',
  },
  BULUKUMBA: {
    id: '7302',
    name: 'Kabupaten Bulukumba',
    type: 'Kabupaten',
    capital: 'Ujung Bulu',
    population: 445400,
    areaKm2: 1154.67,
    description:
      'Bumi Panrita Lopi tempat lahirnya mahakarya perahu Pinisi di Tana Beru, Pantai Tanjung Bira, dan adat Ammatoa Kajang.',
  },
  BANTAENG: {
    id: '7303',
    name: 'Kabupaten Bantaeng',
    type: 'Kabupaten',
    capital: 'Bantaeng',
    population: 201300,
    areaKm2: 395.83,
    description:
      'Kabupaten tertua di Sulsel berjuluk Butta Toa, berkembang sebagai kawasan industri smelter nikel dan agrowisata Loka.',
  },
  JENEPONTO: {
    id: '7304',
    name: 'Kabupaten Jeneponto',
    type: 'Kabupaten',
    capital: 'Bontosunggu',
    population: 411300,
    areaKm2: 749.79,
    description:
      'Bumi Turatea penghasil garam dan sentra kuda, terkenal dengan kuliner coto kuda dan pembangkit listrik tenaga bayu (PLTB).',
  },
  TAKALAR: {
    id: '7305',
    name: 'Kabupaten Takalar',
    type: 'Kabupaten',
    capital: 'Pattallassang',
    population: 309600,
    areaKm2: 566.51,
    description:
      'Daerah pesisir selatan penyangga Makassar, terkenal dengan sentra jagung rebus, Pantai Puntondo, dan Pulau Sanrobengi.',
  },
  GOWA: {
    id: '7306',
    name: 'Kabupaten Gowa',
    type: 'Kabupaten',
    capital: 'Sungguminasa',
    population: 785700,
    areaKm2: 1883.33,
    description:
      'Pusat sejarah Kesultanan Gowa Sultan Hasanuddin, Benteng Somba Opu, dan kawasan sejuk Malino di kaki Gunung Bawakaraeng.',
  },
  SINJAI: {
    id: '7307',
    name: 'Kabupaten Sinjai',
    type: 'Kabupaten',
    capital: 'Sinjai Utara',
    population: 264800,
    areaKm2: 819.96,
    description:
      'Bumi Panrita Kitta di pesisir Teluk Bone, terkenal dengan hutan mangrove Tongke-Tongke dan gugusan Pulau Sembilan.',
  },
  MAROS: {
    id: '7308',
    name: 'Kabupaten Maros',
    type: 'Kabupaten',
    capital: 'Turikale',
    population: 407200,
    areaKm2: 1619.11,
    description:
      'Gerbang udara Sulsel di Bandara Sultan Hasanuddin, kawasan karst Rammang-Rammang, dan air terjun Bantimurung.',
  },
  'PANGKAJENE DAN KEPULAUAN': {
    id: '7309',
    name: 'Kabupaten Pangkajene dan Kepulauan',
    type: 'Kabupaten',
    capital: 'Pangkajene',
    population: 351900,
    areaKm2: 1112.29,
    description:
      'Terkenal dengan industri semen Tonasa, gugusan pulau Spermonde, kuliner sop saudara, dan jeruk pangkep.',
  },
  BARRU: {
    id: '7310',
    name: 'Kabupaten Barru',
    type: 'Kabupaten',
    capital: 'Barru',
    population: 189400,
    areaKm2: 1174.72,
    description:
      'Wilayah pesisir Selat Makassar yang dilintasi jalur Kereta Api Trans-Sulawesi pertama dan pelabuhan Garongkong.',
  },
  BONE: {
    id: '7311',
    name: 'Kabupaten Bone',
    type: 'Kabupaten',
    capital: 'Watampone',
    population: 818400,
    areaKm2: 4559.0,
    description:
      'Bumi Arung Palakka pusat sejarah Kerajaan Bone, lumbung beras utama Sulawesi Selatan, dan gua alam Mampu.',
  },
  SOPPENG: {
    id: '7312',
    name: 'Kabupaten Soppeng',
    type: 'Kabupaten',
    capital: 'Watansoppeng',
    population: 240400,
    areaKm2: 1500.0,
    description:
      'Bumi Latemmamala Kota Kalong, terkenal dengan pemandian air panas alami Lejja dan sentra tenun sutera alam.',
  },
  WAJO: {
    id: '7313',
    name: 'Kabupaten Wajo',
    type: 'Kabupaten',
    capital: 'Sengkang',
    population: 407300,
    areaKm2: 2506.19,
    description:
      'Kota Sutera di tepian Danau Tempe dengan perkampungan nelayan rumah terapung yang memesona.',
  },
  'SIDENRENG RAPPANG': {
    id: '7314',
    name: 'Kabupaten Sidenreng Rappang',
    type: 'Kabupaten',
    capital: 'Pangkajene Sidenreng',
    population: 326400,
    areaKm2: 1883.25,
    description:
      'Lumbung beras dan telur ayam modern di Sulsel, lokasi PLTB Sidrap kincir angin raksasa pertama Indonesia.',
  },
  PINRANG: {
    id: '7315',
    name: 'Kabupaten Pinrang',
    type: 'Kabupaten',
    capital: 'Watang Sawitto',
    population: 414800,
    areaKm2: 1961.77,
    description:
      'Daerah pertanian lumbung pangan dan sentra budidaya tambak udang windu terkemuka di pesisir barat Sulsel.',
  },
  ENREKANG: {
    id: '7316',
    name: 'Kabupaten Enrekang',
    type: 'Kabupaten',
    capital: 'Enrekang',
    population: 231900,
    areaKm2: 1786.01,
    description:
      'Bumi Massenrempulu di perbukitan Gunung Nona, penghasil kopi arabika Kalosi Enrekang dan keju dangke tradisional.',
  },
  LUWU: {
    id: '7317',
    name: 'Kabupaten Luwu',
    type: 'Kabupaten',
    capital: 'Belopa',
    population: 375400,
    areaKm2: 3000.25,
    description:
      'Kedatuan Luwu kerajaan tertua di Sulawesi Selatan, kaya hasil perkebunan kakao, cengkih, dan tambang emas Latimojong.',
  },
  'TANA TORAJA': {
    id: '7318',
    name: 'Kabupaten Tana Toraja',
    type: 'Kabupaten',
    capital: 'Makale',
    population: 278900,
    areaKm2: 2054.3,
    description:
      'Jantung kebudayaan Toraja di Makale, terkenal dengan kuburan tebing batu Lemo, upacara Rambu Solo, dan kopi Toraja.',
  },
  'LUWU UTARA': {
    id: '7322',
    name: 'Kabupaten Luwu Utara',
    type: 'Kabupaten',
    capital: 'Masamba',
    population: 325100,
    areaKm2: 7502.58,
    description:
      'Kabupaten terluas di Sulsel yang membentang dari pegunungan terpencil Rongkong hingga pesisir Teluk Bone.',
  },
  'LUWU TIMUR': {
    id: '7324',
    name: 'Kabupaten Luwu Timur',
    type: 'Kabupaten',
    capital: 'Malili',
    population: 312200,
    areaKm2: 6944.98,
    description:
      'Bumi Batara Guru sentra tambang nikel Sorowako (Vale), Danau Matano terdalam di Asia Tenggara, dan Danau Towuti.',
  },
  'TORAJA UTARA': {
    id: '7326',
    name: 'Kabupaten Toraja Utara',
    type: 'Kabupaten',
    capital: 'Rantepao',
    population: 257500,
    areaKm2: 1151.47,
    description:
      'Pusat pariwisata Toraja di Rantepao, rumah adat Tongkonan Kete Kesu, negeri di atas awan Lolai, dan Bori Kalimbuang.',
  },
  'KOTA MAKASSAR': {
    id: '7371',
    name: 'Kota Makassar',
    type: 'Kota',
    capital: 'Makassar',
    population: 1474000,
    areaKm2: 175.77,
    description:
      'Ibu kota Sulawesi Selatan, metropolis maritim terbesar Indonesia Timur, Pantai Losari, Benteng Rotterdam, dan kuliner coto.',
  },
  'KOTA PARE-PARE': {
    id: '7372',
    name: 'Kota Parepare',
    type: 'Kota',
    capital: 'Parepare',
    population: 158400,
    areaKm2: 99.33,
    description:
      'Kota kelahiran Presiden ke-3 RI B.J. Habibie di pesisir Selat Makassar, simpul perdagangan pelabuhan niaga Nusantara.',
  },
  'KOTA PALOPO': {
    id: '7373',
    name: 'Kota Palopo',
    type: 'Kota',
    capital: 'Palopo',
    population: 190900,
    areaKm2: 247.52,
    description:
      'Kota peninggalan Istana Kedatuan Luwu, Masjid Kuno Jami Tua abad ke-17, dan pusat ekonomi Tana Luwu.',
  },

  // --- MALUKU: MALUKU (IDMA) ---
  'MALUKU TENGGARA BARAT': {
    id: '8101',
    name: 'Kabupaten Kepulauan Tanimbar',
    type: 'Kabupaten',
    capital: 'Saumlaki',
    population: 127400,
    areaKm2: 4465.79,
    description:
      'Pintu gerbang tenggara Maluku di Saumlaki, sentra kain tenun ikat Tanimbar, dan lokasi strategis Proyek Gas Masela.',
  },
  'MALUKU TENGGARA': {
    id: '8102',
    name: 'Kabupaten Maluku Tenggara',
    type: 'Kabupaten',
    capital: 'Langgur',
    population: 128400,
    areaKm2: 1031.81,
    description:
      'Kepulauan Kei dengan Pantai Ngurbloat berpasir putih terhalus di dunia dan hukum adat Larvul Ngabal.',
  },
  'MALUKU TENGAH': {
    id: '8103',
    name: 'Kabupaten Maluku Tengah',
    type: 'Kabupaten',
    capital: 'Masohi',
    population: 428200,
    areaKm2: 7953.81,
    description:
      'Jantung Kepulauan Maluku mencakup Pulau Seram dan Kepulauan Banda (Banda Neira) kepulauan rempah pala dunia.',
  },
  BURU: {
    id: '8104',
    name: 'Kabupaten Buru',
    type: 'Kabupaten',
    capital: 'Namlea',
    population: 139400,
    areaKm2: 4932.32,
    description:
      'Bumi Bupolo penghasil minyak kayu putih terbaik di Indonesia dan Danau Rana di pedalaman Pulau Buru.',
  },
  'KEPULAUAN ARU': {
    id: '8105',
    name: 'Kabupaten Kepulauan Aru',
    type: 'Kabupaten',
    capital: 'Dobo',
    population: 105400,
    areaKm2: 8152.42,
    description:
      'Kepulauan Mutiara di perbatasan Laut Arafura, sentra mutiara laut selatan dan kekayaan kepiting bakau.',
  },
  'SERAM BAGIAN BARAT': {
    id: '8106',
    name: 'Kabupaten Seram Bagian Barat',
    type: 'Kabupaten',
    capital: 'Piru',
    population: 215100,
    areaKm2: 5033.38,
    description:
      'Pulau Seram barat dengan panorama Pulau Osi bertitian kayu panjang, Danau Tapala, dan hutan tropis.',
  },
  'SERAM BAGIAN TIMUR': {
    id: '8107',
    name: 'Kabupaten Seram Bagian Timur',
    type: 'Kabupaten',
    capital: 'Bula',
    population: 142300,
    areaKm2: 5779.12,
    description:
      'Penghasil minyak bumi tertua di Bula dan keindahan karst bahari eksotis Teluk Gumumae.',
  },
  'MALUKU BARAT DAYA': {
    id: '8108',
    name: 'Kabupaten Maluku Barat Daya',
    type: 'Kabupaten',
    capital: 'Tiakur',
    population: 92100,
    areaKm2: 4581.06,
    description:
      'Gugusan pulau terluar berbatasan dengan Timor Leste, sentra kerbau Moa dan kain tenun Kisar.',
  },
  'BURU SELATAN': {
    id: '8109',
    name: 'Kabupaten Buru Selatan',
    type: 'Kabupaten',
    capital: 'Namrole',
    population: 78500,
    areaKm2: 3780.56,
    description:
      'Pesisir selatan Pulau Buru dengan Pantai Wamsoba dan kekayaan hasil perikanan serta rempah-rempah.',
  },
  'KOTA AMBON': {
    id: '8171',
    name: 'Kota Ambon',
    type: 'Kota',
    capital: 'Ambon',
    population: 352400,
    areaKm2: 359.45,
    description:
      'Ibu kota Maluku berjuluk Ambon Manise, Kota Musik Dunia (City of Music) UNESCO, dan Jembatan Merah Putih.',
  },
  'KOTA TUAL': {
    id: '8172',
    name: 'Kota Tual',
    type: 'Kota',
    capital: 'Tual',
    population: 91200,
    areaKm2: 254.39,
    description:
      'Kota Beradat di Kepulauan Dullah dan Kur, sentra perikanan laut dan wisata bahari Pulau Bair (Little Raja Ampat).',
  },

  // --- PAPUA: PAPUA (IDPA) ---
  JAYAPURA: {
    id: '9103',
    name: 'Kabupaten Jayapura',
    type: 'Kabupaten',
    capital: 'Sentani',
    population: 202300,
    areaKm2: 11157.15,
    description:
      'Berpusat di Sentani tempat Bandara Internasional Sentani, Danau Sentani festival budaya, dan Pegunungan Cycloop.',
  },
  'KEPULAUAN YAPEN': {
    id: '9105',
    name: 'Kabupaten Kepulauan Yapen',
    type: 'Kabupaten',
    capital: 'Serui',
    population: 115200,
    areaKm2: 2054.28,
    description:
      'Kepulauan di Teluk Cenderawasih berjuluk Kota Kembang Serui, habitat cenderawasih dan kopi Ambaidiru.',
  },
  'BIAK NUMFOR': {
    id: '9106',
    name: 'Kabupaten Biak Numfor',
    type: 'Kabupaten',
    capital: 'Biak',
    population: 147400,
    areaKm2: 2602.0,
    description:
      'Pintu gerbang Pasifik dengan pangkalan Frans Kaisiepo, Monumen Perang Dunia II, dan terumbu karang Padaido.',
  },
  SARMI: {
    id: '9110',
    name: 'Kabupaten Sarmi',
    type: 'Kabupaten',
    capital: 'Sarmi',
    population: 42700,
    areaKm2: 17740.0,
    description:
      'Kota Ombak di pesisir utara Papua yang berhadapan langsung dengan Samudra Pasifik, kaya perikanan laut.',
  },
  KEEROM: {
    id: '9111',
    name: 'Kabupaten Keerom',
    type: 'Kabupaten',
    capital: 'Arso',
    population: 66400,
    areaKm2: 8390.0,
    description:
      'Wilayah perbatasan darat langsung dengan Papua Nugini (PNG), sentra pertanian jagung dan perkebunan sawit.',
  },
  WAROPEN: {
    id: '9115',
    name: 'Kabupaten Waropen',
    type: 'Kabupaten',
    capital: 'Botawa',
    population: 36800,
    areaKm2: 10977.1,
    description:
      'Negeri Sejuta Bakau di pesisir Teluk Cenderawasih yang kaya potensi kepiting bakau dan udang air payau.',
  },
  SUPIORI: {
    id: '9119',
    name: 'Kabupaten Supiori',
    type: 'Kabupaten',
    capital: 'Sorendiweri',
    population: 25100,
    areaKm2: 687.0,
    description:
      'Pulau karang di utara Pulau Biak dengan keindahan Pantai Waekabu dan cagar alam bahari perawan.',
  },
  'MAMBERAMO RAYA': {
    id: '9120',
    name: 'Kabupaten Mamberamo Raya',
    type: 'Kabupaten',
    capital: 'Burmeso',
    population: 39200,
    areaKm2: 23813.91,
    description:
      'Cekungan Sungai Mamberamo terpanjang dan terlebar di Papua, dijuluki Amazon-nya Indonesia.',
  },
  'KOTA JAYAPURA': {
    id: '9171',
    name: 'Kota Jayapura',
    type: 'Kota',
    capital: 'Jayapura',
    population: 407300,
    areaKm2: 940.0,
    description:
      'Ibu kota Provinsi Papua dan kota terbesar di Tanah Papua, Jembatan Youtefa, dan perbatasan internasional Skouw PNG.',
  },
};

// Exactly 1 representative province for each of the 7 island groups in Indonesia
const TARGET_PROVINCES = [
  { id: 'IDSB', name: 'Sumatera Barat', provKey: 'SUMATERA BARAT', island: 'Sumatera' },
  { id: 'IDJB', name: 'Jawa Barat', provKey: 'JAWA BARAT', island: 'Jawa' },
  { id: 'IDBA', name: 'Bali', provKey: 'BALI', island: 'Bali & Nusa Tenggara' },
  {
    id: 'IDKI',
    name: 'Kalimantan Timur',
    provKey: 'KALIMANTAN TIMUR',
    island: 'Kalimantan',
  },
  {
    id: 'IDSN',
    name: 'Sulawesi Selatan',
    provKey: 'SULAWESI SELATAN',
    island: 'Sulawesi',
  },
  { id: 'IDMA', name: 'Maluku', provKey: 'MALUKU', island: 'Maluku' },
  { id: 'IDPA', name: 'Papua', provKey: 'PAPUA', island: 'Papua' },
];

async function main() {
  console.log(
    '--- Generating 1 Regency Dataset for Each Island (Single Master Source) ---',
  );

  if (!fs.existsSync(masterFilePath)) {
    console.log(`Master file not found locally. Downloading from: ${MASTER_URL}`);
    await downloadFile(MASTER_URL, masterFilePath);
    console.log('Master file downloaded successfully.');
  }

  const rawMaster = fs.readFileSync(masterFilePath, 'utf8');
  const masterData = JSON.parse(rawMaster);
  console.log(`Loaded master GeoJSON with ${masterData.features.length} features.`);

  let totalRegenciesGenerated = 0;

  for (const prov of TARGET_PROVINCES) {
    const provFeatures = masterData.features.filter(
      (f) =>
        f.properties &&
        f.properties.prov_name === prov.provKey &&
        f.geometry &&
        f.geometry.coordinates,
    );

    if (provFeatures.length === 0) {
      console.warn(`No features found for province: ${prov.name} (${prov.provKey})`);
      continue;
    }

    const { viewBox, paths } = convertGeojsonToSvgPaths(provFeatures, 600, 30);

    const regencies = paths.map(({ feature, d }, idx) => {
      const rawName = feature.properties.name || '';
      const altName = feature.properties.alt_name || rawName;
      const isKota = altName.toUpperCase().startsWith('KOTA');

      const meta = METADATA_LOOKUP[rawName] || {
        id: `${feature.properties.prov_id || '99'}${String(idx + 1).padStart(2, '0')}`,
        name: toTitleCase(altName),
        type: isKota ? 'Kota' : 'Kabupaten',
        capital: toTitleCase(rawName.replace(/^(KABUPATEN|KOTA)\s+/i, '')),
        population: 500000,
        areaKm2: 800,
        description: `Daerah otonom ${toTitleCase(altName)} di Provinsi ${prov.name}.`,
      };

      return {
        ...meta,
        provinceId: prov.id,
        d,
      };
    });

    const outputData = {
      provinceId: prov.id,
      provinceName: prov.name,
      viewBox,
      regencies,
    };

    const outPath = path.join(outputDir, `${prov.id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2), 'utf8');
    totalRegenciesGenerated += regencies.length;
    console.log(
      `✓ [${prov.island.padEnd(21)}] ${prov.name.padEnd(16)} (${prov.id}): ${String(regencies.length).padStart(2)} kab/kota | viewBox: ${viewBox}`,
    );
  }

  console.log(
    '----------------------------------------------------------------------------',
  );
  console.log(
    `Successfully generated datasets! Total 7 islands, ${totalRegenciesGenerated} regencies.`,
  );
}

main().catch((err) => {
  console.error('Generation failed:', err);
  process.exit(1);
});
