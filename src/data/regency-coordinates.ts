import { WeatherCoordinates } from '../interfaces/weather';

/**
 * Official geographic coordinates (administrative center / capital) for 109 regencies & cities
 * across 7 representative provincial island regions of Indonesia.
 */
export const REGENCY_COORDINATES: Record<string, WeatherCoordinates> = {
  // === BALI PROVINCE (IDBA) ===
  '5101': { lat: -8.3575, lng: 114.6194, capital: 'Negara' }, // Jembrana Regency
  '5102': { lat: -8.5411, lng: 115.1244, capital: 'Tabanan' }, // Tabanan Regency
  '5103': { lat: -8.5819, lng: 115.1772, capital: 'Mangupura' }, // Badung Regency
  '5104': { lat: -8.5433, lng: 115.3267, capital: 'Gianyar' }, // Gianyar Regency
  '5105': { lat: -8.5356, lng: 115.405, capital: 'Semarapura' }, // Klungkung Regency
  '5106': { lat: -8.4542, lng: 115.3547, capital: 'Bangli' }, // Bangli Regency
  '5107': { lat: -8.4489, lng: 115.6128, capital: 'Amlapura' }, // Karangasem Regency
  '5108': { lat: -8.112, lng: 115.0882, capital: 'Singaraja' }, // Buleleng Regency
  '5171': { lat: -8.6705, lng: 115.2126, capital: 'Denpasar' }, // Denpasar City

  // === WEST JAVA PROVINCE (IDJB) ===
  '3201': { lat: -6.4828, lng: 106.8525, capital: 'Cibinong' }, // Bogor Regency
  '3202': { lat: -6.9875, lng: 106.5419, capital: 'Palabuhanratu' }, // Sukabumi Regency
  '3203': { lat: -6.8228, lng: 107.1397, capital: 'Cianjur' }, // Cianjur Regency
  '3204': { lat: -7.0253, lng: 107.5197, capital: 'Soreang' }, // Bandung Regency
  '3205': { lat: -7.2278, lng: 107.8967, capital: 'Tarogong Kidul' }, // Garut Regency
  '3206': { lat: -7.3533, lng: 108.1103, capital: 'Singaparna' }, // Tasikmalaya Regency
  '3207': { lat: -7.3275, lng: 108.3542, capital: 'Ciamis' }, // Ciamis Regency
  '3208': { lat: -6.9761, lng: 108.4836, capital: 'Kuningan' }, // Kuningan Regency
  '3209': { lat: -6.7628, lng: 108.4828, capital: 'Sumber' }, // Cirebon Regency
  '3210': { lat: -6.8361, lng: 108.2278, capital: 'Majalengka' }, // Majalengka Regency
  '3211': { lat: -6.8586, lng: 107.9269, capital: 'Sumedang Utara' }, // Sumedang Regency
  '3212': { lat: -6.3264, lng: 108.32, capital: 'Indramayu' }, // Indramayu Regency
  '3213': { lat: -6.5678, lng: 107.76, capital: 'Subang' }, // Subang Regency
  '3214': { lat: -6.5569, lng: 107.4433, capital: 'Purwakarta' }, // Purwakarta Regency
  '3215': { lat: -6.3054, lng: 107.3025, capital: 'Karawang Barat' }, // Karawang Regency
  '3216': { lat: -6.3639, lng: 107.1719, capital: 'Cikarang Pusat' }, // Bekasi Regency
  '3217': { lat: -6.8617, lng: 107.4933, capital: 'Ngamprah' }, // West Bandung Regency
  '3218': { lat: -7.6961, lng: 108.4936, capital: 'Parigi' }, // Pangandaran Regency
  '3271': { lat: -6.5971, lng: 106.806, capital: 'Bogor' }, // Bogor City
  '3272': { lat: -6.9278, lng: 106.9297, capital: 'Sukabumi' }, // Sukabumi City
  '3273': { lat: -6.9175, lng: 107.6191, capital: 'Bandung' }, // Bandung City
  '3274': { lat: -6.732, lng: 108.5523, capital: 'Cirebon' }, // Cirebon City
  '3275': { lat: -6.2383, lng: 106.9756, capital: 'Bekasi' }, // Bekasi City
  '3276': { lat: -6.4025, lng: 106.7942, capital: 'Depok' }, // Depok City
  '3277': { lat: -6.8722, lng: 107.5431, capital: 'Cimahi' }, // Cimahi City
  '3278': { lat: -7.3274, lng: 108.2207, capital: 'Tasikmalaya' }, // Tasikmalaya City
  '3279': { lat: -7.3697, lng: 108.5336, capital: 'Banjar' }, // Banjar City

  // === EAST KALIMANTAN PROVINCE (IDKI) ===
  '6401': { lat: -1.8667, lng: 116.1, capital: 'Tanah Grogot' }, // Paser Regency
  '6402': { lat: -0.2333, lng: 115.7, capital: 'Sendawar' }, // West Kutai Regency
  '6403': { lat: -0.4286, lng: 116.9936, capital: 'Tenggarong' }, // Kutai Kartanegara Regency
  '6404': { lat: 0.4908, lng: 117.5458, capital: 'Sangatta' }, // East Kutai Regency
  '6405': { lat: 2.1611, lng: 117.495, capital: 'Tanjung Redeb' }, // Berau Regency
  '6409': { lat: -1.2422, lng: 116.7744, capital: 'Penajam' }, // Penajam Paser Utara Regency
  '6411': { lat: 0.6333, lng: 115.3, capital: 'Ujoh Bilang' }, // Mahakam Ulu Regency
  '6471': { lat: -1.2654, lng: 116.8312, capital: 'Balikpapan' }, // Balikpapan City
  '6472': { lat: -0.5022, lng: 117.1536, capital: 'Samarinda' }, // Samarinda City
  '6474': { lat: 0.1333, lng: 117.5, capital: 'Bontang' }, // Bontang City

  // === MALUKU PROVINCE (IDMA) ===
  '8101': { lat: -7.9806, lng: 131.3, capital: 'Saumlaki' }, // Tanimbar Islands Regency
  '8102': { lat: -5.6322, lng: 132.7441, capital: 'Langgur' }, // Southeast Maluku Regency
  '8103': { lat: -3.3, lng: 128.9667, capital: 'Masohi' }, // Central Maluku Regency
  '8104': { lat: -3.25, lng: 127.1, capital: 'Namlea' }, // Buru Regency
  '8105': { lat: -5.7667, lng: 134.2167, capital: 'Dobo' }, // Aru Islands Regency
  '8106': { lat: -3.0722, lng: 128.1889, capital: 'Piru' }, // West Seram Regency
  '8107': { lat: -3.1111, lng: 130.4944, capital: 'Bula' }, // East Seram Regency
  '8108': { lat: -8.15, lng: 127.9167, capital: 'Tiakur' }, // Southwest Maluku Regency
  '8109': { lat: -3.85, lng: 126.7167, capital: 'Namrole' }, // South Buru Regency
  '8171': { lat: -3.6958, lng: 128.1831, capital: 'Ambon' }, // Ambon City
  '8172': { lat: -5.6292, lng: 132.7533, capital: 'Tual' }, // Tual City

  // === PAPUA PROVINCE (IDPA) ===
  '9103': { lat: -2.5667, lng: 140.5167, capital: 'Sentani' }, // Jayapura Regency
  '9105': { lat: -1.8833, lng: 136.2333, capital: 'Serui' }, // Yapen Islands Regency
  '9106': { lat: -1.1764, lng: 136.0844, capital: 'Biak' }, // Biak Numfor Regency
  '9110': { lat: -1.8667, lng: 138.75, capital: 'Sarmi' }, // Sarmi Regency
  '9111': { lat: -2.9333, lng: 140.75, capital: 'Arso' }, // Keerom Regency
  '9115': { lat: -2.7167, lng: 136.65, capital: 'Botawa' }, // Waropen Regency
  '9119': { lat: -0.7167, lng: 135.6, capital: 'Sorendiweri' }, // Supiori Regency
  '9120': { lat: -2.25, lng: 137.95, capital: 'Burmeso' }, // Mamberamo Raya Regency
  '9171': { lat: -2.5337, lng: 140.7181, capital: 'Jayapura' }, // Jayapura City

  // === WEST SUMATRA PROVINCE (IDSB) ===
  '1301': { lat: -2.0167, lng: 99.5833, capital: 'Tuapejat' }, // Mentawai Islands Regency
  '1302': { lat: -1.35, lng: 100.5667, capital: 'Painan' }, // Pesisir Selatan Regency
  '1303': { lat: -0.9667, lng: 100.6167, capital: 'Arosuka' }, // Solok Regency
  '1304': { lat: -0.6833, lng: 101.3, capital: 'Muaro Sijunjung' }, // Sijunjung Regency
  '1305': { lat: -0.4608, lng: 100.5925, capital: 'Batusangkar' }, // Tanah Datar Regency
  '1306': { lat: -0.6167, lng: 100.2833, capital: 'Parit Malintang' }, // Padang Pariaman Regency
  '1307': { lat: -0.3167, lng: 100.0833, capital: 'Lubuk Basung' }, // Agam Regency
  '1308': { lat: -0.15, lng: 100.6667, capital: 'Sarilamak' }, // Lima Puluh Kota Regency
  '1309': { lat: 0.1472, lng: 100.1653, capital: 'Lubuk Sikaping' }, // Pasaman Regency
  '1310': { lat: -1.4833, lng: 101.25, capital: 'Padang Aro' }, // South Solok Regency
  '1311': { lat: -1.05, lng: 101.6, capital: 'Pulau Punjung' }, // Dharmasraya Regency
  '1312': { lat: 0.1833, lng: 99.8167, capital: 'Simpang Ampek' }, // West Pasaman Regency
  '1371': { lat: -0.9471, lng: 100.4172, capital: 'Padang' }, // Padang City
  '1372': { lat: -0.7989, lng: 100.6589, capital: 'Solok' }, // Solok City
  '1373': { lat: -0.6806, lng: 100.7789, capital: 'Sawahlunto' }, // Sawahlunto City
  '1374': { lat: -0.4639, lng: 100.4, capital: 'Padang Panjang' }, // Padang Panjang City
  '1375': { lat: -0.3056, lng: 100.3692, capital: 'Bukittinggi' }, // Bukittinggi City
  '1376': { lat: -0.2247, lng: 100.6331, capital: 'Payakumbuh' }, // Payakumbuh City
  '1377': { lat: -0.6264, lng: 100.1206, capital: 'Pariaman' }, // Pariaman City

  // === SOUTH SULAWESI PROVINCE (IDSN) ===
  '7301': { lat: -6.1167, lng: 120.4667, capital: 'Benteng' }, // Selayar Islands Regency
  '7302': { lat: -5.55, lng: 120.1833, capital: 'Ujung Bulu' }, // Bulukumba Regency
  '7303': { lat: -5.55, lng: 119.95, capital: 'Bantaeng' }, // Bantaeng Regency
  '7304': { lat: -5.6833, lng: 119.7333, capital: 'Bontosunggu' }, // Jeneponto Regency
  '7305': { lat: -5.4167, lng: 119.45, capital: 'Pattallassang' }, // Takalar Regency
  '7306': { lat: -5.2, lng: 119.45, capital: 'Sungguminasa' }, // Gowa Regency
  '7307': { lat: -5.1333, lng: 120.25, capital: 'Sinjai Utara' }, // Sinjai Regency
  '7308': { lat: -5.0, lng: 119.5667, capital: 'Turikale' }, // Maros Regency
  '7309': { lat: -4.8333, lng: 119.55, capital: 'Pangkajene' }, // Pangkajene and Islands Regency
  '7310': { lat: -4.4167, lng: 119.6167, capital: 'Barru' }, // Barru Regency
  '7311': { lat: -4.5386, lng: 120.3283, capital: 'Watampone' }, // Bone Regency
  '7312': { lat: -4.35, lng: 119.8833, capital: 'Watansoppeng' }, // Soppeng Regency
  '7313': { lat: -4.1333, lng: 120.0333, capital: 'Sengkang' }, // Wajo Regency
  '7314': { lat: -3.9333, lng: 119.8, capital: 'Pangkajene Sidenreng' }, // Sidenreng Rappang Regency
  '7315': { lat: -3.7833, lng: 119.65, capital: 'Watang Sawitto' }, // Pinrang Regency
  '7316': { lat: -3.55, lng: 119.7667, capital: 'Enrekang' }, // Enrekang Regency
  '7317': { lat: -3.35, lng: 120.35, capital: 'Belopa' }, // Luwu Regency
  '7318': { lat: -3.1025, lng: 119.851, capital: 'Makale' }, // Tana Toraja Regency
  '7322': { lat: -2.5667, lng: 120.3167, capital: 'Masamba' }, // North Luwu Regency
  '7324': { lat: -2.5833, lng: 121.1667, capital: 'Malili' }, // East Luwu Regency
  '7326': { lat: -2.9667, lng: 119.9, capital: 'Rantepao' }, // North Toraja Regency
  '7371': { lat: -5.1477, lng: 119.4327, capital: 'Makassar' }, // Makassar City
  '7372': { lat: -4.0139, lng: 119.625, capital: 'Parepare' }, // Parepare City
  '7373': { lat: -2.9944, lng: 120.1969, capital: 'Palopo' }, // Palopo City
};
