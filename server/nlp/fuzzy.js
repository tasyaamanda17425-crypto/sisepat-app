// ==========================================
// FUZZY MATCHING - Toleransi Typo
// Menggunakan Levenshtein Distance untuk mencocokkan
// nomor perkara dan nama meski ada kesalahan ketik
// ==========================================
const natural = require('natural');

/**
 * Hitung Levenshtein Distance antara dua string
 * Semakin kecil nilai, semakin mirip
 */
function levenshteinDistance(s1, s2) {
  return natural.LevenshteinDistance(
    s1.toLowerCase().trim(),
    s2.toLowerCase().trim()
  );
}

/**
 * Cari string paling mirip dari daftar kandidat
 * @param {string} query - String yang dicari user (mungkin ada typo)
 * @param {string[]} candidates - Array string kandidat untuk dibandingkan
 * @param {number} threshold - Batas maksimum jarak (default: 5, semakin besar semakin permisif)
 * @returns {{ best: string|null, distance: number }}
 */
function findBestMatch(query, candidates, threshold = 5) {
  if (!candidates || candidates.length === 0) return { best: null, distance: Infinity };

  let bestMatch = null;
  let bestDistance = Infinity;

  candidates.forEach(candidate => {
    const dist = levenshteinDistance(query, candidate);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = candidate;
    }
  });

  if (bestDistance <= threshold) {
    return { best: bestMatch, distance: bestDistance };
  }

  return { best: null, distance: bestDistance };
}

/**
 * Ekstrak nomor perkara dari teks user
 * Pola umum nomor perkara PN: 123/Pdt.G/2024/PN Smr
 * @param {string} text - Teks dari user
 * @returns {string|null}
 */
function extractNomorPerkara(text) {
  // Pola: angka/kode/tahun/PN kota (dengan variasi spasi dan format)
  const patterns = [
    /\d+\/[A-Za-z.]+\/\d{4}\/[A-Za-z.\s]+/g,  // format lengkap
    /\d+\/[A-Za-z.]+\/\d{4}/g,                  // tanpa PN di akhir
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return null;
}

/**
 * Ekstrak nomor antrian dari teks user
 * Pola: A-001, A001, a-001, dll
 * @param {string} text
 * @returns {string|null}
 */
function extractNomorAntrian(text) {
  const match = text.match(/[A-Za-z]-?\d{3}/i);
  if (match) return match[0].toUpperCase().replace(/([A-Z])(\d)/, '$1-$2');
  return null;
}

module.exports = { findBestMatch, extractNomorPerkara, extractNomorAntrian, levenshteinDistance };
