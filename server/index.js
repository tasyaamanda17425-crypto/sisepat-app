const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { classify } = require('./nlp/classifier');
const { retrieve, retrieveByKategori } = require('./nlp/retrieval');
const { extractNomorPerkara, extractNomorAntrian } = require('./nlp/fuzzy');
const { cariPerkara, formatHasilPerkara } = require('./nlp/sipp');

const app = express();
const PORT = 3001; 

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sisepat_db'
});

db.connect((err) => {
  if (err) console.error('❌ Gagal koneksi MySQL:', err);
  else console.log('✅ Terhubung ke Database MySQL: sisepat_db');
});

// --- API PUBLIK ---

app.post('/api/login', (req, res) => {
  const { nik, password } = req.body;
  db.query("SELECT * FROM users WHERE nik = ? AND password = ?", [nik, password], (err, result) => {
    if (err) return res.status(500).json({error: err.message});
    if (result.length > 0) res.json({ user: result[0] });
    else res.status(401).json({ message: "Gagal Login" });
  });
});

app.get('/api/layanan', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  // Menghitung sisa kuota real-time
  const sql = `
    SELECT l.*, 
    (l.kuota_harian - (SELECT COUNT(*) FROM bookings b WHERE b.layanan_id = l.id AND b.tgl = ?)) as sisa_kuota
    FROM layanan l
  `;
  db.query(sql, [today], (err, result) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(result);
  });
});

// BOOKING BARU (DENGAN PENGECEKAN KUOTA)
app.post('/api/booking', (req, res) => {
  const { layanan_id, tgl, nama_tamu, nik_tamu } = req.body;
  
  // 1. Cek Kuota Dulu
  const sqlCheck = `
    SELECT (l.kuota_harian - (SELECT COUNT(*) FROM bookings b WHERE b.layanan_id = l.id AND b.tgl = ?)) as sisa 
    FROM layanan l WHERE l.id = ?`;
    
  db.query(sqlCheck, [tgl, layanan_id], (err, result) => {
    if (err) return res.status(500).json({error: err.message});
    
    if (result[0].sisa <= 0) {
      return res.status(400).json({ message: "Mohon maaf, Kuota hari ini sudah habis!" });
    }

    // 2. Kalau kuota aman, Lanjut Insert
    const sqlCount = "SELECT COUNT(*) as total FROM bookings WHERE layanan_id = ? AND tgl = ?";
    db.query(sqlCount, [layanan_id, tgl], (err, resCount) => {
      const antrianKe = resCount[0].total + 1;
      const no_antrian = `A-${String(antrianKe).padStart(3, '0')}`;
      
      const sqlInsert = "INSERT INTO bookings (layanan_id, no_antrian, tgl, status, nama_tamu, nik_tamu) VALUES (?, ?, ?, 'pending', ?, ?)";
      db.query(sqlInsert, [layanan_id, no_antrian, tgl, nama_tamu, nik_tamu], (err, ins) => {
        if(err) return res.status(500).json({error: err.message});
        res.json({ message: "Sukses", no_antrian });
      });
    });
  });
});

app.get('/api/booking/status', (req, res) => {
  const { no_antrian } = req.query;
  const sql = `SELECT b.no_antrian, b.status, b.nama_tamu, l.nama_layanan FROM bookings b JOIN layanan l ON b.layanan_id = l.id WHERE b.no_antrian = ?`;
  db.query(sql, [no_antrian], (err, result) => {
    if(result.length > 0) res.json(result[0]);
    else res.status(404).json({ message: "Tidak ditemukan" });
  });
});

app.get('/api/jadwal', (req, res) => {
  db.query("SELECT * FROM jadwal_sidang ORDER BY tanggal DESC", (err, result) => res.json(result));
});

// PELACAKAN PERKARA (TIMELINE)
app.get('/api/perkara/:nomor', (req, res) => {
  // Karena nomor perkara mengandung slash (/), user harus encodeURIComponent di frontend, 
  // tapi express otomatis decode params.
  const nomor = req.params.nomor; 
  db.query("SELECT * FROM perkara WHERE nomor_perkara = ?", [nomor], (err, result) => {
    if(err) return res.status(500).json({error: err.message});
    if(result.length > 0) res.json(result[0]);
    else res.status(404).json({ message: "Perkara tidak ditemukan" });
  });
});

// --- API ADMIN ---

app.get('/api/admin/bookings', (req, res) => {
  const sql = `SELECT b.*, l.nama_layanan FROM bookings b JOIN layanan l ON b.layanan_id = l.id ORDER BY b.id DESC`;
  db.query(sql, (err, result) => res.json(result));
});

// UPDATE STATUS ANTRIAN (Panggil / Tunda / Selesai)
app.put('/api/bookings/:id/status', (req, res) => {
  const { status } = req.body; // 'called', 'postponed', 'completed'
  db.query("UPDATE bookings SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
    if(err) return res.status(500).json({error: err.message});
    res.json({msg: "Status updated"});
  });
});

app.delete('/api/bookings/:id', (req, res) => {
  db.query("DELETE FROM bookings WHERE id = ?", [req.params.id], (err) => res.json({msg: "Ok"}));
});

