import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, User, ChevronDown, X,
  Scale, Check, ArrowLeft, Search, ChevronLeft, ChevronRight, Clock, ExternalLink, FileText, Eye
} from 'lucide-react';

const API_BASE_URL = "http://localhost:3001/api";

// ==========================================
// DATA LAYANAN PTSP (DATA REAL DARI DOKUMEN WORD)
// ==========================================
const SERVICE_DATA = {
  'Perdata': {
    label: 'Layanan Perdata',
    options: [
      '1. Pendaftaran Gugatan Biasa',
      '2. Pendaftaran Gugatan Sederhana',
      '3. Pendaftaran Perlawanan/Bantahan',
      '4. Pendaftaran Verzet',
      '5. Pendaftaran Permohonan',
      '6. Pendaftaran Hak Pengampuan',
      '7. Perbaikan Kesalahan Akta',
      '8. Permohonan Perubahan Nama',
      '9. Pencatatan Kematian',
      '10. Pendaftaran Eksekusi',
      '11. Pendaftaran Konsinyasi'
    ],
    details: {
      '1. Pendaftaran Gugatan Biasa': `📄 **1. Pendaftaran Perkara Gugatan Biasa**
Persyaratan Dokumen:
a. Surat gugatan yang jelas dan tegas, berisi identitas penggugat dan tergugat, ringkasan duduk perkara, dan tuntutan penggugat.
b. Bukti surat yang sudah dilegalisasi, seperti perjanjian atau surat peringatan.
c. Identitas penggugat dan tergugat (KTP, SIM).
d. Soft copy gugatan dalam format Word dan dokumen kelengkapan lain dalam format PDF (KTP, gugatan, dan bukti surat).
e. Minimal 8 rangkap surat gugatan.
f. Jika penggugat adalah badan hukum, perlu dilengkapi dengan surat kuasa, KTA/kartu tanda pegawai, berita acara sumpah/surat tugas, dan identitas (KTP/SIM).`,

      '2. Pendaftaran Gugatan Sederhana': `📄 **2. Pendaftaran Perkara Gugatan Sederhana**
Persyaratan Dokumen:
a. Surat Gugatan minimal 8 rangkap.
b. Softcopy Dokumen Kelengkapan CD/Flashdisk:
   - Softcopy Gugatan (file word)
   - Softcopy KTP (file pdf)
   - Scan Gugatan (file pdf)
   - Scan Bukti Surat/Bukti Permulaan (file pdf)
c. Penggugat diwajibkan memiliki email aktif.
d. Fotokopi Bukti Pendukung (Kwitansi, Surat Perjanjian, Sertifikat, dsb).
e. Fotokopi bukti dengan materai Rp10.000 dan dilegalisir di Kantor Pos sebagai bukti surat.
f. Jika Penggugat yang menggunakan Kuasa Hukum, maka melampirkan surat kuasa, Berita Acara Sumpah dan Kartu KTA dalam bentuk file pdf dengan ukuran tidak melebihi 2 MB.
g. Didaftarkan melalui ecourt.mahkamahagung.go.id (lengkapi data pihak-pihak dalam perkara dan unggah berkas gugatan).`,

      '3. Pendaftaran Perlawanan/Bantahan': `📄 **3. Pendaftaran Perkara Perlawanan/Bantahan**
Persyaratan Dokumen:
a. Surat gugatan/perlawanan/bantahan (softcopy dan hardcopy).
b. Identitas diri (KTP atau yang setara).
c. Surat Kuasa Khusus dan Kartu Advokat/Surat Tugas dari instansi terkait (jika menggunakan kuasa hukum atau berasal dari instansi pemerintah).
d. Fotokopi identitas diri dari penggugat atau kuasa.
e. Didaftarkan melalui ecourt.mahkamahagung.go.id (lengkapi data pihak-pihak dalam perkara dan unggah berkas gugatan).`,

      '4. Pendaftaran Verzet': `📄 **4. Pendaftaran Verzet atas Putusan Verstek**
Persyaratan Dokumen:
a. Surat gugatan verzet.
b. Surat kuasa asli (jika menggunakan kuasa).
c. Salinan e-KTP tergugat/kuasa.
d. Alamat email, nomor rekening, dan nomor HP.
e. Soft copy gugatan verzet.
f. Didaftarkan melalui ecourt.mahkamahagung.go.id.`,

      '5. Pendaftaran Permohonan': `📄 **5. Pendaftaran Perkara Permohonan**
Persyaratan Dokumen:
a. Hardcopy Surat Permohonan yang ditujukan kepada Ketua Pengadilan Negeri (asli bermeterai dan Fotokopinya sebanyak 2 salinan).
b. Foto KTP Pemohon dan Softcopy Surat Permohonan dengan Format Word dan format PDF (scan hardcopy permohonan yang telah ditandatangani) diserahkan dalam flash disc atau Compact Disc (CD).
c. Pemohon yang menggunakan kuasa hukum agar melampirkan surat kuasa khusus, fotokopi KTA dan Berita acara sumpah advokat.`,

      '6. Pendaftaran Hak Pengampuan': `📄 **6. Pendaftaran Hak Pengampuan**
Persyaratan Dokumen:
a. KTP Pemohon.
b. Kartu Keluarga.
c. Kutipan Akta Kelahiran dan Kartu Keluarga calon orang yang diampu.
d. Surat Peryataan Kuasa Pengampuan dari saudara/keluarga yang diampu.
e. Surat Keterangan Desa yang menyatakan hubungan antara Pemohon dengan calon orang yang diampu.
f. Surat Keterangan Dokter/Rumah sakit terkait dengan keadaan calon orang yang diampu.
g. Dokumen lain yang mendukung (Jika Ada).
h. Kesemua bukti surat tersebut di difotokopi + ditempel meterai + distempel/cap oleh Kantor Pos.`,

      '7. Perbaikan Kesalahan Akta': `📄 **7. Permohonan Perbaikan Kesalahan Dalam Akta Catatan Sipil**
Persyaratan Dokumen:
a. KTP Pemohon.
b. Dokumen atau Akta Catatan Sipil yang terdapat kesalahan dan hendak diperbaiki (contoh: kutipan akta lahir, kutipan akta perkawinan, dsb).
c. Dokumen atau akta lain yang menunjukan identitas yang benar:
   - Kartu Keluarga
   - Ijazah
   - Surat Keterangan Desa
   - Paspor / SIM
   - Buku Nikah / Kutipan Akta Perkawinan
   - Kutipan Akta Lahir
d. Kesemua bukti surat tersebut di fotokopi + ditempel meterai + distempel/cap oleh Kantor Pos.`,

      '8. Permohonan Perubahan Nama': `📄 **8. Permohonan Perubahan Nama**
Persyaratan Dokumen:
a. KTP Pemohon.
b. Kutipan Akta Kelahiran orang yang hendak diubah namanya.
c. Kartu Keluarga Pemohon dan orang yang hendak diubah namanya.
d. Surat Keterangan Berkelakuan Baik.
e. Surat Keterangan Tidak Pernah dipidana.
f. Kesemua bukti surat tersebut di fotokopi + ditempel meterai + distempel/cap oleh Kantor Pos.`,

      '9. Pencatatan Kematian': `📄 **9. Permohonan Pencatatan Kematian**
Persyaratan Dokumen:
a. KTP Pemohon.
b. Kutipan Akta Kelahiran mendiang.
c. Surat Keterangan Desa yang menerangkan kematian mendiang.
d. Surat Keterangan dari Dinas Kependudukan dan Pencatatan Sipil (bagi kematian yang data kependudukannya tidak tercantum dalam Kartu Keluarga dan database kependudukan).
e. Surat Keterangan Kepala Dinas Perhubungan Laut bagi kematian karena kecelakaan kapal laut.
f. Surat Keterangan Kepala Dinas Perhubungan Udara bagi kematian karena kecelakaan pesawat terbang.
g. Surat Keterangan Pemerintah Daerah Setempat bagi kematian karena tsunami dan mayatnya tidak diketemukan.
h. Kesemua bukti surat tersebut di fotokopi + ditempel meterai + distempel/cap oleh Kantor Pos.`,

      '10. Pendaftaran Eksekusi': `📄 **10. Pendaftaran Permohonan Eksekusi**
Persyaratan Dokumen:
a. Surat permohonan yang ditandatangani pemohon atau kuasanya.
b. Identitas diri pemohon dan termohon (KTP).
c. Surat kuasa khusus jika permohonan diajukan melalui kuasa hukum.
d. Fotokopi salinan putusan yang telah berkekuatan hukum tetap.
e. Dokumen lain yang relevan, sesuai jenis perkara:
   - Perkara fidusia: Fotokopi surat perjanjian kreditur-debitur, akta/sertifikat fidusia, surat peringatan, dan BPKB/STNK.
   - Perkara pengosongan: Surat kuasa, identitas pemohon dan termohon, uraian singkat alasan permohonan, dan data objek eksekusi.`,

      '11. Pendaftaran Konsinyasi': `📄 **11. Pendaftaran Permohonan Konsinyasi**
Persyaratan Dokumen:
a. Surat permohonan konsinyasi: Ajukan surat permohonan yang sudah ditandatangani di atas materai.
b. Dokumen identitas: Fotokopi identitas (KTP) pemohon dan termohon.
c. Surat kuasa: Fotokopi surat kuasa yang sudah didaftarkan di kepaniteraan hukum, jika pemohon diwakili oleh kuasa hukum.
d. Surat tugas instansi: Fotokopi surat tugas dari instansi terkait (jika pemohon adalah instansi).
e. Berita acara musyawarah: Berita acara hasil Musyawarah Penetapan Ganti Kerugian.
f. Surat penolakan termohon: Fotokopi surat penolakan termohon terhadap bentuk dan/atau besar ganti rugi.
g. Surat keputusan kepala daerah: Fotokopi surat keputusan Gubernur, Bupati, atau Walikota tentang penetapan lokasi pembangunan.
h. Hasil appraisal: Fotokopi surat dari appraisal mengenai nilai ganti rugi.
i. Bukti kepemilikan: Fotokopi bukti bahwa termohon adalah pihak yang berhak atas objek (tanah/bangunan).`
    }
  },
  // --- DATA LAINNYA TETAP (PIDANA, PHI, HUKUM, DLL) ---
  'Pidana': {
    label: 'Layanan Pidana',
    options: ['Izin Besuk', 'Praperadilan'],
    details: {
      'Izin Besuk': "👮 **Permohonan Izin Besuk:**\n1. Surat Permohonan.\n2. KTP Pemohon.\n3. No HP/email yang aktif.",
      'Praperadilan': "👮 **Pendaftaran Permohonan Praperadilan:**\n1. Surat Permohonan Praperadilan (softcopy).\n2. Softcopy dokumen permohonan lengkap.\n3. Fotocopy KTP pemohon.\n4. Surat Kuasa (jika permohonan diajukan melalui kuasa hukum).\n5. KTA Kuasa Hukum.\n6. Mendaftar ke aplikasi eberpadu.mahkamahagung.go.id."
    }
  },
  'PHI': {
    label: 'Layanan PHI',
    options: ['Gugatan PHI', 'Perjanjian Bersama'],
    details: {
      'Gugatan PHI': "🏭 **Pendaftaran Gugatan PHI:**\n1. Asli Surat Anjuran Mediator (7 Rangkap).\n2. Asli Surat Gugatan (7 Rangkap).\n3. Softcopy Gugatan (Word).\n4. Surat Kuasa, KTP, KTA, BAS.\n5. Surat Tugas (Perusahaan).\n6. Resi Pembayaran Bank.",
      'Perjanjian Bersama': "🏭 **Pendaftaran Perjanjian Bersama:**\n1. Surat Permohonan.\n2. Fotokopi PB (stempel pos).\n3. Surat Kuasa Asli Direktur.\n4. Fotokopi Tanda Pembayaran, Akta Perusahaan, KTP Pekerja, SPK."
    }
  },
  'Hukum': {
    label: 'Layanan Hukum',
    options: ['Waarmeking', 'Eraterang', 'Izin Riset', 'Info Perkara', 'Surat Kuasa', 'Legalisasi Surat'],
    details: {
      'Waarmeking': "⚖️ **Permohonan Waarmeking:**\n1. Surat Permohonan.\n2. KTP & KK Seluruh Ahli Waris.\n3. Akta Kematian, Buku Nikah, Akta Lahir.\n4. Buku Tabungan Pewaris.\n5. Surat Keterangan Ahli Waris (Lurah/Camat).",
      'Eraterang': "⚖️ **Surat Keterangan (Eraterang):**\n1. Permohonan ke KPN.\n2. Surat Pernyataan (materai).\n3. Copy KTP, KK, SKCK, Ijazah.\n4. Foto 4x6 (2 lbr).\n5. Daftar: eraterang.badilum.mahkamahagung.go.id.",
      'Izin Riset': "⚖️ **Izin Riset:**\n1. Surat Permohonan ke Ketua Pengadilan.\n2. Proposal Penelitian.\n3. Surat Pengantar Kampus.\n4. Fotokopi KTP.",
      'Info Perkara': "⚖️ **Info Perkara/Turunan Putusan:**\n1. Surat Permohonan.\n2. KTP Pemohon.\n3. Surat Kuasa (jika bukan pihak).",
      'Surat Kuasa': "⚖️ **Pendaftaran Surat Kuasa:**\n1. Surat Kuasa Asli + Fotokopi.\n2. KTP Pemberi & Penerima.\n3. KTA/BAS (Advokat) atau Surat Tugas.\n4. Bayar PNBP.",
      'Legalisasi Surat': "⚖️ **Legalisasi Surat:**\n1. Surat Permohonan.\n2. Surat Asli & Fotokopi.\n3. KTP Pemohon."
    }
  },
  'Tipikor': {
    label: 'Layanan Tipikor',
    options: ['Izin Besuk Tipikor'],
    details: {
       'Izin Besuk Tipikor': "🏛️ **Permohonan Izin Besuk Tipikor:**\n1. Surat Permohonan.\n2. KTP.\n3. No HP/email aktif."
    }
  },
  'Umum': {
    label: 'Layanan Umum',
    options: ['Informasi Umum'],
    details: {
      'Informasi Umum': "ℹ️ **Layanan Umum:**\n1. Penerimaan surat masuk.\n2. Penerimaan berkas upaya hukum.\n3. Informasi jadwal persidangan."
    }
  }
};

