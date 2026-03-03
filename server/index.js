const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

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

app.listen(PORT, () => console.log(`🚀 Server jalan di ${PORT}`));