// CRUD JADWAL SIDANG
app.post('/api/admin/jadwal', (req, res) => {
  const { tanggal, jam, ruangan, nomor_perkara, agenda, hakim } = req.body;
  const sql = "INSERT INTO jadwal_sidang (tanggal, jam, ruangan, nomor_perkara, agenda, hakim) VALUES (?,?,?,?,?,?)";
  db.query(sql, [tanggal, jam, ruangan, nomor_perkara, agenda, hakim], (err) => res.json({msg: "Saved"}));
});

app.put('/api/admin/jadwal/:id', (req, res) => {
  const { tanggal, jam, ruangan, nomor_perkara, agenda, hakim } = req.body;
  const sql = "UPDATE jadwal_sidang SET tanggal=?, jam=?, ruangan=?, nomor_perkara=?, agenda=?, hakim=? WHERE id=?";
  db.query(sql, [tanggal, jam, ruangan, nomor_perkara, agenda, hakim, req.params.id], (err) => res.json({msg: "Updated"}));
});

app.delete('/api/admin/jadwal/:id', (req, res) => {
  db.query("DELETE FROM jadwal_sidang WHERE id=?", [req.params.id], (err) => res.json({msg: "Deleted"}));
});

app.put('/api/admin/layanan/:id', (req, res) => {
  const { kuota } = req.body;
  db.query("UPDATE layanan SET kuota_harian = ? WHERE id = ?", [kuota, req.params.id], (err) => res.json({msg: "Updated"}));
});