// ==========================================
// KOMPONEN 1: TABEL JADWAL SIDANG (10 DATA + NEXT LINK)
// ==========================================
const PublicJadwalSidang = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);

  // DATA JADWAL RINGAN (HANYA 10 ITEM)
  const jadwalData = [
    { id: 1, nomor: '250/Pdt.G/2025/PN Smr', tgl_reg: '25 Nov 2025', klasifikasi: 'Wanprestasi', pihak: 'P: AGUS SALIM dkk\nT: IMAM FAUZI', status: 'Sidang pertama', lama: '2 Hari' },
    { id: 2, nomor: '259/Pid.Sus-TPK/2025/PN Smr', tgl_reg: '25 Nov 2025', klasifikasi: 'Tindak Pidana Korupsi', pihak: 'PU: ARIYANTO WIBOWO\nT: AYUB REYDON L. T.', status: 'Sidang pertama', lama: '2 Hari' },
    { id: 3, nomor: '360/Pid.Sus-TPK/2025/PN Smr', tgl_reg: '25 Nov 2025', klasifikasi: 'Tindak Pidana Korupsi', pihak: 'PU: RAHMATULLAH ARYADI\nT: ACHMAD KRISTIANTO', status: 'Sidang pertama', lama: '2 Hari' },
    { id: 4, nomor: '461/Pid.Sus-TPK/2025/PN Smr', tgl_reg: '25 Nov 2025', klasifikasi: 'Tindak Pidana Korupsi', pihak: 'PU: R JOHARCA DWI PUTRA\nT: MOCHAMAD SOLIKIN', status: 'Sidang pertama', lama: '2 Hari' },
    { id: 5, nomor: '562/Pid.Sus-TPK/2025/PN Smr', tgl_reg: '25 Nov 2025', klasifikasi: 'Tindak Pidana Korupsi', pihak: 'PU: HIRAS, SH\nT: HANIK ARIFIYANTO', status: 'Sidang pertama', lama: '2 Hari' },
    { id: 6, nomor: '663/Pid.Sus-TPK/2025/PN Smr', tgl_reg: '25 Nov 2025', klasifikasi: 'Tindak Pidana Korupsi', pihak: 'PU: ARIYANTO WIBOWO\nT: MIKAEL PAI', status: 'Sidang pertama', lama: '2 Hari' },
    { id: 7, nomor: '742/Pdt.G.S/2025/PN Smr', tgl_reg: '25 Nov 2025', klasifikasi: 'Perbuatan Melawan Hukum', pihak: 'P: HJ. ROSYIDAH\nT: JOKO SANTOSO', status: 'Dismissal', lama: '2 Hari' },
    { id: 8, nomor: '478/Pdt.P/2025/PN Smr', tgl_reg: '25 Nov 2025', klasifikasi: 'Wali Dan Ijin Jual', pihak: 'P: Disamarkan', status: 'Sidang pertama', lama: '2 Hari' },
    { id: 9, nomor: '472/Pdt.P/2025/PN Smr', tgl_reg: '24 Nov 2025', klasifikasi: 'Wali Dan Ijin Jual', pihak: 'P: Disamarkan', status: 'Sidang pertama', lama: '3 Hari' },
    { id: 10, nomor: '473/Pdt.P/2025/PN Smr', tgl_reg: '24 Nov 2025', klasifikasi: 'Permohonan Ganti Nama', pihak: 'P: Abdulah Lilik Efendi', status: 'Sidang pertama', lama: '3 Hari' },
  ];

  const filteredData = jadwalData.filter(item => 
    item.nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pihak.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.klasifikasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden text-slate-800 animate-fade-in relative">
       
       {/* HEADER */}
       <div className="bg-emerald-600 p-6 border-b border-emerald-700 flex flex-col lg:flex-row justify-between items-center gap-4 shrink-0 shadow-md">
         <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="bg-white/20 p-2 rounded-lg text-white">
              <Scale size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide uppercase">Sistem Informasi Penelusuran Perkara</h2>
              <p className="text-emerald-100 text-xs">Pengadilan Negeri Samarinda</p>
            </div>
         </div>
         
         <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto items-center">
            <a 
              href="https://sipp.pn-samarinda.go.id/list_jadwal_sidang" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-emerald-600 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:bg-emerald-50 transform hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <ExternalLink size={16} />
              SIPP Asli
            </a>

            <div className="relative w-full md:w-72">
                <input 
                  type="text" 
                  placeholder="Cari Nomor Perkara / Pihak..." 
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm border-none focus:ring-2 focus:ring-emerald-300 outline-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-3 text-emerald-600" size={16} />
            </div>
         </div>
       </div>

       {/* CONTENT TABEL (FULL WIDTH & HEIGHT, NO PADDING) */}
       <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
         <div className="flex-1 flex flex-col overflow-hidden bg-white">
            
            {/* TABLE CONTAINER */}
            <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <table className="w-full text-xs text-left min-w-[1000px] border-collapse">
                <thead className="text-white font-bold uppercase tracking-wider sticky top-0 z-20 shadow-md">
                  <tr>
                    <th className="p-4 text-center w-10 border-r border-emerald-500/30 bg-emerald-600">No</th>
                    <th className="p-4 w-40 border-r border-emerald-500/30 bg-emerald-600">Nomor Perkara</th>
                    <th className="p-4 w-28 border-r border-emerald-500/30 bg-emerald-600">Tanggal Register</th>
                    <th className="p-4 w-40 border-r border-emerald-500/30 bg-emerald-600">Klasifikasi Perkara</th>
                    <th className="p-4 w-64 border-r border-emerald-500/30 bg-emerald-600">Para Pihak</th>
                    <th className="p-4 w-32 border-r border-emerald-500/30 bg-emerald-600">Status Perkara</th>
                    <th className="p-4 w-24 border-r border-emerald-500/30 text-center bg-emerald-600">Lama Proses</th>
                    <th className="p-4 text-center w-20 bg-emerald-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-emerald-50/60 transition-colors even:bg-slate-50">
                      <td className="p-3 text-center font-medium text-slate-500 border-r border-slate-100">
                        {idx + 1}
                      </td>
                      <td className="p-3 font-bold text-emerald-700 border-r border-slate-100 align-top text-sm">
                        {item.nomor}
                      </td>
                      <td className="p-3 text-slate-600 border-r border-slate-100 align-top">
                        {item.tgl_reg}
                      </td>
                      <td className="p-3 text-slate-700 font-medium border-r border-slate-100 align-top">
                        <span className="bg-slate-100 px-2 py-1 rounded text-[10px] border border-slate-200 uppercase tracking-wide">
                          {item.klasifikasi}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 border-r border-slate-100 align-top font-medium whitespace-pre-line leading-relaxed">
                        {item.pihak}
                      </td>
                      <td className="p-3 border-r border-slate-100 align-top">
                        <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-1 rounded">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-500 border-r border-slate-100 align-top">
                        {item.lama}
                      </td>
                      <td className="p-3 text-center align-top">
                        <button 
                          onClick={() => setSelectedDetail(item)}
                          className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 mx-auto font-bold text-[11px] border border-emerald-200"
                        >
                          <Eye size={12} /> [Detil]
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* PAGINATION (FOOTER) */}
            <div className="flex justify-between items-center p-4 bg-white border-t border-slate-200 shrink-0 shadow-inner">
                <div className="text-xs text-slate-500 font-medium">
                  Menampilkan 1 sampai {filteredData.length} dari 50 entri
                </div>
                <div className="flex gap-2 items-center">
                  {/* Tombol Back (Disabled) */}
                  <button 
                    disabled
                    className="w-8 h-8 rounded-md flex items-center justify-center text-slate-300 cursor-not-allowed bg-slate-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {/* Halaman 1 (Aktif Hijau) */}
                  <button className="w-8 h-8 rounded-md bg-emerald-600 text-white text-xs font-bold shadow-md">
                    1
                  </button>

                  {/* Tombol Next (Link ke SIPP Asli) */}
                  <a 
                    href="https://sipp.pn-samarinda.go.id/list_jadwal_sidang"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-md border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs font-bold flex items-center gap-1 no-underline"
                  >
                    Next <ChevronRight size={14} />
                  </a>
                </div>
            </div>
         </div>
       </div>

       {/* MODAL DETAIL */}
       {selectedDetail && (
         <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all">
             <div className="bg-emerald-600 p-5 flex justify-between items-center text-white shadow-md">
               <div>
                 <h3 className="font-bold text-lg flex items-center gap-2"><FileText size={20}/> Detail Perkara</h3>
                 <p className="text-emerald-100 text-xs mt-1">{selectedDetail.nomor}</p>
               </div>
               <button onClick={() => setSelectedDetail(null)} className="hover:bg-emerald-700 p-2 rounded-full transition-colors"><X size={20}/></button>
             </div>
             
             <div className="p-8 space-y-6 bg-slate-50 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informasi Dasar</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-xs text-slate-500 block">Tanggal Register</span>
                          <span className="font-medium text-slate-800">{selectedDetail.tgl_reg}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Klasifikasi</span>
                          <span className="font-medium text-slate-800">{selectedDetail.klasifikasi}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block">Lama Proses</span>
                          <span className="font-medium text-emerald-600">{selectedDetail.lama}</span>
                        </div>
                      </div>
                   </div>

                   <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status Terkini</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600"><Clock size={20}/></div>
                        <div>
                          <p className="font-bold text-slate-800">{selectedDetail.status}</p>
                          <p className="text-xs text-slate-500">Tahapan persidangan saat ini</p>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Para Pihak</h4>
                   <div className="p-4 bg-slate-50 rounded border border-slate-100 text-sm text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                      {selectedDetail.pihak}
                   </div>
                </div>
             </div>
             
             <div className="bg-white p-4 text-right border-t border-slate-200">
               <button onClick={() => setSelectedDetail(null)} className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-300 transition-colors">Tutup</button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

// ==========================================
// BAGIAN 2: CHATBOT (ASISTEN VIRTUAL) - FULL SCREEN
// ==========================================
const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Halo! Saya Asisten Virtual SISEPAT. Ada yang bisa saya bantu?', type: 'text' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // Track category for sub-options

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(scrollToBottom, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: input, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const welcomeMsg = { id: Date.now() + 1, sender: 'bot', text: 'Selamat datang di SISEPAT.', type: 'text' };
      const menuMsg = { id: Date.now() + 2, sender: 'bot', text: 'Silahkan pilih opsi menu:', type: 'buttons', options: ['PTSP ( Pusat Pelayanan Satu Pintu )', 'Info Umum'] };
      setMessages(prev => [...prev, welcomeMsg, menuMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleButtonClick = (option) => {
    const userChoice = { id: Date.now(), sender: 'user', text: option, type: 'text' };
    setMessages(prev => [...prev, userChoice]);
    setIsTyping(true);
    setTimeout(() => {
      if (option.includes('PTSP')) {
        setMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: 'Pilih layanan PTSP:', type: 'select', options: Object.keys(SERVICE_DATA).filter(k => k !== 'Umum') }]);
      } else {
        // General Info
        const details = SERVICE_DATA['Umum'].details['Informasi Umum'];
        setMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: details, type: 'text' }]);
      }
      setIsTyping(false);
    }, 800);
  };

  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    
    // User selected a main category (e.g., Perdata)
    const userSelect = { id: Date.now(), sender: 'user', text: `Memilih: ${value}`, type: 'text' };
    setMessages(prev => [...prev, userSelect]);
    setIsTyping(true);

    setTimeout(() => {
      if (SERVICE_DATA[value]) {
         // It's a category, show sub-options
         setSelectedCategory(value);
         setMessages(prev => [...prev, { 
           id: Date.now()+1, 
           sender: 'bot', 
           text: `Layanan ${value} apa yang Anda butuhkan?`, 
           type: 'select', 
           options: SERVICE_DATA[value].options 
         }]);
      } else {
         // It might be a sub-option selected from a previous state context, 
         // but standard select change usually handles known lists. 
         // If value matches a key in the current selectedCategory's details:
         if (selectedCategory && SERVICE_DATA[selectedCategory].details[value]) {
            setMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: SERVICE_DATA[selectedCategory].details[value], type: 'text' }]);
         } else {
             // Try to find it in all categories just in case
             let found = false;
             Object.keys(SERVICE_DATA).forEach(cat => {
                 if (SERVICE_DATA[cat].details[value]) {
                     setMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: SERVICE_DATA[cat].details[value], type: 'text' }]);
                     found = true;
                 }
             });
             if (!found) {
                 setMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: `Maaf, informasi untuk ${value} tidak ditemukan.`, type: 'text' }]);
             }
         }
      }
      setIsTyping(false);
    }, 1000);
  };

  return (
    // UPDATE: Hapus rounded & border agar full screen
    <div className="bg-white h-full flex flex-col overflow-hidden text-slate-800">
       <div className="p-4 bg-indigo-600 border-b border-indigo-700 flex items-center space-x-3 shrink-0">
         <div className="bg-white/20 p-2 rounded-full text-white"><MessageSquare size={20} /></div>
         <div><h3 className="font-bold text-white">Asisten SISEPAT</h3><p className="text-xs text-indigo-200">Online • Siap Membantu</p></div>
       </div>
       {/* CHAT CONTENT */}
       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
         {messages.map(msg => (
           <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
             {msg.text && <div className={`p-3 rounded-2xl max-w-[80%] text-sm mb-1 shadow-sm whitespace-pre-line ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'}`}>{msg.text}</div>}
             {msg.type === 'buttons' && <div className="flex flex-wrap gap-2 mt-1">{msg.options.map((opt, i) => <button key={i} onClick={() => handleButtonClick(opt)} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs hover:bg-indigo-100 transition-colors">{opt}</button>)}</div>}
             {msg.type === 'select' && <div className="mt-2 bg-white p-2 rounded border border-slate-200 shadow-sm"><select onChange={handleSelectChange} className="bg-white text-slate-700 text-sm p-1 rounded outline-none w-full"><option value="">Pilih Layanan...</option>{msg.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}</select></div>}
           </div>
         ))}
         {isTyping && <div className="text-xs text-slate-400 italic ml-2">Sedang mengetik...</div>}
         <div ref={messagesEndRef} />
       </div>
       <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
         <input type="text" value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-slate-100 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ketik pesan..." />
         <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"><Send size={16}/></button>
       </form>
    </div>
  );
};

// ==========================================
// BAGIAN 4: PUBLIC LANDING PAGE (FULL SCREEN MODE)
// ==========================================
const PublicLandingPage = ({}) => {
  const [activeMode, setActiveMode] = useState(null); 

  // MODE CHAT
  if (activeMode === 'chat') {
    return (
      // UPDATE: Hapus padding (p-4 md:p-8) agar full screen
      <div className="h-screen bg-slate-50 font-sans text-slate-900 flex flex-col animate-fade-in overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-20 shrink-0">
           <div className="flex items-center gap-2 text-indigo-700 font-bold text-xl"><Scale size={24} /> SISEPAT</div>
           <button onClick={() => setActiveMode(null)} className="text-slate-500 hover:text-red-500 font-medium flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"><ArrowLeft size={20}/> Kembali ke Beranda</button>
        </header>
        <main className="flex-1 flex flex-col overflow-hidden">
           <div className="w-full h-full">
              <ChatBot />
           </div>
        </main>
      </div>
    );
  }

  // MODE JADWAL
  if (activeMode === 'jadwal') {
    return (
      // UPDATE: Hapus padding (p-4 md:p-8) agar full screen
      <div className="h-screen bg-slate-50 font-sans text-slate-900 flex flex-col animate-fade-in overflow-hidden">
        <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-20 shrink-0">
           <div className="flex items-center gap-2 text-emerald-700 font-bold text-xl"><Scale size={24} /> SISEPAT</div>
           <button onClick={() => setActiveMode(null)} className="text-slate-500 hover:text-red-500 font-medium flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"><ArrowLeft size={20}/> Kembali ke Beranda</button>
        </header>
        <main className="flex-1 flex flex-col w-full overflow-hidden">
           <PublicJadwalSidang />
        </main>
      </div>
    );
  }

  // LANDING PAGE UTAMA
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100">
      {/* NAVBAR (LOGIN DIHAPUS, MENU DI TENGAH) */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-2 rounded-lg"><Scale size={24} /></div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SISEPAT</span>
          </div>
          
          {/* MENU TENGAH (ABSOLUTE CENTER) */}
          <div className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <button className="text-sm font-medium text-emerald-600">Beranda</button>
            <button onClick={() => setActiveMode('jadwal')} className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Jadwal Sidang</button>
            <button className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Tentang Kami</button>
          </div>

          {/* LOGIN DIHAPUS - KOSONGKAN DIV KANAN AGAR LOGO TETAP DI KIRI */}
          <div className="w-10"></div>
        </div>
      </nav>

      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-8 animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          Pelayanan Cepat & Digital
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
          Asisten Virtual Cerdas untuk <br/>
          <span className="text-emerald-600">Pelayanan Pengadilan</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Dapatkan informasi jadwal sidang, persyaratan layanan, dan konsultasi seputar PTSP secara instan tanpa perlu antri.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <button onClick={() => setActiveMode('chat')} className="bg-emerald-600 text-white text-lg font-bold px-8 py-4 rounded-full shadow-xl shadow-emerald-200 hover:bg-emerald-700 transform hover:-translate-y-1 transition-all flex items-center gap-3">
            <MessageSquare size={24} /> Mulai Konsultasi
          </button>
          <button onClick={() => setActiveMode('jadwal')} className="bg-white text-emerald-600 border-2 border-emerald-100 text-lg font-bold px-8 py-4 rounded-full shadow-lg hover:bg-emerald-50 transform hover:-translate-y-1 transition-all flex items-center gap-3">
            <Scale size={24} /> Cek Jadwal Sidang
          </button>
        </div>
      </div>

      <footer className="fixed bottom-0 w-full border-t border-slate-100 py-6 text-center text-slate-400 text-sm bg-white">
        <p>&copy; 2024 Pengadilan Negeri Samarinda. All rights reserved.</p>
      </footer>
    </div>
  );
};

// --- APP (HANYA MENAMPILKAN PUBLIK) ---
export default function App() {
  return <PublicLandingPage />;
}