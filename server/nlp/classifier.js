// ==========================================
// NAIVE BAYES CLASSIFIER - Intent Recognition
// Mengenali maksud/intent dari kalimat user
// ==========================================
const natural = require('natural');

const classifier = new natural.BayesClassifier();

// --- TRAINING DATA ---
// Setiap baris = (contoh kalimat user, label intent)

// JADWAL SIDANG
classifier.addDocument('jadwal sidang', 'JADWAL_SIDANG');
classifier.addDocument('jadwal persidangan', 'JADWAL_SIDANG');
classifier.addDocument('kapan sidang', 'JADWAL_SIDANG');
classifier.addDocument('tanggal sidang', 'JADWAL_SIDANG');
classifier.addDocument('jadwal hari ini', 'JADWAL_SIDANG');
classifier.addDocument('jadwal besok', 'JADWAL_SIDANG');
classifier.addDocument('sidang hari ini', 'JADWAL_SIDANG');
classifier.addDocument('lihat jadwal', 'JADWAL_SIDANG');
classifier.addDocument('info sidang', 'JADWAL_SIDANG');
classifier.addDocument('cek jadwal sidang', 'JADWAL_SIDANG');
classifier.addDocument('mau lihat jadwal persidangan', 'JADWAL_SIDANG');
classifier.addDocument('jadwal perkara', 'JADWAL_SIDANG');
classifier.addDocument('agenda sidang', 'JADWAL_SIDANG');
classifier.addDocument('hakim siapa yang sidang', 'JADWAL_SIDANG');
classifier.addDocument('ruangan sidang', 'JADWAL_SIDANG');

// STATUS / CEK PERKARA
classifier.addDocument('cek perkara', 'STATUS_PERKARA');
classifier.addDocument('status perkara', 'STATUS_PERKARA');
classifier.addDocument('nomor perkara', 'STATUS_PERKARA');
classifier.addDocument('lacak perkara', 'STATUS_PERKARA');
classifier.addDocument('info perkara', 'STATUS_PERKARA');
classifier.addDocument('perkara saya', 'STATUS_PERKARA');
classifier.addDocument('cek kasus', 'STATUS_PERKARA');
classifier.addDocument('status kasus', 'STATUS_PERKARA');
classifier.addDocument('perkara nomor', 'STATUS_PERKARA');
classifier.addDocument('mau cek perkara', 'STATUS_PERKARA');
classifier.addDocument('cek status antrian', 'STATUS_PERKARA');
classifier.addDocument('nomor antrian saya', 'STATUS_PERKARA');
classifier.addDocument('status antrian', 'STATUS_PERKARA');
classifier.addDocument('cek antrian', 'STATUS_PERKARA');

// LAYANAN PERDATA
classifier.addDocument('daftar gugatan', 'LAYANAN_PERDATA');
classifier.addDocument('gugatan cerai', 'LAYANAN_PERDATA');
classifier.addDocument('gugatan biasa', 'LAYANAN_PERDATA');
classifier.addDocument('gugatan sederhana', 'LAYANAN_PERDATA');
classifier.addDocument('permohonan waris', 'LAYANAN_PERDATA');
classifier.addDocument('permohonan cerai', 'LAYANAN_PERDATA');
classifier.addDocument('layanan perdata', 'LAYANAN_PERDATA');
classifier.addDocument('perkara perdata', 'LAYANAN_PERDATA');
classifier.addDocument('daftar perkara perdata', 'LAYANAN_PERDATA');
classifier.addDocument('eksekusi putusan', 'LAYANAN_PERDATA');
classifier.addDocument('permohonan eksekusi', 'LAYANAN_PERDATA');
classifier.addDocument('permohonan perubahan nama', 'LAYANAN_PERDATA');
classifier.addDocument('perbaikan akta', 'LAYANAN_PERDATA');
classifier.addDocument('pencatatan kematian', 'LAYANAN_PERDATA');
classifier.addDocument('permohonan pengampuan', 'LAYANAN_PERDATA');
classifier.addDocument('konsinyasi', 'LAYANAN_PERDATA');
classifier.addDocument('verzet', 'LAYANAN_PERDATA');
classifier.addDocument('perlawanan putusan', 'LAYANAN_PERDATA');
classifier.addDocument('syarat gugatan cerai', 'LAYANAN_PERDATA');
classifier.addDocument('cara daftar gugatan', 'LAYANAN_PERDATA');
classifier.addDocument('sengketa tanah', 'LAYANAN_PERDATA');
classifier.addDocument('sengketa harta', 'LAYANAN_PERDATA');

// LAYANAN PIDANA
classifier.addDocument('layanan pidana', 'LAYANAN_PIDANA');
classifier.addDocument('izin besuk', 'LAYANAN_PIDANA');
classifier.addDocument('besuk tahanan', 'LAYANAN_PIDANA');
classifier.addDocument('praperadilan', 'LAYANAN_PIDANA');
classifier.addDocument('daftar praperadilan', 'LAYANAN_PIDANA');
classifier.addDocument('perkara pidana', 'LAYANAN_PIDANA');
classifier.addDocument('kasus pidana', 'LAYANAN_PIDANA');
classifier.addDocument('syarat besuk', 'LAYANAN_PIDANA');
classifier.addDocument('cara daftar praperadilan', 'LAYANAN_PIDANA');