// ==========================================
// ENDPOINT CHATBOT NLP
// POST /api/chat
// Body: { "message": "teks dari user" }
// ==========================================
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.json({ reply: 'Mohon ketik pertanyaan Anda terlebih dahulu.' });
  }

  const text = message.trim();

  // Step 1: Kenali intent
  const { intent } = classify(text);

  // Step 2: Proses berdasarkan intent
  switch (intent) {

    case 'GREETING':
      return res.json({
        intent,
        reply: 'Halo! Selamat datang di SISEPAT - Pengadilan Negeri Samarinda. 👋\n\nSaya siap membantu Anda dengan informasi:\n• Jadwal Sidang\n• Persyaratan Layanan (Perdata, Pidana, PHI, dll)\n• Status Perkara / Antrian\n• FAQ Pengadilan\n\nSilakan ketik pertanyaan Anda!'
      });

    case 'THANKS':
      return res.json({
        intent,
        reply: 'Sama-sama! Semoga urusan Anda di Pengadilan Negeri Samarinda berjalan lancar. 🙏\n\nAda yang bisa saya bantu lagi?'
      });

    case 'JADWAL_SIDANG': {
      // Ambil jadwal dari database
      db.query("SELECT * FROM jadwal_sidang ORDER BY tanggal DESC LIMIT 10", (err, rows) => {
        if (err || !rows || rows.length === 0) {
          return res.json({
            intent,
            reply: 'Saat ini belum ada data jadwal sidang yang tersedia di sistem.\n\nUntuk jadwal sidang terbaru, silakan kunjungi:\n🔗 sipp.pn-samarinda.go.id'
          });
        }

        const jadwalText = rows.slice(0, 5).map(j =>
          `• ${j.tanggal} | ${j.jam} | ${j.ruangan}\n  No. Perkara: ${j.nomor_perkara}\n  Agenda: ${j.agenda} | Hakim: ${j.hakim}`
        ).join('\n\n');

        return res.json({
          intent,
          reply: `📅 Jadwal Sidang Terbaru:\n\n${jadwalText}\n\n${rows.length > 5 ? `...dan ${rows.length - 5} jadwal lainnya.` : ''}\n\nUntuk jadwal lengkap: sipp.pn-samarinda.go.id`
        });
      });
      break;
    }

    case 'STATUS_PERKARA': {
      const nomorPerkara = extractNomorPerkara(text);
      const nomorAntrian = extractNomorAntrian(text);

      if (nomorPerkara) {
        // Cari langsung ke SIPP (data real-time)
        cariPerkara(nomorPerkara)
          .then(data => {
            const reply = formatHasilPerkara(data, nomorPerkara);
            return res.json({ intent, reply });
          })
          .catch(() => {
            // Fallback ke DB lokal jika SIPP tidak bisa diakses
            db.query("SELECT * FROM perkara WHERE nomor_perkara = ?", [nomorPerkara], (err, rows) => {
              if (err || !rows || rows.length === 0) {
                return res.json({
                  intent,
                  reply: `🔍 Perkara "${nomorPerkara}" tidak ditemukan.\n\nCek langsung di:\n🔗 http://sipp.pn-samarinda.go.id/list_perkara`
                });
              }
              const p = rows[0];
              return res.json({
                intent,
                reply: `📋 Perkara: ${p.nomor_perkara}\nStatus: ${p.status || '-'}\n\nDetail: http://sipp.pn-samarinda.go.id`
              });
            });
          });
      } else if (nomorAntrian) {
        const sql = `SELECT b.no_antrian, b.status, b.nama_tamu, l.nama_layanan FROM bookings b JOIN layanan l ON b.layanan_id = l.id WHERE b.no_antrian = ?`;
        db.query(sql, [nomorAntrian], (err, rows) => {
          if (err || !rows || rows.length === 0) {
            return res.json({
              intent,
              reply: `🔍 Nomor antrian "${nomorAntrian}" tidak ditemukan.\n\nPastikan format benar, contoh: A-001`
            });
          }
          const a = rows[0];
          const statusLabel = {
            pending: '⏳ Menunggu',
            called: '📢 Dipanggil',
            postponed: '🔁 Ditunda',
            completed: '✅ Selesai'
          }[a.status] || a.status;
          return res.json({
            intent,
            reply: `🎫 Status Antrian ${a.no_antrian}:\nNama: ${a.nama_tamu}\nLayanan: ${a.nama_layanan}\nStatus: ${statusLabel}`
          });
        });
      } else {
        return res.json({
          intent,
          reply: `🔍 Untuk cek status perkara, silakan sebutkan nomornya.\n\nContoh:\n• "cek perkara 250/Pdt.G/2025/PN Smr"\n• "status antrian A-001"`
        });
      }
      break;
    }

    case 'LAYANAN_PERDATA': {
      const results = retrieve(text);
      const perdata = results.filter(r => r.kategori === 'Perdata');
      if (perdata.length > 0) {
        return res.json({ intent, reply: perdata[0].konten });
      }
      // Fallback: tampilkan daftar layanan perdata
      const listPerdata = retrieveByKategori('Perdata').map(d => `• ${d.judul}`).join('\n');
      return res.json({
        intent,
        reply: `📋 Layanan Perdata yang tersedia:\n\n${listPerdata}\n\nSilakan tanyakan lebih spesifik, contoh: "syarat gugatan cerai" atau "cara daftar eksekusi"`
      });
    }

    case 'LAYANAN_PIDANA': {
      const results = retrieve(text);
      const pidana = results.filter(r => r.kategori === 'Pidana');
      if (pidana.length > 0) {
        return res.json({ intent, reply: pidana[0].konten });
      }
      const listPidana = retrieveByKategori('Pidana').map(d => `• ${d.judul}`).join('\n');
      return res.json({
        intent,
        reply: `📋 Layanan Pidana yang tersedia:\n\n${listPidana}\n\nSilakan tanyakan lebih spesifik, contoh: "syarat izin besuk" atau "cara daftar praperadilan"`
      });
    }

    case 'LAYANAN_PHI': {
      const results = retrieve(text);
      const phi = results.filter(r => r.kategori === 'PHI');
      if (phi.length > 0) {
        return res.json({ intent, reply: phi[0].konten });
      }
      const listPHI = retrieveByKategori('PHI').map(d => `• ${d.judul}`).join('\n');
      return res.json({
        intent,
        reply: `📋 Layanan PHI (Hubungan Industrial) yang tersedia:\n\n${listPHI}\n\nSilakan tanyakan lebih spesifik.`
      });
    }

    case 'LAYANAN_HUKUM': {
      const results = retrieve(text);
      const hukum = results.filter(r => r.kategori === 'Hukum');
      if (hukum.length > 0) {
        return res.json({ intent, reply: hukum[0].konten });
      }
      const listHukum = retrieveByKategori('Hukum').map(d => `• ${d.judul}`).join('\n');
      return res.json({
        intent,
        reply: `📋 Layanan Hukum yang tersedia:\n\n${listHukum}\n\nSilakan tanyakan lebih spesifik.`
      });
    }

    case 'FAQ_UMUM': {
      const results = retrieve(text);
      if (results.length > 0) {
        return res.json({ intent, reply: results[0].konten });
      }
      return res.json({
        intent,
        reply: `ℹ️ Informasi Umum Pengadilan Negeri Samarinda\n\n• Jam Buka: Senin-Kamis 08.00-16.00 WITA, Jumat 08.00-16.00 WITA\n• Alamat: Jl. Bhayangkara No. 1, Samarinda\n• Website: pn-samarinda.go.id\n\nLayanan yang tersedia:\n• Perdata, Pidana, PHI, Hukum, Tipikor, Umum\n\nTanyakan lebih detail atau gunakan menu di atas!`
      });
    }

    default: {
      // Fallback: coba TF-IDF retrieval sebagai last resort
      const results = retrieve(text);
      if (results.length > 0 && results[0]) {
        return res.json({
          intent: 'RETRIEVED',
          reply: `${results[0].konten}\n\n_Apakah ini yang Anda cari? Jika tidak, coba tanyakan dengan kata kunci yang lebih spesifik._`
        });
      }
      return res.json({
        intent: 'UNKNOWN',
        reply: `Maaf, saya belum memahami pertanyaan Anda. 🙏\n\nCoba tanyakan tentang:\n• "jadwal sidang"\n• "syarat gugatan cerai"\n• "cara daftar praperadilan"\n• "cek perkara 123/Pdt.G/2024/PN Smr"\n• "jam buka pengadilan"`
      });
    }
  }
});

app.listen(PORT, () => console.log(`🚀 Server jalan di ${PORT}`));