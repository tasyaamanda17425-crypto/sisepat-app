// ==========================================
// TF-IDF RETRIEVAL - FAQ & Layanan Search
// Mencari informasi layanan yang paling relevan
// berdasarkan pertanyaan user
// ==========================================
const natural = require('natural');

const tfidf = new natural.TfIdf();

// ==========================================
// KNOWLEDGE BASE LAYANAN PENGADILAN
// Setiap dokumen = satu layanan/FAQ
// ==========================================
const knowledgeBase = [
  // --- PERDATA ---
  {
    id: 'perdata_gugatan_biasa',
    kategori: 'Perdata',
    judul: 'Pendaftaran Gugatan Biasa',
    keywords: 'gugatan biasa pendaftaran perkara perdata surat gugatan identitas penggugat tergugat',
    konten: `📄 Pendaftaran Perkara Gugatan Biasa

Persyaratan Dokumen:
a. Surat gugatan yang jelas dan tegas, berisi identitas penggugat dan tergugat, ringkasan duduk perkara, dan tuntutan penggugat.
b. Bukti surat yang sudah dilegalisasi, seperti perjanjian atau surat peringatan.
c. Identitas penggugat dan tergugat (KTP, SIM).
d. Soft copy gugatan dalam format Word dan dokumen kelengkapan lain dalam format PDF.
e. Minimal 8 rangkap surat gugatan.
f. Jika penggugat adalah badan hukum, perlu surat kuasa, KTA, berita acara sumpah, dan identitas.`
  },
  {
    id: 'perdata_gugatan_sederhana',
    kategori: 'Perdata',
    judul: 'Pendaftaran Gugatan Sederhana',
    keywords: 'gugatan sederhana small claim court ecourt mahkamah agung',
    konten: `📄 Pendaftaran Perkara Gugatan Sederhana

Persyaratan Dokumen:
a. Surat Gugatan minimal 8 rangkap.
b. Softcopy Dokumen (CD/Flashdisk): file word gugatan, KTP pdf, scan gugatan pdf, scan bukti surat pdf.
c. Penggugat wajib memiliki email aktif.
d. Fotokopi Bukti Pendukung (Kwitansi, Surat Perjanjian, Sertifikat, dsb).
e. Didaftarkan melalui ecourt.mahkamahagung.go.id.`
  },
  {
    id: 'perdata_permohonan',
    kategori: 'Perdata',
    judul: 'Pendaftaran Permohonan',
    keywords: 'permohonan pendaftaran ketua pengadilan pemohon kuasa hukum',
    konten: `📄 Pendaftaran Perkara Permohonan

Persyaratan Dokumen:
a. Hardcopy Surat Permohonan kepada Ketua Pengadilan Negeri (asli bermeterai + 2 salinan).
b. Foto KTP Pemohon dan Softcopy Surat Permohonan (Word + PDF) dalam flash disc/CD.
c. Jika menggunakan kuasa hukum: surat kuasa khusus, fotokopi KTA, dan Berita Acara Sumpah advokat.`
  },
  {
    id: 'perdata_waris',
    kategori: 'Perdata',
    judul: 'Permohonan Waris / Waarmeking',
    keywords: 'waris waarmeking ahli waris akta kematian surat keterangan waris',
    konten: `⚖️ Permohonan Waarmeking (Surat Keterangan Waris)

Persyaratan Dokumen:
a. Surat Permohonan.
b. KTP & KK seluruh Ahli Waris.
c. Akta Kematian, Buku Nikah, Akta Lahir pewaris.
d. Buku Tabungan Pewaris.
e. Surat Keterangan Ahli Waris dari Lurah/Camat.`
  },
  {
    id: 'perdata_verzet',
    kategori: 'Perdata',
    judul: 'Pendaftaran Verzet',
    keywords: 'verzet verstek putusan perlawanan bantahan',
    konten: `📄 Pendaftaran Verzet atas Putusan Verstek

Persyaratan Dokumen:
a. Surat gugatan verzet.
b. Surat kuasa asli (jika menggunakan kuasa).
c. Salinan e-KTP tergugat/kuasa.
d. Alamat email, nomor rekening, dan nomor HP.
e. Didaftarkan melalui ecourt.mahkamahagung.go.id.`
  },
  {
    id: 'perdata_eksekusi',
    kategori: 'Perdata',
    judul: 'Pendaftaran Eksekusi',
    keywords: 'eksekusi permohonan eksekusi putusan berkekuatan hukum tetap pengosongan fidusia',
    konten: `📄 Pendaftaran Permohonan Eksekusi

Persyaratan Dokumen:
a. Surat permohonan yang ditandatangani pemohon atau kuasanya.
b. Identitas diri pemohon dan termohon (KTP).
c. Surat kuasa khusus jika melalui kuasa hukum.
d. Fotokopi salinan putusan yang telah berkekuatan hukum tetap.
e. Dokumen tambahan sesuai jenis (fidusia: akta/sertifikat fidusia, BPKB; pengosongan: data objek eksekusi).`
  },
  {
    id: 'perdata_perubahan_nama',
    kategori: 'Perdata',
    judul: 'Permohonan Perubahan Nama',
    keywords: 'perubahan nama ganti nama akta kelahiran SKCK',
    konten: `📄 Permohonan Perubahan Nama

Persyaratan Dokumen:
a. KTP Pemohon.
b. Kutipan Akta Kelahiran orang yang hendak diubah namanya.
c. Kartu Keluarga.
d. Surat Keterangan Berkelakuan Baik (SKCK).
e. Surat Keterangan Tidak Pernah Dipidana.
f. Semua bukti surat difotokopi + meterai + cap Kantor Pos.`
  },
  {
    id: 'perdata_pencatatan_kematian',
    kategori: 'Perdata',
    judul: 'Pencatatan Kematian',
    keywords: 'pencatatan kematian akta kematian meninggal surat keterangan kematian',
    konten: `📄 Permohonan Pencatatan Kematian

Persyaratan Dokumen:
a. KTP Pemohon.
b. Kutipan Akta Kelahiran mendiang.
c. Surat Keterangan Desa tentang kematian.
d. Surat Keterangan dari Dinas Kependudukan dan Pencatatan Sipil (jika perlu).
e. Semua bukti surat difotokopi + meterai + cap Kantor Pos.`
  },
  {
    id: 'perdata_pengampuan',
    kategori: 'Perdata',
    judul: 'Pendaftaran Hak Pengampuan',
    keywords: 'pengampuan hak pengampuan wali orang diampu gangguan jiwa',
    konten: `📄 Pendaftaran Hak Pengampuan

Persyaratan Dokumen:
a. KTP Pemohon.
b. Kartu Keluarga.
c. Kutipan Akta Kelahiran dan KK calon orang yang diampu.
d. Surat Pernyataan Kuasa Pengampuan dari keluarga.
e. Surat Keterangan Desa tentang hubungan pemohon dengan yang diampu.
f. Surat Keterangan Dokter/Rumah Sakit tentang keadaan yang diampu.`
  },

  // --- PIDANA ---
  {
    id: 'pidana_izin_besuk',
    kategori: 'Pidana',
    judul: 'Izin Besuk Tahanan',
    keywords: 'izin besuk tahanan rutan lapas narapidana kunjungan',
    konten: `👮 Permohonan Izin Besuk Tahanan

Persyaratan Dokumen:
1. Surat Permohonan Izin Besuk.
2. KTP Pemohon.
3. Nomor HP / email aktif.`
  },
  {
    id: 'pidana_praperadilan',
    kategori: 'Pidana',
    judul: 'Pendaftaran Praperadilan',
    keywords: 'praperadilan penangkapan penahanan tidak sah eberpadu mahkamah agung',
    konten: `👮 Pendaftaran Permohonan Praperadilan

Persyaratan Dokumen:
1. Surat Permohonan Praperadilan (softcopy).
2. Softcopy dokumen permohonan lengkap.
3. Fotocopy KTP pemohon.
4. Surat Kuasa (jika menggunakan kuasa hukum).
5. KTA Kuasa Hukum.
6. Mendaftar ke: eberpadu.mahkamahagung.go.id.`
  },

  // --- PHI ---
  {
    id: 'phi_gugatan',
    kategori: 'PHI',
    judul: 'Gugatan PHI (Perselisihan Hubungan Industrial)',
    keywords: 'PHI gugatan perselisihan hubungan industrial ketenagakerjaan pekerja karyawan sengketa kerja pesangon',
    konten: `🏭 Pendaftaran Gugatan PHI

Persyaratan Dokumen:
1. Asli Surat Anjuran Mediator (7 Rangkap).
2. Asli Surat Gugatan (7 Rangkap).
3. Softcopy Gugatan (Word).
4. Surat Kuasa, KTP, KTA Advokat, Berita Acara Sumpah.
5. Surat Tugas (jika dari perusahaan).
6. Resi Pembayaran Bank.`
  },
  {
    id: 'phi_perjanjian_bersama',
    kategori: 'PHI',
    judul: 'Pendaftaran Perjanjian Bersama',
    keywords: 'perjanjian bersama PHI industrial perusahaan karyawan akta notaris',
    konten: `🏭 Pendaftaran Perjanjian Bersama (PHI)

Persyaratan Dokumen:
1. Surat Permohonan.
2. Fotokopi Perjanjian Bersama (stempel pos).
3. Surat Kuasa Asli Direktur.
4. Fotokopi Tanda Pembayaran, Akta Perusahaan, KTP Pekerja, SPK.`
  },

  // --- HUKUM ---
  {
    id: 'hukum_eraterang',
    kategori: 'Hukum',
    judul: 'Surat Keterangan Tidak Pernah Dihukum (Eraterang)',
    keywords: 'eraterang surat keterangan tidak pernah dihukum SKCK pidana bersih',
    konten: `⚖️ Surat Keterangan (Eraterang)

Persyaratan Dokumen:
1. Surat Permohonan ke Ketua Pengadilan Negeri.
2. Surat Pernyataan bermeterai.
3. Fotokopi KTP, KK, SKCK, Ijazah.
4. Foto 4x6 (2 lembar).
5. Daftar melalui: eraterang.badilum.mahkamahagung.go.id.`
  },
  {
    id: 'hukum_izin_riset',
    kategori: 'Hukum',
    judul: 'Izin Riset / Penelitian',
    keywords: 'izin riset penelitian skripsi tesis mahasiswa kampus pengadilan',
    konten: `⚖️ Permohonan Izin Riset / Penelitian

Persyaratan Dokumen:
1. Surat Permohonan kepada Ketua Pengadilan.
2. Proposal Penelitian.
3. Surat Pengantar dari Kampus/Instansi.
4. Fotokopi KTP Pemohon.`
  },
  {
    id: 'hukum_legalisasi',
    kategori: 'Hukum',
    judul: 'Legalisasi Surat',
    keywords: 'legalisasi surat dokumen pengesahan cap pengadilan',
    konten: `⚖️ Permohonan Legalisasi Surat

Persyaratan Dokumen:
1. Surat Permohonan.
2. Surat Asli dan Fotokopinya.
3. KTP Pemohon.`
  },
  {
    id: 'hukum_surat_kuasa',
    kategori: 'Hukum',
    judul: 'Pendaftaran Surat Kuasa',
    keywords: 'surat kuasa pendaftaran advokat kuasa hukum PNBP',
    konten: `⚖️ Pendaftaran Surat Kuasa

Persyaratan Dokumen:
1. Surat Kuasa Asli beserta fotokopinya.
2. KTP Pemberi Kuasa dan Penerima Kuasa.
3. KTA Advokat / Berita Acara Sumpah, atau Surat Tugas.
4. Pembayaran PNBP.`
  },

  // --- FAQ UMUM ---
  {
    id: 'faq_jam_buka',
    kategori: 'FAQ',
    judul: 'Jam Operasional Pengadilan',
    keywords: 'jam buka tutup operasional pelayanan senin jumat hari kerja',
    konten: `ℹ️ Jam Operasional Pengadilan Negeri Samarinda

Senin - Kamis: 08.00 - 16.00 WITA
Jumat: 08.00 - 11.30 WITA (Istirahat), 13.00 - 16.00 WITA
Sabtu, Minggu, dan Hari Libur Nasional: Tutup

PTSP (Pelayanan Terpadu Satu Pintu) melayani di hari kerja di atas.`
  },
  {
    id: 'faq_lokasi',
    kategori: 'FAQ',
    judul: 'Lokasi dan Kontak Pengadilan',
    keywords: 'alamat lokasi kontak telepon email pengadilan negeri samarinda',
    konten: `ℹ️ Lokasi Pengadilan Negeri Samarinda

Alamat: Jl. Bhayangkara No. 1, Samarinda, Kalimantan Timur
Website: pn-samarinda.go.id
SIPP: sipp.pn-samarinda.go.id

Untuk informasi lebih lanjut, silakan kunjungi langsung atau hubungi melalui website resmi.`
  },
  {
    id: 'faq_alur_pendaftaran',
    kategori: 'FAQ',
    judul: 'Alur Pendaftaran Perkara',
    keywords: 'alur cara prosedur pendaftaran perkara langkah daftar pengadilan',
    konten: `ℹ️ Alur Pendaftaran Perkara di Pengadilan

1. Siapkan dokumen sesuai jenis layanan yang dibutuhkan.
2. Datang ke Loket PTSP Pengadilan Negeri Samarinda.
3. Ambil nomor antrian (bisa booking online melalui aplikasi SISEPAT).
4. Serahkan berkas ke petugas untuk diperiksa kelengkapannya.
5. Lakukan pembayaran biaya perkara (PNBP) jika diperlukan.
6. Terima tanda bukti pendaftaran / nomor perkara.

Beberapa layanan juga bisa didaftarkan secara online melalui ecourt.mahkamahagung.go.id.`
  },
  {
    id: 'faq_tentang_sisepat',
    kategori: 'FAQ',
    judul: 'Tentang Aplikasi SISEPAT',
    keywords: 'sisepat aplikasi apa ini fungsi kegunaan fitur antrian booking',
    konten: `ℹ️ Tentang SISEPAT

SISEPAT (Sistem Informasi Pelayanan Terpadu) adalah aplikasi resmi Pengadilan Negeri Samarinda untuk:
• Booking antrian layanan PTSP online
• Melihat jadwal persidangan
• Melacak status perkara
• Mendapatkan informasi persyaratan layanan

Gunakan menu di atas untuk mulai menggunakan layanan.`
  }
];

// Tambahkan semua dokumen ke TF-IDF index
knowledgeBase.forEach((doc, index) => {
  tfidf.addDocument(`${doc.judul} ${doc.keywords} ${doc.konten}`);
});

/**
 * Cari dokumen paling relevan berdasarkan query user
 * @param {string} query - Teks pertanyaan user
 * @param {number} topN - Jumlah hasil teratas yang dikembalikan
 * @returns {Array} - Array dokumen yang relevan
 */
function retrieve(query, topN = 3) {
  const scores = [];

  tfidf.tfidfs(query, (i, measure) => {
    if (measure > 0) {
      scores.push({ index: i, score: measure, doc: knowledgeBase[i] });
    }
  });

  // Sort by score descending, ambil topN
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, topN).map(s => s.doc);
}

/**
 * Cari dokumen berdasarkan kategori tertentu
 * @param {string} kategori - Nama kategori (Perdata, Pidana, PHI, Hukum, FAQ)
 * @returns {Array} - Semua dokumen dalam kategori tersebut
 */
function retrieveByKategori(kategori) {
  return knowledgeBase.filter(doc =>
    doc.kategori.toLowerCase() === kategori.toLowerCase()
  );
}

module.exports = { retrieve, retrieveByKategori, knowledgeBase };
