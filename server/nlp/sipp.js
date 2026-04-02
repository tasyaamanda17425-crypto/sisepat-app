// ==========================================
// SIPP SCRAPER - Cek Perkara dari Web SIPP
// Mengambil data langsung dari sipp.pn-samarinda.go.id
// ==========================================
const axios = require('axios');
const cheerio = require('cheerio');

const SIPP_BASE = 'http://sipp.pn-samarinda.go.id';

/**
 * Ambil token `enc` dari homepage SIPP (diperlukan untuk search)
 */
async function getEncToken() {
  const res = await axios.get(`${SIPP_BASE}/list_perkara`, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const $ = cheerio.load(res.data);
  const enc = $('input[name="enc"]').first().val();
  if (!enc) throw new Error('enc token tidak ditemukan');
  return enc;
}

/**
 * Cari perkara berdasarkan nomor di SIPP
 * @param {string} nomorPerkara - Nomor perkara (contoh: 250/Pdt.G/2025/PN Smr)
 * @returns {Array} - Array hasil perkara yang ditemukan
 */
async function cariPerkara(nomorPerkara) {
  // Step 1: Ambil enc token
  const enc = await getEncToken();

  // Step 2: POST pencarian
  const params = new URLSearchParams();
  params.append('search_keyword', nomorPerkara);
  params.append('enc', enc);

  const res = await axios.post(`${SIPP_BASE}/list_perkara/search`, params, {
    timeout: 15000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': `${SIPP_BASE}/`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  // Step 3: Parse HTML hasil
  const $ = cheerio.load(res.data);
  const results = [];

  // Ambil total perkara ditemukan
  const totalText = $('.total_perkara').text().trim();

  // Parse tabel hasil
  $('#tablePerkaraAll tbody tr').each((i, row) => {
    const cols = $(row).find('td');
    if (cols.length < 7) return; // skip header row

    const nomorCol = $(cols[1]).text().trim();
    if (!nomorCol || nomorCol === 'Nomor Perkara') return; // skip header

    const detilLink = $(cols[7]).find('a').attr('href');

    results.push({
      nomor: nomorCol,
      tgl_register: $(cols[2]).text().trim(),
      klasifikasi: $(cols[3]).text().trim(),
      para_pihak: $(cols[4]).html()
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/br>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim(),
      status: $(cols[5]).text().trim(),
      lama_proses: $(cols[6]).text().trim(),
      link_detil: detilLink || null,
      link_sipp: detilLink ? detilLink : `${SIPP_BASE}/list_perkara/search`
    });
  });

  return { total: totalText, results };
}

/**
 * Format hasil perkara menjadi teks yang bisa ditampilkan di chatbot
 */
function formatHasilPerkara(data, keyword) {
  const { total, results } = data;

  if (!results || results.length === 0) {
    return `🔍 Perkara "${keyword}" tidak ditemukan di SIPP.\n\nKemungkinan penyebab:\n• Format nomor salah (contoh benar: 250/Pdt.G/2025/PN Smr)\n• Perkara belum terdaftar di sistem\n\nCek manual di: ${SIPP_BASE}/list_perkara`;
  }

  const p = results[0]; // Ambil hasil pertama (paling relevan)

  let reply = `📋 Informasi Perkara dari SIPP\n`;
  reply += `${'─'.repeat(35)}\n`;
  reply += `📌 Nomor: ${p.nomor}\n`;
  reply += `📅 Tgl Register: ${p.tgl_register}\n`;
  reply += `⚖️ Klasifikasi: ${p.klasifikasi}\n`;
  reply += `👥 Para Pihak:\n${p.para_pihak}\n`;
  reply += `📊 Status: ${p.status}\n`;
  reply += `⏱️ Lama Proses: ${p.lama_proses}\n`;

  if (results.length > 1) {
    reply += `\n📄 Ditemukan ${results.length} perkara terkait.\n`;
    reply += `Perkara lain:\n`;
    results.slice(1, 3).forEach(r => {
      reply += `• ${r.nomor} — ${r.klasifikasi} (${r.status})\n`;
    });
  }

  if (p.link_detil) {
    reply += `\n🔗 Detail lengkap: ${p.link_detil}`;
  }

  return reply;
}

module.exports = { cariPerkara, formatHasilPerkara };