// LAYANAN PHI (HUBUNGAN INDUSTRIAL)
classifier.addDocument('layanan phi', 'LAYANAN_PHI');
classifier.addDocument('gugatan phi', 'LAYANAN_PHI');
classifier.addDocument('perselisihan kerja', 'LAYANAN_PHI');
classifier.addDocument('perselisihan hubungan industrial', 'LAYANAN_PHI');
classifier.addDocument('perkara phi', 'LAYANAN_PHI');
classifier.addDocument('perjanjian bersama', 'LAYANAN_PHI');
classifier.addDocument('sengketa ketenagakerjaan', 'LAYANAN_PHI');
classifier.addDocument('dipecat tidak adil', 'LAYANAN_PHI');
classifier.addDocument('hak karyawan', 'LAYANAN_PHI');

// LAYANAN HUKUM (WAARMEKING, ERATERANG, DLL)
classifier.addDocument('layanan hukum', 'LAYANAN_HUKUM');
classifier.addDocument('waarmeking', 'LAYANAN_HUKUM');
classifier.addDocument('surat keterangan waris', 'LAYANAN_HUKUM');
classifier.addDocument('eraterang', 'LAYANAN_HUKUM');
classifier.addDocument('surat keterangan tidak pernah dihukum', 'LAYANAN_HUKUM');
classifier.addDocument('izin riset', 'LAYANAN_HUKUM');
classifier.addDocument('penelitian di pengadilan', 'LAYANAN_HUKUM');
classifier.addDocument('legalisasi surat', 'LAYANAN_HUKUM');
classifier.addDocument('daftar surat kuasa', 'LAYANAN_HUKUM');
classifier.addDocument('pendaftaran surat kuasa', 'LAYANAN_HUKUM');
classifier.addDocument('info perkara lama', 'LAYANAN_HUKUM');
classifier.addDocument('turunan putusan', 'LAYANAN_HUKUM');
classifier.addDocument('salinan putusan', 'LAYANAN_HUKUM');

// FAQ UMUM
classifier.addDocument('jam buka', 'FAQ_UMUM');
classifier.addDocument('jam operasional', 'FAQ_UMUM');
classifier.addDocument('jam pelayanan', 'FAQ_UMUM');
classifier.addDocument('alamat pengadilan', 'FAQ_UMUM');
classifier.addDocument('lokasi pengadilan', 'FAQ_UMUM');
classifier.addDocument('dimana pengadilan', 'FAQ_UMUM');
classifier.addDocument('nomor telepon pengadilan', 'FAQ_UMUM');
classifier.addDocument('kontak pengadilan', 'FAQ_UMUM');
classifier.addDocument('biaya pendaftaran', 'FAQ_UMUM');
classifier.addDocument('cara mendaftar', 'FAQ_UMUM');
classifier.addDocument('prosedur pengadilan', 'FAQ_UMUM');
classifier.addDocument('alur pendaftaran', 'FAQ_UMUM');
classifier.addDocument('informasi pengadilan', 'FAQ_UMUM');
classifier.addDocument('apa itu ptsp', 'FAQ_UMUM');
classifier.addDocument('layanan apa saja', 'FAQ_UMUM');
classifier.addDocument('menu layanan', 'FAQ_UMUM');
classifier.addDocument('bantuan', 'FAQ_UMUM');
classifier.addDocument('help', 'FAQ_UMUM');

// GREETING
classifier.addDocument('halo', 'GREETING');
classifier.addDocument('hai', 'GREETING');
classifier.addDocument('hello', 'GREETING');
classifier.addDocument('selamat pagi', 'GREETING');
classifier.addDocument('selamat siang', 'GREETING');
classifier.addDocument('selamat sore', 'GREETING');
classifier.addDocument('selamat malam', 'GREETING');
classifier.addDocument('assalamualaikum', 'GREETING');
classifier.addDocument('permisi', 'GREETING');
classifier.addDocument('hei', 'GREETING');

// TERIMA KASIH
classifier.addDocument('terima kasih', 'THANKS');
classifier.addDocument('makasih', 'THANKS');
classifier.addDocument('thanks', 'THANKS');
classifier.addDocument('thx', 'THANKS');
classifier.addDocument('oke terima kasih', 'THANKS');
classifier.addDocument('sudah cukup', 'THANKS');

// Train model
classifier.train();

/**
 * Klasifikasikan intent dari teks user
 * @param {string} text - Input teks dari user
 * @returns {{ intent: string, confidence: number }}
 */
function classify(text) {
  const normalizedText = text.toLowerCase().trim();
  const intent = classifier.classify(normalizedText);
  return { intent };
}

module.exports = { classify };
